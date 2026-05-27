#!/usr/bin/env node
// Fetches the Substack RSS feed and regenerates the article rows inside
// newsletter/index.html, between the <!-- newsletter:articles:start --> and
// <!-- newsletter:articles:end --> markers.
//
// Run locally: node scripts/update-newsletter.mjs
// Run in CI:   .github/workflows/update-newsletter.yml (daily cron)
//
// Editorial categories are looked up by post slug in scripts/categories.json.
// Posts without a mapping render with date + title + dek only (no category).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FEED_URL = 'https://ghanemzadeh.substack.com/feed';
const ARCHIVE_URL = 'https://ghanemzadeh.substack.com/api/v1/archive?sort=new&limit=12';
const MAX_ITEMS = 12;

// Substack sits behind Cloudflare, which blocks GitHub Actions' datacenter
// (Azure) IPs at the ASN level with a 403 regardless of headers. When the
// direct fetches below are blocked, the script falls back to a Cloudflare
// Worker proxy that egresses from Cloudflare's edge (not datacenter-blocked).
// The Worker returns the same archive JSON shape as ARCHIVE_URL. Set its URL
// via the NEWSLETTER_PROXY_URL env var (see workers/substack-proxy/README.md).
const PROXY_URL = process.env.NEWSLETTER_PROXY_URL || '';

// A realistic browser UA still helps for IPs that are only UA-gated.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
const UTM = 'utm_source=ghanemzadeh.com&utm_medium=newsletter_page';
const START_MARKER = '<!-- newsletter:articles:start -->';
const END_MARKER = '<!-- newsletter:articles:end -->';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, '..', 'newsletter', 'index.html');
const CATEGORIES_PATH = join(__dirname, 'categories.json');

function htmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCDATA(block, tag) {
  const cdata = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return plain ? plain[1].trim() : '';
}

function formatDate(pubDate) {
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) throw new Error(`Invalid pubDate: ${pubDate}`);
  const long = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const iso = d.toISOString().slice(0, 10);
  return { long, iso };
}

function slugFromLink(link) {
  const m = link.match(/\/p\/([a-z0-9-]+)/i);
  return m ? m[1] : null;
}

function appendUtm(link) {
  return link + (link.includes('?') ? '&' : '?') + UTM;
}

async function loadCategories() {
  try {
    const raw = await readFile(CATEGORIES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
}

// Primary source: the RSS feed. Returns items as { title, dek, link, pubDate }.
async function fetchFromRss() {
  const res = await fetch(FEED_URL, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();

  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (blocks.length === 0) throw new Error('No <item> blocks parsed from feed');

  return blocks.slice(0, MAX_ITEMS).map((block) => {
    const title = getCDATA(block, 'title');
    const dek = getCDATA(block, 'description');
    const link = getCDATA(block, 'link');
    const pubDate = getCDATA(block, 'pubDate');
    if (!title || !link || !pubDate) {
      throw new Error(`Malformed item. title=${JSON.stringify(title)} link=${JSON.stringify(link)} pubDate=${JSON.stringify(pubDate)}`);
    }
    return { title, dek, link, pubDate };
  });
}

// Fallback source: the JSON archive API. Same return shape as fetchFromRss().
// `url` is the direct archive endpoint by default, or the Worker proxy URL
// (which returns the identical archive JSON) when fetching via the proxy.
async function fetchFromArchiveJson(url = ARCHIVE_URL) {
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Archive fetch failed: ${res.status} ${res.statusText}`);
  const posts = await res.json();
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('No posts parsed from archive API');
  }

  return posts.slice(0, MAX_ITEMS).map((post) => {
    const title = post.title;
    const dek = post.subtitle || post.description || '';
    const link = post.canonical_url;
    const pubDate = post.post_date;
    if (!title || !link || !pubDate) {
      throw new Error(`Malformed post. title=${JSON.stringify(title)} link=${JSON.stringify(link)} pubDate=${JSON.stringify(pubDate)}`);
    }
    return { title, dek, link, pubDate };
  });
}

async function fetchItems() {
  try {
    return await fetchFromRss();
  } catch (rssErr) {
    console.warn(`RSS feed unavailable (${rssErr.message}). Trying archive API.`);
  }
  try {
    return await fetchFromArchiveJson();
  } catch (archiveErr) {
    console.warn(`Archive API unavailable (${archiveErr.message}).`);
    if (!PROXY_URL) {
      throw new Error('Both direct sources failed and NEWSLETTER_PROXY_URL is not set. ' +
        'See workers/substack-proxy/README.md to deploy the Cloudflare Worker proxy.');
    }
  }
  console.warn(`Falling back to proxy: ${PROXY_URL}`);
  return await fetchFromArchiveJson(PROXY_URL);
}

async function main() {
  const items = await fetchItems();

  const categories = await loadCategories();

  const rows = items.map((item) => {
    const { long, iso } = formatDate(item.pubDate);
    const url = htmlEscape(appendUtm(item.link));
    const slug = slugFromLink(item.link);
    const cat = slug ? categories[slug] : null;
    const meta = cat
      ? `<time datetime="${iso}">${long}</time>
                <span class="nl-article__dot" aria-hidden="true">·</span>
                <span class="nl-article__cat">${htmlEscape(cat)}</span>`
      : `<time datetime="${iso}">${long}</time>`;
    return `          <li class="nl-article">
            <a class="nl-article__link" href="${url}" target="_blank" rel="noopener">
              <p class="nl-article__meta">
                ${meta}
              </p>
              <h3 class="nl-article__title">${htmlEscape(item.title)}</h3>
              <p class="nl-article__dek">${htmlEscape(item.dek)}</p>
            </a>
          </li>`;
  }).join('\n');

  const html = await readFile(HTML_PATH, 'utf-8');
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Markers not found in newsletter/index.html. Expected ' + START_MARKER + ' and ' + END_MARKER + '.');
  }

  const before = html.slice(0, startIdx + START_MARKER.length);
  const after = html.slice(endIdx);
  const block = `\n          <!-- Generated by scripts/update-newsletter.mjs from Substack RSS. Do not edit by hand. -->\n${rows}\n          `;
  const out = before + block + after;

  if (out === html) {
    console.log(`No changes. ${items.length} items already match.`);
    return;
  }
  await writeFile(HTML_PATH, out);
  console.log(`Updated newsletter/index.html with ${items.length} items.`);
}

main().catch((err) => {
  console.error('update-newsletter failed:', err.message);
  process.exit(1);
});

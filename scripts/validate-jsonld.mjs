#!/usr/bin/env node
/**
 * validate-jsonld.mjs
 *
 * Validates the site's structured data and internal links before deploy:
 *   1. Every <script type="application/ld+json"> block parses as JSON.
 *   2. The Person (#nasser) and WebSite (#website) nodes are fully defined
 *      (not @id-only stubs) on every indexable page.
 *   3. Every FAQPage answer is a verbatim substring of the page's visible
 *      text, so schema and on-page FAQ cannot drift.
 *   4. Stale book facts (224 pages, Version 1.1) appear nowhere.
 *   5. Every internal href resolves to a real file, and every #fragment
 *      link resolves to an id in the target page.
 *   6. Title/description length lint (warn only).
 *
 * Exits 1 on any error. Run from the repo root: node scripts/validate-jsonld.mjs
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'assets', 'scripts', 'workers', '.github', 'mockuphone', '.claude']);

let errors = 0;
let warnings = 0;
const err = (msg) => { errors++; console.error(`ERROR ${msg}`); };
const warn = (msg) => { warnings++; console.warn(`warn  ${msg}`); };

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

const isIndexable = (html) =>
  !/http-equiv=["']refresh["']/.test(html) && !/name=["']robots["'][^>]*noindex/.test(html);

const allFiles = walk(ROOT);
const pages = allFiles.filter((f) => isIndexable(readFileSync(f, 'utf8')));

const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&rarr;/g, '')
    .replace(/&copy;/g, '')
    .replace(/&middot;/g, '·')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

// URL -> file map for internal link checks (includes non-indexable targets).
const urlToFile = new Map();
for (const f of allFiles) {
  const rel = '/' + relative(ROOT, f).replace(/\\/g, '/');
  if (rel === '/index.html') urlToFile.set('/', f);
  else if (rel.endsWith('/index.html')) urlToFile.set(rel.replace(/index\.html$/, ''), f);
  else urlToFile.set(rel, f);
}

for (const file of pages) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  const visibleText = stripTags(html);

  // 1. JSON-LD parses; collect nodes.
  const nodes = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length === 0) err(`${rel}: no JSON-LD block`);
  blocks.forEach((block, i) => {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed['@graph'])) nodes.push(...parsed['@graph']);
      else nodes.push(parsed);
    } catch (e) {
      err(`${rel}: JSON-LD block ${i} does not parse: ${e.message}`);
    }
  });

  // 2. Person and WebSite fully defined.
  for (const id of ['https://ghanemzadeh.com/#nasser', 'https://ghanemzadeh.com/#website']) {
    const node = nodes.find((n) => n['@id'] === id);
    if (!node) err(`${rel}: missing node ${id}`);
    else if (Object.keys(node).length <= 2) err(`${rel}: node ${id} is an @id-only stub`);
  }

  // 3. FAQPage answers mirror visible text.
  for (const faq of nodes.filter((n) => n['@type'] === 'FAQPage')) {
    for (const q of faq.mainEntity || []) {
      const normalize = (s) => s.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
      if (!visibleText.includes(normalize(q.acceptedAnswer?.text || ''))) err(`${rel}: FAQ drift for "${q.name}"`);
      if (!visibleText.includes(normalize(q.name || ''))) err(`${rel}: FAQ question not visible: "${q.name}"`);
    }
  }

  // 5. Internal links resolve.
  const bodyOnly = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
  for (const m of bodyOnly.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) {
    const [, path, fragment] = m;
    const target = urlToFile.get(path);
    if (!target) {
      // Non-page assets (favicons, stylesheets) resolve straight from disk.
      if (!existsSync(join(ROOT, path))) err(`${rel}: broken internal link ${path}`);
      continue;
    }
    if (fragment) {
      const targetHtml = readFileSync(target, 'utf8');
      if (!targetHtml.includes(`id="${fragment.slice(1)}"`)) err(`${rel}: broken fragment ${path}${fragment}`);
    }
  }

  // 6. Meta lint (warn only).
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  if (title.length > 68) warn(`${rel}: title ${title.length} chars`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (desc.length < 120 || desc.length > 165) warn(`${rel}: description ${desc.length} chars`);
}

// 4. Stale facts anywhere in HTML or llms.txt.
const staleTargets = [...allFiles, join(ROOT, 'llms.txt')].filter((f) => existsSync(f));
for (const f of staleTargets) {
  const text = readFileSync(f, 'utf8');
  for (const pattern of [/224 pages/, /Version 1\.1\b/, /"datePublished": "2026-05"/]) {
    if (pattern.test(text)) err(`${relative(ROOT, f)}: stale fact matches ${pattern}`);
  }
}

console.log(`\nChecked ${pages.length} indexable pages: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);

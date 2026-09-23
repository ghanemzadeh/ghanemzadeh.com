#!/usr/bin/env node
// Write Sprint dates and prices from assets/sprint/config.json into the static
// HTML of every page that uses the data-sprint hooks (see assets/sprint/sprint.js).
//
// Pages also fill these values in the browser on load, so visitors always see
// today's kickoffs. This script keeps the HTML itself current for crawlers,
// llms-full.txt, and readers without JavaScript. It runs in the daily
// newsletter Action; run it by hand after editing config.json or the pages.
//
// When a page's rendered values change, its [data-sprint-updated] date moves
// to today.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";

const require = createRequire(import.meta.url);
const Sprint = require("../assets/sprint/sprint.js");

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([
  ".git", "node_modules", "assets", "scripts", "workers", ".github", "mockuphone", ".claude",
]);

const config = JSON.parse(readFileSync(join(ROOT, "assets/sprint/config.json"), "utf8"));
const today = process.env.SPRINT_TODAY || Sprint.todayISO(); // SPRINT_TODAY=YYYY-MM-DD to preview a date
const f = Sprint.fields(config, today);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || IGNORE_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function render(html) {
  // data-sprint="key": replace the element's text (hooks hold plain text only).
  html = html.replace(
    /(<([a-z0-9]+)\b[^>]*?\sdata-sprint="(\w+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (m, open, tag, key, inner, close) => (key in f ? open + esc(f[key]) + close : m),
  );
  // needs / unless / href: rewrite the opening tag's hidden and href attributes.
  html = html.replace(/<([a-z0-9]+)\b([^>]*\sdata-sprint-(?:needs|unless|href)="[^"]*"[^>]*)>/g, (m, tag, attrs) => {
    const needs = attrs.match(/\sdata-sprint-needs="(\w+)"/);
    const unless = attrs.match(/\sdata-sprint-unless="(\w+)"/);
    const href = attrs.match(/\sdata-sprint-href="(\w+)"/);
    let a = attrs;
    if (needs || unless) {
      const hide = needs ? !f[needs[1]] : !!f[unless[1]];
      a = a.replace(/\shidden(?=[\s>]|$)/, "");
      if (hide) a += " hidden";
    }
    if (href) {
      a = a.replace(/\shref="[^"]*"/, "");
      if (f[href[1]]) a += ` href="${esc(f[href[1]])}"`;
    }
    return `<${tag}${a}>`;
  });
  return html;
}

const unesc = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// {key} is a field. [[segment]] drops out when a field in it is empty;
// [[segment||fallback]] uses the fallback instead.
function fillTemplate(tpl) {
  return tpl
    .replace(/\[\[([\s\S]*?)\]\]/g, (m, inner) => {
      const [main, fallback = ""] = inner.split("||");
      return [...main.matchAll(/\{(\w+)\}/g)].every(([, k]) => f[k]) ? main : fallback;
    })
    .replace(/\{(\w+)\}/g, (m, k) => (k in f ? f[k] : m));
}

// Index of the bracket that closes the one at `open`, skipping JSON strings.
function closingBracket(text, open) {
  let depth = 0;
  let inString = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === "\\") i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const indentJson = (value, pad) => JSON.stringify(value, null, 2).split("\n").join("\n" + pad);

// JSON-LD Offer nodes, keyed by the fragment of their @id. Offers stay flat
// (no nested objects) so each one can be rewritten in place.
const p = config.price;
const OFFER_FIELDS = {
  "offer-sprint": { price: String(p.current), priceCurrency: p.currency, priceValidUntil: p.currentThroughKickoff },
  "offer-discovery-day": { price: String(p.discoveryDay), priceCurrency: p.currency },
};

const absolute = (url) => (url.startsWith("/") ? "https://ghanemzadeh.com" + url : url);

// VideoObject for a data-sprint-video slot, once config has the URL and the
// metadata Google requires (thumbnail, upload date). Null removes it.
function videoNode(html, key) {
  const url = config.urls[key];
  const meta = config[key + "Meta"] || {};
  if (!url || !meta.thumbnail || !meta.uploadDate) return null;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  const v = Sprint.videoEmbed(url);
  const node = {
    "@type": "VideoObject",
    "@id": `${canonical}#video-${key}`,
    name: meta.name,
    description: meta.description,
    thumbnailUrl: absolute(meta.thumbnail),
    uploadDate: meta.uploadDate,
  };
  if (meta.duration) node.duration = meta.duration;
  node[v.type === "file" ? "contentUrl" : "embedUrl"] = absolute(v.src);
  return node;
}

function renderStructured(html) {
  // <meta data-sprint-content="template">
  html = html.replace(/<meta\b([^>]*\sdata-sprint-content="([^"]*)"[^>]*)>/g, (m, attrs, tpl) =>
    `<meta${attrs.replace(/\scontent="[^"]*"/, ` content="${esc(fillTemplate(unesc(tpl)))}"`)}>`);

  html = html.replace(/("@id": "[^"]*#(offer-[\w-]+)"[^{}]*)\}/g, (m, body, id) => {
    const set = OFFER_FIELDS[id];
    if (!set) return m;
    for (const [k, v] of Object.entries(set)) {
      body = body.replace(new RegExp(`("${k}": )"[^"]*"`), (mm, pre) => pre + JSON.stringify(v));
    }
    return body + "}";
  });

  // FAQPage JSON-LD is rebuilt from the visible FAQ (<details><summary>Q</summary><p>A</p>),
  // so the schema mirrors the page word for word (validate-jsonld checks).
  const faqAt = html.indexOf('"@type": "FAQPage"');
  const visible = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)];
  if (faqAt !== -1 && visible.length) {
    const open = html.indexOf("[", html.indexOf('"mainEntity":', faqAt));
    const close = closingBracket(html, open);
    const pad = html.slice(html.lastIndexOf("\n", open) + 1).match(/^\s*/)[0];
    const text = (h) => unesc(h.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    const entities = visible.map(([, q, a]) => ({
      "@type": "Question",
      name: text(q),
      acceptedAnswer: { "@type": "Answer", text: text(a) },
    }));
    html = html.slice(0, open) + indentJson(entities, pad) + html.slice(close + 1);
  }

  // VideoObject nodes sit first in the @graph; drop any stale one, then add
  // the current one.
  for (const [, key] of html.matchAll(/\sdata-sprint-video="(\w+)"/g)) {
    const idTail = `#video-${key}"`;
    const at = html.indexOf(idTail);
    if (at !== -1) {
      const start = html.lastIndexOf("{", html.lastIndexOf('"@type": "VideoObject"', at));
      const end = closingBracket(html, start);
      const after = html.slice(end + 1).match(/^,\s*/)[0];
      const before = html.slice(0, start).match(/\s*$/)[0];
      html = html.slice(0, start - before.length) + html.slice(end + 1 + after.length - before.length);
    }
    const node = videoNode(html, key);
    if (node) {
      html = html.replace(/("@graph": \[)(\n(\s*))/, (m, head, nl, pad) => `${head}${nl}${indentJson(node, pad)},${nl}`);
    }
  }
  return html;
}

// The visible "Last updated" date and the WebPage dateModified move together.
function stampUpdated(html) {
  if (!/\sdata-sprint-updated\b/.test(html)) return html;
  return html
    .replace(
      /(<time\b[^>]*\sdata-sprint-updated\b[^>]*\sdatetime=")[^"]*("[^>]*>)[^<]*(<\/time>)/,
      (m, a, b, c) => a + today + b + Sprint.formatDate(today) + c,
    )
    .replace(/("dateModified": )"[^"]*"/, `$1"${today}T00:00:00+00:00"`);
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  if (!/\sdata-sprint(?:-needs|-unless|-href|-content)?="/.test(before)) continue;
  let after = renderStructured(render(before));
  if (after !== before) after = stampUpdated(after);
  const rel = relative(ROOT, file);
  if (after === before) {
    console.log(`  ${rel}: up to date`);
    continue;
  }
  writeFileSync(file, after);
  changed++;
  console.log(`  ${rel}: rendered`);
}

const next = Sprint.nextKickoffs(config, 2, today);
if (next.length < 2) {
  console.warn(`warn  only ${next.length} bookable kickoff(s) left in assets/sprint/config.json. Add dates.`);
}
console.log(`Sprint render: ${changed} file(s) changed.`);

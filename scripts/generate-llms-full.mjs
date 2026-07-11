#!/usr/bin/env node
// Generate llms-full.txt: the full-text companion to llms.txt (llmstxt.org).
//
// Re-run after editing any page: node scripts/generate-llms-full.mjs
//
// Design notes:
// - The intro is single-sourced from llms.txt (everything above "## Pages"),
//   so the two files cannot drift.
// - Page discovery mirrors scripts/update-sitemap.mjs: every *.html except
//   404.html, meta-refresh redirect stubs, and noindex pages, so new pages
//   get picked up without editing this script.
// - Each page's markdown is extracted from the real HTML (site chrome,
//   scripts, SVG, and forms stripped), so the file reflects what the site
//   actually says.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const ORIGIN = "https://ghanemzadeh.com";
const IGNORE_DIRS = new Set([
  ".git", "node_modules", "assets", "scripts", "workers", ".github", "mockuphone", ".claude",
]);

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

function urlFor(file) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (rel === "index.html") return ORIGIN + "/";
  if (rel.endsWith("/index.html")) return ORIGIN + "/" + rel.slice(0, -"index.html".length);
  return ORIGIN + "/" + rel;
}

const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  middot: "·", copy: "©", hellip: "…", ndash: "–",
  mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“",
  rdquo: "”", times: "×", rarr: "→", larr: "←",
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

// Strip tags from inline content and collapse whitespace (for headings,
// link texts, table cells).
function inlineText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function absoluteHref(href) {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith("#")) return null; // same-page anchor: keep text only
  if (href.startsWith("mailto:")) return href;
  if (href.startsWith("/")) return ORIGIN + href;
  return null; // other relative forms: keep text only
}

function tableToMarkdown(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => inlineText(c[1]))
  );
  if (!rows.length) return "";
  const lines = [`| ${rows[0].join(" | ")} |`, `| ${rows[0].map(() => "---").join(" | ")} |`];
  for (const row of rows.slice(1)) lines.push(`| ${row.join(" | ")} |`);
  return `\n\n${lines.join("\n")}\n\n`;
}

// Convert one page's HTML to markdown. Headings are demoted one level
// (h1 -> ##) so each page can sit under its own "# <title>" section header.
function htmlToMarkdown(html) {
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) ?? [, html])[1];

  // Drop non-content blocks and site chrome.
  for (const re of [
    /<!--[\s\S]*?-->/g,
    /<script[\s\S]*?<\/script>/gi,
    /<style[\s\S]*?<\/style>/gi,
    /<noscript[\s\S]*?<\/noscript>/gi,
    /<svg[\s\S]*?<\/svg>/gi,
    /<form[\s\S]*?<\/form>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<nav[\s\S]*?<\/nav>/gi,
    /<header class="site-header">[\s\S]*?<\/header>/gi,
    /<footer class="site-footer">[\s\S]*?<\/footer>/gi,
    /<div class="social-links">[\s\S]*?<\/div>/gi,
  ]) body = body.replace(re, " ");

  // Tables first (their inner tags must survive until here).
  body = body.replace(/<table[\s\S]*?<\/table>/gi, (t) => tableToMarkdown(t));

  // Blockquotes: mark now, prefix lines after text conversion.
  body = body.replace(/<blockquote[^>]*>/gi, "\n\nBQ\n\n").replace(/<\/blockquote>/gi, "\n\n/BQ\n\n");

  // FAQ <summary> questions become headings.
  body = body.replace(/<summary[^>]*>([\s\S]*?)<\/summary>/gi, (_, t) => `\n\n#### ${inlineText(t)}\n\n`);

  // Headings, demoted one level.
  body = body.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => {
    const text = inlineText(t);
    return text ? `\n\n${"#".repeat(Math.min(Number(n) + 1, 6))} ${text}\n\n` : "\n\n";
  });

  // Links: absolute URLs; icon-only/anchor links collapse to their text.
  body = body.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
    const text = inlineText(t);
    if (!text) return " ";
    const abs = absoluteHref(decodeEntities(href));
    return abs ? `[${text}](${abs})` : text;
  });

  // Inline emphasis.
  body = body.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${inlineText(t)}**`);
  body = body.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${inlineText(t)}*`);

  // Definition lists (glossary): term as bold line, definition as paragraph.
  body = body.replace(/<dt[^>]*>([\s\S]*?)<\/dt>/gi, (_, t) => `\n\n**${inlineText(t)}**\n\n`);
  body = body.replace(/<\/?d[ld][^>]*>/gi, "\n\n");

  // List items.
  body = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${inlineText(t)}\n`);

  // Paragraph-ish breaks, then drop every remaining tag.
  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<\/(p|div|section|article|main|aside|figure|figcaption|details|ul|ol|header|footer)>/gi, "\n\n");
  body = body.replace(/<[^>]+>/g, " ");

  body = decodeEntities(body);

  // Normalize whitespace: trim lines, collapse runs of blank lines.
  const lines = body.split("\n").map((l) =>
    l.replace(/[ \t]+/g, " ").replace(/ ([.,;:!?])(?=[\s*)\]"']|$)/g, "$1").trim()
  );
  let out = [];
  let inQuote = false;
  for (const line of lines) {
    if (line === "BQ") { inQuote = true; continue; }
    if (line === "/BQ") { inQuote = false; continue; }
    if (!line) { out.push(""); continue; }
    out.push(inQuote ? `> ${line}` : line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// --- Build the file ---

const llms = readFileSync(join(ROOT, "llms.txt"), "utf8");
const pagesIdx = llms.indexOf("## Pages");
if (pagesIdx === -1) throw new Error('llms.txt has no "## Pages" section to split on');
const intro = llms.slice(0, pagesIdx).trim();

const files = walk(ROOT).filter((f) => {
  const rel = relative(ROOT, f).split(sep).join("/");
  if (rel === "404.html") return false;
  const html = readFileSync(f, "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) return false; // redirect stubs
  if (/name=["']robots["'][^>]*noindex/i.test(html)) return false; // noindex pages
  return true;
});

const pages = files
  .map((f) => {
    const html = readFileSync(f, "utf8");
    const title = inlineText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [, ""])[1]);
    return { url: urlFor(f), title, markdown: htmlToMarkdown(html) };
  })
  .sort((a, b) => {
    const home = ORIGIN + "/";
    if (a.url === home) return -1;
    if (b.url === home) return 1;
    return a.url.localeCompare(b.url);
  });

const sections = pages.map((p) => `---\n\n# ${p.title}\n\nURL: ${p.url}\n\n${p.markdown}`);
const output = `${intro}\n\n${sections.join("\n\n")}\n`;
writeFileSync(join(ROOT, "llms-full.txt"), output);
console.log(`Wrote llms-full.txt with ${pages.length} pages:`);
for (const p of pages) console.log(`  ${p.url}`);

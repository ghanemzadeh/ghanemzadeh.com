#!/usr/bin/env node
// Regenerate sitemap.xml from the actual HTML pages on the site.
//
// Design notes:
// - lastmod is taken from each file's latest git commit date so it stays
//   honest (Google ignores priority/changefreq, and uses lastmod only when it
//   is verifiably accurate, so those fields are intentionally omitted).
// - Redirect stubs (meta-refresh) and noindex pages are excluded automatically,
//   so new pages get picked up without editing this script.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const ORIGIN = "https://ghanemzadeh.com";
// Directories that never contain indexable pages.
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

function gitDate(file) {
  try {
    // Uncommitted (modified or untracked) files: use mtime so freshly
    // regenerated pages (e.g. the daily newsletter) report today, not the
    // previous commit date.
    const status = execFileSync("git", ["status", "--porcelain", "--", file], { cwd: ROOT })
      .toString()
      .trim();
    if (status) return statSync(file).mtime.toISOString().slice(0, 10);
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: ROOT })
      .toString()
      .trim();
    if (d) return d;
  } catch {
    /* git unavailable */
  }
  return statSync(file).mtime.toISOString().slice(0, 10);
}

const files = walk(ROOT).filter((f) => {
  const rel = relative(ROOT, f).split(sep).join("/");
  if (rel === "404.html") return false;
  const html = readFileSync(f, "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) return false; // redirect stubs
  if (/name=["']robots["'][^>]*noindex/i.test(html)) return false; // noindex pages
  return true;
});

const entries = files
  .map((f) => ({ url: urlFor(f), lastmod: gitDate(f) }))
  .sort((a, b) => {
    const home = ORIGIN + "/";
    if (a.url === home) return -1;
    if (b.url === home) return 1;
    return a.url.localeCompare(b.url);
  });

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries
    .map((e) => `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`)
    .join("\n") +
  `\n</urlset>\n`;

writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`Wrote sitemap.xml with ${entries.length} URLs:`);
for (const e of entries) console.log(`  ${e.lastmod}  ${e.url}`);

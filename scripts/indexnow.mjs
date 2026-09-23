#!/usr/bin/env node
// Ping IndexNow (Bing and other participating engines) with changed URLs.
//
// Usage:
//   node scripts/indexnow.mjs --changed             # after a deploy: pages changed since the last ping
//   node scripts/indexnow.mjs --changed <git-ref>   # pages changed since <git-ref>
//   node scripts/indexnow.mjs                       # ping every URL in sitemap.xml
//   node scripts/indexnow.mjs https://ghanemzadeh.com/newsletter/   # ping specific URLs
//   add --dry-run to any of these to list the URLs without pinging
//
// --changed diffs <ref>..HEAD (default ref: the commit recorded by the last
// --changed run in .indexnow-last, else HEAD~1), keeps only pages listed in
// sitemap.xml (so noindex pages like /call/thanks/ never go out), and records
// HEAD once IndexNow accepts the list. Run it after the deploy is live.
//
// The key file (<key>.txt at the site root, containing the key) must be
// deployed before pinging, or the request is rejected.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const HOST = "ghanemzadeh.com";
const ORIGIN = `https://${HOST}`;

const keyFile = readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("No IndexNow key file (<32 hex chars>.txt) found at repo root.");
  process.exit(1);
}
const key = readFileSync(join(ROOT, keyFile), "utf8").trim();

const LAST = join(ROOT, ".indexnow-last");
const git = (...args) => execFileSync("git", args, { cwd: ROOT }).toString().trim();
const sitemapUrls = [...readFileSync(join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const dryRun = process.argv.includes("--dry-run");
let args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const changedMode = args[0] === "--changed";
let urls;
if (changedMode) {
  const since = args[1] || (existsSync(LAST) ? readFileSync(LAST, "utf8").trim() : "HEAD~1");
  const files = git("diff", "--name-only", `${since}..HEAD`).split("\n").filter(Boolean);
  const pageUrl = (f) =>
    f === "index.html" ? `${ORIGIN}/` : f.endsWith("/index.html") ? `${ORIGIN}/${f.slice(0, -"index.html".length)}` : null;
  urls = [...new Set(files.map(pageUrl).filter((u) => u && sitemapUrls.includes(u)))];
  console.log(`Changed since ${since}: ${files.length} file(s), ${urls.length} indexable page(s).`);
  urls.forEach((u) => console.log(`  ${u}`));
  if (urls.length === 0) process.exit(0);
} else {
  urls = args.length ? args : sitemapUrls;
}

const offHost = urls.filter((u) => !u.startsWith(ORIGIN + "/") && u !== ORIGIN + "/");
if (offHost.length) {
  console.error(`Refusing URLs outside ${ORIGIN}:\n  ${offHost.join("\n  ")}`);
  process.exit(1);
}

if (dryRun) {
  console.log(`Dry run: would ping ${urls.length} URL(s).`);
  process.exit(0);
}

const payload = {
  host: HOST,
  key,
  keyLocation: `${ORIGIN}/${keyFile}`,
  urlList: urls,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
console.log(`IndexNow responded ${res.status} ${res.statusText} for ${urls.length} URL(s).`);
if (!res.ok && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
if (changedMode) writeFileSync(LAST, git("rev-parse", "HEAD") + "\n");

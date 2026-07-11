#!/usr/bin/env node
// Ping IndexNow (Bing and other participating engines) with changed URLs.
//
// Usage:
//   node scripts/indexnow.mjs                       # ping every URL in sitemap.xml
//   node scripts/indexnow.mjs https://ghanemzadeh.com/newsletter/   # ping specific URLs
//
// The key file (<key>.txt at the site root, containing the key) must be
// deployed before pinging, or the request is rejected.
import { readFileSync, readdirSync } from "node:fs";
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

let urls = process.argv.slice(2);
if (urls.length === 0) {
  const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const offHost = urls.filter((u) => !u.startsWith(ORIGIN + "/") && u !== ORIGIN + "/");
if (offHost.length) {
  console.error(`Refusing URLs outside ${ORIGIN}:\n  ${offHost.join("\n  ")}`);
  process.exit(1);
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

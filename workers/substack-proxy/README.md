# substack-feed-proxy

A tiny Cloudflare Worker that proxies the `ghanemzadeh.substack.com` archive
(and optionally the RSS feed) for `scripts/update-newsletter.mjs`.

## Why this exists

Substack sits behind Cloudflare, which blocks GitHub Actions' datacenter
(Azure) IP ranges at the ASN level with a `403 Forbidden` — for both
`/feed` and `/api/v1/archive`, regardless of User-Agent. The newsletter sync
workflow runs on those IPs, so it cannot fetch Substack directly.

This Worker runs on Cloudflare's edge, which is not datacenter-blocked. It
fetches the publication on the runner's behalf and returns the response
unchanged. It is locked to one publication and two paths (`/api/v1/archive`,
`/feed`), so it is not an open proxy.

## One-time deploy (~5 min)

You need a (free) Cloudflare account.

### Option A — wrangler CLI

```sh
cd workers/substack-proxy
npx wrangler login        # opens a browser to authorize
npx wrangler deploy       # prints the deployed URL
```

The deployed URL looks like
`https://substack-feed-proxy.<your-subdomain>.workers.dev`.

### Option B — Cloudflare dashboard

1. Dashboard -> Workers & Pages -> Create -> Worker. Name it
   `substack-feed-proxy` and Deploy.
2. Edit code, paste the contents of `worker.js`, and Deploy.
3. Copy the `*.workers.dev` URL from the worker's page.

## Wire it into the workflow

The script reads the Worker URL from the `NEWSLETTER_PROXY_URL` env var, which
the workflow passes from a repo variable. Set it once (no quotes around the
URL needed):

```sh
gh variable set NEWSLETTER_PROXY_URL --body "https://substack-feed-proxy.<your-subdomain>.workers.dev"
```

Then trigger a run to confirm green:

```sh
gh workflow run "Update newsletter from Substack"
gh run watch
```

## Verify the Worker directly

```sh
curl "https://substack-feed-proxy.<your-subdomain>.workers.dev"          # archive JSON
curl "https://substack-feed-proxy.<your-subdomain>.workers.dev/?path=/feed"  # RSS XML
```

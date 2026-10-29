// Cloudflare Worker: a narrow, read-only proxy for the ghanemzadeh.substack.com
// archive/feed. It exists because Substack sits behind Cloudflare, which blocks
// GitHub Actions' datacenter (Azure) IPs at the ASN level with a 403. This
// Worker runs on Cloudflare's edge (not datacenter-blocked), fetches the
// publication on the caller's behalf, and returns the response unchanged.
//
// Substack also rate-limits some Cloudflare egress IPs with a 429, and the
// Worker runs in the location nearest the caller, so calls from GitHub's US
// runners can be refused for weeks while calls from elsewhere succeed. To ride
// that out, every successful upstream response is stored in KV, an hourly Cron
// Trigger refreshes the stored copy (cron runs are not tied to the caller's
// location), and a refused request is answered with the last good copy.
// Responses say which one they are: X-Proxy-Source is "live" or "stored", and
// X-Proxy-Fetched-At is when that body was fetched from Substack.
//
// It is locked to one publication and two paths, so it is NOT an open proxy.
//
// Default request returns the archive JSON (what scripts/update-newsletter.mjs
// parses):  GET https://<worker>.workers.dev/
// To proxy the RSS feed instead:  GET https://<worker>.workers.dev/?path=/feed

const PUBLICATION = 'https://ghanemzadeh.substack.com';
const DEFAULT_PATH = '/api/v1/archive';
const DEFAULT_QS = '?sort=new&limit=12';
const ALLOWED_PATHS = new Set(['/api/v1/archive', '/feed']);

const UPSTREAM_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Fetches one allowed path from Substack. On success, stores the body in KV
// (keyed by path) and returns { ok: true, body, contentType, fetchedAt }.
async function fetchUpstream(path, env) {
  const qs = path === DEFAULT_PATH ? DEFAULT_QS : '';
  const upstream = await fetch(PUBLICATION + path + qs, {
    headers: UPSTREAM_HEADERS,
    // Cache successes at the edge for 10 min so repeated calls don't re-hit
    // Substack. Never cache a refusal, or retries would keep getting it.
    cf: { cacheTtlByStatus: { '200-299': 600, '300-599': -1 } },
  });
  const contentType =
    upstream.headers.get('Content-Type') || 'application/json; charset=utf-8';
  const body = await upstream.text();
  if (!upstream.ok) return { ok: false, status: upstream.status, body, contentType };

  const fetchedAt = new Date().toISOString();
  await env.FEED_CACHE.put(path, body, { metadata: { contentType, fetchedAt } });
  return { ok: true, status: upstream.status, body, contentType, fetchedAt };
}

function respond(body, status, contentType, source, fetchedAt) {
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=600',
    'Access-Control-Allow-Origin': '*',
    'X-Proxy-Source': source,
  };
  if (fetchedAt) headers['X-Proxy-Fetched-At'] = fetchedAt;
  return new Response(body, { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || DEFAULT_PATH;
    if (!ALLOWED_PATHS.has(path)) {
      return new Response(`Path not allowed: ${path}`, { status: 403 });
    }

    const live = await fetchUpstream(path, env);
    if (live.ok) return respond(live.body, live.status, live.contentType, 'live', live.fetchedAt);

    // Substack refused this location. Serve the last good copy if there is one.
    const { value, metadata } = await env.FEED_CACHE.getWithMetadata(path);
    if (value === null) return respond(live.body, live.status, live.contentType, 'live');
    const res = respond(value, 200, metadata.contentType, 'stored', metadata.fetchedAt);
    res.headers.set('X-Upstream-Status', String(live.status));
    return res;
  },

  // Hourly refresh of the stored copies (see triggers in wrangler.toml).
  async scheduled(controller, env) {
    for (const path of ALLOWED_PATHS) {
      const result = await fetchUpstream(path, env);
      console.log(`${path}: ${result.ok ? 'stored' : 'refused'} (${result.status})`);
    }
  },
};

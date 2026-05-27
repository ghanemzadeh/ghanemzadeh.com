// Cloudflare Worker: a narrow, read-only proxy for the ghanemzadeh.substack.com
// archive/feed. It exists because Substack sits behind Cloudflare, which blocks
// GitHub Actions' datacenter (Azure) IPs at the ASN level with a 403. This
// Worker runs on Cloudflare's edge (not datacenter-blocked), fetches the
// publication on the caller's behalf, and returns the response unchanged.
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || DEFAULT_PATH;
    if (!ALLOWED_PATHS.has(path)) {
      return new Response(`Path not allowed: ${path}`, { status: 403 });
    }
    const qs = path === DEFAULT_PATH ? DEFAULT_QS : '';
    const target = PUBLICATION + path + qs;

    const upstream = await fetch(target, {
      headers: UPSTREAM_HEADERS,
      // Cache at the edge for 10 min so repeated calls don't re-hit Substack.
      cf: { cacheTtl: 600, cacheEverything: true },
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};

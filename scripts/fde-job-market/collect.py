"""Collect live forward deployed engineer postings from public ATS job-board APIs.

Usage: python3 -I scripts/fde-job-market/collect.py <out_dir>
Writes <out_dir>/postings.json (one record per posting) and <out_dir>/probe.json
(which company slugs resolved on which ATS).
"""
import html
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

OUT = sys.argv[1]

SLUGS = """openai anthropic palantir scaleai ramp sierra decagon harvey rippling databricks gleanwork glean cohere
mistral elevenlabs writer hebbia baseten modal cognition perplexity vercel retool andurilindustries anduril shieldai
hex clay notion mercor tennr abridge ambiencehealthcare hippocratic cresta assembledhq langchain crusoe togetherai
fireworksai replit anysphere lovable poolside runwayml synthesia deepgram assemblyai weaviate pinecone snorkelai
labelbox invisible turing distyl sourcegraph factory augmentcode xai basis rillet 11x artisan unify rogo brightwave
hightouch ziphq ironclad spellbook eudia legora crosby tandem suki nabla commure salient parafin pylon sana dust
photoroom helsing dataiku hightouch arize braintrust humanloop vellum zapier airtable figma stripe brex mercury
plaid scale cartesia livekit vapi bland retellai elevenlabs sesame character adept inflection imbue reka
writerinc jasper tome gamma mintlify supabase neon temporal temporaltechnologies cursor windsurf codeium
harvey-ai evenup supio eve tavus heygen captions descope clerk workos ashby rippling deel gusto
anthropic-ai salesforce servicenow c3ai c3-ai dataminr shift5 vannevar vannevarlabs rebellion defenseunicorns
""".split()
SLUGS = list(dict.fromkeys(SLUGS))

TITLE = re.compile(r"forward[\s-]*deploy|\bFDE\b", re.I)
UA = {"User-Agent": "ghanemzadeh.com FDE job-market study (contact: site owner)"}


def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
            if r.status != 200:
                return None
            return json.loads(r.read().decode("utf-8", "replace"))
    except Exception:
        return None


def text_of(s):
    s = html.unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def ashby(slug):
    d = get(f"https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true")
    if not d or "jobs" not in d:
        return None
    out = []
    for j in d["jobs"]:
        if not TITLE.search(j.get("title", "")):
            continue
        sal = None
        comp = j.get("compensation") or {}
        for c in comp.get("summaryComponents") or []:
            if c.get("compensationType") == "Salary" and c.get("minValue"):
                sal = {"min": c.get("minValue"), "max": c.get("maxValue"), "currency": c.get("currencyCode"),
                       "interval": c.get("interval")}
                break
        locs = [j.get("location") or ""] + [a.get("location", "") for a in j.get("secondaryLocations") or []]
        out.append({
            "ats": "ashby", "company": slug, "title": j.get("title"), "locations": [l for l in locs if l],
            "remote": bool(j.get("isRemote")) or j.get("workplaceType") == "Remote",
            "workplace": j.get("workplaceType"), "url": j.get("jobUrl"), "published": j.get("publishedAt"),
            "salary": sal, "comp_summary": comp.get("compensationTierSummary"),
            "text": j.get("descriptionPlain") or text_of(j.get("descriptionHtml")),
        })
    return out


def greenhouse(slug):
    d = get(f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true")
    if not d or "jobs" not in d:
        return None
    out = []
    for j in d["jobs"]:
        if not TITLE.search(j.get("title", "")):
            continue
        out.append({
            "ats": "greenhouse", "company": slug, "title": j.get("title"),
            "locations": [(j.get("location") or {}).get("name", "")], "remote": None, "workplace": None,
            "url": j.get("absolute_url"), "published": j.get("first_published") or j.get("updated_at"),
            "salary": None, "comp_summary": None, "text": text_of(j.get("content")),
        })
    return out


def lever(slug):
    d = get(f"https://api.lever.co/v0/postings/{slug}?mode=json")
    if not isinstance(d, list):
        return None
    out = []
    for j in d:
        if not TITLE.search(j.get("text", "")):
            continue
        sr = j.get("salaryRange")
        sal = {"min": sr.get("min"), "max": sr.get("max"), "currency": sr.get("currency"),
               "interval": sr.get("interval")} if sr else None
        cats = j.get("categories") or {}
        locs = cats.get("allLocations") or [cats.get("location", "")]
        lists = " ".join(text_of(l.get("content")) for l in j.get("lists") or [])
        out.append({
            "ats": "lever", "company": slug, "title": j.get("text"), "locations": [l for l in locs if l],
            "remote": j.get("workplaceType") == "remote", "workplace": j.get("workplaceType"),
            "url": j.get("hostedUrl"), "published": j.get("createdAt"), "salary": sal, "comp_summary": None,
            "text": " ".join([j.get("descriptionPlain") or "", lists, j.get("additionalPlain") or ""]),
        })
    return out


def probe(slug):
    found = {}
    rows = []
    for name, fn in (("ashby", ashby), ("greenhouse", greenhouse), ("lever", lever)):
        r = fn(slug)
        if r is not None:
            found[name] = len(r)
            rows += r
    return slug, found, rows


with ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(probe, SLUGS))

probe_map = {s: f for s, f, _ in results if f}
postings = [r for _, _, rows in results for r in rows]
json.dump(probe_map, open(f"{OUT}/probe.json", "w"), indent=1)
json.dump(postings, open(f"{OUT}/postings.json", "w"), indent=1)
print("boards found:", len(probe_map), "| FDE postings:", len(postings))
for s, f in sorted(probe_map.items()):
    if any(f.values()):
        print(f"  {s}: {f}")

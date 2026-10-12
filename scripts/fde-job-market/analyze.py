"""Analyze collected FDE postings. Usage: python3 -I scripts/fde-job-market/analyze.py <out_dir>/postings.json <out_dir>

Produces stats.json (figures quoted on /forward-deployed-engineer-job-market/),
records.json, and fde-postings.csv (published under assets/data/). The page copy
is hand-written from stats.json, so re-check every number after a re-run."""
import csv
import json
import re
import statistics as st
import sys
from collections import Counter, defaultdict

P = json.load(open(sys.argv[1]))
OUT = sys.argv[2]

NAMES = {
    "databricks": "Databricks", "palantir": "Palantir", "openai": "OpenAI", "rogo": "Rogo", "scaleai": "Scale AI",
    "cohere": "Cohere", "cursor": "Cursor", "cresta": "Cresta", "notion": "Notion", "snorkelai": "Snorkel AI",
    "anthropic": "Anthropic", "shieldai": "Shield AI", "stripe": "Stripe", "turing": "Turing", "livekit": "LiveKit",
    "harvey": "Harvey", "gleanwork": "Glean", "elevenlabs": "ElevenLabs", "deepgram": "Deepgram",
    "labelbox": "Labelbox", "eudia": "Eudia", "ramp": "Ramp", "baseten": "Baseten", "modal": "Modal",
    "andurilindustries": "Anduril", "togetherai": "Together AI", "lovable": "Lovable", "legora": "Legora",
    "commure": "Commure", "parafin": "Parafin", "brex": "Brex", "vannevarlabs": "Vannevar Labs",
    "defenseunicorns": "Defense Unicorns", "vercel": "Vercel", "tennr": "Tennr", "abridge": "Abridge",
    "replit": "Replit", "factory": "Factory", "artisan": "Artisan", "figma": "Figma", "cartesia": "Cartesia",
    "vapi": "Vapi", "neon": "Neon", "tavus": "Tavus",
}

# Deduplicate the same posting listed on two boards.
seen, rows = set(), []
for p in P:
    key = (p["company"], p["title"].strip().lower(), tuple(sorted(l.strip().lower() for l in p["locations"])))
    if key in seen:
        continue
    seen.add(key)
    rows.append(p)


def family(t):
    t = t.lower()
    if re.search(r"\bintern|internship|new grad|in training", t):
        return "Intern or new grad"
    if re.search(r"manager|director|head of|\brvp\b|\bvp\b|lead\b", t) and "product manager" not in t:
        return "Manager or leader"
    if "product manager" in t or "member of product staff" in t:
        return "Product manager"
    if re.search(r"banker|lawyer|research scientist|researcher|finance engineer|equity research|sales & trading|strateg|gtm|architect|accelerator|enablement|operations", t):
        return "Strategist, architect, or domain specialist"
    if re.search(r"engineer|developer|software|\bswe\b|technical staff|deployed staff|\bfde\b", t):
        return "Engineer"
    return "Strategist, architect, or domain specialist"


def seniority(t):
    t = re.sub(r"member of (technical|product|deployed) staff", "", t.lower())
    if family(t) in ("Intern or new grad", "Manager or leader"):
        return family(t)
    if re.search(r"staff|principal", t):
        return "Staff or principal"
    if re.search(r"\bsenior\b|\bsr\.?\b", t):
        return "Senior"
    if re.search(r"junior|associate|\bii\b", t):
        return "Junior or associate"
    return "No level in title"


US_HINT = re.compile(r"\b(US|USA|United States|San Francisco|SF|New York|NYC|NY|Seattle|Austin|Boston|Chicago|Washington|DC|Denver|Los Angeles|Palo Alto|Mountain View|Atlanta|Oahu|Hawaii|Costa Mesa|Arlington|Remote - US|Remote US|California|Texas|Virginia|Colorado|Honolulu)\b|, ?(CA|NY|WA|TX|VA|MA|CO|HI|IL|DC|GA|FL|NJ|PA|MD|AZ|UT|OR|NC|OH|MI|MN)\b", re.I)


def region(p):
    locs = " | ".join(p["locations"])
    if not locs:
        return "Unspecified"
    if US_HINT.search(locs):
        return "United States"
    if re.search(r"remote", locs, re.I) and not re.search(r"emea|europe|uk|london|apac|canada|india|latam", locs, re.I):
        return "Remote, unspecified"
    return "Outside the US"


MONEY = r"\$\s?(\d{2,3}(?:,\d{3})+|\d{2,3}(?:\.\d+)?\s?[kK])"
RANGE = re.compile(MONEY + r"\s*(?:USD)?\s*(?:-|–|—|to)\s*" + MONEY)


def val(s):
    s = s.replace(",", "").replace(" ", "")
    return float(s[:-1]) * 1000 if s[-1] in "kK" else float(s)


def salary(p):
    s = p.get("salary")
    if s and s.get("min") and (s.get("currency") in (None, "USD")):
        lo, hi = float(s["min"]), float(s.get("max") or s["min"])
        interval = (s.get("interval") or "").lower()
        if "hour" in interval or "month" in interval:
            return None
        if 50000 <= lo <= 1_000_000:
            return lo, hi, "board field"
    m = RANGE.search(p.get("text") or "")
    if m:
        lo, hi = val(m.group(1)), val(m.group(2))
        if 50000 <= lo <= hi <= 1_500_000:
            return lo, hi, "posting text"
    return None


TRAVEL_PCT = re.compile(r"(\d{1,2})\s?%[^.]{0,60}?travel|travel[^.%]{0,80}?(\d{1,2})\s?%", re.I)

SKILLS = {
    "Python": r"\bpython\b",
    "TypeScript or JavaScript": r"typescript|javascript|\bnode\.?js\b|\breact\b",
    "SQL": r"\bsql\b",
    "LLMs or generative AI": r"\bllms?\b|large language model|generative ai|\bgenai\b|gen ai",
    "Agents": r"\bagent(s|ic)?\b",
    "Retrieval (RAG)": r"\brag\b|retrieval",
    "Evaluation (evals)": r"\bevals?\b|evaluation",
    "Fine-tuning or post-training": r"fine[- ]?tun|post-training|\brlhf\b|reinforcement learning",
    "Cloud (AWS, GCP, Azure)": r"\baws\b|\bgcp\b|google cloud|\bazure\b",
    "Containers (Docker, Kubernetes)": r"docker|kubernetes|\bk8s\b",
    "Security clearance": r"clearance|ts/sci|secret clearance",
}

records = []
for p in rows:
    text = p.get("text") or ""
    sal = salary(p)
    tm = [int(a or b) for a, b in TRAVEL_PCT.findall(text)]
    tm = [x for x in tm if 0 < x <= 100]
    records.append({
        "company": NAMES.get(p["company"], p["company"]),
        "title": re.sub(r"\s+", " ", p["title"]).strip(),
        "family": family(p["title"]),
        "seniority": seniority(p["title"]),
        "region": region(p),
        "locations": "; ".join(l.strip() for l in p["locations"]),
        "remote": bool(p.get("remote")) or bool(re.search(r"\bremote\b", " ".join(p["locations"]), re.I)),
        "salary_min_usd": round(sal[0]) if sal else None,
        "salary_max_usd": round(sal[1]) if sal else None,
        "salary_source": sal[2] if sal else None,
        "mentions_travel": bool(re.search(r"\btravel", text, re.I)),
        "travel_pct": max(tm) if tm else None,
        "skills": [k for k, rx in SKILLS.items() if re.search(rx, text, re.I)],
        "ats": p["ats"],
        "url": p["url"],
        "text_len": len(text),
    })

# Distinct roles: same company and title, counted once across locations.
roles = {}
for r in records:
    roles.setdefault((r["company"], r["title"].lower()), r)
R = list(roles.values())


def pct(n, d):
    return round(100 * n / d) if d else 0


stats = {"postings": len(records), "distinct_roles": len(R), "companies": len({r["company"] for r in records})}
stats["postings_by_company"] = Counter(r["company"] for r in records).most_common()
stats["roles_by_company"] = Counter(r["company"] for r in R).most_common()
stats["family_roles"] = Counter(r["family"] for r in R).most_common()
eng = [r for r in R if r["family"] == "Engineer"]
stats["seniority_eng_roles"] = Counter(r["seniority"] for r in eng).most_common()
stats["region_roles"] = Counter(r["region"] for r in R).most_common()
stats["remote_roles_pct"] = pct(sum(r["remote"] for r in R), len(R))

# Pay: engineer and senior IC roles in the US with a posted USD range, distinct roles.
paid = [r for r in R if r["salary_min_usd"] and r["family"] == "Engineer" and r["region"] != "Outside the US"]
mids = [(r["salary_min_usd"] + r["salary_max_usd"]) / 2 for r in paid]
stats["pay"] = {
    "n_roles_with_range": len(paid),
    "share_us_eng_roles_with_range_pct": pct(len(paid), len([r for r in R if r["family"] == "Engineer" and r["region"] != "Outside the US"])),
    "median_min": st.median(r["salary_min_usd"] for r in paid) if paid else None,
    "median_max": st.median(r["salary_max_usd"] for r in paid) if paid else None,
    "median_mid": st.median(mids) if mids else None,
    "p25_mid": st.quantiles(mids, n=4)[0] if len(mids) > 3 else None,
    "p75_mid": st.quantiles(mids, n=4)[2] if len(mids) > 3 else None,
    "lowest_min": min(r["salary_min_usd"] for r in paid) if paid else None,
    "highest_max": max(r["salary_max_usd"] for r in paid) if paid else None,
}
by_sen = defaultdict(list)
for r in paid:
    by_sen[r["seniority"]].append((r["salary_min_usd"] + r["salary_max_usd"]) / 2)
stats["pay_by_seniority"] = {k: {"n": len(v), "median_mid": st.median(v)} for k, v in by_sen.items()}
by_co = defaultdict(list)
for r in paid:
    by_co[r["company"]].append(r)
stats["pay_by_company"] = {
    c: {"n": len(v), "min": min(x["salary_min_usd"] for x in v), "max": max(x["salary_max_usd"] for x in v)}
    for c, v in sorted(by_co.items(), key=lambda kv: -len(kv[1]))
}

stats["travel"] = {
    "mentions_pct": pct(sum(r["mentions_travel"] for r in R), len(R)),
    "with_pct_value": len([r for r in R if r["travel_pct"]]),
    "pct_values": Counter(r["travel_pct"] for r in R if r["travel_pct"]).most_common(),
}
stats["skills_eng_pct"] = sorted(
    ((k, pct(sum(k in r["skills"] for r in eng), len(eng))) for k in SKILLS), key=lambda kv: -kv[1])
stats["n_eng_roles"] = len(eng)

json.dump(stats, open(f"{OUT}/stats.json", "w"), indent=1, default=str)
with open(f"{OUT}/fde-postings.csv", "w", newline="", encoding="utf-8") as f:
    cols = ["company", "title", "family", "seniority", "region", "locations", "remote", "salary_min_usd",
            "salary_max_usd", "salary_source", "mentions_travel", "travel_pct", "ats", "url"]
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    for r in sorted(records, key=lambda r: (r["company"], r["title"])):
        w.writerow(r)
json.dump(records, open(f"{OUT}/records.json", "w"), indent=1)
print(json.dumps({k: v for k, v in stats.items() if k not in ("postings_by_company", "roles_by_company", "pay_by_company")}, indent=1, default=str))
print("pay_by_company:", json.dumps(stats["pay_by_company"]))

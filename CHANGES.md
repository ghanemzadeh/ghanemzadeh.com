# SEO / AEO / GEO pass, August 10, 2026

Branch: `seo-aeo-geo-pass`. One commit per phase. Note: once merged, this file is
publicly served at /CHANGES.md (GitHub Pages serves the repo root). It contains no
private data, but delete it from the repo if you prefer it unpublished. It is not
referenced by sitemap.xml or llms-full.txt (both only index .html pages).

## Phase 0 audit findings

- **Stack**: plain hand-written static HTML on GitHub Pages (main branch root, CNAME).
  No generator, no build step. Head, header, and footer are duplicated per file, so
  every site-wide change is a per-file edit.
- **Generated files**: `sitemap.xml` (scripts/update-sitemap.mjs, lastmod from git) and
  `llms-full.txt` (scripts/generate-llms-full.mjs, driven by llms.txt's intro and the
  literal `## Pages` heading, which must not be renamed). Both are refreshed by the
  daily newsletter GitHub Action. `llms.txt` is hand-maintained. `scripts/indexnow.mjs`
  is manual-only.
- **JSON-LD existed on every page** before this pass (GSC "Search Appearance" being
  empty notwithstanding): Book, Service, Article, FAQPage, DefinedTermSet,
  BreadcrumbList. The gaps were: Person was an @id-only stub on interior pages,
  WebSite existed only on the homepage, the Book node had no isbn/offers, and three
  pages' FAQPage schema had drifted from the visible text.
- **Stale facts**: "224 pages" appeared in 9 places (book page x6, homepage Book node,
  books index card, llms.txt x2); "Version 1.1" in 2.
- **Date signals conflicted**: visible "Last updated June 2026" vs schema dateModified
  2026-07-04 vs sitemap lastmod 2026-07-11 on the three article pages.
- **Internal links**: the book page sent only 2 in-body links out and linked to none of
  the FDE cluster; the footer linked only 3 of 11 pages; the glossary had 1 inbound
  editorial link. The vs page and glossary were near-orphans.
- **robots.txt was already compliant**: `User-agent: *` allow-all plus explicit allows
  for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, anthropic-ai,
  PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, and a
  sitemap reference. Not modified. (Applebot is covered by the wildcard.)
- **Hygiene**: founder-diagnostic.html was a meta-refresh stub with no noindex; three
  internal working .md docs were committed and publicly served.

## Title and meta description changes (before -> after)

### /books/forward-deployed-ai-engineering/
- Title: `Forward Deployed AI Engineering | A Working Guide to the Hottest Job in Software`
  -> `Forward Deployed AI Engineering: The FDE Book | Nasser Ghanemzadeh`
- Meta: `A working guide to the Forward Deployed AI Engineer role: what it is, where it came from, how it is practiced, and how to do it well. By Nasser Ghanemzadeh. 224 pages. May 2026.`
  -> `The working guide to the Forward Deployed Engineer (FDE) role: what the job is, how the work is done, how to break in. 304 pages, updated August 2026.`
- OG/Twitter descriptions updated to match; `book:release_date` 2026-05 -> 2026-06-16.

### /forward-deployed-ai-engineer/
- Title: `What Is a Forward Deployed AI Engineer? | Nasser Ghanemzadeh`
  -> `What Is a Forward Deployed Engineer (FDE)? Definition, Salary, Role`
- Meta: `A Forward Deployed AI Engineer embeds inside a customer's team and ships AI capabilities directly into their product and codebase. What the role is, where it came from, and how it is practiced.`
  -> `A Forward Deployed Engineer (FDE) is a software engineer embedded with the customer to ship AI into production. Definition, salary data, and how the role works.`

### /ai-feature-sprint/
- Title: `AI Feature Sprint: 10-Day Forward Deployed AI Engineering for B2B SaaS`
  -> `Hire a Forward Deployed AI Engineer: 10-Day AI Feature Sprint`
- Meta: `Ship one narrow AI workflow into your B2B SaaS product in 10 business days. Fixed scope, fixed price ($5K beta / $7.5K to $10K standard). For founder-led teams of 5 to 50. Day-5 prototype guarantee.`
  -> `Ship one production AI workflow into your B2B SaaS in 10 business days. Fixed scope, fixed price, prototype by Day 5. For founder-led teams of 5-50.`

### /forward-deployed-ai-engineer-vs-solutions-engineer/
- Title: `Forward Deployed AI Engineer vs Solutions Engineer | Nasser Ghanemzadeh`
  -> `Forward Deployed Engineer vs Solutions Engineer: Key Differences`
- Meta: `Forward Deployed AI Engineer vs solutions engineer: the same technical instinct, different employer, different deliverable. One ships AI into the customer's product; the other sells and integrates a vendor's.`
  -> `Forward Deployed Engineer vs solutions engineer: who each works for, what each ships, where the code lives, how success is measured, and what each earns.`

### /how-to-become-a-forward-deployed-ai-engineer/
- Title: `How to Become a Forward Deployed AI Engineer | Nasser Ghanemzadeh`
  -> `How to Become a Forward Deployed Engineer (FDE) in 2026`
- Meta: `How to become a Forward Deployed AI Engineer: the backgrounds people come from, the skills to build, and a step-by-step path that ends in one shipped AI workflow you can defend.`
  -> `How to become a Forward Deployed Engineer in 2026: the backgrounds that transfer, the skills to build, and an 8-step path ending in one shipped AI workflow.`

### /newsletter/
- Title: `Notes from the edge of building | Nasser Ghanemzadeh`
  -> `Forward Deployed AI Engineering Newsletter | Nasser Ghanemzadeh`
- Meta: `Weekly notes on Forward Deployed AI Engineering, building AI-native SaaS solo with Claude Code, and distribution without paid ads.`
  -> `A weekly newsletter by Nasser Ghanemzadeh: Forward Deployed AI Engineering in practice, building AI-native SaaS solo with Claude Code, and distribution.`
- The H1/brand "Notes from the edge of building" is unchanged on the page.

### /book/ (Founder Mode)
- Title: `Founder Mode | A book by Nasser Ghanemzadeh`
  -> `The Founder Mode Book: From HP to NVIDIA | Nasser Ghanemzadeh`
- Meta: `Founder Mode is a practical book by Nasser Ghanemzadeh on how great founders stay close to product, people, judgment, and execution as companies scale.`
  -> `Founder Mode, the book by Nasser Ghanemzadeh: the history of calibrated founder involvement, traced through HP, Disney, Apple, Pixar, Amazon, NVIDIA, and Costco.`

### /best-forward-deployed-engineer-books/ (new)
- Title: `The Best Forward Deployed Engineer Books & Resources (2026)`
- Meta: `The best books and resources for learning the Forward Deployed Engineer role in 2026: five books worth reading, plus the essential free essays and talks.`

Note on em dashes: the brief's title strings used an em dash; per the site's standing
no-em-dash rule (confirmed during planning) every occurrence became a colon.

## Schema changes

- **Every interior page** (10 existing + 1 new): the Person `#nasser` @id-stub became a
  full node (name, url, image, jobTitle, one-line description, sameAs x7 including the
  Amazon book page, knowsAbout x4), and a WebSite `#website` node was added, so each
  page's graph now stands alone.
- **Homepage**: Amazon URL added to sameAs; knowsAbout gains "Forward Deployed
  Engineering", "AI deployment", "Product management"; ProfilePage dateModified
  refreshed; the two duplicate Book nodes slimmed to name/url/author @id refs so book
  facts live only on the book pages (this is what let the 224-page staleness survive);
  the "Where can I work with him?" FAQ answer aligned verbatim with the visible text.
- **Book page**: Book node gains isbn 9798199517683, genre, datePublished 2026-06-16,
  bookEdition "First edition, Version 1.5 (August 2026)", numberOfPages 304, publisher
  "Independently published", and workExample nodes for the paperback ($19.99) and
  Kindle ($9.99) editions with Amazon offer URLs. No aggregateRating or review markup
  anywhere (the brief's rule; the book has no reviews).
- **Explainer**: DefinedTerm renamed to "Forward Deployed Engineer" with termCode
  "FDE" and alternateName "Forward Deployed AI Engineer"; Article headline/description
  updated, dateModified 2026-08-10; FAQPage fully replaced (5 new questions).
- **Sprint**: new WebPage node with datePublished/dateModified; FAQPage Q6/Q8 aligned
  byte-for-byte with the visible answers (quote-style drift).
- **vs / how-to**: Article headline + dateModified updates.
- **Glossary**: FDE term gains termCode/alternateName; Echo and Delta DefinedTerms
  added (schema + visible dl entries).
- **Discovery-day**: FAQPage quote-style drift fixed on two answers.
- **New page**: Article + BreadcrumbList + 5-item ItemList (position 1 references the
  internal book page's #book @id).
- Breadcrumbs remain schema-only; visible breadcrumbs would collide with the design's
  eyebrow labels, which the brief permitted.

## Content changes

- **Book page**: edition line now `First edition, May 2026 · Version 1.5, August 2026 ·
  304 pages · ISBN 979-8199517683` with a one-line "What's new in Version 1.5" note
  (AWS $1B FDE program, Microsoft Frontier $2.5B); FAQ length answer now 304 pages /
  5 parts / 20 chapters and availability answer names Version 1.5 (both visible and
  schema); the phrases "the FDE playbook", "sample chapters (PDF)", and "Forward
  Deployed Engineer book" each appear once; new "Keep exploring the role" section
  links the explainer, how-to, vs, sprint, and books-list pages.
- **Explainer** rebuilt as the AEO centerpiece: bolded 42-word quotable definition on
  the McGrew lineage; question-format H2s (what does an FDE do / why "forward
  deployed" / what does an FDE earn with a 3-row salary table / FDE titles by company
  table / FDE vs solutions engineer / why the role exploded in 2026 with a dated
  timeline and TechCrunch external cite / skills / how to become one); new 5-question
  FAQ; Sources section; visible "Last updated August 2026".
- **Sprint page**: hero now carries "hire a Forward Deployed AI Engineer",
  "fixed-price AI development", and "ship an AI feature" once each; new "Measured
  outcomes" section presents the two real Vectig metrics as a
  Metric/Before/After/Sample table with the standing line "As new Sprint engagements
  complete, measured before/after results are added here."; inline terms section now
  links /glossary/; visible byline with August 2026 date.
- **vs page**: compensation row added to the table; both keyword word orders appear
  once each; new "Applied AI Engineer vs Solutions Engineer" H2.
- **Discovery-day**: raw-URL anchor `/ai-feature-sprint` replaced with a descriptive
  anchor.
- **Footer (all 12 full pages, byte-identical)**: Pages block gains "What is an FDE?"
  and "Best FDE books"; the four explainer-cluster pages regain the social icon row.
- **llms.txt**: 224->304 fixes, new "## The book" (ISBN, both Amazon links, prices) and
  "## The service" sections placed before `## Pages` so the llms-full generator carries
  them into its intro; new page added to the Pages list.
- **Hygiene**: noindex on founder-diagnostic.html; `ai-feature-sprint-prd-final.md`,
  `claude-code-ai-feature-sprint-page-improvements.md`, and
  `sprint_page_polish_prompt.md` untracked and gitignored (kept locally; they stop
  being served once this merges).

## New files

- `best-forward-deployed-engineer-books/index.html` (new URL, the only one created)
- `scripts/validate-jsonld.mjs` (structured-data + internal-link validator; run
  `node scripts/validate-jsonld.mjs` from the repo root, exits 1 on error)
- `CHANGES.md` (this file)

## Draft copy for Nasser's review before deploy

- **Books-list page, all of it**: the five book blurbs, the "Where to start" section,
  and especially the five external links, which were found by web search:
  - Qureshi: https://www.lennysnewsletter.com/p/inside-palantir-nabeel-qureshi
  - McGrew: https://www.ycombinator.com/library/Mt-the-fde-playbook-for-ai-startups-with-bob-mcgrew
  - Tunguz: https://tomtunguz.com/fde-cs/ (his `/the-10b-fde-boom/` post is an
    alternative if you prefer the investment-scale angle)
  - Kevin Bai: https://www.youtube.com/watch?v=KwhgfwOSToQ
  - Karpathy: https://www.youtube.com/watch?v=LCEmiRjPEtQ
- **Explainer**: the definition paragraph wording, the salary table framing, the
  titles-by-company table, the 2026 timeline entries, the five new FAQ answers (the
  travel answer is deliberately qualitative; no approved travel stat exists), and the
  Sources list. Business Insider and the compensation data are cited by name without
  URLs; add links if you have them.
- **Sprint page**: the "Measured outcomes" table wording ("Not measured" as the rubric
  before-state) and the reworked hero subhead.
- **Book page**: the "What's new in Version 1.5" line and the hero tagline now reading
  "The Forward Deployed Engineer book: ...".
- **Titles**: the Founder Mode title angle ("From HP to NVIDIA") and the newsletter
  title are judgment calls; both are easy to revise.
- **Glossary**: the Echo and Delta definitions were written from the book-page chapter
  copy; check them against the book's actual definitions.

## Known leftovers (deliberate, out of scope)

- Meta-length lint warnings on pages the brief did not touch: homepage title 74 /
  description 215, discovery-day title 82 / description 181, glossary description 179,
  books index description 171. Worth a later tightening pass.
- The newsletter Periodical/WebPage schema still uses the "Notes from the edge of
  building" name (matches the visible H1, intentional).
- 404.html keeps its stripped footer variant (intentional).

## Post-deploy checklist

1. Merge to `main`, wait for GitHub Pages to deploy, spot-check
   https://ghanemzadeh.com/best-forward-deployed-engineer-books/ renders.
2. Run `node scripts/indexnow.mjs` (submits all 12 sitemap URLs to IndexNow).
3. In Google Search Console, URL-inspect and Request Indexing for the 9 changed/new
   URLs: the book page, explainer, sprint, vs, how-to, glossary, newsletter, /book/,
   and /best-forward-deployed-engineer-books/.
4. Resubmit sitemap.xml in GSC (now 12 URLs).
5. Run the book page, explainer, and sprint page through Google's Rich Results Test;
   expect Book, FAQ, and Breadcrumb detections with zero errors.
6. Recheck GSC at 14 and 28 days: sprint-page CTR (was 0.2%), vs-page position (was
   7.2), "fde book" query CTR, and impressions for the new books-list page against the
   "forward deployed engineer books" query (107 impressions in the last window).
7. Amazon fixes (subtitle, backend keywords, description) are handled separately; no
   Amazon-side change was made or should be inferred from this pass.

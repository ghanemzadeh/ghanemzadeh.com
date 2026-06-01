# AI Sprint Landing Page — Polish & Restructure

## Goal

Polish and restructure the AI Sprint landing page at `/ai-feature-sprint`. Three categories of work:

1. **Layout** — widen the page container to match the books page (`/books/`) so the page reads as a peer of the books page, not a denser sibling.
2. **Targeted content fixes** — five specific edits to existing copy and links.
3. **Visual structural improvements** — six sections currently render as text blocks that should be visually distinct.

The Sprint page is the primary conversion surface on the site. Every edit below is about making it close better, not about reinventing the page. Do not change the underlying messaging or restructure sections. Do not add new sections that aren't listed here.

---

## Step 1: Investigate before changing anything

Before touching code:

1. Compare the current layout primitives between `/books/` and `/ai-feature-sprint/`. Note the max-width container, horizontal padding, and any section-level width overrides. The books page reads as wider and more spacious — confirm whether that's because of a different container component, a different `max-w-*` Tailwind class, or a different page-level layout wrapper.
2. Note any reusable components on either page (Hero, CTA button group, pricing card, FAQ accordion, terms glossary, footer signup). Reuse what exists; do not introduce new components.
3. Identify the file paths for: the Sprint page route, the Discovery Day page route, any shared layout wrapper, the global Tailwind config, and the design tokens file (if one exists).

---

## Step 2: Widen the page to match /books/

The Sprint page currently feels constrained compared to `/books/`. Match the books page's layout treatment:

- Same outer container max-width as `/books/`. If books uses `max-w-5xl` or `max-w-6xl` (or a custom design token), apply the same on the Sprint page wrapper.
- Same horizontal padding on mobile, tablet, and desktop breakpoints.
- Same section vertical rhythm — if `/books/` uses larger vertical padding between sections (e.g., `py-24` instead of `py-16`), apply it here too.
- Headers, lists, and body paragraphs should inherit the same typography scale as `/books/`. If a heading on `/books/` renders at 48px desktop / 36px mobile, the Sprint page H1 should too.

**Don't break responsive behavior.** Test at 375px, 768px, 1024px, and 1440px viewports after the change.

**Don't widen tables or code blocks past readability.** If the rubric table or the Day-0 terminal block becomes uncomfortably wide on desktop after the container widens, constrain those individual elements with their own narrower max-width while the page wrapper stays wide.

---

## Step 3: Targeted content fixes

### Fix 3.1 — Add a credentialing line above the hero CTAs

The current hero opens with the OpenAI/Anthropic framing and goes straight to CTAs. The reader doesn't know who "I" is until they scroll to the "Why work with me" section.

**Find** the hero section, between the urgency line ("⚡ Next Sprint slot...") and the two CTA buttons.

**Insert** this line as a small, muted-text paragraph (same styling as the "Beta pricing: 3 of 3 spots remaining..." caption below the buttons):

> Built by Nasser Ghanemzadeh — Ex-CEO/CPO Nivo (acquired, 200K+ users), building Vectig in public.

Visual treatment: same font size as the existing caption, slightly muted color (a step lighter than body text), centered or left-aligned to match whatever the buttons use.

### Fix 3.2 — Update the "May 4, 2026" body copy

**Find** this exact sentence in the "What is Forward Deployed AI Engineering?" section:

> On May 4, 2026, OpenAI launched a $10 billion deployment subsidiary using exactly this title, and Anthropic launched a $1.5 billion deployment subsidiary the same day.

**Replace** with:

> In May 2026, OpenAI launched a $10 billion deployment subsidiary using exactly this title, and Anthropic launched a $1.5 billion deployment subsidiary the same day.

Same fix wherever else "May 4, 2026" appears as a hard date in body copy. The Terms glossary at the bottom can keep "May 2026" as the date marker; that's fine.

### Fix 3.3 — Update the hero opening paragraph

The hero currently opens with a long context paragraph about OpenAI and Anthropic launches. After Fix 3.2 the freshness of that intro fades faster. Tighten.

**Find** the current hero subhead paragraph:

> OpenAI just launched The Deployment Company, a $10B subsidiary embedding engineers inside enterprises. Anthropic launched a similar deployment subsidiary the same day. This is the same playbook, sized for founder-led SaaS teams that don't have a $250K procurement process. I scope, build, and ship one narrow AI workflow into staging, production, or a production-ready pull request in 10 business days.

**Replace** with:

> OpenAI and Anthropic each launched deployment subsidiaries in May 2026 to embed engineers inside Fortune 500 companies. The AI Feature Sprint is the same playbook, sized for founder-led SaaS teams that don't have a $250K procurement process. I scope, build, and ship one narrow AI workflow into staging, production, or a production-ready pull request in 10 business days.

Tighter, evergreen, and the "Fortune 500" specificity makes the contrast with "founder-led SaaS" sharper.

### Fix 3.4 — Cross-link Sprint page Discovery Day CTAs to /discovery-day

Both "Book a $500 Discovery Day" buttons on this page currently link directly to Cal.com:

`https://cal.com/ghanemzadeh/30min`

**Update both buttons** (the one in the hero CTA pair, and the one in the Discovery Day pricing card section) to link to:

`/discovery-day`

The Discovery Day page already exists and handles the Cal.com handoff. This change makes Featured slot 2 on LinkedIn (which points to `/discovery-day`) pull a real thumbnail, and gives the Discovery Day page traffic so its own AEO indexing starts.

**Also update** the bottom-of-page CTA pair (the "Want to ship one useful AI feature?" section). Same change: `/discovery-day` instead of the Cal.com URL.

### Fix 3.5 — Fix the "Day 0: The readiness check" terminal block rendering

The terminal block currently renders with labels and values mashed together:

```
use casevague
data sourcesscattered
codebase accessready
AI provider setupconfigured
team availabilitypartial
success criteriaundefined
```

This is unreadable. The intent is a two-column terminal output. Render as a proper monospace block with the label left-aligned and the status right-aligned (or aligned to a fixed indent), with a clear visual separator. Suggested rendering:

```
$ run readiness_check --target founder-saas

  use case .................. vague
  data sources .............. scattered
  codebase access ........... ready
  AI provider setup ......... configured
  team availability ......... partial
  success criteria .......... undefined

→ recommended path: 2-hour Discovery Day to scope use case and define success criteria.
```

Use leader dots, or a CSS grid with two columns and dotted underline, or whatever pattern is cleanest in the existing component system. The visual target: looks like real terminal output, not a broken list. Status values can be subtly color-coded if the design system supports it (warnings in amber, ready in green, undefined in muted grey), but plain monochrome is fine if simpler.

---

## Step 4: Visual structural improvements

These sections currently render as plain text lists or definition lists. Convert each to a visually distinct treatment that reads at-a-glance. Keep the copy exactly as it is — only change the visual treatment.

### 4.1 — "Examples of narrow AI workflows" — convert to a 2x3 or 3x2 card grid

The six workflows currently render as a bulleted list. Convert to a grid of six small cards, each card showing the workflow name (bold) and one-sentence description. Cards should be visually consistent with whatever card pattern `/books/` or other sections of the site already use. Keep it minimal — no icons unless the site already has an icon system in place. Card backgrounds should be subtly elevated (light border or very soft fill) to differentiate from body content without screaming for attention.

### 4.2 — "How the 10-business-day sprint works" — convert to a horizontal timeline

Currently renders as definition pairs (Day 1: Scope, Days 2 to 3: Design, etc.). Convert to a horizontal timeline on desktop (5 stops left to right: Day 1, Days 2–3, Days 4–5, Days 6–9, Day 10) with the stage name above each stop and the description below. On mobile, stack vertically as it currently does. Use the same teal accent color as the LinkedIn banner (`#2DD4BF` or whatever the existing design system token is) for the connecting line and milestone markers.

### 4.3 — Discovery Day and Sprint pricing — render as two side-by-side pricing cards

Currently the Discovery Day and Sprint offer details render as stacked text sections. Convert to two side-by-side pricing cards on desktop, stacked on mobile. Both cards same height. Each card contains:

- Card label at top (already in copy: "Entry offer" / "Main offer")
- Price (already in copy)
- "Includes" list (already in copy)
- CTA button at bottom

The Sprint card should have visual emphasis as the primary offer — slightly larger, or with a colored accent border, or a "Most teams start here" badge if there's space. The Discovery Day card is the secondary/qualifying option.

Both cards' CTA buttons must point to the new URLs from Fix 3.4: Discovery Day → `/discovery-day`, Sprint → `https://tally.so/r/ja5pD6` (unchanged).

### 4.4 — "What we'll take on as a first Sprint" — color-coded risk cards

The risk taxonomy (Low / Medium / High) currently renders as a definition list. Convert to three horizontal cards or rows, each with a colored accent on the left edge:

- **Low risk** — green accent
- **Medium risk** — amber/yellow accent
- **High risk** — red accent (with the "Declined as a first Sprint" framing intact)

Keep the description text exactly as written. This is a fast visual cue for prospects scanning to see whether their use case fits.

### 4.5 — "This is for you if…" and "This is not for you if…" — render as a two-column comparison

Currently these are two stacked bulleted lists. Convert to side-by-side columns on desktop, stacked on mobile. Use a green checkmark icon or "+" symbol next to "for you" items, and a red X or "—" next to "not for you" items. Keep all copy exactly as written.

### 4.6 — "Why work with me" — add the headshot

The current "Why work with me" bio section has no photo. Add Nasser's headshot (use the same image that's on the LinkedIn profile or wherever the homepage hero photo lives). Headshot should be small-to-medium (around 120-160px), circular crop, positioned to the left of the bio text on desktop, above the bio on mobile. This is the single highest-impact polish edit on the page — personal brand pages without a face read as impersonal.

---

## Step 5: Smaller polish items

### 5.1 — Speaking credits as logos (only if logo assets exist)

The line "**Speaking on AI-native product development:** OMR Festival, re:publica, GITEX EUROPE" is plain text. If logo assets for these three conferences exist in the project, render as small greyscale logos on a single row. If not, leave as text — don't slow down the deploy on this one.

### 5.2 — Footer newsletter signup — add a one-line value prop

Current signup just says "Get the newsletter" with an email field. Add one line above the field:

> Weekly notes on Forward Deployed AI Engineering, AI-native product, and what I'm shipping. No filler.

This applies to both the Sprint page footer and the global footer if they share a component.

### 5.3 — Make the "Next Sprint slot" string easy to update

This isn't a code edit — it's an instruction. The urgency line currently says "Next Sprint slot: Jun 2, 2026 · 3 of 3 beta spots remaining." If by May 30 there's no booked Sprint, the Jun 2 date will look stale and the "3 of 3" line will start hurting credibility instead of helping. Make this string easy to update from a single config file or content field, so it can be edited weekly without touching layout code.

If currently hardcoded in the page component, extract it to a single content variable at the top of the file with a comment explaining the update cadence.

---

## Step 6: Verification

After all changes deploy:

1. Open `/ai-feature-sprint` at 1440px, 1024px, 768px, and 375px viewports. Confirm no horizontal scroll, no overlapping elements, and no text smaller than 14px on mobile.
2. Compare side-by-side with `/books/` at desktop width — confirm the two pages now feel like peers, not parent/child.
3. Confirm all Discovery Day CTAs link to `/discovery-day` and not directly to Cal.com.
4. Confirm the Sprint CTA still links to the Tally form `https://tally.so/r/ja5pD6`.
5. Confirm the readiness-check terminal block renders cleanly (label-dots-value alignment, no character collision).
6. Run Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100. The structural changes (cards, timeline, columns) shouldn't regress accessibility — verify keyboard navigation still works through all CTAs and the FAQ.
7. Re-run the page URL through LinkedIn Post Inspector to refresh the cached preview.

---

## Out of scope

- Adding testimonials. Placeholder structure can be left for later. No fake testimonials, no AI-generated quotes.
- Changing the FAQ copy or order. The FAQ is doing its job.
- Adding a video. Save for a later iteration.
- Adding an interactive workflow picker or quiz. Out of scope for this pass.
- Internationalization. The Farsi version is a separate project.
- Changing the Tally form. Keep it.

## What to ask before starting

1. Does the site use a shared layout wrapper across `/books/` and `/ai-feature-sprint/`, or are they two independent page components with their own width settings?
2. Is there an existing card component, timeline component, or two-column comparison component already in use elsewhere on the site? If yes, reuse it. If no, build minimal new ones consistent with existing styling.
3. Where is Nasser's headshot stored in the project? If multiple versions exist (square, circle, hero crop, etc.), confirm which one to use.

Confirm those three before writing code.

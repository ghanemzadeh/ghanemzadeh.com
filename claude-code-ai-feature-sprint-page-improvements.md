# Claude Code Prompt: Improve AI Feature Sprint Landing Page

You are working on my personal website repository for `ghanemzadeh.com`, deployed via GitHub Pages.

The live page is:

`https://ghanemzadeh.com/ai-feature-sprint/`

I want you to improve the existing page, not redesign the whole website.

## Goal

Make the AI Feature Sprint landing page more conversion-ready before I start sending warm DMs.

Focus on:

- Clearer CTAs
- USD consistency
- Stronger credibility
- Better buyer qualification
- Clearer scope/capacity expectations
- Less cognitive load in the examples section

Do **not** change unrelated pages or redesign the whole site.

---

## Important constraints

1. Keep the page at:

`/ai-feature-sprint/`

2. Preserve the existing visual style unless a small improvement is clearly needed.

3. Do not add new dependencies unless absolutely necessary.

4. Do not create a backend.

5. Do not remove existing SEO/Open Graph metadata.

6. Keep all public prices in USD.

7. Do not mention euros anywhere on this page.

8. The page should remain static and GitHub Pages compatible.

9. Do not introduce fake scarcity, fake testimonials, fake client logos, or unverifiable claims.

---

# Required changes

## 1. Replace raw email CTA links with structured placeholder links

Currently the CTAs likely use `mailto:` links. Replace them with clearly marked placeholder URLs so I can later paste in real Tally/payment links.

Use these placeholder constants/URLs consistently:

```text
DISCOVERY_DAY_URL = "https://tally.so/r/discovery-day-placeholder"
SPRINT_APPLICATION_URL = "https://tally.so/r/sprint-application-placeholder"
```

If the project structure does not support constants, use the URLs directly in the anchor tags.

Update all CTA buttons:

### Discovery Day CTA text

Use:

`Book a $500 Discovery Day`

Link to:

`https://tally.so/r/discovery-day-placeholder`

### Sprint CTA text

Use:

`Apply for the $5,000 Sprint`

Link to:

`https://tally.so/r/sprint-application-placeholder`

Important:

- Apply this everywhere the CTA appears.
- Keep an email fallback in the founder/contact section:
  `mailto:ghanemzadeh@gmail.com`
- Do not remove my email completely.

---

## 2. Add a short line under the hero CTAs for scarcity/positioning

Add this line under the hero buttons:

```text
Beta offer: first 3 teams only — $5,000.
```

Keep it subtle. Do not use countdown timers, fake urgency, or “only 2 slots left.”

---

## 3. Update the hero subheadline wording

Current wording includes something like:

`staging, production, or a production-ready pull request`

Replace with:

```text
A practical AI implementation sprint for founder-led B2B SaaS teams. I help you choose, scope, build, and ship one narrow AI workflow into staging, production, or a production-ready handoff / pull request.
```

Make sure the hero headline remains:

```text
Ship one useful AI feature in 10 business days.
```

---

## 4. Add timezone / availability line in founder section

In the founder/about section, add this line:

```text
Based in Turkey. Available across European, Middle Eastern, and North American business hours.
```

Place it near the end of the founder bio or near the contact links.

---

## 5. Add capacity constraint line

In the “Clear scope. Clear expectations.” section or equivalent delivery conditions section, add:

```text
I take one active sprint at a time. Kickoff dates are scheduled on a first-available basis.
```

Place it near the existing text about kickoff date, access, feedback, and production deployment depending on infrastructure.

---

## 6. Reduce examples list from 10 to 6

Find the “Examples of narrow AI workflows” section.

Keep only these 6 examples:

1. Investor update assistant
2. Finance/runway scenario explainer
3. Customer summary generator
4. Support ticket summarizer
5. Report generator
6. Onboarding assistant

Remove or hide the other examples from the visible grid/list.

If any removed examples are currently useful, move them to the FAQ only if it does not clutter the page. Otherwise delete them.

Make sure each remaining example has a short, concrete one-line explanation.

Suggested copy:

### Investor update assistant

Turn monthly metrics, asks, risks, and progress into a clear investor update draft.

### Finance/runway scenario explainer

Help founders understand how burn, hiring, churn, or revenue changes affect runway.

### Customer summary generator

Turn scattered account notes, usage data, and history into a concise customer summary.

### Support ticket summarizer

Summarize long support threads and surface the issue, urgency, and suggested next step.

### Report generator

Turn structured data or notes into a useful weekly, customer, or internal report.

### Onboarding assistant

Guide new users or customers through the first important workflow in your product.

---

## 7. Strengthen Sprint deliverable wording

In the AI Feature Sprint deliverables, find:

`Implementation support`

Replace with:

```text
Hands-on implementation of the selected workflow
```

Also ensure this deliverable exists:

```text
Team handoff and enablement session
```

If it already exists, keep it. If not, add it.

Add or keep this explanation nearby:

```text
A live walkthrough showing your team how the workflow works, how to maintain it, and how to identify the next useful AI implementation.
```

---

## 8. Add concrete outcome sentence near Sprint CTA

Near the Sprint CTA, add:

```text
By the end, you have a working prototype by Day 5 and a staging deployment, production-ready pull request, or implementation handoff by Day 10.
```

This should appear close to the Sprint pricing/CTA area.

---

## 9. Add a compact “Why me” section before the founder bio

Add a section before the detailed founder/about section.

Heading:

```text
Why work with me
```

Content as 4 bullets:

```text
Former CEO/CPO and product leader with 17+ years building and scaling technology products.

Led products with 200K+ users and founder-level responsibility across strategy, product, and execution.

Building Vectig, an AI-native product for startup finance, investor communication, and founder operating clarity.

Using Claude Code and modern AI development workflows in my own product work daily.
```

Do not add unverified claims such as “acquired startup” or client logos.

---

## 10. Slightly expand “After the Sprint” section

Find the “After the Sprint” section.

Keep it smaller than Discovery Day and Sprint sections. Do not turn it into a third equal pricing card.

Update the copy to include:

```text
After the first workflow ships, teams can continue with a second sprint or a monthly advisory retainer.

Typical retainers range from $3,000 to $5,000/month and include AI roadmap prioritization, two strategy/review calls per month, async spec review, workflow critique, and implementation guidance.
```

Do not make this the main CTA.

---

## 11. Add or update FAQ for provider flexibility

Add this FAQ item if it does not exist:

### Can this work with our AI provider or cloud setup?

```text
Yes. The sprint can support common AI implementation paths, including Anthropic API, AWS Bedrock, Google Vertex AI, OpenAI, or your existing provider setup, depending on your infrastructure and requirements.
```

Avoid wording such as:

- private Claude deployment
- self-hosted Claude
- deploy Claude privately

---

## 12. Add or update FAQ for training

Add this FAQ item if it does not exist:

### Do you offer team training?

```text
Every sprint includes a team handoff and enablement session. Standalone workshops may be available for teams that want help adopting AI-assisted product and engineering workflows, but the core offer is focused on shipping one useful AI workflow.
```

Do not add a separate public workshop pricing tier.

---

## 13. Check USD consistency

Search the page for:

- `€`
- `EUR`
- `euro`
- `euros`

There should be no matches.

Search for pricing and ensure all are USD:

- `$500`
- `$5,000`
- `$7,500`
- `$10,000`
- `$3,000`
- `$5,000/month`

Do not use mixed currency.

---

## 14. Preserve SEO metadata, but update if needed

Ensure metadata remains coherent.

Suggested metadata:

### Title

```text
AI Feature Sprint for B2B SaaS Teams | Nasser Ghanemzadeh
```

### Meta description

```text
A 10-business-day AI implementation sprint for founder-led B2B SaaS teams to choose, scope, build, and ship one useful AI workflow.
```

### Open Graph title

```text
Ship one useful AI feature in 10 business days
```

### Open Graph description

```text
AI Feature Sprint by Nasser Ghanemzadeh helps B2B SaaS teams turn vague AI ideas into one narrow shipped workflow.
```

Canonical URL:

```text
https://ghanemzadeh.com/ai-feature-sprint/
```

---

# Testing / acceptance criteria

After making changes:

1. The page still builds successfully.
2. The page remains available at `/ai-feature-sprint/`.
3. No unrelated pages are changed.
4. No euro symbols or euro references remain.
5. CTA buttons link to the placeholder Tally URLs.
6. Email fallback remains available in the contact/founder section.
7. Examples section shows only 6 examples.
8. “Why work with me” section appears before founder bio.
9. Timezone/business-hours line appears in founder section.
10. Capacity constraint appears in delivery conditions.
11. Provider flexibility FAQ exists and avoids “private Claude deployment” wording.
12. Training FAQ exists, but no public workshop pricing tier is added.
13. Page remains responsive on mobile and desktop.
14. Provide a concise summary of changed files and testing steps.

---

# Do not do

- Do not redesign the entire website.
- Do not add a new brand.
- Do not create a new page.
- Do not add testimonials or logos.
- Do not invent case studies.
- Do not add a workshop as a public pricing tier.
- Do not create fake urgency.
- Do not remove my contact email.
- Do not add tracking scripts unless already present and consistent with the site.

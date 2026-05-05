# PRD: AI Feature Sprint Landing Page

## 1. Project Overview

Create a new static landing page on the existing personal website:

`https://ghanemzadeh.com/ai-feature-sprint/`

The page promotes a productized AI implementation offer:

**AI Feature Sprint for B2B SaaS Teams**

The goal of the page is to validate demand and convert visitors into either:

1. A paid **AI Feature Discovery Day**
2. An application/inquiry for the **AI Feature Sprint**

The page should be static, fast, mobile responsive, and compatible with the current GitHub Pages deployment setup.

---

## 2. Business Context

I am Nasser Ghanemzadeh, a former CEO/CPO and product leader with 17+ years of experience in product leadership, startup building, AI product advisory, and strategy-to-execution work.

I am launching a productized offer for founder-led B2B SaaS teams that know they need to add AI to their product but are unsure what useful feature to build, how to scope it, or how to ship it without wasting months on vague AI experiments.

The page should position me as a credible senior operator who helps teams move from AI intention to one practical shipped AI workflow.

This is not a generic AI consulting page. It should feel specific, practical, and execution-oriented.

---

## 3. Offer Summary

### Entry Offer

**AI Feature Discovery Day**

A lower-friction paid entry point for teams that are not ready for a full sprint yet.

A 2-hour working session to assess whether a proposed AI use case is actually useful, buildable, and worth turning into a sprint.

**Price:** $500

If the client continues to the full AI Feature Sprint within 14 days, the $500 Discovery Day fee is credited toward the sprint price.

---

### Main Offer

**AI Feature Sprint**

A 10-business-day sprint to help a founder-led B2B SaaS team scope, build, and ship one narrow AI workflow into staging, production, or a production-ready pull request.

**Beta price:** $5,000 for the first 3 teams

Later pricing may increase to $7,500–$10,000.

---

### Follow-on Offer

**Post-sprint advisory or second sprint**

This should not be presented as a third equal pricing card.

Instead, include a short “After the Sprint” section explaining that teams can continue with a second sprint or a monthly advisory retainer for AI product strategy, roadmap prioritization, workflow review, and implementation guidance.

Do not show detailed retainer pricing on the landing page yet.

---

## 4. Target Audience

The target audience is:

- Founder-led B2B SaaS teams
- Early-stage SaaS CEOs/founders
- Product leaders at small or scaling SaaS companies
- Teams under pressure to add useful AI functionality
- Teams already experimenting with Claude Code, Cursor, OpenAI, Anthropic, or internal AI workflows
- SaaS teams that need one practical AI workflow, not a vague AI roadmap
- Teams that can make decisions quickly and provide access/context during the sprint

---

## 5. Page Goal

The page should drive two primary actions:

### Primary CTA

**Book a $500 Discovery Day**

This is the lower-friction entry point.

### Secondary CTA

**Apply for the $5,000 AI Feature Sprint**

This is for teams already ready to move.

The page should make it obvious which CTA is right:

- Not sure what to build? Start with Discovery Day.
- Already have a use case? Apply for the Sprint.

---

## 6. URL / Routing Requirement

Create the new page at:

`/ai-feature-sprint/`

The final live URL should be:

`https://ghanemzadeh.com/ai-feature-sprint/`

Implementation should match the existing structure of the site.

If the site is plain HTML, create:

`/ai-feature-sprint/index.html`

If the site uses Jekyll, create:

`/ai-feature-sprint.md`

with front matter similar to:

```yaml
---
layout: default
title: AI Feature Sprint
permalink: /ai-feature-sprint/
---
```

Use the correct approach based on the current repository structure.

---

## 7. Page Structure

The landing page should include the following sections.

---

# Section 1: Hero

## Headline

Ship one useful AI feature in 10 business days.

## Subheadline

A practical AI implementation sprint for founder-led B2B SaaS teams. I help you choose, scope, build, and ship one narrow AI workflow into staging, production, or a production-ready pull request.

## Supporting credibility line

Built by Nasser Ghanemzadeh, former CEO/CPO, founder of Vectig, and AI product advisor building AI-native SaaS with Claude Code.

## CTAs

Primary button:

Book a $500 Discovery Day

Secondary button:

Apply for the $5,000 Sprint

CTA buttons can initially link to placeholder anchors:

- `#discovery-day`
- `#sprint`

Or to email links:

Primary CTA:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Discovery Day`

Secondary CTA:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Sprint Application`

If payment or booking links are available, replace mailto links with those links.

---

# Section 2: The Problem

## Heading

Your team knows AI matters. The hard part is shipping the right thing.

## Body Copy

Most SaaS teams are already experimenting with AI.

Someone has tried Claude Code. Someone has built a prototype. Someone has suggested adding a chatbot.

But useful AI features do not come from vague experimentation. They need a clear workflow, the right data, a narrow scope, product judgment, and an implementation path the team can actually ship.

This sprint is designed to help you move from “we should add AI” to one useful AI workflow your users or internal team can actually use.

---

# Section 3: AI Implementation, Not AI Theater

## Heading

AI implementation, not AI theater.

## Body Copy

Most teams do not need another AI brainstorm. They need one clear workflow, the right data, a narrow scope, and a practical path to implementation.

The sprint is designed to help your team move from vague AI experiments to one working workflow that improves a real product or business process.

---

# Section 4: What We Can Build

## Heading

Examples of narrow AI workflows

Display these as cards or a clean grid.

Examples:

- Customer summary generator
- Support ticket summarizer
- Sales email analyzer
- Onboarding assistant
- Report generator
- Investor update assistant
- Finance/runway scenario explainer
- Internal admin assistant
- Product analytics insight generator
- Document extraction workflow

Each card can have a one-line explanation.

Example card:

**Customer summary generator**  
Turn scattered customer notes, usage data, and account history into a concise account summary.

Example card:

**Support ticket summarizer**  
Summarize long support conversations and highlight customer pain, urgency, and next actions.

Example card:

**Finance/runway scenario explainer**  
Help founders or internal operators understand runway changes, risk scenarios, and decision implications.

---

# Section 5: What This Is Not

## Heading

This is not an AI science project.

Use a list.

This is not:

- A generic AI strategy workshop
- A chatbot brainstorm
- A 40-page roadmap
- An attempt to make your whole product “AI-native” in two weeks
- A replacement for your engineering team
- A vague exploration of agents, copilots, and buzzwords
- A compliance-heavy enterprise AI transformation
- A promise to force production deployment regardless of infrastructure constraints

## Closing sentence

The sprint is intentionally narrow: one workflow, one clear user problem, one useful shipped outcome.

---

# Section 6: Discovery Day

Set the section ID as:

`id="discovery-day"`

## Heading

Not sure what to build yet? Start with a Discovery Day.

## Description

The AI Feature Discovery Day is a 2-hour working session designed to assess whether your AI use case is actually useful, buildable, and worth turning into a sprint.

## Price

$500

## Includes

- 2-hour working session
- Use-case clarification
- Data/API readiness check
- Workflow selection
- Risk assessment
- Recommended feature scope
- Go / no-go memo
- Sprint recommendation if there is a strong fit

## Credit Policy

If you continue to the full AI Feature Sprint within 14 days, the $500 Discovery Day fee is credited toward the sprint price.

## CTA

Book a $500 Discovery Day

For now, link to:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Discovery Day`

Replace with payment or booking link when available.

---

# Section 7: AI Feature Sprint

Set the section ID as:

`id="sprint"`

## Heading

AI Feature Sprint

## Description

A 10-business-day sprint to help your team scope, build, and ship one narrow AI workflow into staging, production, or a production-ready pull request.

## Beta Price

$5,000 for the first 3 teams.

## Later Price

$7,500–$10,000 after the beta slots.

## What Is Included

- AI use-case selection
- Feature scope
- UX flow
- Product and technical architecture
- Prompt/data design
- Claude Code workflow
- Implementation support
- Working prototype by Day 5
- Staging deployment, production-ready PR, or handoff by Day 10
- Team handoff and enablement session
- Loom walkthrough
- Handoff notes
- 30-day roadmap

## Team Handoff Explanation

The sprint includes a live walkthrough showing your team how the workflow works, how to maintain it, and how to identify the next useful AI implementation.

## CTA

Apply for the $5,000 Sprint

For now, link to:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Sprint Application`

Replace with application form or booking link when available.

---

# Section 8: Sprint Timeline

## Heading

How the 10-business-day sprint works

Use a timeline layout.

### Day 1: Scope

We define the workflow, user problem, available data, constraints, and success criteria.

### Days 2–3: Design

We map the UX flow, architecture, prompt/data structure, and implementation plan.

### Days 4–5: Prototype

We build the first working version and validate the direction.

### Days 6–9: Implementation

We refine the workflow, handle edge cases, add error states, improve prompts, and prepare for handoff or deployment.

### Day 10: Handoff

You receive a staging deployment, production-ready pull request, or implementation handoff, depending on your infrastructure and access.

---

# Section 9: Delivery Conditions

## Heading

Clear scope. Clear expectations.

Include this copy:

The sprint timeline begins on the agreed kickoff date, scheduled after contract signing and upfront payment.

Production deployment depends on access, infrastructure, team availability, and third-party dependencies. If production release is blocked, the deliverable becomes a staging deployment, production-ready pull request, or implementation handoff.

Client access, decision-maker availability, and timely feedback are required for the 10-business-day timeline.

## Optional Contract Language

This can be included on the page in simplified form, or kept for contract/terms documentation:

- Sprint timeline begins on the agreed kickoff date, scheduled within 7 calendar days of contract signing and deposit payment.
- Client must provide required access, materials, and decision-maker availability before kickoff.
- Delays in access, feedback, or third-party dependencies may shift delivery dates.
- Discovery Day fees are non-refundable once booked, but may be rescheduled once with at least 24 hours’ notice.
- Sprint deposits are non-refundable after kickoff.
- If no working prototype or validated implementation direction exists by Day 5 due to failure on my side, the client may stop the sprint and receive a partial refund of up to 50% of the amount paid.

---

# Section 10: Who It Is For

## Heading

This is for you if…

Use a checklist.

- You run or lead product at a B2B SaaS company
- You know AI should be part of your product but do not want vague experimentation
- You want one useful AI workflow, not a giant AI transformation
- Your team can provide access to relevant product, data, or codebase context
- You can make decisions quickly during the sprint
- You want product judgment and execution, not just code
- You want your team to learn how to maintain and extend the workflow after the sprint

---

# Section 11: Who It Is Not For

## Heading

This is not for you if…

Use a checklist.

- You want to “add AI” without a real user workflow
- You need a full enterprise AI transformation
- Your data is inaccessible or not ready
- Your team cannot provide access or feedback during the sprint
- You want a general chatbot without a clear product use case
- You need guaranteed production deployment regardless of infrastructure constraints
- You want someone to replace your engineering team instead of working with your team

---

# Section 12: About Nasser

## Heading

Built by a product operator, not an AI tourist.

## Copy

I’m Nasser Ghanemzadeh, a former CEO/CPO and product leader with 17+ years of experience building and scaling technology products.

I’ve worked across product strategy, execution, AI product development, startup leadership, and founder advisory.

I’m currently building Vectig, an AI-native product for startup finance, investor communication, and founder operating clarity. I use Claude Code and modern AI development workflows in my own product work, so this sprint is based on practical implementation experience, not generic AI consulting theory.

This sprint combines product judgment, AI implementation, and founder-level execution discipline to help SaaS teams ship useful AI workflows faster.

Optional links:

- LinkedIn: `https://linkedin.com/in/ghanemzadeh`
- Email: `mailto:ghanemzadeh@gmail.com`
- Vectig: `https://vectig.com`

---

# Section 13: FAQ

## Heading

FAQ

Include these questions.

### Can you guarantee production deployment in 10 business days?

No. Production deployment depends on access, infrastructure, team availability, and third-party dependencies. If production release is blocked, the deliverable becomes a staging deployment, production-ready pull request, or implementation handoff.

### Do we need to know exactly what AI feature we want?

No. If you are unsure, start with the Discovery Day. The Discovery Day helps clarify the best use case and whether it is worth building.

### Do you replace our engineering team?

No. I help scope, design, and implement one narrow AI workflow. The sprint works best when your team can provide access, context, and feedback.

### What kind of AI features work best?

Narrow workflows with clear inputs and outputs work best. Examples include summaries, report generation, support workflows, onboarding assistants, sales analysis, finance scenarios, and document extraction.

### Can this work with our AI provider or cloud setup?

Yes. The sprint can support common AI implementation paths, including Anthropic API, AWS Bedrock, Google Vertex AI, OpenAI, or your existing provider setup, depending on your infrastructure and requirements.

Avoid wording such as “private Claude deployment” or “self-hosted Claude.”

### Do you offer team training?

Every sprint includes a team handoff and enablement session. Standalone workshops may be available for teams that want help adopting AI-assisted product and engineering workflows, but the core offer is focused on shipping one useful AI workflow.

### What happens after the sprint?

You can continue with a second sprint or a monthly advisory retainer for AI product strategy, roadmap prioritization, workflow review, and implementation guidance.

### What is the refund policy?

Discovery Day fees are non-refundable once booked, but can be rescheduled once with at least 24 hours’ notice.

Sprint deposits are non-refundable after kickoff. If no working prototype or validated implementation direction exists by Day 5 due to failure on my side, the client may stop the sprint and receive a partial refund of up to 50% of the amount paid.

---

# Section 14: After the Sprint

## Heading

After the Sprint

## Copy

After the first workflow ships, teams can continue with a second sprint or a monthly advisory retainer for AI product strategy, roadmap prioritization, workflow review, and implementation guidance.

Do not show detailed retainer pricing on the landing page yet.

---

# Section 15: Final CTA

## Heading

Want to ship one useful AI workflow?

## Copy

Start with a Discovery Day if you need help choosing the right use case.

Apply for the Sprint if you already know what you want to build and need help getting it shipped.

## CTAs

Primary:

Book a $500 Discovery Day

Link:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Discovery Day`

Secondary:

Apply for the $5,000 Sprint

Link:

`mailto:ghanemzadeh@gmail.com?subject=AI Feature Sprint Application`

---

## 8. Design Requirements

The page should feel:

- Clean
- Premium
- Founder-focused
- Strategic
- Practical
- Minimal
- Trustworthy
- Not hype-driven

Visual style:

- White or near-white background
- Dark text
- Strong typography
- Generous spacing
- Clear section hierarchy
- Simple cards
- Subtle borders
- Minimal accent color
- Mobile responsive
- Fast loading
- No heavy animations

Avoid:

- Generic AI imagery
- Robot icons
- Excessive gradients
- Cartoon visuals
- Overly startup-bro style
- Cluttered layouts
- Tool-first design that makes the offer feel like a developer tutorial

---

## 9. Technical Requirements

- Must work with the current GitHub Pages deployment setup.
- Must not require a backend.
- Must not require a database.
- Must be responsive on mobile, tablet, and desktop.
- Must include correct meta title and meta description.
- Must include Open Graph tags for LinkedIn sharing.
- Must preserve existing site styling where appropriate.
- Must not break the existing homepage or other pages.
- Must use semantic HTML.
- Must be accessible enough for basic screen reader and keyboard navigation.
- CTA buttons must be clear and visible above the fold.
- All links should work.
- External links should open safely.
- Email links should use the correct email address: `ghanemzadeh@gmail.com`.

---

## 10. SEO / Metadata

Page title:

`AI Feature Sprint for B2B SaaS Teams | Nasser Ghanemzadeh`

Meta description:

`A 10-business-day AI implementation sprint for founder-led B2B SaaS teams to scope, build, and ship one useful AI workflow into staging, production, or a production-ready pull request.`

Open Graph title:

`Ship one useful AI feature in 10 business days`

Open Graph description:

`AI Feature Sprint by Nasser Ghanemzadeh helps B2B SaaS teams turn vague AI ideas into one narrow shipped workflow.`

Canonical URL:

`https://ghanemzadeh.com/ai-feature-sprint/`

Suggested Open Graph type:

`website`

Suggested social sharing image:

Use existing site image if available. If there is no suitable image, do not block launch. The page should still include Open Graph title and description.

---

## 11. Acceptance Criteria

The task is complete when:

- A new page exists at `/ai-feature-sprint/`
- The page builds successfully through GitHub Pages
- The page is mobile responsive
- The page includes all required sections
- The page has working CTA links
- The page includes SEO and Open Graph metadata
- The page visually matches or improves the current site style
- Existing pages still work
- There are no broken internal links
- The page can be shared on LinkedIn with a proper preview title and description
- The page keeps the public offer simple: Discovery Day + Sprint, with Retainer only mentioned as an after-sprint path
- The page does not add a separate public workshop/training tier

---

## 12. Implementation Notes for Claude Code

Before coding:

1. Inspect the repository structure.
2. Identify whether the site is plain HTML, Jekyll, or another static setup.
3. Follow the existing architecture and styling conventions.
4. Reuse existing layout/header/footer if available.
5. Create the new `/ai-feature-sprint/` route/page.
6. Keep implementation minimal and static.
7. Do not introduce new dependencies unless absolutely necessary.
8. Do not redesign the whole website.
9. Do not change unrelated files except where needed for navigation or metadata.
10. After implementation, provide a summary of changed files and how to test locally.

---

## 13. Optional Navigation

If the existing site has a navigation menu, add a subtle link:

`AI Feature Sprint`

Only add it if it does not clutter the current navigation.

If adding to navigation is risky, skip it.

---

## 14. Payment / Booking Notes

For the first version, mailto links are acceptable to launch quickly.

Later, replace them with:

- A payment link for the $500 Discovery Day
- A booking link for Discovery Day scheduling
- A short application form for the $5,000 Sprint

Recommended future options:

- Tally or similar for applications
- Cal.com or Calendly for booking
- Lemon Squeezy, Paddle, invoice, or bank transfer for payments depending on availability and client type

Do not block the first launch on perfect payment automation.

---

## 15. Future Enhancements

Do not implement these now unless simple:

- Replace mailto links with Tally form
- Add Cal.com or Calendly booking
- Add payment link for Discovery Day
- Add testimonial/case study section
- Add analytics event tracking
- Add downloadable one-page PDF
- Add a dedicated thank-you page
- Add a short Discovery Day memo sample
- Add workshop/training as a private upsell after validation

For this version, prioritize launch speed.

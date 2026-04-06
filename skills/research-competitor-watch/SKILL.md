---
name: research-competitor-watch
description: Focused competitive intelligence on specific competitors. Updates dossiers with latest moves, pricing, features, and market positioning.
user-invocable: true
version: 1.1.0
---

# Research Competitor Watch -- Competitive Intelligence

Focused deep-dive on specific competitors. Updates or creates competitive dossiers.

## Step 0: Initialize

```bash
mkdir -p .teams/research/{workspace,output,intelligence}
mkdir -p .teams/reviews/research
mkdir -p .teams/requests
```

Generate watch ID: `watch-{YYYYMMDD-HHMMSS}`

## Step 1: Identify Targets

From user message or existing dossiers in `.teams/research/intelligence/`:
- **Competitors to watch:** specific company names
- **Focus areas:** pricing changes, new features, hiring, funding, partnerships, content strategy

Check `.teams/research/intelligence/` for existing dossiers on these competitors. If found, note the last analysis date to focus on what changed.

## Step 2: Investigation (2 agents IN PARALLEL, model: "sonnet")

### Agent 1: Product & Pricing Intel
Spawn **research-competitor-analyst**:
```
Deep-dive on: {competitor names}
Focus: product features, pricing tiers, recent feature launches, customer reviews (G2, Capterra).
Check if existing dossier exists: .teams/research/intelligence/{competitor-slug}-dossier.md
If yes, focus on what changed since last check.
USE mcp__firecrawl__* to scrape competitor websites, pricing pages, and feature lists for structured data.
USE mcp__exa__* for semantic search to find recent reviews, comparisons, and mentions.
Write to: .teams/research/workspace/{watch-id}/PRODUCT-INTEL.md
```

### Agent 2: Strategic Intel
Spawn **research-trend-spotter**:
```
Strategic intelligence on: {competitor names}
Focus: recent funding, hiring patterns (what roles?), partnerships, press releases, conference talks.
What direction are they heading?
USE mcp__exa__* to find recent news, funding announcements, and job postings.
USE mcp__firecrawl__* to scrape company blogs, press pages, and hiring portals.
Write to: .teams/research/workspace/{watch-id}/STRATEGIC-INTEL.md
```

## Step 3: Dossier Update (1 agent, model: "opus")

Spawn **research-competitor-analyst** (model: "opus"):
```
Update the competitive dossier for: {competitor names}

<product_intel>{PRODUCT-INTEL.md content}</product_intel>
<strategic_intel>{STRATEGIC-INTEL.md content}</strategic_intel>
<existing_dossier>{existing dossier content if any, or "NEW"}</existing_dossier>

Produce updated dossier highlighting what CHANGED since last analysis.
Write to: .teams/research/intelligence/{competitor-slug}-dossier.md
Also write summary to: .teams/research/output/{watch-id}-DOSSIER.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/research/output/{watch-id}-DOSSIER.md`

If revision requested by Supervisor:
1. Read the specific feedback from the REVIEW.md
2. Route back to Step 3 with revision context:
   ```
   REVISION REQUEST from Supervisor (attempt {N}/3):
   {specific feedback from REVIEW.md}
   Revise ONLY the flagged dimensions. Do not regress other areas.
   ```
3. Re-run supervisor review. Max 3 revision loops.

## Step 5: Alert and Cross-Team Trigger

If the competitor made a significant move (new product, price change, major funding, acquisition):

Auto-create a Marketing request:
```markdown
---
id: req-{timestamp}
from: research
to: marketing
type: content-request
priority: high
source: {watch-id}-DOSSIER.md
created: {ISO timestamp}
status: pending
---

# Content Positioning Request: Competitor Alert

## Context
Competitive intelligence detected a significant move by {competitor name}:
{1-2 sentence summary of what changed}

See full dossier: .teams/research/intelligence/{competitor-slug}-dossier.md

## Deliverables Requested
- [ ] LinkedIn post positioning our differentiation against this move
- [ ] Talking points for sales team (if applicable)

## Key Differentiators to Highlight
- {differentiator 1 from dossier}
- {differentiator 2 from dossier}
```

Write to: `.teams/requests/research-to-marketing-{watch-id}.md`

If no significant move detected, skip the cross-team trigger and present the dossier update to the user.

---
name: research-landscape
description: Broad market landscape scan -- identifies top opportunities, trends, and competitive dynamics across an entire industry or domain. Ranks opportunities for deep-dive.
user-invocable: true
version: 1.1.0
---

# Research Landscape -- Market Landscape Scan

Broad scan of an industry/domain to identify the best opportunities. Think of this as the "wide net" before diving deep with `/research:opportunity`.

## Step 0: Initialize

```bash
mkdir -p .teams/research/{workspace,output,intelligence,trends}
mkdir -p .teams/reviews/research
mkdir -p .teams/requests
```

Generate ID: `landscape-{YYYYMMDD-HHMMSS}`

## Step 1: Define Domain

Extract from user:
- **Domain/Industry:** what space to scan
- **Our capabilities:** what we can offer
- **Constraints:** geography, budget, tech, regulatory limitations
- **Focus areas:** any specific sub-segments to prioritize

## Step 2: Parallel Scan (4 agents IN PARALLEL, model: "sonnet")

### Agent 1: Market Overview
Spawn **research-market-researcher** (model: "sonnet"):
```
Broad market overview of: {domain}
Identify top 5-7 sub-segments with market size and growth for each.
USE mcp__exa__* for semantic search on market reports, industry analysis, sizing data.
USE mcp__firecrawl__* to scrape industry report pages and data sources for structured data.
Write to: .teams/research/workspace/{landscape-id}/MARKET-OVERVIEW.md
```

### Agent 2: Competitive Map
Spawn **research-competitor-analyst** (model: "sonnet"):
```
Map the competitive landscape for: {domain}
Identify major players per sub-segment. Find underserved areas.
Write to: .teams/research/workspace/{landscape-id}/COMPETITIVE-MAP.md
```

### Agent 3: Opportunity Signals
Spawn **research-lead-scout** (model: "sonnet"):
```
Scan for business opportunity signals in: {domain}
Look for: companies actively buying, RFPs, job postings (hiring for this), funding rounds, partnership signals.
Write to: .teams/research/workspace/{landscape-id}/OPPORTUNITY-SIGNALS.md
```

### Agent 4: Trend Landscape
Spawn **research-trend-spotter** (model: "sonnet"):
```
Macro trend analysis for: {domain}
Identify trends that create NEW opportunities vs. trends that close existing ones.
Write to: .teams/research/workspace/{landscape-id}/TREND-LANDSCAPE.md
```

## Step 3: Opportunity Ranking (1 agent, model: "opus")

Synthesize all 4 reports. Spawn **research-market-researcher** (model: "opus"):

```
Synthesize the landscape scan into a ranked opportunity list.

<market>{MARKET-OVERVIEW.md content}</market>
<competition>{COMPETITIVE-MAP.md content}</competition>
<signals>{OPPORTUNITY-SIGNALS.md content}</signals>
<trends>{TREND-LANDSCAPE.md content}</trends>

Our capabilities: {what we offer}

Produce a ranked list of top 5 opportunities with:
1. Opportunity name and description
2. Market size estimate
3. Competition intensity (low/medium/high)
4. Our competitive advantage
5. Timing assessment (now/6mo/1yr)
6. Recommended investigation depth (quick-look / deep-dive / skip)

Write to: .teams/research/output/{landscape-id}-LANDSCAPE.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/research/output/{landscape-id}-LANDSCAPE.md`

If revision requested by Supervisor:
1. Read specific feedback from `.teams/reviews/research/{landscape-id}-LANDSCAPE-REVIEW.md`
2. Route back to the synthesis agent (Step 3) with revision context:
   ```
   REVISION REQUEST from Supervisor (attempt {N}/3):
   {specific feedback from REVIEW.md}
   Revise ONLY the flagged dimensions. Do not regress other areas.
   ```
3. If the issue is with underlying research (source quality, data recency), re-run the relevant research agent from Step 2 before re-synthesizing.
4. Max 3 revision loops.

## Step 5: Cross-Team Trigger

For each opportunity ranked "deep-dive" with timing "now" or "6mo":

Auto-create a Marketing awareness request:
```markdown
---
id: req-{timestamp}
from: research
to: marketing
type: content-request
priority: medium
source: {landscape-id}-LANDSCAPE.md
created: {ISO timestamp}
status: pending
---

# Thought Leadership Request: {domain} Opportunities

## Context
Landscape scan of {domain} identified {N} high-potential opportunities.
See full report: .teams/research/output/{landscape-id}-LANDSCAPE.md

## Deliverables Requested
- [ ] LinkedIn thought leadership post positioning us as experts in {domain}
- [ ] Content series covering top {N} trends identified

## Key Insights from Research
- {top insight 1}
- {top insight 2}
- {top insight 3}
```

Write to: `.teams/requests/research-to-marketing-{landscape-id}.md`

## Step 6: Present to User

Show:
- Ranked opportunity list with scores
- Supervisor review score
- For each "deep-dive" opportunity: offer to run `/research:opportunity` for full investigation
- Note that a Marketing request has been auto-created for thought leadership content

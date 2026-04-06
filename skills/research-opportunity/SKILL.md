---
name: research-opportunity
description: Deep-dive investigation of a specific business opportunity — market size, competition, leads, trends, and GO/NO-GO recommendation with confidence score.
user-invocable: true
version: 1.1.0
---

# Research Opportunity — Business Opportunity Investigation

Investigates a specific business opportunity using the full Research team. Produces an actionable report with a GO/CONDITIONAL-GO/NO-GO recommendation.

## Step 0: Initialize

```bash
mkdir -p .teams/research/{workspace,output,intelligence,trends}
mkdir -p .teams/reviews/research
mkdir -p .teams/requests
```

Generate ID: `opp-{YYYYMMDD-HHMMSS}`

## Step 1: Define Scope

Extract from user message:
- **Opportunity:** what market/product/service to investigate
- **Questions to answer:** specific unknowns (market size? competitors? regulations?)
- **Our angle:** what we'd offer in this space
- **Constraints:** geography, budget, timeline, tech stack limitations

## Step 2: Parallel Research Phase (4 agents IN PARALLEL, model: "sonnet" — all read-only research)

### Agent 1: Market Researcher
Spawn **research-market-researcher**:
```
Investigate the market for: {opportunity description}

Focus on: TAM/SAM/SOM, growth rate, market dynamics, key segments, regulatory environment.
Our angle: {what we'd offer}
USE mcp__exa__* for semantic search on market reports, sizing data, industry analysis.
USE mcp__firecrawl__* to scrape industry pages and data sources for structured data.

Write to: .teams/research/workspace/{opp-id}/MARKET.md
```

### Agent 2: Competitor Analyst
Spawn **research-competitor-analyst**:
```
Analyze the competitive landscape for: {opportunity description}

Find: major players, their pricing, features, positioning, strengths/weaknesses.
Identify gaps we could exploit.
USE mcp__firecrawl__* to scrape competitor websites, pricing pages, and feature lists.
USE mcp__exa__* for semantic search on competitor reviews, comparisons, and mentions.

Write to: .teams/research/workspace/{opp-id}/COMPETITORS.md
```

### Agent 3: Lead Scout
Spawn **research-lead-scout**:
```
Identify potential customers and partners for: {opportunity description}

Find: top 10 qualified leads, decision-makers, partnership opportunities.
Our offering: {what we'd offer}

Write to: .teams/research/workspace/{opp-id}/LEADS.md
```

### Agent 4: Trend Spotter
Spawn **research-trend-spotter**:
```
Analyze trends relevant to: {opportunity description}

Focus on: emerging tech, regulatory changes, market shifts, timing signals.
Is now the right time to enter this space?

Write to: .teams/research/workspace/{opp-id}/TRENDS.md
```

## Step 3: Synthesis (1 agent, model: "opus" — judgment/decision work)

Read all 4 research outputs. Spawn a synthesis agent (use **research-market-researcher** (model: "opus")):

```
Synthesize these 4 research reports into an Opportunity Report.

<market>{MARKET.md}</market>
<competitors>{COMPETITORS.md}</competitors>
<leads>{LEADS.md}</leads>
<trends>{TRENDS.md}</trends>

Produce:
1. Executive summary (5 sentences max)
2. GO / CONDITIONAL-GO / NO-GO recommendation
3. Confidence score (1-10) with justification
4. Risk matrix (probability x impact)
5. Top 3 recommended next steps with owners/timelines
6. Key metrics to track

Write the full report to: .teams/research/output/{opp-id}-REPORT.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/research/output/{opp-id}-REPORT.md`

The Supervisor evaluates against the Research Rubric — source quality, logical rigor, actionability, quantification.

## Step 5: Cross-Team Trigger

If the report verdict is GO or CONDITIONAL-GO:
1. Auto-create a Marketing request:
```markdown
---
id: req-{timestamp}
from: research
to: marketing
type: campaign-request
priority: {high if GO, medium if CONDITIONAL-GO}
source: {opp-id}-REPORT.md
created: {ISO timestamp}
status: pending
---

# Marketing Campaign Request

## Context
Research identified a {GO|CONDITIONAL-GO} opportunity: {opportunity name}
See full report: .teams/research/output/{opp-id}-REPORT.md

## Deliverables Requested
- [ ] LinkedIn post announcing our entry/expertise in this space
- [ ] Content strategy for ongoing thought leadership
- [ ] CTA driving to: {website URL}

## Key Messages from Research
- {top 3 findings that should inform marketing}
```

2. Write to `.teams/requests/research-to-marketing-{opp-id}.md`

## Step 6: Present to User

Show:
- Executive summary
- GO/CONDITIONAL-GO/NO-GO verdict with confidence score
- Supervisor review score
- If GO: mention that a Marketing request has been auto-created
- Key next steps

---
name: sales-prospect
description: Full prospecting pipeline — ICP definition, signal scanning, prospect profiling, scoring, and outreach sequence generation. From research to ready-to-send messages.
user-invocable: true
version: 1.0.0
---

# Sales Prospect — Find & Qualify Leads

End-to-end prospecting: define ICP → scan for signals → build profiles → score → generate outreach.

## Step 0: Initialize

```bash
mkdir -p .teams/sales/{workspace,output,pipeline,templates}
mkdir -p .teams/reviews/sales
mkdir -p .teams/requests
```

Generate ID: `prospect-{YYYYMMDD-HHMMSS}`

## Step 1: Research Foundation (1 agent, model: "sonnet")

Check if research exists. Spawn **research-lead-scout** (model: "sonnet"):
```
Scan for business opportunity signals relevant to our offering.
Read .teams/research/output/ for existing landscape scans.
If no research exists, do a quick scan of the target market.

Focus on: companies actively buying, job postings, funding rounds, tech changes, compliance deadlines.

Write to: .teams/sales/workspace/{prospect-id}-SIGNALS.md
```

## Step 2: Prospect Research (1 agent, model: "opus")

Spawn **sales-prospector** (model: "opus"):
```
Build a scored prospect list from the research signals.

<signals>
{content of SIGNALS.md from Step 1}
</signals>

User's offering: {what we sell / what we do}
Target ICP: {from user input or infer from research}

Build Tier 1 (hot), Tier 2 (warm), Tier 3 (nurture) prospect lists.
Write to: .teams/sales/output/{prospect-id}-PROSPECTS.md
```

## Step 3: Objection Prep (1 agent, model: "opus")

Spawn **sales-objection-handler** (model: "opus"):
```
For the top prospects identified, prepare:
1. Competitive battle cards for their likely current solutions
2. Objection responses for their likely pushbacks
3. Killer questions to ask in discovery calls

Read prospect list from: .teams/sales/output/{prospect-id}-PROSPECTS.md
Read competitor intel from: .teams/research/intelligence/
Write to: .teams/sales/output/{prospect-id}-BATTLECARDS.md
```

## Step 4: Outreach Sequences (1 agent, model: "opus")

Spawn **sales-outreach-writer** (model: "opus"):
```
Write personalized outreach sequences for Tier 1 prospects.

<prospects>
{content of PROSPECTS.md — Tier 1 only}
</prospects>

Write a 5-touch multi-channel sequence (email + LinkedIn) for each Tier 1 prospect.
Write to: .teams/sales/output/{prospect-id}-OUTREACH.md
```

## Step 5: Proposal Templates (1 agent, model: "opus" — only for Tier 1 prospects with deal size > $10K)

Spawn **sales-proposal-generator** (model: "opus"):
```
Create a tailored proposal template for each Tier 1 prospect.

<prospects>
{Tier 1 prospects from PROSPECTS.md}
</prospects>

Read competitor intel from: .teams/research/intelligence/
Create a proposal draft per Tier 1 prospect with: executive summary, their specific pain, our solution, ROI, pricing.
Write to: .teams/sales/output/{prospect-id}-PROPOSALS.md
```

## Step 6: Supervisor Review

Invoke `/supervisor:review` on `.teams/sales/output/{prospect-id}-PROSPECTS.md`

If revision requested: re-run the relevant step with feedback (max 3 loops).

## Step 7: Pipeline Setup

Spawn **sales-pipeline-tracker** (model: "opus"):
```
Create deal records for all Tier 1 prospects. Set initial stage to "Prospect."
Read from: .teams/sales/output/{prospect-id}-PROSPECTS.md
Write deal files to: .teams/sales/pipeline/
```

## Step 8: Present to User

Show:
- Prospect list with scores and tiers
- Battle cards for top competitors
- Ready-to-send outreach sequences
- Proposal templates for Tier 1 prospects
- Pipeline initialized with deal tracking
- Supervisor review score

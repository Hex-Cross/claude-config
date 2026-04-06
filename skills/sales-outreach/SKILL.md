---
name: sales-outreach
description: Focused outreach writing session — takes existing prospects and creates personalized multi-channel sequences with A/B variants.
user-invocable: true
version: 1.0.0
---

# Sales Outreach — Write Outreach Sequences

Focused session to create personalized outreach for specific prospects.

## Step 0: Initialize

```bash
mkdir -p .teams/sales/{workspace,output,templates}
mkdir -p .teams/reviews/sales
mkdir -p .teams/requests
```

Generate ID: `outreach-{YYYYMMDD-HHMMSS}`

## Step 1: Gather Context (1 agent, model: "sonnet")

Spawn **sales-prospector** (model: "sonnet"):
```
Read existing prospect data and gather fresh context for outreach.

Check .teams/sales/output/ for existing prospect profiles.
Check .teams/sales/pipeline/ for deal status.
Check .teams/marketing/published/ for recent content to reference.
Check .teams/research/intelligence/ for competitor positioning.

Write context brief to: .teams/sales/workspace/{outreach-id}-CONTEXT.md
```

## Step 2: Write Sequences (1 agent, model: "opus")

Spawn **sales-outreach-writer** (model: "opus"):
```
Write personalized outreach sequences.

<context>
{content of CONTEXT.md}
</context>

Target: {user-specified prospects or all Tier 1 from latest prospect list}

For each prospect: 5-touch multi-channel sequence with A/B subject lines.
Write to: .teams/sales/output/{outreach-id}-SEQUENCES.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/sales/output/{outreach-id}-SEQUENCES.md`

If revision requested: re-run Step 2 with feedback (max 3 loops).

## Step 4: Present Results

Show:
- Sequences per prospect with send schedule
- A/B variants for testing
- Supervisor review score

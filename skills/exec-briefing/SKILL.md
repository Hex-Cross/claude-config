---
name: exec-briefing
description: Weekly executive briefing — synthesizes all team outputs into dashboard, highlights, concerns, pending decisions, and recommended actions.
user-invocable: true
version: 1.0.0
---

# Exec Briefing — Weekly Business Summary

Cross-team synthesis into an executive briefing.

## Step 0: Initialize

```bash
mkdir -p .teams/exec/{output,okrs,decisions}
mkdir -p .teams/reviews/exec
```

Generate ID: `briefing-{YYYYMMDD-HHMMSS}`

## Step 1: Data Collection (4 agents IN PARALLEL, model: "sonnet")

### Agent 1: Research Summary
Spawn **research-market-researcher** (model: "sonnet"):
```
Summarize recent research activity. Read .teams/research/output/ and .teams/research/intelligence/.
What new opportunities were found? What competitor moves happened? What trends emerged?
Write to: .teams/exec/output/{briefing-id}-RESEARCH-SUMMARY.md
```

### Agent 2: Marketing Summary
Spawn **marketing-content-strategist** (model: "sonnet"):
```
Summarize recent marketing activity. Read .teams/marketing/published/ and .teams/marketing/output/.
What content was published? What engagement did it get? What's in the pipeline?
Write to: .teams/exec/output/{briefing-id}-MARKETING-SUMMARY.md
```

### Agent 3: Sales Summary
Spawn **sales-pipeline-tracker** (model: "sonnet"):
```
Summarize sales activity. Read .teams/sales/pipeline/ and .teams/sales/output/.
Pipeline value, deals moved, outreach results, conversion rates.
Write to: .teams/exec/output/{briefing-id}-SALES-SUMMARY.md
```

### Agent 4: Dev/Quality Summary
Spawn **test-strategist** (model: "sonnet"):
```
Summarize dev and quality activity. Read .teams/testing/output/ and .teams/dev/output/.
Features shipped, test results, quality scores, technical health.
Write to: .teams/exec/output/{briefing-id}-DEV-SUMMARY.md
```

## Step 2: Synthesize Briefing (1 agent, model: "opus")

Spawn **exec-strategist** (model: "opus"):
```
Produce the weekly executive briefing from all team summaries.

Read:
- .teams/exec/output/{briefing-id}-RESEARCH-SUMMARY.md
- .teams/exec/output/{briefing-id}-MARKETING-SUMMARY.md
- .teams/exec/output/{briefing-id}-SALES-SUMMARY.md
- .teams/exec/output/{briefing-id}-DEV-SUMMARY.md
- .teams/exec/okrs/ for current OKR status

Produce a complete weekly briefing with: dashboard, highlights, concerns, decisions needed, next week focus.
Write to: .teams/exec/output/{briefing-id}-WEEKLY-BRIEFING.md
```

## Step 3: Polish Briefing (1 agent, model: "opus")

Spawn **exec-briefing-writer** (model: "opus"):
```
Take the weekly briefing and produce a polished executive summary.

Read: .teams/exec/output/{briefing-id}-WEEKLY-BRIEFING.md

Produce:
- A TL;DR (3 bullets max)
- A clean dashboard table
- Scannable highlights and concerns
- Recommended actions with owners

Write polished version to: .teams/exec/output/{briefing-id}-EXEC-SUMMARY.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/exec/output/{briefing-id}-WEEKLY-BRIEFING.md`

## Step 5: Present to User

Show the full briefing and the executive summary with all sections.

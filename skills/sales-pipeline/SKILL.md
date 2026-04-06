---
name: sales-pipeline
description: Pipeline report — generates revenue forecast, deal status summary, stale deal alerts, conversion funnel, and recommended actions.
user-invocable: true
version: 1.0.0
---

# Sales Pipeline — Pipeline Report & Forecast

Generate a comprehensive sales pipeline report.

## Step 0: Initialize

```bash
mkdir -p .teams/sales/{workspace,output,pipeline}
mkdir -p .teams/reviews/sales
mkdir -p .teams/exec/output
```

Generate ID: `pipeline-{YYYYMMDD-HHMMSS}`

## Step 1: Pipeline Analysis (1 agent, model: "opus")

Spawn **sales-pipeline-tracker** (model: "opus"):
```
Generate a comprehensive pipeline report.

Read all deal files from: .teams/sales/pipeline/
Read recent outreach results from: .teams/sales/output/
Read research for market context from: .teams/research/output/

Produce:
- Pipeline summary with total value and weighted forecast
- Stage breakdown with conversion rates
- Stale deal alerts (14+ days no activity)
- Win/loss analysis
- Recommended next actions per deal

Write to: .teams/sales/output/{pipeline-id}-PIPELINE-REPORT.md
```

## Step 2: Financial Projection (1 agent, model: "opus")

Spawn **exec-financial-analyst** (model: "opus"):
```
Based on the pipeline data, produce a revenue forecast.

<pipeline>
{content of PIPELINE-REPORT.md}
</pipeline>

Model: conservative / expected / aggressive scenarios for next 3-6 months.
Write to: .teams/exec/output/{pipeline-id}-REVENUE-FORECAST.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/sales/output/{pipeline-id}-PIPELINE-REPORT.md`

If revision requested: re-run Step 1 with feedback (max 3 loops).

## Step 4: Present Results

Show:
- Pipeline dashboard (deals by stage, values)
- Revenue forecast (3 scenarios)
- Deals needing immediate attention
- Recommended actions

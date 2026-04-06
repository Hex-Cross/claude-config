---
name: exec-strategy
description: Strategic planning session — OKR setting, quarterly review, market positioning analysis, and business roadmap creation.
user-invocable: true
version: 1.0.0
---

# Exec Strategy — Strategic Planning

Deep strategic planning session with OKR tracking and business roadmap.

## Step 0: Initialize

```bash
mkdir -p .teams/exec/{output,okrs,decisions}
mkdir -p .teams/reviews/exec
mkdir -p .teams/requests
```

Generate ID: `strategy-{YYYYMMDD-HHMMSS}`

## Step 1: Situation Analysis (3 agents IN PARALLEL, model: "sonnet")

### Agent 1: Market Position
Spawn **research-market-researcher** (model: "sonnet"):
```
Current market position analysis. Read all research output.
Where are we? Where are competitors? What's changing?
Write to: .teams/exec/output/{strategy-id}-MARKET-POSITION.md
```

### Agent 2: Business Performance
Spawn **sales-pipeline-tracker** (model: "sonnet"):
```
Business performance summary. Read pipeline, sales output, marketing output.
Revenue trajectory, win rates, customer acquisition metrics.
Write to: .teams/exec/output/{strategy-id}-PERFORMANCE.md
```

### Agent 3: Product Health
Spawn **test-strategist** (model: "sonnet"):
```
Product/technical health summary. Read testing output, dev output.
Quality scores, technical debt, feature velocity.
Write to: .teams/exec/output/{strategy-id}-PRODUCT-HEALTH.md
```

## Step 2: Strategic Synthesis (1 agent, model: "opus")

Spawn **exec-strategist** (model: "opus"):
```
Produce a strategic plan based on situation analysis.

Read:
- .teams/exec/output/{strategy-id}-MARKET-POSITION.md
- .teams/exec/output/{strategy-id}-PERFORMANCE.md
- .teams/exec/output/{strategy-id}-PRODUCT-HEALTH.md
- .teams/exec/okrs/ for current OKRs

Produce:
1. SWOT analysis
2. Strategic priorities for next quarter
3. OKR recommendations (3-5 objectives, 3 KRs each)
4. Resource allocation recommendation
5. Risk register

Write to: .teams/exec/output/{strategy-id}-STRATEGIC-PLAN.md
```

## Step 3: Financial Modeling (1 agent, model: "opus")

Spawn **exec-financial-analyst** (model: "opus"):
```
Model the financial implications of the strategic plan.

<plan>
{content of STRATEGIC-PLAN.md}
</plan>

Produce 12-month revenue projections (3 scenarios) aligned to the plan.
Write to: .teams/exec/output/{strategy-id}-FINANCIAL-MODEL.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/exec/output/{strategy-id}-STRATEGIC-PLAN.md`

## Step 5: Present to User

Show: SWOT, strategic priorities, OKRs, financial projections, risks.

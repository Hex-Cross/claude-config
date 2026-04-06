---
name: exec-decision
description: Structured decision analysis — frames a business decision with options, scoring matrix, tradeoffs, devil's advocate, and clear recommendation.
user-invocable: true
version: 1.0.0
---

# Exec Decision — Decision Framework

Structure an ambiguous decision into clear options with tradeoff analysis.

## Step 0: Initialize

```bash
mkdir -p .teams/exec/{output,decisions}
mkdir -p .teams/reviews/exec
```

Generate ID: `decision-{YYYYMMDD-HHMMSS}`

## Step 1: Research Context (2 agents IN PARALLEL, model: "sonnet")

### Agent 1: Market Context
Spawn **research-market-researcher** (model: "sonnet"):
```
Research context for this decision: {user's decision question}
Find: market data, competitor approaches, industry benchmarks, case studies.
Write to: .teams/exec/output/{decision-id}-MARKET-CONTEXT.md
```

### Agent 2: Financial Context
Spawn **exec-financial-analyst** (model: "sonnet"):
```
Gather financial data relevant to: {user's decision question}
Find: cost estimates, ROI benchmarks, pricing data, budget implications.
Write to: .teams/exec/output/{decision-id}-FINANCIAL-CONTEXT.md
```

## Step 2: Decision Analysis (1 agent, model: "opus")

Spawn **exec-decision-maker** (model: "opus"):
```
Analyze this decision with full framework:

Decision: {user's question}

<market-context>
{content of MARKET-CONTEXT.md}
</market-context>

<financial-context>
{content of FINANCIAL-CONTEXT.md}
</financial-context>

Produce: options, scoring matrix, devil's advocate, recommendation with deadline.
Write to: .teams/exec/decisions/{decision-id}-DECISION.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/exec/decisions/{decision-id}-DECISION.md`

## Step 4: Present to User

Show the decision analysis with scoring matrix and recommendation.
User makes the final call.

---
name: ab-test
description: A/B testing framework setup — feature flags, experiment configuration, variant assignment, and statistical analysis for controlled experiments
user-invocable: true
version: 1.0.0
---

# A/B Testing Framework

Set up and analyze controlled experiments.

---

## Phase 1: Framework Detection

1. Check for existing feature flag tools: LaunchDarkly, GrowthBook, Vercel Edge Config, PostHog, custom.
2. If none: recommend and set up GrowthBook (open-source, self-hostable) or Vercel Edge Config (for Vercel projects).
3. Read existing experiment infrastructure.

## Phase 2: Experiment Setup

1. Accept experiment definition from user: hypothesis, variants, metrics, traffic allocation.
2. Generate experiment configuration:

```typescript
interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    weight: number; // traffic percentage
    description: string;
  }[];
  metrics: {
    primary: string; // e.g., "conversion_rate"
    secondary: string[]; // e.g., ["time_on_page", "bounce_rate"]
    guardrail: string[]; // e.g., ["error_rate", "latency_p95"]
  };
  targeting: {
    percentage: number; // % of total traffic
    segments?: string[]; // user segments
  };
  startDate: Date;
  endDate?: Date;
  minSampleSize: number; // calculated from MDE
}
```

## Phase 3: Code Generation

Generate:
1. Feature flag component/hook for the framework
2. Variant assignment logic (hash-based, consistent per user)
3. Event tracking for experiment metrics
4. Server-side assignment for SSR/edge

## Phase 4: Analysis

When experiment has data:
1. Calculate: conversion rate per variant, confidence interval, p-value
2. Check: minimum sample size reached, novelty effect subsided (7+ days)
3. Determine: statistically significant winner, no winner yet, or inconclusive
4. Recommend: ship variant X, extend experiment, or kill experiment

## Phase 5: Report

```markdown
# Experiment Report: {name}

## Hypothesis
{hypothesis}

## Results
| Variant | Users | Conversions | Rate | vs Control | p-value |
|---------|-------|-------------|------|-----------|---------|

## Decision: {SHIP_VARIANT|EXTEND|KILL}
{reasoning with statistical backing}
```

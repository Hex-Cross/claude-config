---
name: test-performance
description: Focused performance testing session — k6 load tests, Lighthouse audits, Core Web Vitals, bundle analysis. Identifies bottlenecks and scalability limits.
user-invocable: true
version: 1.0.0
---

# Test Performance — Load & Speed Testing

Focused performance testing using k6 and Lighthouse.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests

# Check for k6
which k6 2>/dev/null || echo "⚠️ k6 not installed — load tests will be skipped. Install: https://k6.io/docs/get-started/installation/"

# Check for Chromium (needed for Lighthouse)
npx playwright --version 2>/dev/null || (npm install -D @playwright/test && npx playwright install chromium)
```

Generate ID: `perf-{YYYYMMDD-HHMMSS}`

## Step 1: Quick Analysis (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Quick analysis for performance testing. Identify:
- All API endpoints (with expected request patterns)
- User-facing pages (for Lighthouse/CWV)
- Database-heavy operations
- File upload/download endpoints
- Any existing performance baselines
- Expected traffic patterns (if documented)

Write a brief performance plan to: .teams/testing/workspace/{perf-id}-PLAN.md
Focus ONLY on performance — skip E2E, security, etc.
```

## Step 2: Run Tests (1 agent, model: "opus")

Spawn **test-performance-engineer** (model: "opus"):
```
Execute performance tests based on this plan:

<plan>
{content of performance plan from Step 1}
</plan>

Run:
1. Lighthouse audits on all key pages (desktop + mobile)
2. k6 load tests on critical API endpoints (if k6 available)
3. Bundle size analysis (if applicable)

Write k6 scripts to: tests/performance/
Write report to: .teams/testing/reports/{perf-id}-PERFORMANCE.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{perf-id}-PERFORMANCE.md`

If revision requested: re-run Step 2 with supervisor feedback (max 3 loops).

## Step 4: Present Results

Show:
- Core Web Vitals per page (LCP, INP, CLS)
- API response times (p50, p95, p99)
- Bottlenecks identified with root cause
- Bundle size breakdown (if applicable)
- Priority fixes ranked by impact
- Supervisor review score

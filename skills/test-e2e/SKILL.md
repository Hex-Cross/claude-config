---
name: test-e2e
description: Focused Playwright E2E test session — analyzes app, writes and runs end-to-end tests for critical user flows, produces execution report.
user-invocable: true
version: 1.0.0
---

# Test E2E — Playwright End-to-End Tests

Focused E2E testing session using Playwright.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests

# Ensure Playwright is installed
npx playwright --version 2>/dev/null || (npm install -D @playwright/test && npx playwright install)
```

Generate ID: `e2e-{YYYYMMDD-HHMMSS}`

## Step 1: Quick Analysis (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Quick analysis of this app for E2E testing. Identify:
- All user-facing routes/pages
- Critical user flows (signup, login, main feature, checkout, etc.)
- Form submissions and data mutations
- Protected routes requiring auth
- Existing E2E tests (if any)

Write a brief E2E plan to: .teams/testing/workspace/{e2e-id}-PLAN.md
Focus ONLY on E2E — skip API, performance, visual, etc.
```

## Step 2: Write & Run Tests (1 agent, model: "opus")

Spawn **test-e2e-engineer** (model: "opus"):
```
Write and run Playwright E2E tests based on this plan:

<plan>
{content of E2E plan from Step 1}
</plan>

Requirements:
- Cover all critical user flows
- Test both happy path and error paths
- Include mobile viewport tests for key flows
- Use proper selectors (getByRole, getByText, data-testid)
- Run tests and capture results

Write tests to: e2e/ or tests/e2e/
Write report to: .teams/testing/reports/{e2e-id}-E2E.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{e2e-id}-E2E.md`

If revision requested: re-run Step 2 with supervisor feedback (max 3 loops).

## Step 4: Present Results

Show:
- Tests passed/failed/skipped
- Failed test details with screenshots
- Coverage of user flows
- Suggested fixes for failures
- Supervisor review score

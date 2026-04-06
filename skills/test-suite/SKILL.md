---
name: test-suite
description: Full test suite orchestrator — strategist analyzes app, spawns all test agents in parallel waves, collects results, routes to supervisor review. The complete quality gate.
user-invocable: true
version: 1.0.0
---

# Test Suite — Full Application Testing

Complete testing pipeline: analyze → test all layers → report → supervisor review.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,strategy,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests
```

Generate ID: `test-{YYYYMMDD-HHMMSS}`

## Step 1: Strategy (1 agent, model: "opus")

Spawn **test-strategist** (model: "opus"):
```
Analyze this application and produce a comprehensive test strategy.

Scan the project root for: package.json, route structure, API endpoints, existing tests, auth flows, database connections, CI config.

Write strategy to: .teams/testing/strategy/{test-id}-STRATEGY.md

Include: risk map, test assignments for all agents, success criteria.
```

Read the strategy output before proceeding.

## Step 1.5: Test Data Setup (1 agent, model: "opus")

Spawn **test-data-seeder** (model: "opus"):
```
Analyze the app's data schema and create test fixtures, factories, and seed scripts.

<strategy>
{content of STRATEGY.md}
</strategy>

Create:
- Factory functions for all entities (tests/factories/)
- Seed scripts for test database (tests/seed/)
- Mock responses for external APIs (tests/mocks/)
- Auth fixtures / Playwright storageState files (tests/.auth/)

Write report to: .teams/testing/reports/{test-id}-DATA.md
```

## Step 2: Setup (sequential)

Ensure test tooling is installed:

```bash
# Check for Playwright
npx playwright --version 2>/dev/null || (npm install -D @playwright/test && npx playwright install)

# Check for axe-core
npm ls @axe-core/playwright 2>/dev/null || npm install -D @axe-core/playwright

# Check for Pact
npm ls @pact-foundation/pact 2>/dev/null || npm install -D @pact-foundation/pact

# Check for k6
which k6 2>/dev/null || echo "⚠️ k6 not installed — performance tests will be skipped. Install: https://k6.io/docs/get-started/installation/"

# Check for Storybook test runner (if Storybook exists)
test -d .storybook && (npm ls @storybook/test-runner 2>/dev/null || npm install -D @storybook/test-runner @storybook/addon-a11y @storybook/test)
```

## Step 3: Wave 1 — Critical Path (2 agents IN PARALLEL, model: "opus")

### Agent 1: E2E Tests
Spawn **test-e2e-engineer** (model: "opus"):
```
Write and run Playwright E2E tests for the critical user flows identified in the test strategy.

<strategy>
{content of STRATEGY.md}
</strategy>

Focus on Wave 1 critical paths. Write tests to: e2e/ or tests/e2e/
Write report to: .teams/testing/reports/{test-id}-E2E.md
```

### Agent 2: API Tests
Spawn **test-api-tester** (model: "opus"):
```
Write and run API contract tests for all endpoints identified in the test strategy.

<strategy>
{content of STRATEGY.md}
</strategy>

Focus on auth enforcement, input validation, and error handling.
Write tests to: tests/api/
Write report to: .teams/testing/reports/{test-id}-API.md
```

## Step 4: Wave 2 — Coverage (3 agents IN PARALLEL, model: "opus")

### Agent 3: Performance Tests
Spawn **test-performance-engineer** (model: "opus"):
```
Run performance tests: k6 load tests on critical endpoints, Lighthouse on key pages.

<strategy>
{content of STRATEGY.md}
</strategy>

Write k6 scripts to: tests/performance/
Write report to: .teams/testing/reports/{test-id}-PERFORMANCE.md
```

### Agent 4: Visual Regression
Spawn **test-visual-regression** (model: "opus"):
```
Capture visual baselines and check for regressions on all key pages.

<strategy>
{content of STRATEGY.md}
</strategy>

Test at desktop (1280x720), tablet (768x1024), mobile (375x667).
Write tests to: tests/visual/
Write report to: .teams/testing/reports/{test-id}-VISUAL.md
```

### Agent 5: Accessibility Audit
Spawn **test-accessibility-auditor** (model: "opus"):
```
Run WCAG 2.2 AA audit on all user-facing pages using axe-core + manual checks.

<strategy>
{content of STRATEGY.md}
</strategy>

Write tests to: tests/accessibility/
Write report to: .teams/testing/reports/{test-id}-A11Y.md
```

## Step 5: Wave 3 — Hardening & Components (3 agents IN PARALLEL, model: "opus")

### Agent 6: Security Scan
Spawn **test-security-scanner** (model: "opus"):
```
Security assessment covering OWASP Top 10. Test all attack surfaces identified in strategy.

<strategy>
{content of STRATEGY.md}
</strategy>

Also run: npm audit, semgrep, dependency scanning.
Write report to: .teams/testing/reports/{test-id}-SECURITY.md
```

### Agent 7: Contract Tests (if multi-service)
Only spawn if strategy identifies service-to-service communication.

Spawn **test-contract-tester** (model: "opus"):
```
Write and run Pact contract tests for all service boundaries.

<strategy>
{content of STRATEGY.md}
</strategy>

Write tests to: tests/contracts/
Write report to: .teams/testing/reports/{test-id}-CONTRACT.md
```

### Agent 8: Storybook Tests (if component library exists)
Only spawn if `.storybook/` directory exists or strategy identifies UI components.

Spawn **test-storybook-tester** (model: "opus"):
```
Test all UI components via Storybook — visual snapshots, interaction tests, accessibility.

<strategy>
{content of STRATEGY.md}
</strategy>

Write stories alongside components.
Write visual tests to: tests/storybook/
Write report to: .teams/testing/reports/{test-id}-STORYBOOK.md
```

## Step 6: Consolidate Results (1 agent, model: "opus")

Spawn **test-strategist** (model: "opus"):
```
Consolidate all test reports into a single quality report.

Read all reports from: .teams/testing/reports/{test-id}-*.md

Produce a consolidated report with:
- Overall quality score (0-100)
- Pass/fail per category
- Critical issues requiring immediate fix
- Recommended improvements by priority
- Test coverage summary

Write to: .teams/testing/output/{test-id}-QUALITY-REPORT.md
```

## Step 7: CI Pipeline Generation (1 agent, model: "opus")

Spawn **test-ci-generator** (model: "opus"):
```
Generate GitHub Actions workflows that run all the tests created in this session.

Read all test files and reports from:
- .teams/testing/reports/{test-id}-*.md
- tests/ directory structure

Generate CI workflows for:
- PR test suite (all test types, parallel jobs, sharding)
- Daily security scan (cron)
- Weekly performance baseline (cron)

Write workflows to: .github/workflows/
Write report to: .teams/testing/reports/{test-id}-CI.md
```

## Step 8: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/output/{test-id}-QUALITY-REPORT.md`

The Supervisor uses the **Testing Rubric** (see supervisor agent).

If revision requested:
1. Read specific feedback
2. Re-run only the failing test category agents
3. Re-consolidate and re-review (max 3 loops)

## Step 9: Cross-Team Triggers

If security or functional bugs found:
```markdown
---
id: req-{timestamp}
from: testing
to: {relevant-team}
type: bug-report
priority: {critical|high|medium}
source: {test-id}-QUALITY-REPORT.md
created: {ISO timestamp}
status: pending
---

# Bug Report from Testing

## Bugs Found
{list bugs with severity and reproduction steps}
```

Write to: `.teams/requests/testing-to-dev-{test-id}.md`

## Step 10: Present to User

Show:
- Overall quality score
- Pass/fail per category (E2E, API, Performance, Visual, A11Y, Security, Contract, Storybook)
- Critical/blocker issues with fix suggestions
- CI pipeline summary (workflows generated, estimated duration)
- Supervisor review score
- Link to full reports in `.teams/testing/reports/`

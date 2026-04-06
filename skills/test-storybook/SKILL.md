---
name: test-storybook
description: Focused Storybook testing session — audits component library coverage, runs visual snapshots, interaction tests, and accessibility checks for all stories.
user-invocable: true
version: 1.0.0
---

# Test Storybook — Component Library Testing

Focused component testing via Storybook.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests

# Check Storybook exists
npx storybook --version 2>/dev/null || echo "⚠️ Storybook not installed — run: npx storybook@latest init"

# Ensure test dependencies
npm ls @storybook/test 2>/dev/null || npm install -D @storybook/test
npm ls @storybook/addon-a11y 2>/dev/null || npm install -D @storybook/addon-a11y
npm ls @storybook/test-runner 2>/dev/null || npm install -D @storybook/test-runner
```

Generate ID: `storybook-{YYYYMMDD-HHMMSS}`

## Step 1: Component Audit (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Audit the component library for Storybook coverage. Identify:
- All exported UI components (scan src/components/, src/ui/, etc.)
- Which components have stories (.stories.tsx)
- Which components are missing stories
- Component variants (props, sizes, states)
- Existing Storybook config (.storybook/)

Write audit to: .teams/testing/workspace/{storybook-id}-AUDIT.md
Focus ONLY on component coverage — skip E2E, API, performance.
```

## Step 2: Write Stories & Tests (1 agent, model: "opus")

Spawn **test-storybook-tester** (model: "opus"):
```
Write missing stories and run all Storybook tests.

<audit>
{content of AUDIT.md from Step 1}
</audit>

For each component without stories: create stories covering all variants.
For each story: add interaction tests (play functions) and verify accessibility.
Run visual snapshots against all stories.

Write stories alongside components.
Write visual tests to: tests/storybook/
Write report to: .teams/testing/reports/{storybook-id}-STORYBOOK.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{storybook-id}-STORYBOOK.md`

If revision requested: re-run Step 2 with supervisor feedback (max 3 loops).

## Step 4: Present Results

Show:
- Component coverage (stories/total)
- Visual regressions found
- Accessibility violations per component
- Interaction test failures
- Missing stories that need creation
- Supervisor review score

---
name: test-ci
description: Generates CI/CD pipeline configurations from test strategy — GitHub Actions workflows with parallel jobs, caching, artifact uploads, and branch protection recommendations.
user-invocable: true
version: 1.0.0
---

# Test CI — Pipeline Generation

Generates CI/CD workflows that run the full test suite automatically.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests
mkdir -p .github/workflows
```

Generate ID: `ci-{YYYYMMDD-HHMMSS}`

## Step 1: Analyze Existing CI & Tests (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Analyze the project's existing CI and test infrastructure. Identify:
- Existing CI workflows (.github/workflows/, .gitlab-ci.yml, etc.)
- Package manager (npm, pnpm, yarn, bun) and lock file
- All test scripts in package.json
- Test directories and frameworks in use
- Deployment platform (Vercel, AWS, etc.)
- Monorepo tools (turbo, nx, pnpm workspaces) if any
- Existing test coverage and gaps

Write analysis to: .teams/testing/workspace/{ci-id}-CI-ANALYSIS.md
Focus ONLY on CI pipeline needs — skip test writing.
```

## Step 2: Generate Pipelines (1 agent, model: "opus")

Spawn **test-ci-generator** (model: "opus"):
```
Generate GitHub Actions workflow files based on this analysis:

<analysis>
{content of CI-ANALYSIS.md from Step 1}
</analysis>

Generate:
1. Main test suite workflow (PR + push triggers)
2. Security scan workflow (daily cron)
3. Performance baseline workflow (weekly cron)

Requirements:
- Parallel jobs for independent test suites
- Smart caching (node_modules, browsers, build artifacts)
- Playwright sharding for E2E (4 shards)
- Artifact uploads on failure
- Timeout guards on every job
- Vercel preview URL integration if applicable

Write workflows to: .github/workflows/
Write report to: .teams/testing/reports/{ci-id}-CI.md
```

## Step 3: Validate Workflows

```bash
# Verify YAML syntax (basic check)
for f in .github/workflows/ci-*.yml; do
  node -e "
    const fs = require('fs');
    const content = fs.readFileSync('$f', 'utf-8');
    if (!content.includes('name:') || !content.includes('jobs:')) {
      console.error('INVALID: $f - missing required YAML keys');
      process.exit(1);
    }
  " 2>&1 || echo "INVALID: $f"
done
```

If validation fails, fix and re-validate.

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{ci-id}-CI.md`

If revision requested: re-run Step 2 with supervisor feedback (max 3 loops).

## Step 5: Present Results

Show:
- Workflows generated with job dependency graph
- Estimated CI duration
- Caching strategy and savings
- Branch protection recommendations
- Supervisor review score
- Note: user must enable required status checks in GitHub repo settings

---
name: test-api
description: Focused API testing session — contract validation, auth enforcement, input validation, error handling, and schema correctness for REST/GraphQL endpoints.
user-invocable: true
version: 1.0.0
---

# Test API — API Contract & Integration Tests

Focused API testing session.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests

# Ensure Playwright is installed (used for API testing)
npx playwright --version 2>/dev/null || npm install -D @playwright/test
```

Generate ID: `api-{YYYYMMDD-HHMMSS}`

## Step 1: Endpoint Discovery (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Discover and catalog all API endpoints in this project. For each endpoint document:
- Path, method, auth requirement
- Expected request/response shape
- Input validation rules
- Error codes returned

Check: route handlers, OpenAPI specs, client-side fetch calls, middleware.

Write endpoint catalog to: .teams/testing/workspace/{api-id}-ENDPOINTS.md
Focus ONLY on API — skip E2E, performance, visual, etc.
```

## Step 2: Write & Run Tests (1 agent, model: "opus")

Spawn **test-api-tester** (model: "opus"):
```
Write and run API tests based on this endpoint catalog:

<endpoints>
{content of ENDPOINTS.md from Step 1}
</endpoints>

For each endpoint test:
- Happy path with valid auth
- 401 without auth / 403 wrong role
- 400 with invalid input (missing fields, wrong types, edge values)
- Edge cases (empty arrays, max pagination, concurrent requests)

Write tests to: tests/api/
Write report to: .teams/testing/reports/{api-id}-API.md
```

## Step 3: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{api-id}-API.md`

If revision requested: re-run Step 2 with supervisor feedback (max 3 loops).

## Step 4: Present Results

Show:
- Endpoint coverage matrix
- Auth enforcement results
- Contract violations found
- Security issues discovered during API testing
- Failed tests with suggested fixes
- Supervisor review score

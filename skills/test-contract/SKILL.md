---
name: test-contract
description: Focused contract testing session — discovers service boundaries, writes Pact consumer-driven contract tests, verifies providers, and detects breaking changes.
user-invocable: true
version: 1.0.0
---

# Test Contract — Consumer-Driven Contract Tests

Focused contract testing session using Pact.

## Step 0: Initialize

```bash
mkdir -p .teams/testing/{workspace,output,reports}
mkdir -p .teams/reviews/testing
mkdir -p .teams/requests

# Ensure Pact is installed
npm ls @pact-foundation/pact 2>/dev/null || npm install -D @pact-foundation/pact
```

Generate ID: `contract-{YYYYMMDD-HHMMSS}`

## Step 1: Service Mapping (1 agent, model: "sonnet")

Spawn **test-strategist** (model: "sonnet"):
```
Map all service-to-service communication in this project. Identify:
- Internal API calls between services/modules
- External API calls to third-party services
- Event/message-based communication (webhooks, queues)
- Shared data contracts (request/response shapes)
- Existing contract tests (if any)

Write service map to: .teams/testing/workspace/{contract-id}-SERVICE-MAP.md
Focus ONLY on service boundaries and contracts.
```

## Step 2: Generate Test Data (1 agent, model: "opus")

Spawn **test-data-seeder** (model: "opus"):
```
Create test fixtures for all service interactions mapped in the service map.

<service-map>
{content of SERVICE-MAP.md from Step 1}
</service-map>

Create factories for entities that cross service boundaries.
Write to: tests/factories/ and tests/mocks/
Write report to: .teams/testing/reports/{contract-id}-DATA.md
```

## Step 3: Write & Run Contract Tests (1 agent, model: "opus")

Spawn **test-contract-tester** (model: "opus"):
```
Write and run Pact contract tests for all service boundaries.

<service-map>
{content of SERVICE-MAP.md}
</service-map>

Write consumer contracts and provider verifications.
Write tests to: tests/contracts/
Write report to: .teams/testing/reports/{contract-id}-CONTRACT.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/testing/reports/{contract-id}-CONTRACT.md`

If revision requested: re-run Step 3 with supervisor feedback (max 3 loops).

## Step 5: Present Results

Show:
- Contract matrix (consumer ↔ provider)
- Breaking changes detected
- Missing contracts
- Supervisor review score

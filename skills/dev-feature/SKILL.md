---
name: dev-feature
description: Full feature development pipeline — architecture spec, database design, implementation, code review, and testing handoff. From idea to production-ready code.
user-invocable: true
version: 1.0.0
---

# Dev Feature — Build a Feature End-to-End

Complete development pipeline: design → database → build → review → test.

## Step 0: Initialize

```bash
mkdir -p .teams/dev/{specs,output,adrs}
mkdir -p .teams/reviews/dev
mkdir -p .teams/requests
```

Generate ID: `feature-{YYYYMMDD-HHMMSS}`

## Step 1: Architecture (1 agent, model: "opus")

Spawn **dev-architect** (model: "opus"):
```
Design the technical architecture for: {user's feature description}

Produce:
- System overview and component diagram
- API contract (endpoints, methods, request/response shapes)
- Database schema changes needed
- Component structure (files/folders)
- Technical decisions with rationale
- Security model
- Performance considerations

Write to: .teams/dev/specs/{feature-id}-SPEC.md
```

Read the spec before proceeding.

## Step 2: Database (1 agent, model: "opus" — only if schema changes needed)

Spawn **dev-database-engineer** (model: "opus"):
```
Design and create database migrations for this feature.

<spec>
{content of SPEC.md}
</spec>

Write schema design to: .teams/dev/output/{feature-id}-SCHEMA.md
Write migration files to the project's migration directory.
```

## Step 3: Implementation (1 agent, model: "opus")

Spawn **dev-fullstack-engineer** (model: "opus"):
```
Implement the feature according to this spec.

<spec>
{content of SPEC.md}
</spec>

<schema>
{content of SCHEMA.md if it exists}
</schema>

Follow project conventions. Write production-quality code.
Write implementation notes to: .teams/dev/output/{feature-id}-IMPLEMENTATION.md
```

## Step 4: Code Review (1 agent, model: "opus")

Spawn **dev-code-reviewer** (model: "opus"):
```
Review the implementation against the spec.

<spec>
{content of SPEC.md}
</spec>

<implementation>
{content of IMPLEMENTATION.md + diff of changed files}
</implementation>

Check: correctness, security, performance, convention compliance, spec compliance.
Write to: .teams/dev/output/{feature-id}-REVIEW.md
```

If review has critical issues → fix and re-review (max 3 loops).

## Step 5: Test Handoff

Create a testing request:
```markdown
---
id: req-{timestamp}
from: dev
to: testing
type: test-request
priority: high
source: {feature-id}-IMPLEMENTATION.md
created: {ISO timestamp}
status: pending
---

# Test Request: {Feature Name}

## What was built
{summary from implementation notes}

## Files changed
{list of modified files}

## Testing suggestions
{from implementation notes}
```

Write to: `.teams/requests/dev-to-testing-{feature-id}.md`

## Step 6: Supervisor Review

Invoke `/supervisor:review` on `.teams/dev/output/{feature-id}-IMPLEMENTATION.md`

## Step 7: Present to User

Show:
- Architecture summary
- Files created/modified
- Code review results
- Test request created
- Supervisor review score

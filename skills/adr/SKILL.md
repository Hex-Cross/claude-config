---
name: adr
description: Create Architecture Decision Records with auto-discovery of existing ADRs, intelligent numbering, context research, cross-referencing, and status management. Usage: /adr [decision topic]
user-invocable: true
version: 1.1.0
---

# Create ADR: $ARGUMENTS

## Step 1: Discover & Research (2 agents IN PARALLEL)

### Agent 1: ADR Discovery (model: "sonnet")
- Check directories: `docs/adr/`, `docs/decisions/`, `adr/`, `.adr/`
- List existing ADRs with numbers, titles, statuses
- Determine next number (max + 1, or 0001)
- Read last 3 ADRs to match format/template conventions
- If no ADR dir exists, use `docs/adr/` with number `0001`

### Agent 2: Context Research (model: "sonnet")
- Search codebase for code related to decision topic
- Check git log for recent related changes
- Find existing patterns, conventions, constraints
- Find related ADRs this decision impacts or supersedes

## Step 2: Generate ADR (model: "opus")

Write `docs/adr/NNNN-<slug>.md` with: Date, Status (Proposed), Deciders, Context (referencing specific code/metrics/incidents), Decision (with code examples if relevant), Consequences (Positive with impact, Negative with mitigation, Neutral), Alternatives Considered (each with Approach/Pros/Cons/Why rejected — no strawmen), Related Decisions (links to impacted ADRs), References.

## Step 3: Cross-Reference
- If superseding an existing ADR, update old ADR status to "Superseded by NNNN"
- Verify consistency with other active ADRs (no contradictions)

## Step 4: Present for Review
Ask: Is context complete? Alternatives missed? Who are deciders? Status Proposed or Accepted?

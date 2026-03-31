---
name: plan-feature
description: Plan a new feature using multi-agent brainstorming and design. Usage: /plan-feature [feature description]
user-invocable: true
---

# Feature Planning: $ARGUMENTS

Plan this feature using multi-agent brainstorming and design.

## Phase 1: Understand the Codebase (Parallel Exploration)

Launch 2 Explore agents IN PARALLEL:

### Agent 1: Related Code
Search the codebase for:
- Existing features similar to what's being requested
- Reusable components, hooks, utilities, and services
- Existing patterns for state management, API calls, routing
- Related tests that show how similar features are tested

### Agent 2: Integration Points
Map where the new feature will integrate:
- Which routes, pages, or components will be affected
- Which API endpoints exist or need to be created
- Which Redux slices or state management will be involved
- What permissions or auth checks are needed
- What translations/i18n keys will be needed

## Phase 2: Brainstorm Approaches (Parallel Planning)

Launch 2 Plan agents IN PARALLEL with different perspectives:

### Plan Agent A: Simplicity-First Approach
Design the simplest implementation that meets requirements:
- Minimize new files and abstractions
- Reuse maximum existing code
- Prioritize speed of delivery
- Note trade-offs and limitations

### Plan Agent B: Scalability-First Approach
Design a robust, scalable implementation:
- Consider future extensions and edge cases
- Design for testability and maintainability
- Propose clean abstractions where beneficial
- Note trade-offs and complexity costs

## Phase 3: Synthesize the Plan

Compare both approaches and create one implementation plan:

### Implementation Plan Format

```
## Feature: [Name]
## Approach: [Chosen approach with rationale]

## Files to Create
- path/to/file.tsx — [purpose]

## Files to Modify
- path/to/existing.tsx — [what changes and why]

## Reusable Code Found
- path/to/util.ts:functionName — [how to reuse]

## API Requirements
- GET /api/v1/... — [purpose]
- POST /api/v1/... — [purpose]

## State Management
- Slice: [name] — [what state it manages]
- Thunks: [list async operations]

## Implementation Order
1. [First task — can be parallelized with 2?]
2. [Second task]
3. [Third task]
...

## Test Strategy
- Unit tests: [what to test]
- Integration tests: [what to test]
- E2E tests: [what to test]

## Estimated Complexity
- New files: N
- Modified files: N
- Independent subtasks (parallelizable): N
```

## Phase 4: Present for Approval

Show the plan to the user and wait for approval before any implementation.
Ask if they want to adjust scope, approach, or priorities.

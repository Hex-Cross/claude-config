---
name: implement
description: Implement changes using parallel agents for independent tasks. Usage: /implement [task description or ticket number]
user-invocable: true
---

# Multi-Agent Implementation: $ARGUMENTS

Implement this task using parallel agents for maximum efficiency.

## Phase 1: Understand & Decompose

Launch 2 Explore agents IN PARALLEL (model: "sonnet" — read-only exploration):

### Agent 1: Task Analysis
- Understand what needs to be built/changed
- If a ticket number is given, read the ticket context
- Identify acceptance criteria and edge cases
- Find existing code that will be modified

### Agent 2: Dependency Mapping
- Map all files that will be affected
- Identify shared utilities and components to reuse
- Check for existing tests that need updating
- Identify which changes are independent (can be parallelized)

## Phase 2: Plan the Work

Based on exploration, decompose into independent subtasks:

```
Subtask 1: [description] — Files: [list] — Dependencies: none
Subtask 2: [description] — Files: [list] — Dependencies: none
Subtask 3: [description] — Files: [list] — Dependencies: subtask 1
...
```

Rules for decomposition:
- Each subtask modifies a DIFFERENT set of files (no overlap)
- Independent subtasks run IN PARALLEL as separate agents
- Dependent subtasks run SEQUENTIALLY
- Each subtask is small enough for one agent to complete

## Phase 3: Parallel Implementation

For each group of independent subtasks, launch general-purpose agents IN PARALLEL (model: "opus" — implementation/coding work):

### Per-Agent Instructions
Each implementation agent must:
1. Read the target files first
2. Follow existing patterns and conventions in the codebase
3. Use existing utilities and components (don't reinvent)
4. Write clean, typed code matching project style
5. Handle edge cases identified in Phase 1

## Phase 4: Integration & Verification

After all agents complete:

1. **Check for conflicts**: Ensure parallel changes don't conflict
2. **Run lint**: `npm run lint` (or project equivalent)
3. **Run type-check**: `npx tsc --noEmit` (or project equivalent)
4. **Run tests**: Execute relevant test suite
5. **Fix any issues**: If lint/types/tests fail, fix immediately

## Phase 5: Present Results

Show the user:
- Summary of all changes made
- Files created/modified
- Any decisions or trade-offs made
- Verification results (lint, types, tests)
- Ask for review before committing

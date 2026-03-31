---
name: superpowers-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements. Usage: /superpowers-code-review
user-invocable: true
---

# Requesting Code Review

Dispatch review subagents to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## Step 1: Gather Changes

```bash
BASE_SHA=$(git merge-base HEAD dev 2>/dev/null || git merge-base HEAD main 2>/dev/null || echo "HEAD~1")
HEAD_SHA=$(git rev-parse HEAD)
```

Run `git diff $BASE_SHA..HEAD` to see all changes.

## Step 2: Parallel Review (3 Agents)

Launch 3 Explore agents IN PARALLEL:

### Agent 1: Code Quality
Review all changed files for:
- **Naming**: Variables, functions, components follow existing conventions
- **Complexity**: No unnecessarily complex logic — could it be simpler?
- **DRY**: Is there duplicated code that should use an existing utility?
- **Error handling**: Are errors caught and handled appropriately?
- **TypeScript**: Are types properly defined? Avoid `any` where possible
- **Performance**: Any obvious performance issues (unnecessary re-renders, missing memoization for expensive operations)?

### Agent 2: Security (OWASP Top 10)
Review all changed files for:
- **Injection**: No string concatenation in SQL/API calls — use parameterized queries
- **XSS**: No `dangerouslySetInnerHTML` without sanitization; user input is escaped
- **Sensitive data**: No secrets, tokens, or credentials in code
- **Authentication**: Auth checks in place for protected operations
- **Input validation**: User inputs validated at system boundaries
- **CSRF**: API calls use proper tokens/headers

### Agent 3: Project Conventions
Review all changed files against project conventions (CLAUDE.md):
- State management patterns consistent
- API call patterns followed
- Error handling uniform
- Naming conventions consistent
- i18n: All user-facing strings use translation function
- Code style matches project standards

## Step 3: Fix Issues

For each issue found by the agents:
1. Categorize severity: **Critical** (must fix) / **Warning** (should fix) / **Info** (nice to have)
2. **Automatically fix** all Critical and Warning issues
3. Re-run lint and type-check after fixes

## Step 4: Act on Feedback

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Step 5: Review Report

Present to the user:

```
## Code Review Report

### Summary
- Files reviewed: N
- Issues found: N (N critical, N warning, N info)
- Issues auto-fixed: N
- Verdict: APPROVED / NEEDS ATTENTION

### Code Quality
- [list findings]

### Security
- [list findings]

### Project Conventions
- [list findings]

### Changes Made During Review
- [list auto-fixes applied]
```

If verdict is APPROVED, the code is ready to present to the user.
If verdict is NEEDS ATTENTION, explain what couldn't be auto-fixed and why.

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

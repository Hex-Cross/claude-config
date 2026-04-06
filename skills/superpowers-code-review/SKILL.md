---
name: superpowers-code-review
description: 3-agent parallel code review covering quality, security, and project conventions. Use when completing tasks or before merging.
user-invocable: true
version: 1.1.0
---

# Code Review

Dispatch review subagents to catch issues. The reviewer gets precisely crafted context — never your session history.

## Step 1: Gather Changes
```bash
BASE_SHA=$(git merge-base HEAD dev 2>/dev/null || git merge-base HEAD main 2>/dev/null || echo "HEAD~1")
git diff $BASE_SHA..HEAD
```

## Step 2: Parallel Review (3 agents IN PARALLEL — model: "opus")

### Agent 1: Code Quality
Review all changed files for: naming conventions, unnecessary complexity, DRY violations, error handling, TypeScript types (no `any`), performance issues (unnecessary re-renders, missing memoization).

### Agent 2: Security (OWASP Top 10)
Review for: injection (no string concatenation in SQL/API), XSS (no unsanitized `dangerouslySetInnerHTML`), sensitive data exposure, auth checks on protected ops, input validation at boundaries, CSRF protection.

### Agent 3: Project Conventions
Review against CLAUDE.md: state management patterns, API call patterns, error handling uniformity, naming conventions, i18n (all user-facing strings translated), code style.

## Step 3: Fix Issues

Categorize: **Critical** (must fix) / **Warning** (should fix) / **Info** (nice to have).
Auto-fix all Critical and Warning. Re-run lint + type-check after fixes.

## Step 4: Review Report

| Metric | Value |
|--------|-------|
| Files reviewed | N |
| Issues found | N (N critical, N warning, N info) |
| Issues auto-fixed | N |
| **Verdict** | **APPROVED / NEEDS ATTENTION** |

### Findings by Category
- Code Quality: [list]
- Security: [list]
- Project Conventions: [list]
- Changes Made During Review: [auto-fixes applied]

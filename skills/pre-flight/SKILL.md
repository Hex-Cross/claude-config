---
name: pre-flight
description: The ULTIMATE quality gate — 10-point verification with parallel execution for maximum speed. Replaces calling verification, red-team, and accessibility individually.
version: 1.1.0
---

# Pre-Flight Check — The Ultimate Quality Gate

Do NOT claim work is done until this entire pre-flight passes.

## Phase 1: Identify Changes
```bash
git diff --name-only HEAD 2>/dev/null | head -50
```
Determine: which files changed, are there UI files (.tsx/.jsx/.vue/.svelte/.html/.css), are there API/auth/DB files.

## Phase 2: Parallel Gate Wave 1 — Independent Static Checks (4 agents IN PARALLEL — model: "opus")

These 4 gates have ZERO dependencies on each other. Run them simultaneously:

### Agent 1: Build + Types (Gates 1-2)
```bash
npm run build 2>/dev/null || yarn build 2>/dev/null || pnpm build 2>/dev/null
npx tsc --noEmit --strict 2>/dev/null || tsc --noEmit
```
Both FAIL = BLOCKER.

### Agent 2: Lint + Format (Gates 3-4)
```bash
oxlint {changed_files} 2>/dev/null; npx eslint {changed_files} 2>/dev/null
npx prettier --check {changed_files} 2>/dev/null
```
Lint errors = BLOCKER. Format: auto-fix with `--write`, verify.

### Agent 3: Security + Deps (Gates 6-7)
```bash
semgrep --config auto --config p/owasp-top-ten --error {changed_files} 2>/dev/null
npm audit --audit-level=high 2>/dev/null
trivy fs . --severity HIGH,CRITICAL --quiet 2>/dev/null
osv-scanner scan --recursive . 2>/dev/null
```
HIGH/CRITICAL = BLOCKER. If semgrep unavailable: manual OWASP Top 10 review.

### Agent 4: Tests (Gate 5)
```bash
npm test 2>/dev/null || yarn test 2>/dev/null || npx jest 2>/dev/null || npx vitest run 2>/dev/null || pytest 2>/dev/null
```
Any failure = BLOCKER. Investigate skipped tests.

**Wait for all 4 agents to complete before proceeding. If ANY agent reports BLOCKER: fix issues, re-run ONLY the failed agent.**

## Phase 3: Parallel Gate Wave 2 — Analysis Checks (2 agents IN PARALLEL — model: "opus")

Only run after Wave 1 passes (these depend on clean build/types):

### Agent 5: Red Team (Gate 8) — skip if no API/auth/DB changes
For every new endpoint/function accepting external input:
- **Pass A**: Trace user inputs to dangerous sinks (SQL, HTML, file paths, shell, eval). Check prototype pollution, type confusion.
- **Pass B**: Check auth on protected routes. Race conditions in state mutations. Error handling leaks. Resource exhaustion vectors.
CRITICAL/HIGH = BLOCKER.

### Agent 6: Accessibility (Gate 9) — skip if no UI changes
Check semantic HTML, ARIA attributes, keyboard navigation, focus management, color contrast (4.5:1), alt text, `prefers-reduced-motion`.
Critical/Serious a11y = BLOCKER.

## Phase 4: Self-Review (Gate 10) — Sequential, Final

Re-read diff one final time. Check for:
- `console.log`, `debugger`, `TODO`, `FIXME`, `HACK`
- Hardcoded values that should be config/env
- Missing error handling on external calls
- `any` types in TypeScript
- Magic numbers, commented-out code, import remnants, scope creep

## Output: Pre-Flight Report

| # | Gate | Wave | Status | Details |
|---|------|------|--------|---------|
| 1 | Build | W1 | PASS/FAIL | |
| 2 | Types | W1 | PASS/FAIL | |
| 3 | Lint | W1 | PASS/FAIL | 0 errors, 0 warnings |
| 4 | Format | W1 | PASS/FAIL | |
| 5 | Tests | W1 | PASS/FAIL | X pass, Y fail, Z skip |
| 6 | Security | W1 | PASS/FAIL | X findings |
| 7 | Deps | W1 | PASS/FAIL | X vulnerabilities |
| 8 | Red Team | W2 | PASS/FAIL/SKIP | X vectors tested |
| 9 | Accessibility | W2 | PASS/FAIL/SKIP | X issues |
| 10 | Self-Review | W3 | PASS/FAIL | X items found |

**VERDICT: CLEARED FOR DELIVERY / BLOCKED**

Fix blockers → re-run ONLY failed gates. Never skip gates — manual equivalent if tool unavailable.

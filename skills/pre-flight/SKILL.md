---
name: pre-flight
description: The ULTIMATE quality gate — runs the complete 10-point verification pipeline PLUS red-team PLUS accessibility in one command. Use as the absolute final check before presenting ANY work. Replaces calling verification, red-team, and accessibility individually.
---

# Pre-Flight Check — The Ultimate Quality Gate

You are executing the complete pre-flight verification sequence. This is the ONE skill to run before presenting ANY work to the user. It combines all quality gates into a single, structured pipeline.

## IMPORTANT: Do NOT claim work is done until this entire pre-flight passes.

## Gate 1: Build Integrity
```bash
npm run build 2>/dev/null || yarn build 2>/dev/null || pnpm build 2>/dev/null || bun run build 2>/dev/null
```
FAIL = BLOCKER. Fix before continuing.

## Gate 2: Type Safety
```bash
npx tsc --noEmit --strict 2>/dev/null || tsc --noEmit
```
FAIL = BLOCKER.

## Gate 3: Lint (Zero Warnings)
```bash
# Run both for maximum coverage
oxlint {changed_files} 2>/dev/null
npx eslint {changed_files} 2>/dev/null || eslint {changed_files}
```
Any error = BLOCKER. Warnings = fix them too (zero warnings policy).

## Gate 4: Formatting
```bash
npx prettier --check {changed_files} 2>/dev/null || prettier --check {changed_files}
```
FAIL = auto-fix with `--write`, then verify.

## Gate 5: Full Test Suite
```bash
npm test 2>/dev/null || yarn test 2>/dev/null || npx jest 2>/dev/null || npx vitest run 2>/dev/null || pytest 2>/dev/null
```
Any failure = BLOCKER. Any skipped test = investigate.

## Gate 6: Security Scan (SAST)
```bash
semgrep --config auto --config p/owasp-top-ten --error {changed_files} 2>/dev/null
```
Any HIGH/CRITICAL finding = BLOCKER.

If semgrep unavailable: manually review all changed files for OWASP Top 10 vulnerabilities (injection, XSS, auth bypass, data exposure, SSRF, insecure deserialization).

## Gate 7: Dependency Security
```bash
npm audit --audit-level=high 2>/dev/null
trivy fs . --severity HIGH,CRITICAL --quiet 2>/dev/null
osv-scanner scan --recursive . 2>/dev/null
```
HIGH/CRITICAL in direct deps = BLOCKER.

## Gate 8: Red Team (Adversarial)

For every new endpoint/function that accepts external input:

Launch 2 parallel analysis passes:
- **Pass 1**: Trace all user inputs through the code. Do they reach SQL queries, HTML output, file paths, shell commands, or eval() without sanitization? Check for prototype pollution, type confusion, and deserialization attacks.
- **Pass 2**: Check auth on every protected route. Look for race conditions in state mutations. Verify error handling doesn't leak sensitive data. Check for resource exhaustion vectors.

Any CRITICAL/HIGH finding = BLOCKER.

## Gate 9: Accessibility (UI changes only)

If any `.tsx`, `.jsx`, `.vue`, `.svelte`, `.html`, or `.css` files changed:
- Check semantic HTML usage
- Verify ARIA attributes on interactive elements
- Confirm keyboard navigability (focusable, tab order, escape handling)
- Check color contrast ratios (4.5:1 minimum)
- Verify focus management for dynamic content
- Check alt text on images

Critical/Serious a11y issues = BLOCKER for UI work.

## Gate 10: Self-Review

Re-read your own diff one final time. Check for:
- [ ] Leftover `console.log`, `debugger`, `TODO`, `FIXME`, `HACK`
- [ ] Hardcoded values that should be config/env
- [ ] Missing error handling on external calls
- [ ] `any` types in TypeScript
- [ ] Magic numbers without explanation
- [ ] Commented-out code
- [ ] Import statements for removed code
- [ ] Files that were changed but shouldn't have been (scope creep)

## Output: Pre-Flight Report

```
## Pre-Flight Report

| # | Gate | Status | Details |
|---|------|--------|---------|
| 1 | Build | PASS/FAIL | |
| 2 | Types | PASS/FAIL | |
| 3 | Lint | PASS/FAIL | 0 errors, 0 warnings |
| 4 | Format | PASS/FAIL | |
| 5 | Tests | PASS/FAIL | X pass, Y fail, Z skip |
| 6 | Security (SAST) | PASS/FAIL | X findings |
| 7 | Deps | PASS/FAIL | X vulnerabilities |
| 8 | Red Team | PASS/FAIL | X attack vectors tested |
| 9 | Accessibility | PASS/SKIP | X issues |
| 10 | Self-Review | PASS/FAIL | X items found |

**VERDICT: CLEARED FOR DELIVERY / BLOCKED**

Blocking issues: (list any)
```

## Rules
- If VERDICT is BLOCKED: fix ALL blockers, then re-run ONLY the failed gates
- If VERDICT is CLEARED: present work to user with confidence
- NEVER present work as complete if pre-flight has not been run
- NEVER skip gates — if a tool is unavailable, do the manual equivalent

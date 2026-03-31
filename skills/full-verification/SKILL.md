---
name: full-verification
description: Run ALL automated quality gates — tests, SAST security scan, lint, types, build, dependency audit, coverage check. The final verification gate that catches everything superpowers-verification misses.
---

# Full Verification Pipeline

You are executing the COMPLETE automated verification pipeline. This is the FINAL quality gate before presenting work. Nothing passes without clearing every check.

## CRITICAL: This skill exists because `superpowers-verification` only runs lint/types/build. This skill adds: test execution, SAST scanning, dependency audit, and coverage enforcement.

## Step 1: Identify Changed Files
```bash
# Get list of all files changed in this session
git diff --name-only HEAD 2>/dev/null || git diff --name-only
git diff --cached --name-only 2>/dev/null
```
Store the list of changed files. All subsequent checks target these files.

## Step 2: Static Analysis (Run ALL in parallel)

Launch 4 checks simultaneously:

### Check A — Lint
```bash
# Try project-level first, fall back to global
npx eslint {changed_files} 2>/dev/null || eslint {changed_files}
oxlint {changed_files}
```

### Check B — Type Safety
```bash
npx tsc --noEmit --strict 2>/dev/null || tsc --noEmit
```

### Check C — Build
```bash
# Use project's build command
npm run build 2>/dev/null || yarn build 2>/dev/null || pnpm build 2>/dev/null || bun run build 2>/dev/null
```

### Check D — Formatting
```bash
npx prettier --check {changed_files} 2>/dev/null || prettier --check {changed_files}
```

If ANY check fails: fix the issue, then re-run ONLY the failed check. Do NOT proceed until all 4 pass.

## Step 3: Security Scanning (SAST)

```bash
# Semgrep with security-focused rules
semgrep --config auto --config p/owasp-top-ten --config p/security-audit --error {changed_files}

# If semgrep finds issues: they are BLOCKERS. Fix every finding before proceeding.
```

If semgrep is not available, perform a manual security review of all changed files checking:
- SQL injection (string concatenation in queries)
- XSS (unsanitized user input in HTML/DOM)
- Path traversal (user input in file paths)
- Command injection (user input in shell commands)
- Insecure deserialization
- Hardcoded secrets/tokens/API keys
- Missing authentication/authorization checks
- CSRF on state-changing endpoints

## Step 4: Test Execution

```bash
# Run the FULL test suite, not just related tests
npm test 2>/dev/null || yarn test 2>/dev/null || pnpm test 2>/dev/null || npx jest 2>/dev/null || npx vitest run 2>/dev/null || pytest 2>/dev/null
```

- If tests fail: diagnose and fix. Re-run until all pass.
- If NO test runner is found: flag this to the user as a risk.
- Count test results: note total tests, passed, failed, skipped.
- If there are SKIPPED tests: investigate why. Skipped tests may hide regressions.

## Step 5: Dependency Audit

```bash
# Check for known vulnerabilities in dependencies
npm audit --audit-level=moderate 2>/dev/null
trivy fs . --severity HIGH,CRITICAL 2>/dev/null
osv-scanner scan --recursive . 2>/dev/null
```

- HIGH/CRITICAL vulnerabilities in direct dependencies are BLOCKERS
- LOW/MODERATE vulnerabilities: flag but don't block

## Step 6: Coverage Check (if available)

```bash
# Try to get coverage on changed files
npx jest --coverage --changedSince=HEAD~1 2>/dev/null || npx vitest run --coverage 2>/dev/null
```

- New files MUST have >0% coverage (at least one test touches the code)
- Flag any changed function with 0 test coverage

## Step 7: Shell Script Check

```bash
# If any .sh files were changed
shellcheck {changed_sh_files}
```

## Step 8: Circular Dependency Check

```bash
# If any JS/TS files were changed
npx madge --circular {changed_files} 2>/dev/null || madge --circular {changed_files} 2>/dev/null
```

## Output Format

Present a verification report:

```
## Verification Report

| Gate | Status | Details |
|------|--------|---------|
| Lint | PASS/FAIL | 0 errors, 0 warnings |
| Types | PASS/FAIL | strict mode |
| Build | PASS/FAIL | clean build |
| Format | PASS/FAIL | all files formatted |
| Security (SAST) | PASS/FAIL | semgrep findings count |
| Tests | PASS/FAIL | X passed, Y failed, Z skipped |
| Deps | PASS/FAIL | X high/critical vulns |
| Coverage | PASS/WARN | new code coverage % |
| Shell | PASS/SKIP | shellcheck findings |
| Circular Deps | PASS/WARN | cycles found |

**Overall: PASS / FAIL**
```

If ANY gate is FAIL: do NOT present work as complete. Fix all failures first.
If overall is PASS: work is verified and ready to present.

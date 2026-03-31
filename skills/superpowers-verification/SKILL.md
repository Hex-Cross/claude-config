---
name: superpowers-verification
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always. Usage: /superpowers-verification
user-invocable: true
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Step 1: Automated Checks

Run these checks sequentially — stop and fix on first failure:

### 1a. Linting
```bash
npm run lint
```
If fails: read errors, fix code, re-run (up to 3 attempts).

### 1b. Type Checking
```bash
npx tsc --noEmit
```
If fails: read errors, fix type issues, re-run (up to 3 attempts).

### 1c. Production Build
```bash
npm run build
```
If fails: read errors, fix build issues, re-run (up to 3 attempts).

## Step 2: Code Quality Scan

Review all changed files (`git diff`) for:

- [ ] **Console statements**: Remove any `console.log`, `console.warn`, `console.error` left from debugging
- [ ] **TODO/FIXME comments**: Flag or resolve any new TODO/FIXME comments
- [ ] **Hardcoded strings**: User-facing text must use i18n translation, not raw strings
- [ ] **Missing error handling**: Async operations should handle rejected promises; API calls should have try/catch
- [ ] **Secrets/credentials**: No hardcoded tokens, passwords, API keys, or secrets
- [ ] **Unused imports**: Remove any imports that are no longer used
- [ ] **Type safety**: Avoid unnecessary `any` types — use proper TypeScript types

## Step 3: Visual Verification (if Playwright MCP available)

If Playwright MCP is configured:
1. Navigate to the affected pages
2. Take screenshots at desktop viewport
3. Verify the UI renders correctly — no broken layouts, missing elements, or visual regressions

If Playwright is NOT available, skip this step and note it in the report.

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter is not compiler |
| "Agent said success" | Verify independently |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Step 4: Verification Report

Present a summary:

```
## Verification Report

### Automated Checks
- Lint: pass/fail
- TypeScript: pass/fail
- Build: pass/fail

### Code Quality
- Console statements: None / Found N
- Hardcoded strings: None / Found N
- Missing error handling: None / Found N
- Unused imports: None / Found N

### Visual
- Screenshots taken: yes/skipped (no Playwright)

### Overall: PASS / FAIL
```

If any check FAILS: fix the issues automatically and re-verify. Only present FAIL if you cannot resolve after 3 attempts.

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

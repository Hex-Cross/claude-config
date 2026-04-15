---
name: mutation-test
description: Run mutation testing with Stryker to verify test quality — find tests that pass regardless of code correctness, identify untested logic, and improve test suite effectiveness
user-invocable: true
version: 1.0.0
---

# Mutation Testing

Verify test quality by introducing mutations into source code and checking if tests catch them.

---

## Phase 1: Setup Detection

1. Read `package.json` for existing test framework (Jest, Vitest, Playwright).
2. Check if Stryker is installed (`@stryker-mutator/core`).
3. If not installed, install: `npm install -D @stryker-mutator/core @stryker-mutator/{jest|vitest}-runner`.
4. Generate `stryker.config.mjs` if missing.

## Phase 2: Target Selection

1. If user specifies files: use those.
2. If inside a GSD phase: identify files changed in this phase via git diff.
3. Otherwise: identify critical business logic files (exclude config, types, constants).
4. Present target files for confirmation.

## Phase 3: Run Mutations

1. Run Stryker: `npx stryker run --files {targets}`.
2. Parse results: mutation score, killed/survived/timeout mutants.
3. For each survived mutant:
   - Identify the mutation type (arithmetic, conditional, string, etc.)
   - Identify the source file and line
   - Explain what the mutation changed and why tests didn't catch it

## Phase 4: Report

```markdown
# Mutation Test Report

## Score: {X}% ({killed}/{total} mutants killed)

## Survived Mutants (tests didn't catch these!)
| File | Line | Mutation | Original | Mutated | Missing Test |
|------|------|----------|----------|---------|-------------|

## Recommendations
1. Add test for {specific scenario} in {file}
```

## Phase 5: Fix (optional)

If user wants, generate missing test cases for survived mutants.

---

**Thresholds**: Score >= 80% = good, >= 60% = acceptable, < 60% = test suite needs work.

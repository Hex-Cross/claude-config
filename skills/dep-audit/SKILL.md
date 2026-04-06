---
name: dep-audit
description: Audit dependencies for vulnerabilities, outdated packages, and deprecations — generates prioritized upgrade plan
user-invocable: true
version: 1.0.0
---

# Dependency Audit

Audit project dependencies for vulnerabilities, outdated packages, and deprecations. Produces a prioritized upgrade plan and optionally auto-fixes safe updates.

## Phase 1: Detect Package Manager

Use Bash to check which lockfile exists in the project root:

- `package-lock.json` → npm
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `bun.lockb` or `bun.lock` → bun

Set `$PM` to the detected manager. If multiple exist, prefer pnpm > yarn > npm > bun. Abort with a clear message if no lockfile is found.

## Phase 2: Vulnerability Audit

Run the audit command for the detected manager:

| Manager | Command |
|---------|---------|
| npm | `npm audit --json` |
| pnpm | `pnpm audit --json` |
| yarn | `yarn npm audit --json` (yarn 2+) or `yarn audit --json` (yarn 1) |
| bun | `bun pm audit 2>&1` (limited — fall back to `npm audit --json` if bun audit unavailable) |

Parse JSON output. Extract each advisory: package name, severity (critical/high/moderate/low), title, patched version, and path.

## Phase 3: Outdated Packages

Run the outdated command:

| Manager | Command |
|---------|---------|
| npm | `npm outdated --json` |
| pnpm | `pnpm outdated --format json` |
| yarn | `yarn outdated --json` |
| bun | `bun outdated` |

For each package, capture: current version, wanted version, latest version. Classify:
- **Major** — latest major differs from current (breaking changes likely)
- **Minor** — latest minor differs, same major
- **Patch** — only patch differs

## Phase 4: Deprecation Check

Run `$PM info <package> --json` for each direct dependency (from package.json). Flag any where the `deprecated` field is non-empty. Group results by severity of deprecation message.

Limit to direct dependencies only to keep runtime reasonable. For large projects (>80 deps), batch in parallel groups of 10.

## Phase 5: Generate Report

Print a categorized summary table to the user:

1. **Critical vulnerabilities** — must fix immediately
2. **High vulnerabilities** — fix this sprint
3. **Deprecated packages** — plan replacement
4. **Major outdated** — schedule upgrade with migration plan
5. **Minor/patch outdated** — safe to update

For each item include: package name, current version, target version, and one-line action.

## Phase 6: Auto-Fix (optional)

Only when the user passes `--fix` or confirms when prompted:

1. Run `$PM audit fix` to resolve vulnerabilities with compatible updates
2. Run `$PM update` for patch/minor bumps only (no major)
3. Run the project's test command (`npm test` or equivalent) to verify nothing broke
4. If tests pass, report changes. If tests fail, revert with `git checkout package.json *lock*` and report which updates caused failures.

Never auto-fix major version bumps or deprecated package replacements — those require manual migration.

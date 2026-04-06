---
name: changelog
description: Generate or update CHANGELOG.md from git history — groups by type, suggests version bump
user-invocable: true
version: 1.0.0
---

# Changelog Generator

## Step 1: Detect Context

- Read existing `CHANGELOG.md` if present
- Get latest git tag: `git describe --tags --abbrev=0 2>/dev/null`
- If no tags, use first commit as baseline
- Get current date for the release header

## Step 2: Parse Git History

Run: `git log <last-tag>..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`

For each commit, classify by type:
- `feat:` / `feature` / `add` → Features
- `fix:` / `bugfix` / `patch` → Bug Fixes
- `BREAKING CHANGE` / `!:` → Breaking Changes
- `docs:` → Documentation
- `refactor:` / `chore:` / `ci:` / `test:` → Maintenance
- Unmatched → Other

## Step 3: Suggest Version Bump

Based on classified changes:
- Breaking changes present → **major** bump
- Features present → **minor** bump
- Only fixes/chores → **patch** bump

Read current version from `package.json` and suggest next version.

## Step 4: Generate Changelog Entry

Format:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Breaking Changes
- description (commit-hash)

### Features
- description (commit-hash)

### Bug Fixes
- description (commit-hash)

### Maintenance
- description (commit-hash)
```

## Step 5: Write

- If `CHANGELOG.md` exists, prepend the new entry after the title line
- If not, create with header: `# Changelog\n\nAll notable changes to this project.\n\n`
- Show the diff to user before writing

---
name: release
description: Create releases — version bump, git tag, GitHub release with auto-generated notes
user-invocable: true
version: 1.0.0
---

# Release Manager

## Step 1: Detect Current Version

- Read `package.json` → `version` field
- Get latest git tag: `git describe --tags --abbrev=0 2>/dev/null`
- Compare — warn if they diverge

## Step 2: Analyze Changes

Run: `git log <last-tag>..HEAD --oneline`

Count commits by type (feat/fix/breaking/other). Suggest semver bump:
- Breaking → major
- Features → minor
- Fixes only → patch

Present suggestion to user. Wait for confirmation of version number.

## Step 3: Generate Release Notes

Run `/changelog` skill to generate changelog entry for this version.

## Step 4: Bump Version

- Update `package.json` version field
- Update `package-lock.json` if present (run `npm install --package-lock-only`)
- Stage changes: `git add package.json package-lock.json CHANGELOG.md`

## Step 5: Confirm Before Tagging

Show the user exactly what will happen:
```
Version: X.Y.Z → A.B.C
Files changed: package.json, CHANGELOG.md
Tag: vA.B.C
GitHub release: yes/no
```

**WAIT for explicit "yes" before proceeding.** Do NOT auto-tag or push.

## Step 6: Create Tag and Release

After user confirms:
```bash
git commit -m "release: vA.B.C"
git tag -a vA.B.C -m "Release vA.B.C"
```

Ask user if they want to push and create GitHub release:
```bash
git push && git push --tags
gh release create vA.B.C --title "vA.B.C" --notes-file <(changelog-content)
```

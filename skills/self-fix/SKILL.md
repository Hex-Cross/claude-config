---
name: self-fix
description: "Validate skills, references, settings, structure, and hook health. Repair issues with approval. Usage: /self-fix [check|repair|test <name>|hooks]"
user-invocable: true
version: 1.1.0
---

# Skill Ecosystem Self-Fix: $ARGUMENTS

## Modes: `check` (default, read-only) | `repair` (fix with approval) | `test <name>` (single skill) | `hooks` (hook health only)

## Check Mode — 5 agents IN PARALLEL (model: "sonnet")

**Agent 1: Frontmatter** — Parse YAML, validate name/directory match, description exists, user-invocable boolean, version semver, no duplicates. Severity: CRITICAL/HIGH/LOW.

**Agent 2: References** — Extract skill references from SKILL.md + CLAUDE.md. Verify targets exist. Check deprecated stubs point to valid replacements.

**Agent 3: Settings** — Cross-ref tool references vs settings.json allow/deny. Cross-ref MCP tools vs mcp.json servers. Report gaps.

**Agent 4: Structure** — Each skills/ dir has one SKILL.md. Flag empty dirs, unexpected files, >500 lines. Verify deprecated stubs are minimal.

**Agent 5: Hook Health (NEW)** — `node --check` every hook. Verify stdin timeout guards exist. Check hooks in settings.json exist on disk. Find orphaned hooks. Verify version headers vs GSD VERSION. Flag hooks >5KB.

## Repair Mode
Run checks, then for each auto-fixable issue: show before→after, ask "yes/no/yes to all", backup to `~/.claude/evolve/backups/`, apply, re-validate.
**Auto-fixable:** missing user-invocable, name mismatch, empty description, missing frontmatter, orphaned hooks.
**Not auto-fixable:** YAML errors, broken references, missing tools/MCP.

## Test Mode — Single skill: frontmatter, tools, cross-refs, $ARGUMENTS handling, structure. PASS/FAIL/WARN.

## Hooks Mode — Run only Agent 5. Detailed hook audit: syntax, timeouts, settings consistency, versions, performance.

---
name: gold-standard
description: "Audit and enforce tiered model routing. Verifies Sonnet for read-only, Opus for decide/write/judge. Can auto-fix violations. Usage: /gold-standard [audit|explain|check <name>|fix]"
user-invocable: true
version: 1.1.0
---

# Gold Standard Model Routing: $ARGUMENTS

## Policy: Sonnet = read/report only. Opus = decide/write/judge.

## Modes
- `explain`: Print policy + worked examples, exit
- `audit` (default): Full compliance audit
- `check <name>`: Audit single skill
- `fix`: Audit + auto-fix violations with approval

## Audit Mode

### Phase 1: Evidence (2 Sonnet agents IN PARALLEL — model: "sonnet")
**Agent 1: Skill Scanner** — Scan all SKILL.md files, identify every Agent spawn, record model param, classify as SONNET/OPUS tier, flag violations.
**Agent 2: GSD Config Scanner** — Read `~/.gsd/defaults.json` and `model-profiles.cjs`, determine effective model per GSD agent, flag mismatches.

### Phase 2: Report (1 Opus agent — model: "opus")
GSD Agent Routing table, Custom Skill Routing table, violation count, fix instructions for each.

## Fix Mode (NEW)
1. Run full audit
2. For each violation, show exact change (add/change `model:` parameter)
3. Ask: "Apply? (yes/no/yes to all)"
4. Edit SKILL.md files, re-audit to verify

**Auto-fixable:** missing `model: "sonnet"` on Explore agents, missing `model: "opus"` on decision agents, wrong model assignment.
**NOT auto-fixable:** ambiguous agents (flag for human), GSD config changes.

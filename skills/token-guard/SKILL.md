---
name: token-guard
description: "Detect and eliminate token waste — redundant agents, oversized context injections, duplicate verification, bloated skills, stale memory. Usage: /token-guard [audit|fix|report]"
user-invocable: true
version: 1.0.0
---

# Token Guard — Efficiency Audit: $ARGUMENTS

Detect and eliminate patterns that waste tokens across your Claude Code configuration. Finds redundant work, oversized context, and inefficient agent routing.

## Mode Detection

- If $ARGUMENTS is empty or `audit`: run **Full Audit**
- If $ARGUMENTS is `fix`: run audit then auto-fix safe issues
- If $ARGUMENTS is `report`: generate a token efficiency scorecard

---

## Phase 1: Measure (2 Sonnet agents IN PARALLEL — model: "sonnet")

### Agent 1: Skill & Hook Size Analysis
- Measure byte size and line count of every `~/.claude/skills/*/SKILL.md`
- Measure byte size of every hook in `~/.claude/hooks/` (skip gsd-* which are package-managed)
- Measure byte size of `~/.claude/CLAUDE.md`
- Count total agents spawned per skill (look for "IN PARALLEL", "Launch N agents")
- Calculate: total context bytes loaded per skill invocation
- Flag: skills over 8KB, skills spawning 4+ agents, hooks over 5KB

### Agent 2: Redundancy Scanner
- Read the auto-trigger chains in `~/.claude/hooks/skill-auto-trigger.mjs`
- For each chain, list every skill invoked and what checks each skill runs
- Identify overlapping checks across skills in the same chain:
  - Same bash commands run twice (lint, tsc, build, prettier, semgrep, npm audit)
  - Same security analysis done by multiple skills (OWASP in code-review + red-team + pre-flight)
  - Same architecture analysis in architect vs review-arch
- Read memory files in `~/.claude/projects/*/memory/` — flag files with <50 bytes of content or stale dates

---

## Phase 2: Score & Recommend (1 Opus agent — model: "opus")

Synthesize findings into a Token Efficiency Scorecard:

```
## Token Efficiency Scorecard
**Date**: [today]
**Config version**: [git hash if available]

### Context Budget
| Item | Size | Status |
|------|------|--------|
| CLAUDE.md | X KB | OK/LARGE |
| Largest skill | X KB (name) | OK/LARGE |
| Total skills corpus | X KB | OK/BLOATED |
| Largest hook | X KB (name) | OK/LARGE |
| Total memory files | X KB | OK/STALE |

### Agent Efficiency
| Metric | Value | Status |
|--------|-------|--------|
| Avg agents per skill | N | OK/HIGH |
| Skills with 4+ agents | N | OK/FLAG |
| Skills missing model: param | N | VIOLATION |
| Opus agents doing read-only work | N | WASTE |

### Chain Redundancy
| Chain | Duplicate gates | Token waste estimate |
|-------|----------------|---------------------|
| feature/medium | N gates run 2x | ~X tokens saved if deduplicated |
| ... | ... | ... |

### Stale/Dead Items
- [list of empty memory files, orphaned skills, ghost directories]

### Recommendations (prioritized by token savings)
1. [highest impact fix — estimated savings]
2. [second highest]
3. ...

**Overall Score**: X/100
```

---

## Fix Mode

If `$ARGUMENTS` is `fix`, after generating the scorecard:

**Safe auto-fixes (no confirmation needed):**
- Delete empty memory files (<50 bytes, not MEMORY.md)
- Delete ghost directories (brace-expansion artifacts)
- Add missing `model: "sonnet"` annotations to read-only agents in skills

**Unsafe fixes (present for user approval):**
- Removing skills from chains
- Merging overlapping skills
- Reducing agent counts

---

## Principles

- This skill itself uses Sonnet for scanning, Opus for synthesis — eat your own dog food
- Never modify skill logic — only flag and recommend
- In fix mode, only auto-apply reversible, low-risk changes
- Token estimates are approximate — based on skill size + agent count, not actual API metering
- Run this monthly or after adding new skills to keep config lean

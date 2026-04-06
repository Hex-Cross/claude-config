---
name: token-guard
description: "Detect and eliminate token waste — redundant agents, oversized context, duplicate verification, bloated skills, stale memory, plugin overhead. Usage: /token-guard [audit|fix|report]"
user-invocable: true
version: 1.1.0
---

# Token Guard — Efficiency Audit: $ARGUMENTS

## Mode: empty/`audit` = Full Audit | `fix` = audit + auto-fix | `report` = scorecard

## Phase 1: Measure (3 Sonnet agents IN PARALLEL — model: "sonnet")

### Agent 1: Skill & Hook Size Analysis
Measure byte size/line count of every SKILL.md, every hook, CLAUDE.md. Count agents per skill. Flag: skills >8KB, 4+ agents, hooks >5KB, deprecated skills still full-size.

### Agent 2: Redundancy Scanner
Read auto-trigger chains. Map which checks each skill runs. Identify overlapping checks across skills in same chain (same bash commands, same security analysis). Flag memory files <50 bytes or missing `last_verified`.

### Agent 3: Plugin & MCP Overhead (NEW)
Estimate token injection per plugin per session. List MCP servers, check if each is referenced in skills/workflows. Flag: plugins injecting >5KB/session, MCP servers never referenced, project-type mismatches (e.g., Vercel plugin on non-Vercel project).

## Phase 2: Score (1 Opus agent — model: "opus")

Token Efficiency Scorecard with: Context Budget table (CLAUDE.md, skills, hooks, memory, plugin overhead, MCP servers), Agent Efficiency metrics, Chain Redundancy table, Plugin Impact table, Stale/Dead Items list, Prioritized Recommendations. **Score: X/100.**

## Fix Mode
**Safe (no confirm):** delete empty memory files, delete ghost dirs, add missing `model: "sonnet"`.
**Unsafe (user approval):** remove skills from chains, merge overlapping, reduce agents, disable plugins.

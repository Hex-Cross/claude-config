---
name: Maximum Quality Priority
description: User wants maximum quality with zero errors, security-first, full verification pipeline — Opus for all decision/write/judge agents, Sonnet for read-only research/exploration
type: feedback
---

User explicitly requested maximum quality mode — no cost optimization, no shortcuts.

**Why:** User values correctness and security above speed and token cost. They want zero-defect output with comprehensive security scanning.

**How to apply:**
- Use Opus for all agents that decide, write, or judge (planning, implementation, security, testing, code review)
- Use Sonnet only for pure read/report agents (exploration, research, codebase mapping) — this is cost-efficient without sacrificing quality since these agents only gather data
- Run full 6-phase workflow including Red Team phase on every non-trivial task
- Never skip security audit — run semgrep on all changed files
- Run full test suite not just related tests
- Fix warnings not just errors (zero warnings policy)
- GSD profile is set to "quality" with Sonnet overrides for 5 research/mapper agents only
- Use all installed tools: eslint, prettier, biome, semgrep, shellcheck, tsc
- Run `/superpowers-verification` and `/superpowers-code-review` on ALL tasks including Small ones

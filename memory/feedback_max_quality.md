---
name: Maximum Quality Priority
description: User wants super quality results with zero errors, high security, and maximum effort on every task — all agents on Opus, full verification pipeline
type: feedback
---

User explicitly requested maximum quality mode — no cost optimization, no shortcuts.

**Why:** User values correctness and security above speed and token cost. They want zero-defect output with comprehensive security scanning.

**How to apply:**
- Always use Opus model for ALL agents (explore, plan, implement, verify, red team)
- Run full 6-phase workflow including Red Team phase on every non-trivial task
- Never skip security audit — run semgrep on all changed files
- Run full test suite not just related tests
- Fix warnings not just errors (zero warnings policy)
- GSD profile is set to "quality" with all overrides on Opus
- Use all installed tools: eslint, prettier, biome, semgrep, shellcheck, tsc
- Run `/superpowers-verification` and `/superpowers-code-review` on ALL tasks including Small ones

---
name: pulse-check
description: "Check what's new in Claude Code, AI tools, and your skill ecosystem. Finds new features, outdated patterns, and upgrade opportunities. Usage: /pulse-check [claude|ai|skills|all]"
user-invocable: true
version: 1.0.0
---

# Pulse Check — What's New: $ARGUMENTS

Stay current with Claude Code features, AI tooling updates, and skill ecosystem health. Finds upgrade opportunities and outdated patterns before they become technical debt.

## Mode Detection

- If $ARGUMENTS is empty or `all`: run all 3 checks
- If $ARGUMENTS is `claude`: check Claude Code features only
- If $ARGUMENTS is `ai`: check AI tooling ecosystem only
- If $ARGUMENTS is `skills`: check skill ecosystem health only

---

## Phase 1: Gather Intelligence (Up to 3 Sonnet agents — model: "sonnet")

### Agent 1: Claude Code Feature Check (if mode includes `claude` or `all`)
Research what's new in Claude Code:
- WebSearch for "Claude Code changelog" and "Claude Code new features 2026"
- WebSearch for "Anthropic Claude Code hooks" and "Claude Code tools update"
- Check if any new hook event types exist beyond: SessionStart, PreToolUse, PostToolUse, UserPromptSubmit, SubagentStart, SubagentStop, SessionEnd
- Check if any new Agent subagent_types are available
- Check if any new tool types are available (beyond Read, Write, Edit, Bash, Glob, Grep, Agent, etc.)
- Check for new model options (beyond sonnet, opus, haiku)
- Look for deprecations or breaking changes

Report format:
```
## Claude Code Updates
- New features: [list with dates]
- New hook types: [if any]
- New tools: [if any]
- New agent types: [if any]
- Deprecations: [if any]
- Breaking changes: [if any]
```

### Agent 2: AI Ecosystem Check (if mode includes `ai` or `all`)
Research AI tooling updates relevant to the user's stack:
- WebSearch for "Vercel AI SDK latest version" and "AI SDK changelog"
- WebSearch for "Anthropic Claude API updates 2026"
- Check for new model releases (Claude, GPT, Gemini) that might be better/cheaper
- Look for new MCP servers that could be useful
- Check if any dependencies in `~/.claude/mcp.json` have newer versions

Report format:
```
## AI Ecosystem Updates
- New models: [list with capabilities]
- SDK updates: [version changes]
- New MCP servers: [relevant ones]
- Cost changes: [if any pricing updates]
```

### Agent 3: Skill Ecosystem Health (if mode includes `skills` or `all`)
- Read all `~/.claude/skills/*/SKILL.md` frontmatter
- Check version numbers — any still at 1.0.0 that have been modified?
- Cross-reference skills against CLAUDE.md chain — any skills not in any chain?
- Check if any skill references tools or features that no longer exist
- Check `~/.claude/hooks/skill-auto-trigger.mjs` — are all intents still correct?
- Read `~/.gsd/defaults.json` — is model routing still aligned with gold-standard policy?

Report format:
```
## Skill Health
- Total skills: N
- Orphaned skills (not in any chain): [list]
- Skills needing version bump: [list]
- Stale references: [list]
- Model routing compliance: PASS/FAIL
```

---

## Phase 2: Synthesize & Recommend (1 Opus agent — model: "opus")

Combine all agent findings into an actionable report:

```
## Pulse Check Report
**Date**: [today]
**Claude Code version**: [if detectable]

### What's New (action items)
1. [Most impactful new feature/tool] — How to use it: [brief]
2. [Second most impactful] — How to use it: [brief]
...

### What's Outdated (fix items)
1. [Most urgent outdated pattern] — Fix: [brief]
2. [Second most urgent] — Fix: [brief]
...

### Upgrade Opportunities
- [New model that's cheaper/better for a specific task]
- [New MCP server that could replace manual work]
- [New hook type that could automate something]

### Skill Ecosystem Score
| Metric | Value |
|--------|-------|
| Skills up to date | X/Y |
| Model routing compliant | PASS/FAIL |
| Chain coverage | X% of skills in at least one chain |
| Orphaned skills | N |

### Recommended Next Actions
1. [Highest priority action with command to run]
2. [Second priority]
3. [Third priority]
```

---

## Phase 3: Offer Actions

Present the report, then offer:
- "Run `/token-guard audit` to check for bloat" — if efficiency issues found
- "Run `/gold-standard audit` to verify model routing" — if routing issues found
- "Run `/evolve audit` to check for skill gaps" — if ecosystem health is low
- "Run `/self-fix check` to repair broken references" — if stale references found

---

## Principles

- All research agents use Sonnet — this is an information-gathering skill
- Only the synthesis agent uses Opus — it makes recommendations
- Never auto-apply changes — this is a READ-ONLY diagnostic skill
- Focus on actionable findings, not exhaustive lists
- Prioritize findings by impact: what saves the most tokens or improves quality the most
- Run this weekly or after major Claude Code updates

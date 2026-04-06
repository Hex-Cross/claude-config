---
name: ecosystem-audit
description: Self-healing audit of all agents, skills, hooks, and settings. Detects staleness, broken references, missing tools, and configuration drift. Auto-fixes what it can, escalates what it cannot.
user-invocable: true
version: 1.1.0
---

# Ecosystem Audit -- Self-Healing System Check

Audits the entire agent/skill/hook infrastructure for health issues and auto-fixes them.

## Step 0: Initialize

```bash
mkdir -p .teams/supervisor
mkdir -p .teams/reviews/supervisor
```

## Step 1: Inventory

Gather the full list of artifacts:

```bash
echo "=== Agents ===" && ls agents/*.md 2>/dev/null | wc -l
echo "=== Skills ===" && ls skills/*/SKILL.md 2>/dev/null | wc -l
echo "=== Hooks ===" && ls hooks/*.{js,mjs} 2>/dev/null | wc -l
```

Read `settings.json` for the authoritative hook and permission configuration.

## Step 2: Parallel Audit (3 agents IN PARALLEL, model: "opus" -- judgment required for all)

### Agent 1: Agent Audit
Spawn **ecosystem-auditor** agent:
```
Audit ALL agent files in the agents/ directory.

For each agent, verify:
1. YAML frontmatter has: name, description, tools, color
2. Filename matches name field (e.g., supervisor.md has name: supervisor)
3. All tools in tools: field are valid Claude Code tools or MCP wildcards
4. MCP wildcards (mcp__*) reference servers that exist in settings.json
5. System prompt has structured sections (role, output format, standards)
6. Any cross-references to other agents/files point to things that exist
7. Description accurately reflects what the agent does

Read every .md file in agents/ directory.
Write agent audit findings to: .teams/supervisor/audit-agents.md
For any issues with confidence: high, FIX THEM DIRECTLY by editing the agent file.
Log every fix.
```

### Agent 2: Skill Audit
Spawn **ecosystem-auditor** agent:
```
Audit ALL skill files in skills/*/SKILL.md.

For each skill, verify:
1. YAML frontmatter has: name, description, user-invocable, version
2. Every agent referenced in the skill exists in agents/
3. Model routing is correct: sonnet for research, opus for decisions/writing/review
4. Steps are complete (no TODOs, placeholders, or "TBD")
5. File paths (.teams/*, .planning/*) are consistent across skills
6. If skill references other skills (/supervisor:review, etc.), those skills exist
7. Every skill ends with a supervisor review gate (except supervisor-review itself)
8. Revision loops are defined for handling supervisor feedback

Read every SKILL.md in skills/ directory.
Write skill audit findings to: .teams/supervisor/audit-skills.md
Fix issues directly where confidence is high.
```

### Agent 3: Hook & Settings Audit
Spawn **ecosystem-auditor** agent:
```
Audit ALL hook files in hooks/ and the settings.json file.

For each hook:
1. Run: node --check {file} -- verify no syntax errors
2. Verify it is registered in settings.json (correct matcher, path, timeout)
3. Check for timeout safety (setTimeout guard, stdin timeout)
4. Verify all imports/requires resolve to existing files
5. Check matchers in settings.json match what the hook actually handles

For settings.json:
1. All MCP wildcards in allow have corresponding MCP server configs
2. All hook command paths point to existing files
3. No orphaned hooks (registered but file missing)
4. Allow and deny lists do not contradict

Write hook/settings audit findings to: .teams/supervisor/audit-hooks.md
Fix issues directly where confidence is high.
```

## Step 3: Cross-System Consistency (1 agent, model: "opus")

Spawn **ecosystem-auditor** agent:
```
Verify cross-system consistency across agents, skills, hooks, and settings.

Read the three audit reports:
- .teams/supervisor/audit-agents.md
- .teams/supervisor/audit-skills.md
- .teams/supervisor/audit-hooks.md

Then verify:
1. Every team (marketing, research, testing, sales, exec, dev) has both agents AND orchestrator skills
2. .teams/ directory structure expectations are consistent across all agents/skills
3. Model routing compliance across all skill files matches the routing policy
4. No orphaned agents (agents that no skill ever spawns)
5. No orphaned skills (skills that reference non-existent agents)
6. settings.json permissions cover all MCP tools referenced by agents
7. Communication contracts: agents that produce output write to paths that consuming agents read from

Write cross-system findings to: .teams/supervisor/audit-cross-system.md
Fix issues directly where confidence is high.
```

## Step 4: Verification Pass

After all auto-fixes in Steps 2-3, run a quick verification:
```bash
# Verify all hooks still parse
for f in hooks/*.mjs hooks/*.js; do node --check "$f" 2>&1; done

# Verify settings.json is valid JSON
node -e "JSON.parse(require('fs').readFileSync('settings.json','utf-8'))" 2>&1
```

If any fix broke something, revert that fix and log it as an escalation.

## Step 5: Health Score & Report

Compile all audit findings into a single report. Calculate health score:
- Start at 10.0
- Deduct 0.5 per critical issue (broken reference, syntax error, missing agent)
- Deduct 0.2 per warning (missing optional field, stale description)
- Deduct 0.1 per info (style inconsistency, naming convention)

Write final report to: `.teams/supervisor/audit-report.md`

## Step 6: Supervisor Review

Invoke `/supervisor:review` on `.teams/supervisor/audit-report.md` to verify the audit itself is thorough and the fixes are sound.

Present to user:
- Health score
- Issues found, auto-fixed, and escalated
- Agent/skill roster with status
- Recommendations for improvements

---
name: gold-standard
description: "Audit and enforce tiered model routing policy. Verifies Explore/Research agents use Sonnet and Planning/Coding/Security/Testing agents use Opus. Usage: /gold-standard [audit|explain|check <skill-name>]"
user-invocable: true
version: 1.0.0
---

# Gold Standard Model Routing Audit: $ARGUMENTS

Audit compliance with the tiered model routing policy defined in CLAUDE.md. Ensures token-expensive Opus is reserved for quality-critical work while Sonnet handles read-only research.

## Routing Policy (Canonical Reference)

### SONNET tier — agents that only read and report
- **Explore agents**: file reading, directory listing, git log, codebase mapping, import tracing
- **Research agents**: web search, documentation fetching, API browsing, prior art investigation
- **Passive analysis**: dependency listing, pattern scanning (read-only output)

### OPUS tier — agents that decide, write, or judge
- **Planning agents**: architecture decisions, task decomposition, adversarial review
- **Implementation agents**: writing or modifying any code or configuration
- **Security agents**: red team simulation, OWASP scanning, auth analysis, fuzzing
- **Testing agents**: writing tests, coverage analysis, edge case identification
- **Verification agents**: judging whether work meets requirements
- **Bug fixing agents**: root cause analysis, fix implementation
- **Code review agents**: final quality gate

### The one rule
Sonnet for agents that only read and report. Opus for agents that decide, write, or judge.

---

## Mode Detection

- If $ARGUMENTS is empty or `audit`: run **Audit Mode**
- If $ARGUMENTS is `explain`: run **Explain Mode**
- If $ARGUMENTS starts with `check`: run **Check Mode** on the named skill

---

## Explain Mode

Print the routing policy tables above verbatim. Then show a worked example:

```
Example 1 (Sonnet): Spawning an Explore agent to find all usages of a function
  → model: "sonnet" — read-only codebase search

Example 2 (Opus): Spawning an agent to implement a new API endpoint
  → model: "opus" — writing code, making design decisions

Example 3 (Sonnet): Spawning a research agent to fetch documentation
  → model: "sonnet" — information retrieval only

Example 4 (Opus): Spawning a security agent to red-team auth flow
  → model: "opus" — adversarial reasoning, high stakes
```

Exit after printing.

---

## Audit Mode

### Phase 1: Collect Evidence (2 Sonnet agents IN PARALLEL)

#### Agent 1: Skill Scanner (model: "sonnet")
Scan all SKILL.md files under `~/.claude/skills/`:
- For each skill, identify every reference to Agent tool calls or agent spawning
- Record: skill name, agent purpose/description, model parameter (if present or absent)
- Classify each agent as SONNET-tier or OPUS-tier based on the routing policy
- Flag violations:
  - Read-only/research agent with `model: "opus"` or no model specified (defaults to opus)
  - Coding/security/testing agent with `model: "sonnet"`

#### Agent 2: GSD Config Scanner (model: "sonnet")
- Read `~/.gsd/defaults.json` — extract model_profile and model_overrides
- Read `~/.claude/get-shit-done/bin/lib/model-profiles.cjs` — extract the profile table
- For each GSD agent, determine effective model (override > profile > fallback)
- Classify each agent: researcher/mapper → should be sonnet; planner/executor/debugger → should be opus
- Flag violations where effective model doesn't match policy

### Phase 2: Compliance Report (1 Opus agent)

Synthesize Phase 1 findings into a structured report:

```
## Gold Standard Compliance Report
**Date**: [today]
**Policy version**: 1.0.0

### GSD Agent Routing
| Agent | Effective Model | Policy Model | Status |
|---|---|---|---|
| gsd-planner | opus | opus | PASS |
| gsd-executor | opus | opus | PASS |
| ... | ... | ... | ... |

### Custom Skill Routing
| Skill | Agent Description | Model Used | Policy | Status |
|---|---|---|---|---|
| implement | Task Analysis (explore) | [model] | sonnet | PASS/VIOLATION |
| ... | ... | ... | ... | ... |

### Summary
- Total agent spawns audited: N
- Compliant: N
- Violations: N

### Violations (if any)
1. **[file:line]** — [agent description] uses [current model], should be [policy model]
   Fix: add `model: "[correct]"` parameter

### Recommended Actions
[Numbered list of specific changes to make]
```

---

## Check Mode

Scope Phase 1 to only the named skill file (`~/.claude/skills/<name>/SKILL.md`).
Run Phase 2 for that skill only.

If the skill is not found, check `~/.claude/commands/gsd/<name>.md` as fallback.

---

## Principles

- This skill itself follows the routing policy: research phases use Sonnet, synthesis uses Opus
- Never modify skill files automatically — only report violations and recommend fixes
- The routing policy in CLAUDE.md is the single source of truth; this skill audits against it
- Flag ambiguous cases (agent does both reading and light processing) for human judgment
- A missing `model:` parameter on an Agent call is a violation if the default would be wrong

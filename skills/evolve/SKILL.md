---
name: evolve
description: "Audit the skill ecosystem, detect gaps, propose new/updated/removed skills, and apply changes safely. All changes require explicit user approval. Usage: /evolve [audit|propose|apply|rollback|status]"
user-invocable: true
version: 1.0.0
---

# Skill Ecosystem Evolution: $ARGUMENTS

The meta-skill that manages, grows, and maintains the skill ecosystem.

## Sub-command Detection

- Empty or `audit`: run **Audit Mode** (full ecosystem health report)
- `propose new <description>`: run **Propose New Skill**
- `propose update <skill-name>`: run **Propose Skill Update**
- `propose remove <skill-name>`: run **Propose Skill Removal**
- `apply <proposal-filename>`: run **Apply Proposal**
- `rollback <skill-name>`: run **Rollback Skill**
- `status`: run **Status Report**

<HARD-GATE>
SAFETY RULES — NEVER VIOLATE THESE:
1. NEVER modify any file under ~/.claude/skills/ without showing the complete proposed change to the user AND receiving explicit "yes" approval
2. NEVER modify more than ONE skill per approval cycle
3. ALWAYS create a backup before modifying any skill file
4. ALWAYS log every change to ~/.claude/projects/-home-frok/memory/skill-evolution-log.md
5. NEVER auto-execute proposals — always dry-run first
6. NEVER delete a skill without backup
7. NEVER modify CLAUDE.md or settings.json — those are out of scope
8. ALL proposals are written to ~/.claude/evolve/proposals/ before any action
</HARD-GATE>

---

## Audit Mode (default)

### Step 1: Inventory

Read all directories under `~/.claude/skills/`. For each, parse `SKILL.md` frontmatter and collect:
- Skill name, description, version, user-invocable status
- File size (lines)
- Last-modified date (use `stat` via Bash)

### Step 2: Usage Analysis (2 parallel agents)

#### Agent 1: History Mining

- Read `~/.claude/history.jsonl` (or recent portion if large — last 5000 lines)
- Search for skill invocation patterns: lines containing `/skill-name` 
- For each skill, count: total invocations, invocations in last 30 days, last invocation date
- Classify each skill:
  - **Active**: used in last 14 days
  - **Occasional**: used in last 60 days but not last 14
  - **Stale**: not used in 60+ days
  - **Never used**: zero recorded invocations
- Also detect **manual workflow patterns**: repeated sequences of commands/tool usage that suggest a missing skill (e.g., user repeatedly runs the same 5 commands in sequence)

#### Agent 2: Gap Detection

- Read `~/.claude/settings.json` allow list — identify permitted tools
- Read `~/.claude/mcp.json` — identify configured MCP servers
- Compare against what existing skills actually use
- Flag tools/servers that are permitted but not leveraged by any skill
- Read `~/.claude/projects/-home-frok/memory/` files for feedback entries that suggest desired capabilities
- Read `~/.claude/projects/-home-frok/memory/skill-gap-observations.md` for previously noted gaps
- Optionally: use WebSearch to find "Claude Code popular skills" or "AI assistant common workflows" to identify industry-standard capabilities the ecosystem lacks

### Step 3: Improvement Analysis

For each **active** skill, assess:
- Could it benefit from tools added since it was created? (e.g., new MCP servers)
- Is it following current best practices? (parallel agents, structured output, version field)
- Are there user complaints or workarounds in memory files?
- Is it referenced correctly in CLAUDE.md skill chain?

### Step 4: Generate Audit Report

```
## Skill Ecosystem Audit Report
**Date**: [today]
**Total Skills**: [N]
**Active**: [N] | Occasional: [N] | Stale: [N] | Never Used: [N]

### Usage Ranking (Last 30 Days)
| Rank | Skill | 30d Uses | Total Uses | Trend | Status |
|------|-------|----------|------------|-------|--------|
| 1    | ...   | ...      | ...        | ...   | Active |

### Proposed Actions
1. **[NEW]** Create `/<name>` — [reason with evidence]
2. **[UPDATE]** `/<name>` — [what could be improved]
3. **[REMOVE]** `/<name>` — [usage evidence for removal]

### Detected Gaps
1. [Tool/capability] permitted but unused by any skill
2. [Manual pattern] detected [N]x in history — could be a skill

### Ecosystem Health
- Skills with version tracking: [N]/[total]
- Skills with issues (run /self-fix for details): [N]
- Backup directory size: [size]
- Pending proposals: [N]
```

Present the report and ask:
- "Want me to generate a detailed proposal for any of these actions?"
- "Want to deep-dive into usage data for a specific skill?"

---

## Propose New Skill (`/evolve propose new <description>`)

1. Parse the description to understand what the skill should do
2. Read `~/.claude/evolve/templates/new-skill-template.md` for the canonical structure
3. Optionally use WebSearch to research best practices for the skill's domain
4. Generate a complete `SKILL.md` content following the template:
   - Valid YAML frontmatter with name, description, user-invocable, version: 1.0.0
   - Clear phase structure with parallel agents where appropriate
   - Structured output format
   - Tool dependencies listed
5. Write the proposal to `~/.claude/evolve/proposals/[date]-proposal-new-[slug].md` with format:

```markdown
# Proposal: New Skill — [name]
**Date**: [today]
**Type**: NEW
**Target**: ~/.claude/skills/[name]/SKILL.md

## Rationale
[Why this skill is needed — evidence from audit, user request, or gap detection]

## Proposed SKILL.md Content
[Full content of the SKILL.md file]

## Tool Dependencies
[List of tools this skill requires and their permission status]

## Impact
- New directory: ~/.claude/skills/[name]/
- New file: ~/.claude/skills/[name]/SKILL.md
- No existing files modified
```

6. Present the full proposal to the user
7. Ask: "Approve this proposal? Say 'yes' to create the skill, or suggest changes."

---

## Propose Skill Update (`/evolve propose update <skill-name>`)

1. Read the current `~/.claude/skills/<skill-name>/SKILL.md`
2. Analyze what could be improved (based on audit findings, user feedback, or explicit request)
3. Generate the updated content
4. Write the proposal to `~/.claude/evolve/proposals/[date]-proposal-update-[name].md`:

```markdown
# Proposal: Update Skill — [name]
**Date**: [today]
**Type**: UPDATE
**Target**: ~/.claude/skills/[name]/SKILL.md
**Current Version**: [version]
**Proposed Version**: [bumped version]

## Rationale
[What's being improved and why]

## Changes
[Diff-style description of what changed]

## Full Updated SKILL.md Content
[Complete new content]

## Rollback
Backup will be created at: ~/.claude/evolve/backups/[name]/SKILL.md.[timestamp]
```

5. Show the proposal with a clear diff summary
6. Ask for approval

---

## Propose Skill Removal (`/evolve propose remove <skill-name>`)

1. Read the current skill file
2. Gather usage stats from history
3. Check for references from other skills and CLAUDE.md
4. Write the proposal to `~/.claude/evolve/proposals/[date]-proposal-remove-[name].md`:

```markdown
# Proposal: Remove Skill — [name]
**Date**: [today]
**Type**: REMOVE
**Target**: ~/.claude/skills/[name]/

## Evidence for Removal
- Last used: [date or never]
- Total uses: [N]
- Referenced by: [list or "none"]

## Impact
- Directory to remove: ~/.claude/skills/[name]/
- References to update: [list or "none"]
- Backup location: ~/.claude/evolve/backups/[name]/SKILL.md.[timestamp]

## Reversibility
Full backup will be preserved. Use `/evolve rollback [name]` to restore.
```

5. Present and ask for approval. If references exist, warn that they need updating.

---

## Apply Proposal (`/evolve apply <proposal-filename>`)

1. Read the proposal from `~/.claude/evolve/proposals/<proposal-filename>`
2. Parse the proposal type (NEW, UPDATE, REMOVE)
3. Show a summary of what will happen — this is the final dry-run
4. Wait for explicit "yes" from user

**If approved:**

For NEW:
1. Create the skill directory: `mkdir -p ~/.claude/skills/[name]/`
2. Write the SKILL.md file
3. Append to `~/.claude/projects/-home-frok/memory/skill-evolution-log.md`
4. Run self-fix validation logic on the new skill
5. Report success

For UPDATE:
1. Create backup: `cp ~/.claude/skills/[name]/SKILL.md ~/.claude/evolve/backups/[name]/SKILL.md.[timestamp]`
2. Ensure backup directory exists: `mkdir -p ~/.claude/evolve/backups/[name]/`
3. Write the updated SKILL.md
4. Update version in frontmatter
5. Append to evolution log
6. Run self-fix validation on the updated skill
7. Report success with backup path

For REMOVE:
1. Create backup: `mkdir -p ~/.claude/evolve/backups/[name]/ && cp ~/.claude/skills/[name]/SKILL.md ~/.claude/evolve/backups/[name]/SKILL.md.[timestamp]`
2. Remove the skill directory: `rm -rf ~/.claude/skills/[name]/`
3. Append to evolution log
4. Report success with backup path

---

## Rollback (`/evolve rollback <skill-name>`)

1. List all backups in `~/.claude/evolve/backups/<skill-name>/` sorted by date
2. If no backups exist, report error
3. Show each backup with its timestamp and the evolution log entry for context
4. Ask user which version to restore (default: most recent)
5. Show diff between current state and selected backup
6. Wait for "yes"
7. If the skill currently exists, back up current version first
8. Restore the selected backup to `~/.claude/skills/<skill-name>/SKILL.md`
9. Log the rollback in evolution log
10. Run self-fix validation

---

## Status (`/evolve status`)

Quick overview without full audit:

```
## Evolution Status
**Date**: [today]

### Pending Proposals
| File | Type | Skill | Date |
|------|------|-------|------|
| ... | NEW/UPDATE/REMOVE | ... | ... |

### Recent Changes (last 5)
[From skill-evolution-log.md]

### Backup Directory
- Total size: [size]
- Skills with backups: [list]
- Oldest backup: [date]

### Quick Stats
- Total skills: [N]
- Skills with version tracking: [N]
- Last audit: [date or "never — run /evolve audit"]
```

---

## Principles

- **User controls everything** — the system proposes, the user decides
- **Dry-run by default** — proposals are files, not actions
- **Audit trail is immutable** — every change logged with date, type, reason, backup path
- **One change at a time** — prevents cascade failures
- **Backups are mandatory** — no modification without a safety net
- **Evolution is deliberate** — no automatic triggers, no background modifications

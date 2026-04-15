---
name: linear-sync
description: Sync GSD phases and tasks with Linear issues — bidirectional status tracking, auto-create tickets from roadmap phases, and pull sprint updates
user-invocable: true
version: 1.0.0
---

# Linear Sync

Route by sub-command: `sync | status | create | update | import`

If no sub-command is provided, default to `status`.

---

## `sync` — Push GSD phases to Linear

1. Read `.planning/ROADMAP.md` to get all phases.
2. Read `.planning/STATE.md` for current phase status.
3. Authenticate with Linear MCP: `mcp__claude_ai_Linear__*`
4. For each phase:
   - Check if a matching Linear issue exists (search by title prefix `[Phase {N}]`)
   - If not: create issue with `mcp__claude_ai_Linear__*` — title: `[Phase {N}] {goal}`, description from ROADMAP
   - If exists: update status to match STATE.md (planned→backlog, in_progress→started, completed→done)
5. Report: `Synced {N} phases → Linear. Created {X}, updated {Y}, unchanged {Z}.`

## `status` — Pull Linear sprint status

1. Authenticate and fetch current cycle/sprint issues via `mcp__claude_ai_Linear__*`
2. Group by status: Backlog / Todo / In Progress / Done
3. Present summary table with: issue key, title, assignee, priority, status
4. Cross-reference with `.planning/STATE.md` to highlight drift (Linear says done but GSD says in_progress)
5. Flag stale issues (no update in 7+ days)

## `create` — Create Linear issue from context

1. Accept description from user or current conversation context.
2. Auto-detect: Bug (error/crash/fix language), Feature (add/implement/build), Task (default).
3. Set priority from language: Urgent (ASAP/critical), High (important/blocker), Medium (default).
4. Create via `mcp__claude_ai_Linear__*` with: title, description, type, priority, labels.
5. If inside a GSD phase, add label `phase-{N}` and link in CONTEXT.md.
6. Return issue ID and URL.

## `update` — Update Linear issue

1. Require issue identifier (ID or title search).
2. Determine action: status change, comment, assign, set priority.
3. Execute via `mcp__claude_ai_Linear__*`.
4. Confirm the update.

## `import` — Pull Linear issues into GSD

1. Fetch issues from a specific project/team via `mcp__claude_ai_Linear__*`.
2. For each unmatched issue, propose: create as new GSD phase, add to backlog (999.x), or skip.
3. Present proposals for user approval before writing.
4. Create approved phases in ROADMAP.md via `/gsd-add-phase` or `/gsd-add-backlog`.

---

**Error handling**: If Linear MCP auth fails, show clear message: "Linear MCP not authenticated. Run `mcp__claude_ai_Linear__authenticate` first."

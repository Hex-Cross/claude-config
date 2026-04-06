---
name: atlassian-sync
description: Sync with Jira and Confluence — sprint status, issue management, Confluence publishing via MCP
user-invocable: true
version: 1.0.0
---

# Atlassian Sync

Route by sub-command: `sync | status | create | update | publish`

If no sub-command is provided, ask the user which action they need.

---

## `sync` — Pull Jira issues from project/sprint

1. Ask for project key if not provided (e.g. `PROJ`).
2. Use `mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql` with JQL:
   - Active sprint: `project = {key} AND sprint in openSprints() ORDER BY priority DESC`
   - Or custom JQL if the user supplies one.
3. For each issue, extract: key, summary, status, assignee, priority.
4. Present a grouped summary table (by status column: To Do / In Progress / Done).
5. Call out any unassigned or blocked issues.

## `status` — Sprint progress & blockers

1. Run the same open-sprint JQL as `sync`.
2. Compute counts per status category and show a progress bar (done / total).
3. Identify blockers: issues with `Blocked` flag, or flagged items.
4. List upcoming due dates (issues where `duedate` is within 7 days).
5. Summarise: percent complete, top blockers, approaching deadlines.

## `create` — Create a Jira issue

1. Accept a natural-language description from the user.
2. Auto-detect issue type (Bug if error/crash/fix language; Story otherwise) and priority (High if urgent/critical language; Medium default).
3. Ask for project key if not provided.
4. Use `mcp__claude_ai_Atlassian__createJiraIssue` with fields: project, summary, description, issuetype, priority.
5. Return the new issue key and URL.

## `update` — Update issue status / comment / log work

1. Require an issue key (e.g. `PROJ-123`).
2. Determine action from user intent:
   - **Transition**: Use `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue` to list valid transitions, then `mcp__claude_ai_Atlassian__transitionJiraIssue`.
   - **Comment**: Use `mcp__claude_ai_Atlassian__addCommentToJiraIssue`.
   - **Edit fields**: Use `mcp__claude_ai_Atlassian__editJiraIssue` for summary, description, priority, assignee changes.
   - **Log work**: Use `mcp__claude_ai_Atlassian__addWorklogToJiraIssue`.
3. Confirm the update and show the resulting issue state via `mcp__claude_ai_Atlassian__getJiraIssue`.

## `publish` — Publish to Confluence

1. Accept: title, space key, and content (or generate from conversation context).
2. Check if page exists: `mcp__claude_ai_Atlassian__searchConfluenceUsingCql` with `title = "{title}" AND space = "{spaceKey}"`.
3. If exists: use `mcp__claude_ai_Atlassian__updateConfluencePage` with new content.
4. If new: use `mcp__claude_ai_Atlassian__createConfluencePage`.
5. Return the page URL.

---

**Error handling**: If any MCP call fails, show the error clearly and suggest corrective action (check permissions, verify project key, etc.).

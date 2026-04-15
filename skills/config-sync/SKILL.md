---
name: config-sync
description: Synchronize global Claude configuration (CLAUDE.md, GOVERNANCE.md, AGENTS.md, .mcp.json) across all registered projects. Push global changes or pull project-specific updates.
user-invocable: true
version: 1.0.0
---

# Config Sync

Route by sub-command: `push | pull | status | register | diff`

If no sub-command, default to `status`.

---

## `push` — Push global config changes to all projects

1. Read the global config source at `/home/frok/Documents/Project/claude-config/`.
2. Read the project registry at `/home/frok/Documents/Project/claude-config/memory/global-project-registry.md`.
   - If registry doesn't exist, create it with the current project as the first entry.
3. For each registered project:
   a. Read the project's config files (CLAUDE.md, GOVERNANCE.md, AGENTS.md, .mcp.json).
   b. Identify sections marked with `<!-- BEGIN:global -->` / `<!-- END:global -->` markers.
   c. Replace global sections with the latest global content while preserving project-specific sections (inside `<!-- BEGIN:project -->` / `<!-- END:project -->` or `<!-- BEGIN:bootstrap -->` / `<!-- END:bootstrap -->` markers).
   d. For files without markers: replace the entire file with global version (GOVERNANCE.md, .mcp.json).
   e. Write updated files.
4. Update `last_synced` timestamps in the registry.
5. Report: `Synced to {N} projects. Files updated: {list}.`

## `pull` — Pull project-specific changes back to global

1. Read the current project's config files.
2. Identify any changes in global sections that should propagate upstream.
3. Show diff between project and global versions.
4. Ask user to confirm which changes should be promoted to global.
5. Update global config source and push to other projects.

## `status` — Show sync status

1. Read registry.
2. For each project: show last_synced date, detect drift (files modified after last sync).
3. Present table: project name, path, last synced, drift status (in sync / drifted / never synced).

## `register` — Add current project to sync registry

1. Detect project root (package.json, .git, etc.).
2. Detect framework/stack.
3. Add entry to global-project-registry.md: path, framework, date registered.
4. Run initial push to bring project up to date.

## `diff` — Show differences between global and project configs

1. For each config file: diff global vs project version.
2. Highlight: global-only changes, project-only changes, conflicts.
3. Suggest resolution for each conflict.

---

**Safety**: Never overwrite content inside `<!-- BEGIN:project -->` / `<!-- END:project -->` markers. These contain project-specific customizations that must be preserved.

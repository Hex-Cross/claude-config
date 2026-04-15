---
name: bootstrap-project
description: Initialize a new project with full Claude configuration layers — CLAUDE.md, AGENTS.md, GOVERNANCE.md, .mcp.json, .memory/, knowledge/, .feedback/, .decisions/. Auto-detects framework and tailors config.
user-invocable: true
version: 1.0.0
---

# Bootstrap Project

Route by argument: empty → **Full Bootstrap**, `refresh` → **Refresh Mode**

---

## Full Bootstrap

### Step 1: Detect Project

1. Read `package.json`, `composer.json`, `Cargo.toml`, `go.mod`, `pyproject.toml` to identify framework.
2. Detect: Next.js, React SPA, Vue, Express, Laravel, Remix, Hono, Rust, Go, Python, or Unknown.
3. Identify capabilities: `has_ui`, `has_db`, `has_api`, `has_auth`, `has_compliance`.

### Step 2: Generate Config Layers

For each of the 8 config layers, read the global template from `/home/frok/Documents/Project/claude-config/` and customize for this project:

1. **CLAUDE.md**: Global rules + `<!-- BEGIN:project -->` section with framework-specific rules (e.g., Next.js App Router patterns, Drizzle ORM conventions) + `<!-- BEGIN:plugin-skills -->` section listing relevant plugin skills.
2. **AGENTS.md**: Team roster tailored to project capabilities. Skip marketing/sales agents for internal tools. Include all dev/test agents always.
3. **GOVERNANCE.md**: Copy global governance unchanged (authority hierarchy and debate protocol are universal).
4. **.mcp.json**: Project-level MCP config. Include Context7 always. Add Playwright if has_ui. Add framework-specific MCPs.
5. **.memory/**: Create directory with initial `conventions.md` capturing detected patterns (import style, naming conventions, directory structure).
6. **knowledge/**: Create directory with `stack.md` documenting detected tech stack and key dependencies.
7. **.feedback/**: Create directory with empty `feedback-index.md`.
8. **.decisions/**: Create directory with empty `decisions-index.md`.

### Step 3: Register

1. Add project to global registry via `/config-sync register` logic.
2. Add `.memory/`, `.feedback/`, `.decisions/`, `knowledge/` to `.gitignore` if not already present.

### Step 4: Report

Output: `[Bootstrap complete: {framework} project configured with {N} agents, {N} MCP servers, 8 config layers]`

---

## Refresh Mode

For projects that already have partial config:

1. Scan which of the 8 layers exist.
2. For missing layers: generate them (same as full bootstrap).
3. For existing layers: check for `<!-- BEGIN:plugin-skills -->` section in CLAUDE.md — add if missing.
4. Do NOT overwrite existing content — only add missing pieces.
5. Report what was added.

---

**Safety**: Never overwrite existing CLAUDE.md project-specific sections. Always preserve `<!-- BEGIN:project -->` markers.

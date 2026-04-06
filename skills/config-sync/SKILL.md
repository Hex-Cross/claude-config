---
name: config-sync
description: "Sync configuration changes across all projects. Push local improvements to global, pull global updates to local. Usage: /config-sync [push|pull|diff]"
user-invocable: true
version: 1.0.0
created: 2026-04-04
last_updated: 2026-04-04
---

# Configuration Sync Skill

Detects changes in one project's configuration files and intelligently propagates GLOBAL changes to all other bootstrapped projects while preserving LOCAL (project-specific) customizations.

## Usage

```
/config-sync push     # Push current project's global changes to all projects
/config-sync pull     # Pull latest global config into current project
/config-sync diff     # Show what's different between this project and global
/config-sync          # Auto-detect changes and suggest action
```

## How It Works

### Change Classification: LOCAL vs GLOBAL

The skill classifies each configuration change into one of two categories:

#### GLOBAL Changes (Propagate to All Projects)
- **GOVERNANCE.md**: Authority hierarchy, debate protocol, escalation paths, decision-making gates
- **CLAUDE.md**: Security standards, model routing rules, workflow verification gates, validation patterns
- **New Skills**: Any skill files created or discovered
- **New MCP Servers**: Additions to .mcp.json that expand available capabilities
- **Memory Feedback**: New lessons or feedback patterns that apply broadly
- **Pattern/Convention Decisions**: Naming conventions, import orders, error handling patterns, commit message formats

#### LOCAL Changes (Stay in Project)
- **GOVERNANCE.md**: Audit matrix entries specific to project agents
- **CLAUDE.md**: Tech stack rules (framework-specific, language-specific)
- **Project Context**: Changes to .memory/ project-overview.md, project-specific learnings
- **Knowledge**: Project-specific documentation, tech stack decisions
- **Technology Decisions**: ADRs and decisions that are specific to this project's architecture or framework

### Detection Heuristics

The skill uses multiple strategies to identify changes:

1. **File Timestamp Comparison**: Compare mtime against last sync timestamp
2. **Content Hash Checking**: Detect actual content changes (not just metadata)
3. **Keyword Analysis**: Search for global vs local keywords:
   - **GLOBAL keywords**: "authority", "debate", "escalation", "override", "security", "OWASP", "auth", "encryption", "validation", "skill chain", "model routing", "verification gate", "naming convention", "import order", "error handling pattern"
   - **LOCAL keywords**: "framework-specific", "tech stack", "project-specific", "this project", "our frontend", "our backend", "Django", "Next.js", "React", "Laravel", "Remotion"

4. **Structural Analysis**: Parse YAML/JSON/Markdown to detect section changes

### Propagation Process

For each GLOBAL change:

1. **Extract and normalize** the change from the originating project
2. **Update the global config** in `/home/frok/Documents/Project/claude-config/`
3. **Scan the project registry** (`claude-config/memory/global-project-registry.md`)
4. **For each bootstrapped project**:
   - Load the project's existing config
   - Apply the global change while respecting `<!-- BEGIN:bootstrap -->` and `<!-- END:bootstrap -->` markers
   - Preserve project-specific LOCAL customizations
   - Update the sync timestamp
   - Commit the change to the project's git repo (if present)

### Markers for Safe Propagation

When propagating changes, the skill respects these markers in config files:

```markdown
<!-- BEGIN:bootstrap -->
[This section is managed by config-sync and will be overwritten]
<!-- END:bootstrap -->
```

Content outside these markers is never touched, protecting project-specific customizations.

## Implementation Details

### Agent Setup

Uses parallel agents for efficiency:

- **Model: sonnet** — Fast scanning and change detection
  - Scan file timestamps and hashes
  - Compare current project against global config
  - Generate diff reports

- **Model: opus** — Complex merging and writing
  - Merge changes while preserving LOCAL customizations
  - Apply bootstrap markers intelligently
  - Handle conflicts and generate merge reports

### Configuration Files Monitored

- `CLAUDE.md` — Model routing, security standards, workflow rules
- `AGENTS.md` — Agent authority, roles, responsibilities
- `GOVERNANCE.md` — Debate protocols, escalation paths, gates
- `.mcp.json` — MCP server configurations
- `.memory/` — Project memory and learnings
- `knowledge/` — Project knowledge base
- `.feedback/` — Feedback and improvement logs
- `.decisions/` — Architecture decision records (ADRs)

### Output

The skill reports:

```
[config-sync] Scanning /path/to/project...
[config-sync] Found changes:
  - GOVERNANCE.md: Added escalation path (GLOBAL) ✓
  - CLAUDE.md: Added validation pattern (GLOBAL) ✓
  - .memory/learnings.md: Project-specific fix (LOCAL) ✓
[config-sync] Propagating GLOBAL changes to 4 other projects...
  [1/4] dazsolution — Updated GOVERNANCE.md ✓
  [2/4] patuhin — Updated GOVERNANCE.md ✓
  [3/4] Simedia — Updated GOVERNANCE.md ✓
  [4/4] promo-video — Updated GOVERNANCE.md ✓
[config-sync] All projects synced. Last sync: 2026-04-04T23:45:12Z
```

## Related Skills

- `/gold-standard` — Quality standards (included in GLOBAL syncs)
- `/research-debate` — Debate protocols (included in GLOBAL syncs)
- `/architect` — Architecture decisions (can be LOCAL or GLOBAL)
- `/pre-flight` — Pre-flight checks use synced configuration

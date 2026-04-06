---
name: Global Project Registry
description: All bootstrapped projects and their locations for config-sync propagation
type: reference
created: 2026-04-04
last_updated: 2026-04-04
---

# Bootstrapped Projects Registry

This registry maintains a list of all projects bootstrapped with Paul's Claude configuration framework. The config-sync skill uses this registry to determine which projects should receive GLOBAL configuration updates.

## Projects

| Project | Path | Framework | Last Bootstrapped | Last Synced |
|---------|------|-----------|------------------|-------------|
| PatuhIn | /home/frok/Documents/Project/Idea/patuhin/patuhin/ | Next.js 16 | 2026-04-04 | 2026-04-04 |
| dazsolution | /home/frok/Documents/Project/dazsolution/ | Laravel 11 | 2026-04-04 | 2026-04-04 |
| Simedia Admin Frontend | /home/frok/Documents/Project/Simedia/admin-frontend/ | React 18 | 2026-04-04 | 2026-04-04 |
| Niaga | /home/frok/Documents/Project/Idea/2/ | Next.js 16 | 2026-04-04 | 2026-04-04 |
| Promo Video | /home/frok/Documents/Project/promo-video/ | Remotion 5 | 2026-04-04 | 2026-04-04 |

## Sync Rules

### GLOBAL Changes Propagation
- GLOBAL changes detected in any bootstrapped project propagate to **ALL** other projects
- Changes are merged while respecting bootstrap markers (`<!-- BEGIN:bootstrap -->` / `<!-- END:bootstrap -->`)
- Project-specific LOCAL customizations outside bootstrap markers are never overwritten
- Each project's sync timestamp is updated after successful propagation

### LOCAL Changes Stay Local
- LOCAL changes originate in a single project and do NOT propagate
- Project-specific configurations (tech stack, framework rules, project context) remain unchanged
- LOCAL changes still trigger the config-sync suggestion but won't execute a push

### Project Lifecycle
- **New Projects**: When `/bootstrap-project` runs on a new project, it's automatically registered here with current timestamp
- **Removed Projects**: When a project is deprecated or deleted, manually remove it from this registry
- **Framework Changes**: Update the Framework column if a project switches tech stacks
- **Resyncing**: Use `/config-sync pull` to re-sync a project that was manually edited

## How config-sync Uses This Registry

1. **Push**: Identifies all OTHER projects in this registry and propagates GLOBAL changes to each
2. **Pull**: Compares current project against the latest version in global config
3. **Diff**: Shows what's different between this project and the global version
4. **Auto-detect**: Suggests action based on detected changes

## Maintaining the Registry

This registry is **semi-automated**:

- **Automatic Updates**: The config-sync skill automatically adds projects when bootstrap runs
- **Manual Maintenance**: Remove entries when projects are deprecated
- **Manual Timestamps**: Update "Last Synced" after manual propagation if needed

### Update Format
When manually adding a project:
```markdown
| ProjectName | /absolute/path/to/project/ | Framework Version | 2026-04-04 | 2026-04-04 |
```

### Timestamps
- **Last Bootstrapped**: ISO 8601 date when `/bootstrap-project` was run
- **Last Synced**: ISO 8601 date when `/config-sync push` last succeeded for that project

## Related Files

- **Global Config Source**: `/home/frok/Documents/Project/claude-config/` (CLAUDE.md, GOVERNANCE.md, AGENTS.md, etc.)
- **config-sync Skill**: `/home/frok/Documents/Project/claude-config/skills/config-sync/SKILL.md`
- **config-sync Monitor Hook**: `/home/frok/Documents/Project/claude-config/hooks/config-sync-monitor.mjs`

## Example: Propagating a GLOBAL Change

When you make a GLOBAL change to security standards in PatuhIn's CLAUDE.md:

1. Edit the file: `/home/frok/Documents/Project/Idea/patuhin/patuhin/CLAUDE.md`
2. Run: `/config-sync push`
3. config-sync:
   - Detects the change is GLOBAL (contains security keywords)
   - Updates global config: `/home/frok/Documents/Project/claude-config/CLAUDE.md`
   - Propagates to 4 other projects:
     - dazsolution/CLAUDE.md
     - Simedia/admin-frontend/CLAUDE.md
     - Idea/2/CLAUDE.md
     - promo-video/CLAUDE.md
   - Updates "Last Synced" timestamp in this registry
   - Commits changes to each project's git repo (if present)

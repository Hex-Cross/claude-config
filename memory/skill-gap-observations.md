---
name: Skill Gap Observations
description: Detected patterns suggesting missing or improvable skills — accumulated between /evolve audit runs
type: reference
---

## Observations (2026-04-06 audit, updated same day)

### Unused MCP Integrations
- ~~Gmail MCP~~ RESOLVED: removed from permissions (user doesn't use Gmail)
- **Canva MCP** — permitted, only `marketing-visual-designer` agent references it. No skill wires it in.
- ~~Atlassian MCP~~ RESOLVED: `/atlassian-sync` skill created
- ~~Exa MCP~~ RESOLVED: research skills now explicitly invoke it
- ~~Firecrawl MCP~~ RESOLVED: research skills now explicitly invoke it

### Missing Workflow Skills
- ~~Dependency audit~~ RESOLVED: `/dep-audit` skill created
- ~~Changelog generation~~ RESOLVED: `/changelog` skill created
- ~~Release management~~ RESOLVED: `/release` skill created
- **Database migration** — relevant for PatuhIn (Drizzle) + Niaga (Neon), no skill exists

### Skill Auto-Trigger Gap
- ~~Too narrow~~ RESOLVED: expanded from 5 to 14 intent categories

### Version Tracking
- 60/108 skills (all GSD) lack version frontmatter — makes evolution tracking harder

### New Gaps Identified (research phase)
- **WhatsApp integration** — P0, Indonesian SMEs live on WhatsApp, no skill for Business API flows
- **Halal compliance tracking** — P0, PatuhIn's core value prop, BPJPH/SIHALAL integration
- **Indonesian tax (Coretax)** — P0, Niaga needs PPh/PPN/e-Faktur compliance
- **Sentry/error tracking** — P1, no observability skill, Sentry has hosted MCP server
- **i18n/localization** — P1, bilingual Bahasa/English required for both products
- **API docs generation** — P1, OpenAPI spec from route handlers
- **Database migration mgmt** — P1, safety checks for schema changes on compliance data
- **Xendit payments** — P1, THE payment gateway for Indonesian SMEs

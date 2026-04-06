---
name: bootstrap-project
description: "Auto-detect project type and distribute agents, skills, memory, MCP, and knowledge base configs. Usage: /bootstrap-project [path]"
user-invocable: true
version: 1.0.0
---

# Bootstrap Project: $ARGUMENTS

Detect the project type at the given path (or current working directory), then generate and distribute all seven configuration layers: CLAUDE.md, AGENTS.md, .mcp.json, memory files, knowledge base, GOVERNANCE.md, and collaboration scaffolding (.feedback/, .decisions/). Smart-subset only what's relevant for this project type.

## Mode Detection

- If `$ARGUMENTS` contains **"audit"**: scan existing configs and report gaps (don't write)
- If `$ARGUMENTS` contains **"refresh"**: re-detect project type and update existing configs (preserve custom additions)
- If `$ARGUMENTS` contains **"clean"**: remove all bootstrapped configs from the project
- Otherwise: **full bootstrap** (detect → generate → write)

---

## Phase 1: Project Detection (model: "sonnet")

Launch 1 agent to scan the project and classify it.

### Agent 1: Project Scanner

Read the project root and identify:

1. **Framework**: Check for these markers:
   - `next.config.*` or `"next"` in package.json → **nextjs**
   - `artisan` or `composer.json` with `"laravel/framework"` → **laravel**
   - `"react"` in package.json (no next) → **react-spa**
   - `"vue"` in package.json → **vue**
   - `"express"` or `"fastify"` in package.json → **node-api**
   - `pyproject.toml` or `requirements.txt` with `django` → **django**
   - `pyproject.toml` or `requirements.txt` with `fastapi` → **fastapi**
   - `Cargo.toml` → **rust**
   - `go.mod` → **golang**
   - None matched → **generic**

2. **Tech Stack**: Identify from package.json/composer.json/requirements.txt:
   - Database (supabase, prisma, drizzle, eloquent, sqlalchemy)
   - Auth (supabase-auth, clerk, next-auth, sanctum)
   - UI framework (tailwind, shadcn, bootstrap, material)
   - API style (trpc, graphql, rest, grpc)
   - Payment (stripe, midtrans, paddle)
   - Comms (resend, sendgrid, twilio, wati)

3. **Project Metadata**: Read existing CLAUDE.md, AGENTS.md, README.md, BUSINESS-STRATEGY.md, or any .md files at root for context about what the project does.

4. **Current State**: List what's already built (directories with files) vs empty/stub directories.

**Output**: Structured detection report:
```
framework: nextjs
stack: [supabase, drizzle, trpc, tailwind, shadcn, midtrans, wati, resend]
domain: compliance-saas
has_auth: true
has_api: true
has_ui: true
has_payments: true
has_ai: false
built: [auth, dashboard, products, certifications, documents, regulations, alerts, settings, landing, pricing]
not_built: [real-auth, ai-features, marketplace, integrations]
existing_configs: { claude_md: minimal, agents_md: minimal, mcp_json: none, memory: none, knowledge: none }
```

---

## Phase 2: Config Generation (model: "opus")

Based on the detection report, generate all five configuration layers. Launch 3 agents IN PARALLEL:

### Agent 1: CLAUDE.md + AGENTS.md Generator

Generate project-specific CLAUDE.md that includes:

**CLAUDE.md structure:**
```markdown
# [Project Name] — Claude Configuration

## Project Context
[One paragraph: what this project is, who it's for, key deadline if any]

## Tech Stack Rules
- Framework: [version-specific rules, e.g. "Next.js 16 — use app router only, no pages/"]
- Database: [ORM rules, migration conventions]
- API: [pattern rules, e.g. "All new endpoints go through tRPC routers"]
- UI: [component conventions, e.g. "Use shadcn/ui, no custom components for standard patterns"]
- Auth: [auth flow rules]
- Styling: [Tailwind conventions]

## Architecture Rules
- [Directory structure conventions]
- [Naming conventions]
- [Import ordering]
- [Error handling patterns]

## What's Built vs Not Built
[Current state so agents don't rebuild existing things]

## Model Routing
[Import from global: Sonnet for explore, Opus for implement]

## Security Standards
[Import from global: OWASP Top 10, parameterized queries, etc.]

## Workflow
[Reference global skill chains: brainstorming → planning → implement → verify]

@AGENTS.md
```

**AGENTS.md structure:**
```markdown
# Agent Assignments

## Domain Agents
[Subset of agents from claude-config-1 relevant to this project type]

### Development
- dev-architect: [when to use]
- dev-fullstack-engineer: [when to use]
- dev-database-engineer: [when to use — only if project has DB]

### Testing
- test-strategist: [when to use]
- test-e2e-engineer: [when to use — only if project has UI]
- test-api-tester: [when to use — only if project has API]
- test-security-scanner: [always]

### Business (if project has BUSINESS-STRATEGY.md)
- sales-proposal-generator: [when to use]
- marketing-content-strategist: [when to use]
- marketing-visual-designer: [when to use — Canva integration]
- exec-strategist: [when to use]

### GSD Workflow
[Always include core GSD agents: executor, planner, verifier, debugger]

## Agent Selection Rules
- Feature work → dev-fullstack-engineer + test-strategist
- Bug fix → gsd-debugger + dev-fullstack-engineer
- Architecture → dev-architect + review-arch skill
- Security concern → test-security-scanner + security-scan skill
- Pre-launch → test-e2e-engineer + test-performance-engineer + pre-flight skill
- Content/marketing → marketing-content-strategist + marketing-visual-designer
```

### Agent 2: MCP + Knowledge Base Generator

**Generate .mcp.json** — subset from global configs:

Always include:
- `context7` (documentation lookup — universal)
- `sequential-thinking` (complex reasoning — universal)
- `github` (if .git directory exists)

Include conditionally:
- `playwright` (if project has UI / e2e tests)
- `exa` (if project does research / content)
- `firecrawl` (if project does web scraping / research)
- `atlassian` (if project uses Jira/Confluence)
- `canva` (if project has marketing/content needs or BUSINESS-STRATEGY.md)
- `figma` (if project has UI components or design assets)

**Document installed plugin skills** — Add a "Plugin Skills Available" section to the generated CLAUDE.md listing which plugin skills are relevant:

For ALL projects:
- `engineering:code-review`, `engineering:debug`, `engineering:deploy-checklist`, `engineering:documentation`
- `enterprise-search:search` (cross-tool context lookup)
- `productivity:task-management`, `productivity:memory-management`

For projects with UI (has_ui: true):
- `design:accessibility-review`, `design:design-critique`, `design:ux-copy`, `design:design-handoff`

For projects with database (has DB):
- `data:write-query`, `data:explore-data`, `data:build-dashboard`, `data:create-viz`

For projects with architecture complexity (medium+):
- `engineering:system-design`, `engineering:architecture`, `engineering:testing-strategy`, `engineering:tech-debt`

For projects with compliance/finance domain:
- `operations:compliance-tracking`, `operations:risk-assessment`
- `finance:financial-statements`, `finance:reconciliation`, `finance:variance-analysis`, `finance:sox-testing`, `finance:audit-support`

For projects with product management needs:
- `product-management:write-spec`, `product-management:sprint-planning`, `product-management:roadmap-update`
- `product-management:competitive-brief`, `product-management:metrics-review`

For projects with operational complexity:
- `operations:runbook`, `operations:status-report`, `operations:capacity-plan`, `operations:change-request`

**Generate knowledge base** — create `knowledge/` directory:

For each project type, generate relevant knowledge files:
- `knowledge/architecture.md` — current architecture decisions and patterns
- `knowledge/conventions.md` — coding standards specific to this stack
- `knowledge/domain.md` — domain-specific knowledge (e.g., Indonesian compliance regulations for PatuhIn)
- `knowledge/api-reference.md` — API endpoint documentation (auto-generated from router files)
- `knowledge/database-schema.md` — Current schema documentation (auto-generated from schema files)

### Agent 3: Memory + Governance Generator

**Generate memory files** in project-local `.memory/` directory:

1. `project-overview.md` — What the project is, tech stack, current state
2. `project-business.md` — Business context (if BUSINESS-STRATEGY.md exists)
3. `project-roadmap.md` — What's built, what's next, key milestones
4. `project-conventions.md` — Coding style, naming, patterns discovered in codebase
5. `project-decisions.md` — Key architectural decisions (extracted from code patterns)

**Also update global memory** in claude-config:
- Create/update `memory/-{encoded-path}__project_overview.md` with current state

Memory format:
```markdown
---
name: [Project Name] Overview
description: Auto-generated project context for [project-name]
type: project
bootstrapped: [ISO date]
last_refreshed: [ISO date]
---

[Content]
```

**Generate governance scaffolding:**

1. **Copy GOVERNANCE.md** from `claude-config/GOVERNANCE.md` to project root
   - Customize the Audit Matrix section based on detected project type
   - If project has no marketing/sales (e.g., pure library), remove those rows
   - If project has no UI, remove accessibility/visual audit rows

2. **Create `.feedback/` directory** with:
   - `feedback-index.md` — Empty index with format template
   - This directory will accumulate cross-audit results and inter-agent feedback

3. **Create `.decisions/` directory** with:
   - `decisions-index.md` — Empty index with format template
   - Pre-populate with any decisions already visible in the codebase (e.g., if the project chose tRPC over REST, document that decision now so agents don't re-debate it)

4. **Add debate patterns to AGENTS.md** — For each domain pair present in the project, define:
   - What conflicts are likely (e.g., dev vs exec on scope, security vs speed on launch)
   - How to resolve (reference GOVERNANCE.md authority hierarchy)
   - Where to log outcomes (`.decisions/`)

---

## Phase 3: Write & Verify (model: "opus")

1. **Write all generated files** to the project directory:
   - `CLAUDE.md` (overwrite if minimal/placeholder, merge if has custom content)
   - `AGENTS.md` (overwrite if minimal/placeholder, merge if has custom content)
   - `.mcp.json` (create or merge)
   - `.memory/` directory with memory files
   - `knowledge/` directory with knowledge base files
   - `GOVERNANCE.md` (copy from global + project-specific customizations)
   - `.feedback/` directory with index
   - `.decisions/` directory with index + pre-populated decisions
   - Update global memory in claude-config

2. **Verify** — Read back each file and confirm:
   - CLAUDE.md references @AGENTS.md and @GOVERNANCE.md
   - AGENTS.md lists agents relevant to detected project type AND includes debate patterns
   - .mcp.json has valid JSON and correct server configs
   - Memory files have valid frontmatter
   - Knowledge files have accurate content from codebase
   - GOVERNANCE.md audit matrix matches the agents assigned in AGENTS.md
   - .feedback/ and .decisions/ directories exist with valid index files

3. **Report** — Present summary:
   ```
   ## Bootstrap Complete: [Project Name]

   **Detected**: [framework] + [stack items]
   **Domain**: [domain]

   ### Files Created/Updated:
   - ✅ CLAUDE.md — [X lines, Y sections]
   - ✅ AGENTS.md — [N agents assigned, M debate patterns defined]
   - ✅ .mcp.json — [N servers configured]
   - ✅ .memory/ — [N memory files]
   - ✅ knowledge/ — [N knowledge files]
   - ✅ GOVERNANCE.md — [Authority hierarchy + audit matrix customized]
   - ✅ .feedback/ — [Index created, ready for cross-audit results]
   - ✅ .decisions/ — [Index created + N pre-populated decisions]
   - ✅ Global memory updated

   ### Agent Distribution:
   - Development: [list]
   - Testing: [list]
   - Business: [list]
   - GSD: [list]

   ### Collaboration Wiring:
   - Cross-audit pairs: [N pairs defined in audit matrix]
   - Debate triggers: [N conflict types with resolution protocols]
   - Feedback loops: [N producer→consumer feedback paths]
   - Pre-populated decisions: [N existing decisions documented]

   ### MCP Servers:
   - [list with reason for inclusion]

   ### Plugin Skills Assigned:
   - Engineering: [list of engineering:* skills assigned]
   - Design: [list of design:* skills if UI project]
   - Data: [list of data:* skills if DB project]
   - Operations: [list of operations:* skills assigned]
   - Finance: [list of finance:* skills if compliance/finance project]
   - Product: [list of product-management:* skills assigned]
   - Search: [enterprise-search skills]
   - Productivity: [productivity:* skills]

   ### Suggested Next Steps:
   1. Run `/cross-audit full` for baseline quality assessment
   2. Run `/security-scan` for baseline security audit
   3. Run `/ecosystem-health` to verify governance wiring
   4. Run `engineering:tech-debt` for initial tech debt inventory
   5. [Project-specific suggestion]
   ```

---

## Phase 4: Post-Bootstrap Suggestions

Based on detected gaps, suggest:
- Missing dependencies that should be installed
- Skills to run immediately (e.g., `/security-scan` if auth is present)
- Knowledge base entries that need manual input (e.g., regulatory data)
- Memory entries that should be manually reviewed
- Governance customizations needed (e.g., add domain-specific audit pairs)
- Debate patterns to define proactively (known trade-offs in this project type)

---

## Principles

- **Smart subset only** — never dump all 56 agents into a React SPA. Match agents to project capabilities.
- **Preserve custom content** — if CLAUDE.md or AGENTS.md has real content beyond placeholders, MERGE don't overwrite. Use `<!-- BEGIN:bootstrap -->` / `<!-- END:bootstrap -->` markers for managed sections.
- **Idempotent** — running bootstrap twice produces the same result. Use markers to identify managed content.
- **Project-local first** — configs go IN the project directory, with a sync back to global memory.
- **Accurate detection** — read actual files, don't guess. If package.json says Next.js 16, the rules should be for Next.js 16 specifically.
- **Knowledge is generated, not copied** — knowledge base files are synthesized from the actual codebase, not generic templates.
- **Governance is inherited, then customized** — copy GOVERNANCE.md from global config, then tailor the audit matrix and debate patterns to match the specific agents assigned to this project.
- **Decisions are pre-populated** — don't start with an empty decision log. Extract existing architectural decisions from the codebase so agents don't waste time re-debating settled questions.
- **Collaboration scaffolding is mandatory** — .feedback/ and .decisions/ directories are created for every project, even if empty. The infrastructure must exist before agents need it.

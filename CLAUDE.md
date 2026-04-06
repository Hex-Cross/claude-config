# Global Multi-Agent Workflow — Tiered Model Routing

## Model Routing Policy (MANDATORY)

| Task type | Model | Examples |
|---|---|---|
| Explore / codebase reading | **Sonnet** | File reading, directory listing, git log, import tracing |
| Research / web browsing | **Sonnet** | Web search, doc fetching, API browsing, prior art |
| Planning / architecture | **Opus** | Task decomposition, adversarial review, design decisions |
| Implementation / coding | **Opus** | Writing or modifying any code or config |
| Security / red team | **Opus** | OWASP scanning, auth review, fuzzing |
| Testing / verification | **Opus** | Writing tests, coverage analysis, judging quality |
| Bug fixing / debugging | **Opus** | Root cause analysis, fix implementation |
| Code review | **Opus** | Final quality gate |

**One rule**: Sonnet for agents that only read and report. Opus for agents that decide, write, or judge.

When spawning Agent tool calls, always pass `model: "sonnet"` or `model: "opus"` per this table.

## Workflow Phases

For ALL tasks sized **Small** or above, follow this workflow:

### Phase 1: Deep Exploration (Up to 5 Parallel Agents — scale to task size)
- **Patterns**: Existing conventions, utilities, reusable components
- **Dependencies**: Import chain, all affected areas
- **Tests & Docs**: Coverage gaps, related docs/configs
- **Edge Cases**: Error paths, race conditions, boundary inputs, null states
- **Prior Art**: Git history, past PRs, similar implementations

### Phase 2: Adversarial Planning (3 Parallel Agents)
- **Simplicity**: Minimum moving parts, correct solution
- **Robustness**: Every edge case, failure mode, security concern
- **Devil's Advocate**: Critique both, find flaws and traps

Synthesize best elements. Present tradeoffs to user on disagreements.

### Phase 3: Implement
- Opus agents, parallel for independent files, sequential for cross-file deps
- Worktree isolation for 3+ files or risky areas
- Every agent runs linter/type-checker on its own output

### Phase 4: Verification (4 Parallel Agents)
- **Static Analysis**: Lint, type-check, build. Zero warnings.
- **Test Suite**: Full suite, not just related tests.
- **Security Audit**: OWASP Top 10, injection, auth bypass, data exposure
- **Edge Case Testing**: Tests for null, empty, max, concurrent, timeout

### Phase 5: Red Team (2 Parallel Agents)
- **Input Fuzzing**: Malformed, oversized, malicious inputs (SQLi, XSS, path traversal)
- **Logic Attack**: Race conditions, deadlocks, infinite loops, memory leaks, auth bypass

If vulnerabilities found → fix and re-run Phase 4.

### Phase 6: Final Review
- `/superpowers-code-review` as final gate
- Verify requirements match — no scope creep
- Backwards compatibility unless breaking changes requested

## Task Sizing

| Size | Criteria | Workflow |
|------|----------|----------|
| **Trivial** | Typo, 1-3 lines | Fix directly, still lint + type-check |
| **Small** | Single file, <50 lines | Explore (3) → Plan (1) → Implement → Verify |
| **Medium** | Multi-file | Full 6-phase + skill chain |
| **Large** | Cross-cutting, major refactor | Full 6-phase + worktree + user approval gate |

## Skill Chain — FULLY AUTOMATED

The `skill-auto-trigger.mjs` hook detects intent and task size from the user's prompt and injects the correct chain. **Execute the injected chain automatically without pausing for permission between steps.**

### When to pause (ONLY these cases):
- User explicitly asks a question
- Ambiguous requirements that could go multiple ways
- Need credentials or env vars the user must provide
- Need user to install something (CLI tool, dependency)
- Large task: pause after brainstorming (step 1) for design approval

### When NOT to pause:
- Between any two skills in the chain
- After verification finds issues (auto-fix and re-run)
- After red-team finds vulnerabilities (auto-fix and re-verify)
- To ask "should I continue?" or "shall I proceed?" — NEVER ask this

### Chain by task size:

**Trivial** (typo, 1-3 lines): Fix → lint + type-check
**Small** (single file, <50 lines): `/superpowers-writing-plans` → Implement → `/superpowers-code-review` → `/pre-flight`
**Medium** (multi-file): `/superpowers-brainstorming` → `/superpowers-writing-plans` → `/implement` → `/red-team` (only if security surface exists) → `/accessibility-audit` (if UI) → `/superpowers-code-review` → `/pre-flight`
**Large** (cross-cutting): Same as Medium + `/architect` first + worktree isolation + user approval after brainstorming

Note: `/pre-flight` is the FINAL gate and includes all verification checks (lint, types, build, tests, security, deps). There is no separate `/full-verification` step — `/pre-flight` is a superset.

### Auto-fix loop:
If any gate FAILS → fix the issue → re-run ONLY that gate → continue chain. Up to 5 retries per gate.
If still failing after 5 retries → stop and report to user.

### Contextual skills (auto-added when relevant):
- `/security-scan` — auto-added when touching auth, payments, or user data
- `/dead-code-sweep` — auto-added after refactors
- `/accessibility-audit` — auto-added when ANY .tsx/.jsx/.css/.html file is modified
- `/gsd:debug` — auto-invoked when any gate fails repeatedly

## Security — Zero Tolerance

- OWASP Top 10 scan on all changed code
- No hardcoded secrets, tokens, API keys anywhere
- Validate/sanitize all user inputs at system boundaries
- Parameterized queries only — no string concatenation for DB
- Output encoding for user-controlled data in HTML/DOM
- CSRF protection on state-changing endpoints
- Auth checks on every protected route; no broken access control
- Secure session management: secure cookies, proper expiry
- PII encrypted at rest and in transit
- Never log passwords, tokens, PII, or full request bodies
- File uploads: validate type, size, scan for malware

## Code Quality

- Every external call (API, DB, I/O) has explicit error handling
- Typed errors — no generic catch-all without re-throw
- Never swallow errors silently
- Strict TypeScript (`strict: true`), no `any` unless documented why
- Check for N+1 queries, unnecessary re-renders, unbounded results
- Prefer existing deps; new ones need justification (size, security, alternatives)
- Pin exact versions
- Structured logging at appropriate levels; include correlation IDs
- WCAG 2.1 AA minimum for UI work

## Universal Workflow Rules

1. **Execute & Auto-Test**: Write code → run tests/build → fix autonomously (up to 5 retries)
2. **Self-Verify**: Re-read diff for debug code, console.logs, TODOs, hardcoded values, type issues
3. **THE HARD STOP**: Do NOT commit or push unless a skill explicitly requires it (e.g., GSD workflows). For non-GSD work, summarize changes — user handles git manually.

### Git Safety
- NEVER `git commit` or `git push` without explicit user approval (denied in settings)
- GSD workflows override this — their commit/PR rules take precedence

## Installed Quality Tools

| Tool | Command |
|------|---------|
| ESLint | `eslint` |
| Prettier | `prettier --check` / `prettier --write` |
| Biome | `biome check` |
| OxLint | `oxlint` |
| Semgrep | `semgrep --config=auto` |
| ShellCheck | `shellcheck` |
| TypeScript | `tsc --noEmit` |
| Trivy | `trivy fs .` |
| OSV-Scanner | `osv-scanner scan --recursive .` |
| Knip | `npx knip` |
| Madge | `madge --circular` |

## Agent Collaboration — Debate, Audit, Govern

All agents operate under the **GOVERNANCE.md** framework. Key rules:

### Mandatory Cross-Audit
- Every agent output gets challenged by an agent from a DIFFERENT domain (see Audit Matrix in GOVERNANCE.md)
- For Medium+ tasks, `/cross-audit` runs automatically after `/implement`
- CRITICAL/HIGH challenges block delivery until resolved

### Structured Debate
- Architecture forks, priority conflicts, and risk disagreements trigger mandatory debate
- Debates are time-boxed: 2 rounds max for feature-level, 3 rounds max for architecture-level
- Resolution follows authority hierarchy: security > quality > business > speed
- Every resolution logged in `.decisions/`

### Feedback Loops
- Downstream agents provide structured feedback to upstream agents after each task
- Feedback stored in `.feedback/` and indexed for quick loading
- Agents MUST read `feedback-index.md` at task start to incorporate past learnings
- `/ecosystem-health` periodically audits whether feedback is actually improving quality

### Governance Files (auto-created by /bootstrap-project)
- `GOVERNANCE.md` — Authority hierarchy, debate protocol, escalation paths
- `.feedback/` — Cross-audit results and inter-agent feedback
- `.decisions/` — Decision log with rationale and revisit triggers
- `.memory/` — Project context that persists across sessions

### Updated Skill Chain (Medium+ tasks):
```
/superpowers-brainstorming → /superpowers-writing-plans → /implement → /cross-audit → /red-team (if security) → /superpowers-code-review → /pre-flight
```

Note: `/cross-audit` is inserted after `/implement` to catch alignment and accuracy issues BEFORE security review and final gates.

## Automatic Configuration Management — ZERO Manual Input

Everything runs automatically. The user never types config commands.

### Auto-Bootstrap (SessionStart hook)
When opening ANY project folder, `bootstrap-detect.mjs` fires automatically:
- Scans for 8 config layers (CLAUDE.md, AGENTS.md, GOVERNANCE.md, .mcp.json, .memory/, knowledge/, .feedback/, .decisions/)
- If ANY are missing: auto-executes `/bootstrap-project` — no user prompt needed
- Detects framework, generates smart-subset configs, registers in global project registry
- User sees: "[Bootstrap complete: Next.js project configured with 19 agents, 7 MCP servers]"

### Auto-Sync (PostToolUse hook)
When editing ANY config file in ANY project, `config-sync-monitor.mjs` fires automatically:
- Classifies changes as GLOBAL (security, governance, workflow) or LOCAL (tech stack, project memory)
- For GLOBAL changes: auto-executes `/config-sync push` to propagate to ALL registered projects
- Preserves project-specific content inside `<!-- BEGIN:bootstrap -->` markers
- User sees: "[Synced: Security standards update → 4 projects updated]"
- For LOCAL changes: stays completely silent

### Auto-Chain (UserPromptSubmit hook)
When the user describes a task, `skill-auto-trigger.mjs` fires automatically:
- Detects intent (feature, bugfix, refactor, audit) and task size (trivial, small, medium, large)
- Injects the complete skill chain INCLUDING `/cross-audit` for medium+ tasks
- Executes the entire chain without pausing between steps
- User just describes what they want — the full pipeline runs automatically

### Global Project Registry
All bootstrapped projects are tracked in `claude-config/memory/global-project-registry.md`.
- `/bootstrap-project` adds new projects automatically
- `/config-sync push` reads the registry to know where to propagate
- Currently registered: PatuhIn, dazsolution, Simedia, Niaga, promo-video

## Installed Plugin Skills — Auto-Available Across All Projects

These plugins extend the agent arsenal. They are auto-distributed to all projects via `/bootstrap-project` and `/config-sync`.

### Engineering Plugin (8 skills)
| Skill | When auto-triggered | Model |
|-------|-------------------|-------|
| `engineering:code-review` | Replaces/augments `/superpowers-code-review` in chains | Opus |
| `engineering:system-design` | Large features with architecture decisions | Opus |
| `engineering:architecture` | ADR creation, large refactors, technology choices | Opus |
| `engineering:testing-strategy` | Medium+ features, before implementation | Opus |
| `engineering:debug` | Bugfix chains, replaces/augments `/gsd:debug` | Opus |
| `engineering:tech-debt` | Refactor chains, tech debt audits | Opus |
| `engineering:deploy-checklist` | Before any deployment or merge | Opus |
| `engineering:documentation` | After large features/refactors complete | Sonnet |

### Operations Plugin (6 skills)
| Skill | Use case | Model |
|-------|----------|-------|
| `operations:compliance-tracking` | PatuhIn/Niaga compliance workflows | Opus |
| `operations:risk-assessment` | Large features, architecture decisions | Opus |
| `operations:runbook` | Post-deployment documentation | Sonnet |
| `operations:status-report` | Project health summaries | Sonnet |
| `operations:capacity-plan` | Sprint planning, resource allocation | Opus |
| `operations:change-request` | System/process changes needing approval | Opus |

### Finance Plugin (8 skills)
| Skill | Primary project | Model |
|-------|----------------|-------|
| `finance:financial-statements` | Niaga | Opus |
| `finance:variance-analysis` | Niaga | Opus |
| `finance:reconciliation` | Niaga | Opus |
| `finance:sox-testing` | PatuhIn compliance | Opus |
| `finance:audit-support` | PatuhIn compliance | Opus |
| `finance:journal-entry` | Niaga | Opus |
| `finance:journal-entry-prep` | Niaga | Opus |
| `finance:close-management` | Niaga | Opus |

### Product Management Plugin (9 skills)
| Skill | When used | Model |
|-------|-----------|-------|
| `product-management:write-spec` | Before large features | Opus |
| `product-management:sprint-planning` | Sprint kickoff | Opus |
| `product-management:roadmap-update` | Priority changes | Opus |
| `product-management:competitive-brief` | Strategy reviews | Sonnet |
| `product-management:metrics-review` | Performance analysis | Sonnet |
| `product-management:stakeholder-update` | Status reports | Sonnet |
| `product-management:synthesize-research` | User feedback analysis | Opus |
| `product-management:product-brainstorming` | Idea exploration | Opus |
| `/brainstorm` (command) | Quick ideation | Opus |

### Data Plugin (7 skills)
| Skill | Use case | Model |
|-------|----------|-------|
| `data:write-query` | SQL across all dialects | Opus |
| `data:build-dashboard` | Interactive HTML dashboards | Opus |
| `data:create-viz` | Publication-quality charts | Opus |
| `data:explore-data` | Dataset profiling and QA | Sonnet |
| `data:statistical-analysis` | Trend analysis, hypothesis testing | Opus |
| `data:validate-data` | Pre-share analysis QA | Opus |
| `data:data-context-extractor` | Company-specific data skill creation | Opus |

### Design Plugin (7 skills)
| Skill | Primary projects | Model |
|-------|-----------------|-------|
| `design:accessibility-review` | Simedia, PatuhIn | Opus |
| `design:design-critique` | All frontend projects | Opus |
| `design:design-system` | Simedia admin | Opus |
| `design:ux-copy` | PatuhIn, Niaga | Sonnet |
| `design:design-handoff` | All with Figma integration | Sonnet |
| `design:user-research` | Product discovery | Opus |
| `design:research-synthesis` | Feedback analysis | Opus |

### Enterprise Search Plugin (5 skills)
| Skill | Use case | Model |
|-------|----------|-------|
| `enterprise-search:search` | Cross-source unified search | Sonnet |
| `enterprise-search:digest` | Daily/weekly activity digest | Sonnet |
| `enterprise-search:source-management` | MCP source configuration | Sonnet |
| `enterprise-search:search-strategy` | Complex multi-source queries | Opus |
| `enterprise-search:knowledge-synthesis` | Cross-source answer generation | Opus |

### Productivity Plugin (4 skills)
| Skill | Use case | Model |
|-------|----------|-------|
| `productivity:task-management` | TASKS.md tracking | Sonnet |
| `productivity:memory-management` | Two-tier memory system | Sonnet |
| `productivity:update` | Sync tasks from trackers | Sonnet |
| `productivity:start` | Initialize productivity dashboard | Sonnet |

### MCP Connectors
| Connector | Status | Projects |
|-----------|--------|----------|
| Canva | Connected | promo-video, all design |
| Atlassian (Jira/Confluence) | Connected | All projects |
| Gmail | Connected | Notifications, stakeholder comms |
| Figma | Available — connect for design-to-code | Simedia, PatuhIn, Niaga |
| Context7 | Connected | All — real-time docs |
| Exa | Connected | Research, competitive analysis |
| Firecrawl | Connected | Web scraping, data collection |

### Plugin Integration with Skill Chains
Plugins auto-enhance existing chains:
- `engineering:code-review` runs alongside `/superpowers-code-review` for double-layer review
- `engineering:testing-strategy` injects before `/implement` on medium+ features
- `design:accessibility-review` replaces raw `/accessibility-audit` with WCAG 2.1 AA framework
- `operations:compliance-tracking` auto-triggers on PatuhIn/Niaga when touching compliance-related files
- `data:write-query` auto-suggests when SQL files or migration files are modified
- `enterprise-search:search` available for any agent needing cross-tool context lookup

### Contextual Skills (available but not auto-chained)
These skills are available on-demand or when agents detect they're needed:
- `finance:*` — invoked by agents working on Niaga/PatuhIn financial features
- `design:design-critique`, `design:design-system`, `design:user-research`, `design:research-synthesis` — invoked during UI/UX focused work
- `data:statistical-analysis`, `data:data-context-extractor` — invoked during data analysis tasks
- `product-management:product-brainstorming`, `product-management:synthesize-research`, `product-management:competitive-brief` — invoked during product strategy work
- `enterprise-search:digest`, `enterprise-search:knowledge-synthesis` — invoked for cross-tool research
- `productivity:start`, `productivity:update` — invoked at session start for task context

## GSD Configuration

Tiered routing — researcher/mapper agents on Sonnet, planner/executor/debugger on Opus. Configured in `~/.gsd/defaults.json`.

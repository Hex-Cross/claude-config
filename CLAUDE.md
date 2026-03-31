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

### Phase 1: Deep Exploration (5 Parallel Agents)
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
**Small** (single file, <50 lines): Plan → Implement → `/full-verification` → `/superpowers-code-review` → `/pre-flight`
**Medium** (multi-file): `/superpowers-brainstorming` → `/superpowers-writing-plans` → `/implement` → `/full-verification` → `/red-team` → `/accessibility-audit` (if UI) → `/superpowers-code-review` → `/pre-flight`
**Large** (cross-cutting): Same as Medium + `/architect` first + worktree isolation + user approval after brainstorming

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
3. **THE HARD STOP**: Do NOT commit or push. Summarize changes. User handles git manually.

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

## GSD Configuration

Tiered routing — researcher/mapper agents on Sonnet, planner/executor/debugger on Opus. Configured in `~/.gsd/defaults.json`.

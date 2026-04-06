# Generic Project Bootstrap Template

Used when no specific framework is detected, or for multi-language/custom projects.

## Framework-Agnostic CLAUDE.md Rules

```markdown
## Tech Stack Rules

### Language: [DETECTED]
- Follow language-standard conventions and idioms
- Use the project's existing patterns as the source of truth
- Prefer established libraries over custom implementations

### Code Quality
- Consistent formatting (auto-format on save if configured)
- Clear error handling with descriptive messages
- No dead code — remove unused imports, functions, variables
- Comments explain WHY, not WHAT
- Functions do one thing and are named accordingly

### Architecture
- Follow the existing directory structure conventions
- New features follow the same patterns as existing features
- Separation of concerns: data access, business logic, presentation
- Configuration via environment variables, not hardcoded values

### Security
- OWASP Top 10 awareness
- No hardcoded secrets or credentials
- Input validation at all boundaries
- Parameterized queries for database access
- HTTPS everywhere in production

### Testing
- Tests live alongside or mirror the source directory structure
- New features include tests
- Bug fixes include regression tests
- Test names describe the expected behavior
```

## Agent Subset (Minimal)

### Always Include
- dev-architect
- dev-fullstack-engineer
- test-strategist
- test-security-scanner
- gsd-executor, gsd-planner, gsd-verifier, gsd-debugger

### Include Based on Detection
- dev-database-engineer (if DB detected)
- dev-devops-engineer (if Dockerfile/CI config exists)
- test-e2e-engineer (if UI detected)
- test-api-tester (if API detected)
- test-performance-engineer (if performance-critical)
- marketing-* (if BUSINESS-STRATEGY.md exists)

## MCP Servers (Minimal)

### Always
- context7
- sequential-thinking

### Conditional
- github (if .git exists)
- playwright (if UI exists)
- canva (if business/marketing context)

## Knowledge Base

For generic projects, generate only what can be accurately detected:
- `architecture.md` — directory structure + entry points
- `conventions.md` — patterns found in existing code
- `domain.md` — only if domain-specific docs exist in the repo

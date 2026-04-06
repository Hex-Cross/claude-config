---
name: dead-code-sweep
description: Find and remove unused code, dependencies, exports, and circular dependencies using parallel analysis agents. Uses knip, madge, and static analysis.
version: 1.1.0
---

# Dead Code Sweep

Dead code increases maintenance burden, confuses developers, and can hide security vulnerabilities.

## Phase 1: Parallel Analysis (3 agents IN PARALLEL — model: "sonnet")

These 3 tools are independent — run them simultaneously:

### Agent 1: Dependency & Export Analysis (knip)
```bash
npx knip 2>/dev/null || knip 2>/dev/null
```
If knip unavailable: `npx depcheck 2>/dev/null`

Extract: unused dependencies (safe to remove), unused devDependencies (check CI/scripts first), missing dependencies (add these), unused exports (remove `export` or delete if internal), unused files (check git blame, dynamic imports, config refs before deleting).

### Agent 2: Circular Dependency Detection (madge)
```bash
npx madge --circular --ts-config tsconfig.json src/ 2>/dev/null || madge --circular src/ 2>/dev/null
```
For each cycle: identify leaf module, extract shared types to separate file, suggest dependency injection or event patterns.

### Agent 3: Bundle Size Analysis
```bash
npx source-map-explorer dist/**/*.js 2>/dev/null
```
If unavailable, check largest dependencies:
```bash
npx knip --include dependencies 2>/dev/null | head -20
```
Identify heaviest deps, check for tree-shaking opportunities, flag deps used for single functions (inline instead).

## Phase 2: Synthesize & Present (sequential)

Combine all 3 agent reports into:

## Dead Code Sweep Report

### Unused Dependencies
| Package | Type | Size Impact | Action |
|---------|------|-------------|--------|

### Circular Dependencies
| Cycle | Files | Fix |
|-------|-------|-----|

### Unused Exports & Files
- X unused exports across Y files
- X orphan files found

### Bundle Size Opportunities
- Heaviest deps and alternatives

### Summary
- Dependencies to remove: X (saved ~YKB)
- Circular deps to fix: X
- Dead exports to remove: X
- Dead files to remove: X

**Present findings to user for approval before deleting anything.**

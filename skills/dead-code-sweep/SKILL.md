---
name: dead-code-sweep
description: Find and remove unused code, unused dependencies, unused exports, and circular dependencies. Uses knip, madge, and static analysis to keep the codebase clean and lean.
---

# Dead Code Sweep

You are executing a comprehensive dead code and dependency hygiene sweep on the project. Dead code increases maintenance burden, confuses developers, and can hide security vulnerabilities.

## Step 1: Unused Dependencies

```bash
# Knip finds unused deps, unused exports, unused files
npx knip 2>/dev/null || knip 2>/dev/null
```

If knip is not available:
```bash
# Fallback: check each dependency in package.json against actual imports
npx depcheck 2>/dev/null
```

Review findings:
- **Unused dependencies**: Safe to remove from package.json
- **Unused devDependencies**: Safe to remove (but check if used in CI/scripts)
- **Missing dependencies**: Used in code but not in package.json — ADD these

## Step 2: Circular Dependencies

```bash
# Detect circular import chains
npx madge --circular --ts-config tsconfig.json src/ 2>/dev/null || madge --circular src/ 2>/dev/null
```

For each cycle found:
1. Identify which module should be the "leaf" (no outgoing deps)
2. Extract shared types/interfaces to a separate file
3. Use dependency injection or event patterns to break the cycle

## Step 3: Unused Exports

```bash
npx knip --include exports 2>/dev/null
```

For each unused export:
- If it's a public API: keep it (document as intentionally exported)
- If it's internal: remove the `export` keyword or delete the function entirely
- If it's a type: check if it's used in `.d.ts` files or external consumers

## Step 4: Unused Files

```bash
npx knip --include files 2>/dev/null
```

For each unused file:
- Check git blame — was it recently added? (might be WIP)
- Check if it's imported dynamically (`import()`, `require()`)
- Check if it's referenced in config files (webpack, jest, etc.)
- If truly unused: delete it

## Step 5: Bundle Size Impact (if applicable)

```bash
# Check what's adding the most size
npx source-map-explorer dist/**/*.js 2>/dev/null
# Or
npx bundlephobia {package_name} 2>/dev/null
```

## Output Format

```
## Dead Code Sweep Report

### Unused Dependencies
| Package | Type | Size Impact | Action |
|---------|------|-------------|--------|
| lodash | dep | 72KB | Remove (only using 1 function, inline it) |

### Circular Dependencies
| Cycle | Files | Fix |
|-------|-------|-----|
| A -> B -> C -> A | 3 files | Extract shared types to types.ts |

### Unused Exports
- X unused exports found across Y files

### Unused Files
- X orphan files found

### Summary
- Dependencies removed: X (saved ~YKB)
- Circular deps fixed: X
- Dead exports removed: X
- Dead files removed: X
```

Present findings to user for approval before deleting anything.

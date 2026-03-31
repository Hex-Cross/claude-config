---
name: self-fix
description: "Validate all skills have correct frontmatter, check for broken references, validate settings consistency, and repair common issues. Usage: /self-fix [check|repair|test <skill-name>]"
user-invocable: true
version: 1.0.0
---

# Skill Ecosystem Self-Fix: $ARGUMENTS

Diagnose and repair the skill ecosystem. Default mode is `check` (read-only).

## Mode Detection

- If $ARGUMENTS is empty or starts with "check": run **Check Mode** (report only, change nothing)
- If $ARGUMENTS starts with "repair": run **Repair Mode** (fix issues with per-issue user approval)
- If $ARGUMENTS starts with "test": run **Test Mode** on the named skill

---

## Check Mode (default)

Launch 4 diagnostic agents IN PARALLEL:

### Agent 1: Frontmatter Validation

For each directory under `~/.claude/skills/`:
- Read the `SKILL.md` file
- Parse YAML frontmatter between `---` delimiters
- Validate:
  - `name` field exists and matches the directory name
  - `description` field exists and is non-empty
  - `user-invocable` is boolean if present
  - `version` is valid semver if present (X.Y.Z)
  - No YAML parse errors
- Flag duplicate `name` values across skills
- Report each issue with severity: CRITICAL (parse error), HIGH (missing name/description), LOW (missing optional fields)

### Agent 2: Reference Integrity

- Read every `SKILL.md` file and extract references to other skills (patterns: `/skill-name`, `invoke.*skill-name`, `run.*skill-name`)
- For each referenced skill, verify the directory and SKILL.md exist
- Read `~/.claude/CLAUDE.md` and extract skill references from the skill chain section
- For each referenced skill in CLAUDE.md, verify it exists
- Report: broken references with source file, line, and missing target

### Agent 3: Settings Consistency

- Read `~/.claude/settings.json` and extract the `permissions.allow` and `permissions.deny` lists
- Read `~/.claude/mcp.json` and extract configured MCP server names
- For each skill, extract tool references (patterns: `WebSearch`, `WebFetch`, `mcp__*`, `Bash`, `Agent`, `TaskCreate`)
- Verify each tool reference is in the allow list or not in the deny list
- Verify each MCP tool reference has a corresponding server in mcp.json
- Report: tools used by skills but not permitted, MCP tools without servers

### Agent 4: Structural Health

- List all directories under `~/.claude/skills/`
- Verify each contains exactly one `SKILL.md`
- Flag empty directories (no SKILL.md)
- Flag unexpected files (anything other than SKILL.md)
- Check file sizes: flag any SKILL.md over 500 lines as "complex, consider splitting"
- Verify all SKILL.md files are readable (not empty, not binary)
- Report: structural issues with paths

## Synthesize Report

Combine all 4 agent outputs into this format:

```
## Self-Fix Diagnostic Report
**Date**: [today]
**Total Skills**: [count]

### Frontmatter Issues
| Skill | Issue | Severity | Auto-fixable |
|-------|-------|----------|--------------|
| ...   | ...   | ...      | YES/NO       |

### Broken References
| Source File | Line | References | Status |
|-------------|------|------------|--------|
| ...         | ...  | ...        | OK/BROKEN |

### Settings Inconsistencies
| Skill | Tool Used | Issue |
|-------|-----------|-------|
| ...   | ...       | Not in allow list / No MCP server |

### Structural Issues
| Path | Issue | Auto-fixable |
|------|-------|--------------|
| ...  | ...   | YES/NO       |

### Summary
- Healthy: [N] / Total: [N]
- Critical: [N] | High: [N] | Low: [N]
- Auto-fixable: [N]
```

---

## Repair Mode (`/self-fix repair`)

1. Run all checks from Check Mode above
2. For each issue marked **auto-fixable**, in order of severity (CRITICAL first):
   - Show the exact change that will be made (before → after)
   - Ask the user: "Apply this fix? (yes/no/yes to all)"
   - If approved:
     - Create backup: `cp` original to `~/.claude/evolve/backups/SKILL-NAME/SKILL.md.[timestamp]`
     - Apply the fix
     - Re-validate the fixed file immediately
     - Report success or failure
3. For non-auto-fixable issues, explain what needs manual attention and suggest specific steps

### Auto-fixable Issues

These can be repaired automatically:
- Missing `user-invocable: true` field → add it
- `name` doesn't match directory → update name to match directory
- Empty `description` → set to "[NEEDS DESCRIPTION]" and flag for user
- Missing frontmatter entirely → generate minimal valid frontmatter from filename

### NOT Auto-fixable (require manual intervention)

- YAML parse errors in complex frontmatter
- Broken references to skills that don't exist (user must decide: create or remove reference)
- Tools used but not permitted (user must update settings.json)
- Missing MCP servers (user must configure mcp.json)

---

## Test Mode (`/self-fix test <skill-name>`)

1. Locate `~/.claude/skills/<skill-name>/SKILL.md`
2. If not found, report error and list available skills
3. Read and parse the file:
   - Validate frontmatter (same checks as Agent 1)
   - Extract all tool references
   - Verify each tool is available and permitted
   - Check for `$ARGUMENTS` handling (does it handle empty args?)
   - Check for references to other skills and verify they exist
   - Check for phase/step structure (is the skill well-organized?)
4. Report:

```
## Skill Test: [skill-name]
**Status**: PASS / FAIL / WARN

### Frontmatter: [OK/ISSUES]
### Tool Dependencies: [all satisfied / N missing]
### Cross-References: [all valid / N broken]
### Structure: [well-organized / concerns]

### Details
[Specific findings]
```

---

## Principles

- **Check mode is always safe** — read-only, never modifies anything
- **Repair mode requires per-issue approval** — no batch modifications without consent
- **Backups before any repair** — always create backup in `~/.claude/evolve/backups/`
- **Re-validate after every fix** — confirm the repair actually worked
- **Never modify CLAUDE.md or settings.json** — those are out of scope for self-fix

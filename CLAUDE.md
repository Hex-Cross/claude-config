# Claude Config Repository

This repo is the source of truth for `~/.claude/` configuration files.
The full workflow rules, model routing policy, and quality standards are defined in the global `~/.claude/CLAUDE.md`.

## Project-Specific Notes

- This is a config-only repo — no application code, no builds, no tests
- Changes here must be synced to `~/.claude/` via `./sync.sh` (use `--dry-run` first)
- `settings.json`, `hooks/`, `skills/`, `agents/`, `commands/`, `get-shit-done/` are the managed artifacts
- Do NOT run quality tools (eslint, tsc, semgrep, etc.) against this repo — they are meant for application projects
- `gsd-file-manifest.json` tracks GSD version and file checksums — do not manually edit

## Deprecated Skills (redirects)

These skills still exist as stubs so `/command` still works, but redirect to their superset:
- `/superpowers-verification` → use `/pre-flight`
- `/plan-feature` → use `/superpowers-brainstorming`
- `/review-arch` → use `/architect`

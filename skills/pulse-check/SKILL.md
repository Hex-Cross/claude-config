---
name: pulse-check
description: "Check what's new in Claude Code, AI tools, skill ecosystem, and MCP server health. Usage: /pulse-check [claude|ai|skills|mcp|all]"
user-invocable: true
version: 1.1.0
---

# Pulse Check: $ARGUMENTS

## Mode: `all` (default) | `claude` | `ai` | `skills` | `mcp`

## Phase 1: Intelligence (up to 4 Sonnet agents — model: "sonnet")

**Agent 1: Claude Code** (if claude/all) — WebSearch for changelog, new hooks/tools/agent types/models, deprecations, breaking changes. Compare installed vs latest version.

**Agent 2: AI Ecosystem** (if ai/all) — WebSearch for Vercel AI SDK, Anthropic API updates, new models, new MCP servers, dependency version changes.

**Agent 3: Skill Health** (if skills/all) — Read all skill frontmatter. Check versions, orphaned skills, stale tool refs, auto-trigger alignment, GSD routing compliance.

**Agent 4: MCP Server Health (NEW)** (if mcp/all) — For each server in mcp.json: `npm view <package> version` to check latest, verify env vars for auth-requiring servers, test HTTP endpoints, report status (OK/OUTDATED/UNREACHABLE/MISSING_AUTH).

## Phase 2: Synthesize (1 Opus agent — model: "opus")

Pulse Check Report: What's New (action items), What's Outdated (fix items), MCP Server Health table (server/package/installed/latest/status), Upgrade Opportunities, Skill Ecosystem Score (up-to-date/routing/coverage/orphans/MCP health), Recommended Next Actions with commands.

## Phase 3: Offer follow-ups
`/token-guard`, `/gold-standard`, `/evolve`, `/self-fix`, `/self-fix hooks` based on findings.

---
name: Vercel Plugin Management
description: Vercel plugin injects ~12K tokens/session — disable for non-Vercel projects to save context budget
type: reference
last_verified: 2026-04-01
---

## Vercel Plugin Token Impact

The Vercel plugin injects a ~47KB knowledge graph (Vercel ecosystem relational map) at SessionStart plus skill injections on keyword matches in prompts. Total overhead: ~12,000+ tokens/session.

**When it's valuable:** Working on PatuhIn (Next.js + Vercel), Niaga (Next.js + Vercel), or any Next.js/Vercel project.

**When it's wasteful:** Working on non-Vercel projects (config repos, mobile apps, backend-only services, non-JS projects).

**How to disable temporarily:**
In `~/.claude/settings.json`, set:
```json
"enabledPlugins": {
  "vercel-plugin@vercel-vercel-plugin": false
}
```

**How to re-enable:**
```json
"enabledPlugins": {
  "vercel-plugin@vercel-vercel-plugin": true
}
```

**Keyword triggers to be aware of:** The plugin's lexical matching fires on words like "next", "react", "vercel", "deploy", "functions", "cache", "sdk", "auth", "turbopack", "shadcn" — even in non-Vercel contexts. This is by design (plugin can't detect project type). The workaround is to disable the plugin for non-Vercel work.

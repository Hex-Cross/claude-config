---
name: sentry-integrate
description: Sentry error tracking setup and triage — SDK init, alert rules, error grouping, fix suggestions
user-invocable: true
version: 1.0.0
---

# Sentry Integrate — Error Tracking

## Sub-command Detection

- Empty or `setup` → **Setup Mode**
- `triage` → **Triage Mode**

## Setup Mode

### Step 1: Detect Framework

Read `package.json`. Support: Next.js, Express, Hono, Remix, plain Node.js.

### Step 2: Install and Configure

For Next.js (most common):
```bash
npx @sentry/wizard@latest -i nextjs
```

This auto-generates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.ts` with Sentry plugin
- `.env.sentry-build-plugin`

Required env vars: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

For other frameworks: generate manual SDK init with `Sentry.init()`.

### Step 3: Generate Error Boundary

Create a React error boundary component:
- Captures render errors
- Reports to Sentry with context
- Shows user-friendly fallback UI
- Includes "Report Feedback" button

### Step 4: Generate Alert Rules

Suggest alert configurations:
- **Error spike**: >10 events in 5 min → Slack/email
- **New issue**: first occurrence of new error → notify
- **Performance**: p95 latency > 2s → warn
- **Unhandled rejection**: any unhandled promise → critical

### Step 5: Add Custom Context

Generate patterns for enriching Sentry events:
- User context (ID, email, plan — never passwords)
- Transaction names for API routes
- Breadcrumbs for key user actions
- Custom tags: environment, region, product (PatuhIn/Niaga)

### Step 6: MCP Server Note

Sentry has a hosted MCP server at `mcp.sentry.dev/mcp` (OAuth, zero install).
Add to `~/.claude/mcp.json` for deeper integration:
- List/search issues directly from Claude
- Get error details and stack traces
- Use Seer AI for root-cause analysis

## Triage Mode

1. Pull recent unresolved issues (via Sentry API or MCP)
2. Group by: error type, frequency, affected users
3. For each top issue: read stack trace, identify root cause, suggest fix
4. Prioritize: crash > data loss > UX bug > warning
5. Generate fix PR descriptions for top 3 issues

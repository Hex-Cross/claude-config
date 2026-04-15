---
name: customer-feedback
description: Analyze customer feedback from Intercom conversations and support tickets — sentiment analysis, trend detection, and actionable product insights
user-invocable: true
version: 1.0.0
---

# Customer Feedback Analysis

Route by sub-command: `analyze | trends | triage`

If no sub-command, default to `analyze`.

---

## `analyze` — Full feedback analysis

1. Authenticate with Intercom MCP: `mcp__claude_ai_Intercom__*`
2. Pull recent conversations and tickets (last 30 days or user-specified range).
3. Spawn a `customer-feedback-analyst` agent (Opus) with the raw data.
4. Agent categorizes each ticket: Bug Report, Feature Request, UX Confusion, Praise, Churn Signal, Onboarding Friction.
5. Agent scores severity: frequency × intensity × revenue impact.
6. Agent produces report in `.teams/research/feedback/`.
7. Submit report to `/supervisor-review` for quality gate.
8. Present top 5 action items to user.

## `trends` — Sentiment trend over time

1. Pull feedback data for last 90 days.
2. Bucket by week.
3. Calculate: positive/neutral/negative percentages per week.
4. Identify: improving categories, worsening categories, new categories.
5. Present trend chart (text-based) and analysis.

## `triage` — Quick ticket triage

1. Pull unresolved tickets.
2. Sort by: severity (P0 first), age (oldest first), revenue (highest ARR first).
3. For top 10: suggest response template or escalation path.
4. Present triage list for user action.

---

**Fallback**: If Intercom MCP is not authenticated, offer to analyze feedback from local files: CSV imports, copied ticket text, or `.teams/research/feedback/raw/` directory.

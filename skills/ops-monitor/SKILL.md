---
name: ops-monitor
description: Application health monitoring — analyze error logs, deployment metrics, and performance data to detect anomalies and recommend actions
user-invocable: true
version: 1.0.0
---

# Operations Monitoring

Route by sub-command: `health | deploy | errors | report`

If no sub-command, default to `health`.

---

## `health` — Current application health

1. Spawn an `ops-monitor` agent (Opus).
2. Agent checks:
   - Recent git log for deployments
   - Vercel deployment status (if Vercel project)
   - Error patterns in application logs (if accessible)
   - Build status from CI/CD
3. Produce health report in `.teams/dev/ops/`.

## `deploy` — Deployment analysis

1. Read recent deployment history (git log, Vercel API).
2. Correlate with error rates: did errors spike after a deploy?
3. Identify: safe deploys, risky deploys, rollback candidates.
4. Report deployment health score.

## `errors` — Error analysis

1. Read application error logs or Sentry data (if Sentry MCP available).
2. Group errors by: type, frequency, affected endpoints.
3. For top errors: identify root cause, suggest fix.
4. Report in priority order.

## `report` — Generate ops report

1. Combine health, deploy, and error data.
2. Generate comprehensive ops report.
3. Submit to `/supervisor-review`.

---

**Auto-trigger**: Consider running after every `/gsd-ship` to verify the deployment is healthy.

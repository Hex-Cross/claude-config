---
name: notify
description: Send notifications to team channels — Slack, Discord, or email summaries when tasks complete, reviews are needed, or alerts fire
user-invocable: true
version: 1.0.0
---

# Notify — Team Notifications

Route by sub-command: `send | setup | status | test`

---

## `setup` — Configure notification channels

1. Ask which channels to configure: Slack webhook, Discord webhook, or email (via API).
2. For Slack/Discord: ask for webhook URL. Store in `.teams/notify-config.json`:
   ```json
   {
     "channels": {
       "slack": { "webhook": "https://hooks.slack.com/..." },
       "discord": { "webhook": "https://discord.com/api/webhooks/..." }
     },
     "rules": {
       "review_complete": ["slack"],
       "pipeline_alert": ["slack", "discord"],
       "ops_alert": ["slack"],
       "milestone_complete": ["slack", "discord"]
     }
   }
   ```
3. Run `/notify test` to verify connectivity.

## `send` — Send a notification

1. Accept: message text, channel (slack/discord/all), urgency (info/warning/critical).
2. Read `.teams/notify-config.json` for webhook URLs.
3. Format message per platform:
   - **Slack**: JSON payload with `text`, `blocks` for rich formatting, color sidebar (green=info, yellow=warning, red=critical).
   - **Discord**: JSON payload with `embeds` array, color-coded.
4. Send via `WebFetch` (POST to webhook URL).
5. Log the notification in `.teams/notify-log.md`.

## `status` — Show notification config

1. Read `.teams/notify-config.json`.
2. Display configured channels, routing rules, and last 5 notifications from log.

## `test` — Test webhook connectivity

1. Send a test message to each configured channel.
2. Report success/failure per channel.

---

## Auto-Trigger Integration

This skill is designed to be called by other skills at key moments:
- After `/supervisor-review` APPROVED → notify "review_complete" channels
- After `/gsd-complete-milestone` → notify "milestone_complete" channels
- After ops-monitor detects P0/P1 → notify "ops_alert" channels
- After sales-pipeline-tracker finds stale deals → notify "pipeline_alert" channels

Skills call `/notify send` programmatically — the notification is fire-and-forget.

**Security**: Webhook URLs in notify-config.json should be added to `.gitignore`. Never commit webhook secrets.

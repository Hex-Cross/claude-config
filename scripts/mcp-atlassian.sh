#!/bin/sh
exec /home/frok/.local/bin/uvx mcp-atlassian \
  --jira-url "https://simedia-data.atlassian.net" \
  --jira-username "paul@saastaq.io" \
  --jira-token "$JIRA_API_TOKEN"

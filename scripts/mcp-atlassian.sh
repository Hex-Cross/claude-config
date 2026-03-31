#!/bin/sh
# MCP Atlassian server wrapper
# Set these env vars: JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN
exec /home/frok/.local/bin/uvx mcp-atlassian \
  --jira-url "${JIRA_URL}" \
  --jira-username "${JIRA_USERNAME}" \
  --jira-token "${JIRA_API_TOKEN}"

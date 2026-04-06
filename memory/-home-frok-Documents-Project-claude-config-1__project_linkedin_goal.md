---
name: LinkedIn Company Page Integration
description: User wants to connect LinkedIn company page for automated posting -- needs LinkedIn MCP server
type: project
---

User wants Claude to publish directly to their company LinkedIn page. Requires:
1. LinkedIn Developer App at developer.linkedin.com
2. Community Management API product (requires LinkedIn review, can take days/weeks)
3. Admin role on the company page
4. OAuth scopes: w_organization_social, r_organization_social

**Why:** Automate marketing pipeline end-to-end -- from research to published post.

**How to apply:** Once user has LinkedIn API credentials, install org-mobicycle/linkedin-mcp-server or Composio, add to settings.json MCP config, and the marketing-social-manager agent can publish directly. Until then, the pipeline produces publish-ready content for manual posting.

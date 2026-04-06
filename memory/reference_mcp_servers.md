---
name: MCP Server Usage Guide
description: When to use each MCP server — Exa for semantic search, Firecrawl for structured scraping, Context7 for library docs, Playwright for browser testing
type: reference
last_verified: 2026-04-01
---

## MCP Servers and When to Use Each

### Exa (mcp__exa__*)
- **Best for:** Semantic search — finding concepts, ideas, similar projects, competitors, market data
- **Use when:** Researching ideas, finding alternatives, competitive analysis, trend research
- **Example:** "Find companies doing Indonesian tax compliance SaaS"

### Firecrawl (mcp__firecrawl__*)
- **Best for:** Structured web scraping — extracting specific data from known URLs
- **Use when:** Reading documentation pages, extracting API specs, crawling sitemaps
- **Example:** "Scrape the Next.js 16 migration guide page"

### Context7 (mcp__context7__*)
- **Best for:** Library documentation lookup — getting up-to-date API references
- **Use when:** Need current API signatures, method parameters, config options for any npm package
- **Example:** "Get the latest tRPC v11 router API"

### Playwright (mcp__playwright__*)
- **Best for:** Browser automation — visual testing, form interaction, screenshot capture
- **Use when:** Accessibility testing (axe-core injection), UI verification, E2E flow testing
- **Not for:** Reading docs (use Firecrawl) or searching (use Exa)

### GitHub (mcp via HTTP)
- **Best for:** Repository operations — issues, PRs, code search across GitHub
- **Use when:** Creating PRs, checking CI status, searching for code patterns across repos

### Atlassian (mcp__claude_ai_Atlassian__*)
- **Best for:** Jira/Confluence — issue tracking, documentation
- **Use when:** Creating/updating Jira issues, reading Confluence pages

### Decision Tree
1. Need current API docs? → **Context7**
2. Need to search the web for concepts? → **Exa**
3. Need to scrape a specific page? → **Firecrawl**
4. Need to test UI in a browser? → **Playwright**
5. Need GitHub operations? → **GitHub MCP**
6. Need Jira/Confluence? → **Atlassian MCP**

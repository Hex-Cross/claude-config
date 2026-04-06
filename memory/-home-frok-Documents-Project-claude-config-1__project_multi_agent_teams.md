---
name: Multi-Agent Professional Teams
description: 6 business teams (54 agents, 43 skills) covering CEO, Research, Marketing, Dev, Testing, and Sales — full company simulation
type: project
---

Built 2026-04-02. Expanded to 6 teams on 2026-04-02.

**Teams:**
- Marketing (5 agents): content-strategist, copywriter, seo-growth, social-manager, visual-designer
- Research (4 agents): competitor-analyst, lead-scout, market-researcher, trend-spotter
- Testing (11 agents): strategist, e2e-engineer, performance-engineer, api-tester, visual-regression, accessibility-auditor, security-scanner, contract-tester, data-seeder, storybook-tester, ci-generator
- Sales (5 agents): prospector, outreach-writer, proposal-generator, pipeline-tracker, objection-handler
- Executive (4 agents): strategist, financial-analyst, decision-maker, briefing-writer
- Dev (5 agents): architect, fullstack-engineer, devops-engineer, database-engineer, code-reviewer
- Supervisor: gates ALL teams at 9/10 (6 rubrics: marketing, research, testing, sales, exec, dev)
- Ecosystem Auditor: self-heals across all 6 teams
- GSD: 18 framework agents

**Why:** User wants to be CEO + Researcher + Marketing + Developer + Sales — full business operation automated through agent teams.

**How to apply:**
- Marketing: `/marketing:post`, `/marketing:campaign`
- Research: `/research:opportunity`, `/research:landscape`, `/research:competitor-watch`
- Testing: `/test-suite`, `/test-e2e`, `/test-performance`, `/test-api`, `/test-contract`, `/test-storybook`, `/test-ci`
- Sales: `/sales-prospect`, `/sales-outreach`, `/sales-pipeline`
- Executive: `/exec-briefing`, `/exec-decision`, `/exec-strategy`
- Dev: `/dev-feature`, `/dev-scaffold`, `/dev-deploy`
- Supervisor: `/supervisor:review`
- skill-auto-trigger.mjs has intents for: feature, bugfix, refactor, testing, sales, executive, development, audit, trivial

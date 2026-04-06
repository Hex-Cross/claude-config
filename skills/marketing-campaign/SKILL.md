---
name: marketing-campaign
description: Full multi-post marketing campaign — strategy, content calendar, copy series, visuals, SEO, and supervisor review for each piece. Drives sustained traffic to your website.
user-invocable: true
version: 1.1.0
---

# Marketing Campaign — Multi-Post Campaign Pipeline

Creates a full marketing campaign with multiple content pieces, a content calendar, and coordinated messaging.

## Step 0: Initialize

```bash
mkdir -p .teams/marketing/{workspace,output,published,templates}
mkdir -p .teams/reviews/marketing
mkdir -p .teams/requests
```

Generate campaign ID: `campaign-{YYYYMMDD-HHMMSS}`

## Step 1: Campaign Brief

Extract from user message or `.teams/requests/`:
- **Campaign name:** descriptive title
- **Goal:** what the campaign should achieve (traffic, leads, awareness, launch)
- **Duration:** how long the campaign runs (1 week, 2 weeks, 1 month)
- **Website URL:** where to drive traffic
- **Key messages:** 2-4 themes to cover
- **Audience:** target persona(s)

## Step 2: Research Phase (2 agents IN PARALLEL, model: "sonnet")

First, check for existing research data:
- Read `.teams/research/output/` for recent opportunity reports on this topic
- Read `.teams/research/intelligence/` for competitor dossiers

If existing data is sufficient (created within last 30 days and covers the topic), skip to Step 3 using that data. Otherwise, spawn fresh research:

### Agent 1: Market Context
Spawn **research-market-researcher** (model: "sonnet"):
```
Quick market context scan for a marketing campaign about: {campaign topic}
Focus on: current trends, competitor content, audience pain points.
Write to: .teams/marketing/workspace/{campaign-id}/MARKET-CONTEXT.md
```

### Agent 2: Competitive Content
Spawn **research-competitor-analyst** (model: "sonnet"):
```
Scan competitor LinkedIn content for: {topic/industry}
What are they posting? What gets engagement? Where are content gaps?
Write to: .teams/marketing/workspace/{campaign-id}/COMPETITOR-CONTENT.md
```

## Step 3: Campaign Strategy (1 agent, model: "opus")

Spawn **marketing-content-strategist**:
```
Design a full campaign strategy.

<brief>
{campaign brief from Step 1}
</brief>

<market_context>
{MARKET-CONTEXT.md content}
</market_context>

<competitor_content>
{COMPETITOR-CONTENT.md content}
</competitor_content>

Produce:
- Campaign narrative arc (how posts build on each other)
- Content calendar (dates, topics, formats)
- Messaging pillars (3-4 themes across all posts)
- Per-post briefs (topic, angle, format, CTA for each post)

Write to: .teams/marketing/workspace/{campaign-id}/CAMPAIGN-STRATEGY.md
```

## Step 4: Supervisor Strategy Review

Invoke `/supervisor:review` on the CAMPAIGN-STRATEGY.md BEFORE creating content.
The Supervisor checks: strategic coherence, audience fit, differentiation, completeness.

If not approved, revise strategy before proceeding.

## Step 5: Content Creation (parallel per post, wave-based)

For each post in the campaign calendar, spawn agents in waves (max 3 posts per wave):

### Per Post Wave (for each post):
1. **marketing-copywriter** (model: "opus") -- writes post copy based on per-post brief from CAMPAIGN-STRATEGY.md
2. **marketing-visual-designer** (model: "opus") -- creates graphic via Canva based on copy + visual direction from strategy
3. **marketing-seo-growth** (model: "sonnet") -- final hashtag/keyword optimization for this specific post

Steps 1-3 run sequentially per post (copy first, then visual + SEO in parallel).
Multiple posts in the same wave run in parallel.

### Assembly (per post):
**marketing-social-manager** (model: "opus") -- assembles copy + visual + SEO into deliverable format, runs pre-publish checklist.

Write all deliverables to: `.teams/marketing/output/{campaign-id}-post-{N}-DELIVERABLE.md`

## Step 6: Per-Deliverable Supervisor Review

Each post deliverable goes through `/supervisor:review` independently.
Posts that pass: marked approved.
Posts that need revision:
1. Read supervisor feedback from `.teams/reviews/marketing/{deliverable-id}-REVIEW.md`
2. Route back to **marketing-copywriter** (for copy issues) or **marketing-visual-designer** (for visual issues) with specific feedback
3. Re-run supervisor review. Max 3 revision loops per post.
4. If a post fails 3 revisions, flag it to user but continue with other posts.

## Step 7: Campaign Package

Once all posts are approved:
1. Compile campaign overview with all posts, scores, and calendar
2. Present complete campaign to user
3. Show: campaign timeline, post previews, Canva design URLs, overall strategy
4. Offer to move approved posts to `.teams/marketing/published/`

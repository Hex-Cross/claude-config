---
name: marketing-post
description: End-to-end LinkedIn post creation — strategy, copy, visual, SEO, assembly, and supervisor review. Produces a publish-ready post for your company page.
user-invocable: true
version: 1.0.0
---

# Marketing Post — LinkedIn Post Pipeline

Creates a single LinkedIn post from brief to publish-ready deliverable. The full marketing team collaborates.

## Step 0: Initialize Workspace

```bash
mkdir -p .teams/marketing/{workspace,output,published,templates}
mkdir -p .teams/reviews/marketing
mkdir -p .teams/requests
```

Generate a post ID: `post-{YYYYMMDD-HHMMSS}`

## Step 1: Gather Brief

If the user provided topic/product/link in their message, extract:
- **Topic:** What the post is about
- **Goal:** What action we want readers to take (visit website, engage, awareness)
- **Website URL:** The link to drive traffic to (if applicable)
- **Audience:** Who we're targeting (or "default" for general B2B)

If insufficient info, check `.teams/requests/` for pending requests from Research team.

## Step 2: Research Phase (2 agents IN PARALLEL, model: "sonnet" — read-only research)

### Agent 1: Content Strategist
Spawn **marketing-content-strategist** agent:
```
Create a content strategy for this LinkedIn post.

Brief:
- Topic: {topic}
- Goal: {goal}
- Audience: {audience}
- Website: {url}

Check .teams/research/output/ and .teams/research/intelligence/ for relevant market data.
Check .teams/marketing/published/ to avoid repeating recent topics.

Write strategy to: .teams/marketing/workspace/{post-id}/STRATEGY.md
```

### Agent 2: SEO & Growth
Spawn **marketing-seo-growth** agent:
```
Research SEO and growth optimization for a LinkedIn post about: {topic}
Target audience: {audience}

Find trending hashtags, competitor content to beat, best posting time, and engagement hooks.

Write brief to: .teams/marketing/workspace/{post-id}/SEO-BRIEF.md
```

## Step 3: Creative Phase (1 agent, model: "opus" — creative writing)

### Copywriter
Spawn **marketing-copywriter** agent:
```
Write a LinkedIn post based on this strategy and SEO brief.

<strategy>
{content of STRATEGY.md}
</strategy>

<seo_brief>
{content of SEO-BRIEF.md}
</seo_brief>

Website to drive traffic to: {url}
Goal: {goal}

Write draft to: .teams/marketing/workspace/{post-id}/DRAFT.md
```

## Step 4: Visual + Final SEO (2 agents IN PARALLEL)

### Agent 1: Visual Designer (model: "opus" — creative work)
Spawn **marketing-visual-designer** agent:
```
Create a LinkedIn post graphic for this content.

<copy>
{content of DRAFT.md — the actual post text}
</copy>

<strategy>
{visual direction from STRATEGY.md}
</strategy>

Use Canva brand kit. Design should reinforce the post's key message.
LinkedIn feed image: 1200x628px or 1080x1080px.

Write design details to: .teams/marketing/workspace/{post-id}/VISUAL.md
```

### Agent 2: SEO Final Pass (model: "sonnet" — optimization)
Spawn **marketing-seo-growth** agent:
```
Final optimization pass on this LinkedIn post copy.

<copy>
{content of DRAFT.md}
</copy>

<seo_brief>
{content of SEO-BRIEF.md}
</seo_brief>

Verify hashtags are current. Suggest any final engagement hooks. Check character count (max 3000).

Write final optimization to: .teams/marketing/workspace/{post-id}/SEO-FINAL.md
```

## Step 5: Assembly (1 agent, model: "opus")

Spawn **marketing-social-manager** agent:
```
Assemble the final LinkedIn post deliverable from these components:

<copy>{DRAFT.md content}</copy>
<visual>{VISUAL.md content}</visual>
<seo>{SEO-FINAL.md content}</seo>
<strategy>{STRATEGY.md content}</strategy>

Combine into a publish-ready deliverable. Run the pre-publish checklist.

Write to: .teams/marketing/output/{post-id}-DELIVERABLE.md
Update calendar: .teams/marketing/calendar.md
```

## Step 6: Supervisor Review

Invoke `/supervisor:review` on `.teams/marketing/output/{post-id}-DELIVERABLE.md`

This will score the deliverable and either approve, request revision (loops back to Step 3 with feedback), or reject.

## Step 7: Present to User

Once approved:
1. Show the final post copy
2. Show the Canva design URL/thumbnail
3. Show the supervisor score
4. Offer: "Ready to publish? Move to `.teams/marketing/published/`"

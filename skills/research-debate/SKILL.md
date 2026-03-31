---
name: research-debate
description: "Research ideas using internet search, then deliver a structured bull/bear debate with evidence. Challenges weak assumptions. Two modes: /research-debate [idea] to evaluate, or /research-debate explore [domain] to discover opportunities."
user-invocable: true
version: 1.0.0
---

# Idea Research & Debate: $ARGUMENTS

Research an idea or domain using web search, then deliver a structured bull/bear debate with evidence. Actively challenge weak thinking.

## Mode Detection

- If $ARGUMENTS starts with "explore": run **Discovery Mode** (find opportunities in a domain)
- Otherwise: run **Evaluation Mode** (stress-test a specific idea)

---

## Phase 1: Quick Clarification

Ask the user 2-3 targeted questions in a SINGLE message. Do NOT over-interview — get what you need and move.

**For Evaluation Mode, ask:**
- Who is the target customer? (if not obvious from the idea)
- What's the proposed business model or monetization approach?
- Any constraints? (solo dev vs team, budget, timeline, technical skills)

**For Discovery Mode, ask:**
- What draws you to this domain? (interest, expertise, market signal)
- Any constraints on what you could build? (B2B vs B2C, SaaS vs marketplace, solo vs team)
- Are you optimizing for revenue, impact, learning, or something else?

Wait for the user's response before proceeding to Phase 2.

---

## Phase 2: Deep Research

Launch 4 Research agents IN PARALLEL. Each agent should perform multiple web searches and synthesize findings.

### Agent 1: Competitive Landscape

Search for existing solutions and competitors using WebSearch:
- "[idea/domain] startup"
- "[idea/domain] app tool software"
- "[idea/domain] alternatives comparison"
- "best [idea/domain] solutions 2025 2026"
- "[idea/domain] product hunt"

For each competitor found, collect: name, URL, what they do, pricing model, estimated traction (funding, users, reviews).

Also search for:
- Acqui-hires or shutdowns in this space (signals of market difficulty)
- Open-source alternatives that might undercut paid products
- Market consolidation (big players acquiring small ones)

**Output**: Competitor table with Name, URL, Description, Pricing, Traction, Weakness/Gap

### Agent 2: Market Signals & Trends

Search for market data using WebSearch:
- "[domain] market size report"
- "[domain] industry forecast 2025 2026"
- "[domain] growth trends"
- "[domain] venture capital funding rounds"
- "[domain] regulations compliance"

Collect:
- Market size estimates (cite source)
- Growth direction: expanding, flat, or contracting
- Recent funding activity (signals of investor confidence)
- Tailwinds: technology shifts, regulation changes, demographic trends that help
- Headwinds: saturation, regulatory risk, technology disruption that hurts
- For Discovery Mode: also search for "[domain] pain points", "[domain] frustrations reddit", "[domain] underserved"

**Output**: Market summary with size, growth, tailwinds, headwinds, and key data points with source URLs

### Agent 3: Failure Stories & Risk Patterns

Search for what has gone wrong in this space using WebSearch:
- "[idea/domain] startup failed post-mortem"
- "[idea/domain] shutdown why"
- "[idea/domain] challenges problems difficult"
- "[idea/domain] mistakes lessons learned"
- "[idea/domain] pivot"

Collect:
- Specific failure cases with company names and reasons
- Common failure patterns: couldn't acquire users, couldn't monetize, regulatory blocked, technical too hard, timing wrong
- Pivots: companies that started in this space and moved elsewhere (and where they went)
- Graveyard count: how many have tried and failed?

**Output**: Failure case list with Company, What Happened, Root Cause, Source URL, and pattern summary

### Agent 4: Technical & Distribution Feasibility

Assess buildability and go-to-market using WebSearch:
- "[idea] tech stack how to build"
- "[idea/domain] API platform infrastructure"
- "[idea/domain] customer acquisition strategy"
- "[idea/domain] go to market"
- "[idea/domain] open source alternative"

Collect:
- Key technical challenges and complexity estimate
- Available APIs, platforms, and infrastructure to build on
- Distribution channels: SEO, paid ads, viral, partnerships, community, marketplaces
- Customer acquisition cost signals
- Time-to-market estimate: weeks, months, or years
- Open-source risk: could an OSS project kill this?

**Output**: Feasibility rating (Easy/Medium/Hard) for both technical and distribution, with evidence

---

## Phase 3: Devil's Advocate Debate

Using ALL research from Phase 2, construct the structured debate. Be genuinely adversarial — do not softball the bear case.

### BULL CASE — Why This Could Work

Present the strongest evidence-backed arguments FOR the idea:
- Market gaps that competitors haven't filled
- Timing advantages (why now is better than 2 years ago)
- Tailwinds that make success more likely
- Low barriers to entry or unfair advantages
- Evidence of unmet demand (complaints, workarounds, willingness to pay)
- Assign overall bull confidence: X/10 with reasoning

### BEAR CASE — Why This Might Fail

Present the strongest evidence-backed arguments AGAINST the idea. Be brutal and honest:
- Strongest competitors and their moats (network effects, brand, data, switching costs)
- Failure patterns from similar attempts — specifically cite the failures from Agent 3
- Distribution nightmare: how will anyone find this? (most ideas die here)
- Unit economics concerns: can this make money at scale?
- Regulatory or legal blockers
- Technical complexity that's being underestimated
- Timing risk: too early, too late, or window closing
- Assign overall bear confidence: X/10 with reasoning

### DEVIL'S ADVOCATE CHALLENGES

Directly challenge the user's weakest assumptions. Use the Socratic method — ask pointed questions that force the user to defend their thinking:

1. "[Specific assumption] — but [counter-evidence]. How do you account for this?"
2. "[Competitor X] already does [similar thing] and has [advantage]. What's your wedge?"
3. "[Failure case Y] tried exactly this and failed because [reason]. Why would you be different?"

Present at least 3 challenges. Wait for the user to respond to each before proceeding.

---

## Phase 4: Opportunity Synthesis

**For Evaluation Mode:**
- Identify the **strongest wedge** — the narrowest viable entry point that avoids direct competition
- Suggest **pivots or repositioning** if the core idea is weak (backed by research findings)
- Propose the **cheapest possible test** of the riskiest assumption (not an MVP — just a test)
- Rate competitive difficulty: **Blue Ocean** (no real competition) / **Crowded** (many players, room for differentiation) / **Red Ocean** (dominated, avoid)

**For Discovery Mode:**
- Rank the top 3-5 opportunities discovered during research
- For each: one-line description, why it's interesting, biggest risk, estimated difficulty
- Highlight the one with the best risk/reward ratio
- Note any surprising or non-obvious opportunities found

---

## Phase 5: Final Verdict

Present the complete report:

```
## Research & Debate Report: [Idea/Domain]
**Date**: [today]
**Mode**: Evaluation / Discovery

---

### Executive Summary
[2-3 sentences: what we found, what we recommend, why]

### Competitive Landscape
| Competitor | What They Do | Pricing | Traction | Gap/Weakness |
|------------|-------------|---------|----------|--------------|
| ...        | ...         | ...     | ...      | ...          |

### Market Signals
- **Market Size**: [estimate with source URL]
- **Growth**: [direction + evidence]
- **Tailwinds**: [what helps]
- **Headwinds**: [what hurts]
- **Funding Activity**: [recent rounds in the space]

### Bull Case (Confidence: X/10)
1. [Point] — [source URL]
2. ...

### Bear Case (Confidence: X/10)
1. [Point] — [source URL]
2. ...

### Failure Patterns
1. [Company]: [what happened] — [source URL]
2. ...

### Feasibility
- **Technical**: Easy/Medium/Hard — [reasoning]
- **Distribution**: Easy/Medium/Hard — [reasoning]
- **Time to Market**: [estimate]

### Key Unknowns
- [ ] [Critical assumption that needs testing]
- [ ] ...

---

### VERDICT: GO / CONDITIONAL GO / NO-GO
**Confidence**: X/10
**Reasoning**: [2-3 sentences with the decisive factors]

### If GO: Next Steps
1. [Cheapest test of the riskiest assumption — specific and actionable]
2. [Narrowest wedge to enter the market]
3. [What to build first and what to explicitly skip]

### If CONDITIONAL GO: What Must Change
1. [Pivot or repositioning needed]
2. [Assumption that must be validated first]
3. [Risk that must be mitigated]

### If NO-GO: Better Alternatives
1. [Adjacent opportunity with reasoning]
2. [Pivot direction suggested by the research]

### Sources
- [Title](URL)
- ...
```

### After the Report

Ask the user:
- "Want to deep-dive into any specific competitor?"
- "Want to research a suggested pivot or alternative?"
- "Ready to move to implementation? I can run `/superpowers-brainstorming` on the chosen direction."

---

## Principles

- **Evidence over opinion** — every claim must have a source URL
- **Genuine adversarial debate** — do NOT softball the bear case to be nice
- **Challenge weak thinking** — the user asked for this, so be direct and honest
- **Actionable output** — every section should help the user make a decision
- **No false precision** — use ranges and confidence levels, not exact numbers
- **Cite everything** — unsourced claims are worthless in a research report

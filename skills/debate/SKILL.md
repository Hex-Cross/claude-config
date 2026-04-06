---
name: debate
description: Structured agent debate — two agents argue opposing positions on a decision, a judge resolves conflicts with reasoning
user-invocable: true
version: 1.0.0
---

# Debate — Adversarial Decision Making

Two agents argue FOR and AGAINST a position. A judge resolves it. Use for architecture decisions, technology choices, strategy disagreements, or any decision with real tradeoffs.

## Step 1: Parse the Topic

Extract from user:
- **Decision/topic**: what to debate
- **Context**: any constraints, prior decisions, or stakeholder preferences
- If unclear, ask the user to frame it as a yes/no or option A vs option B question

## Step 2: Spawn Advocate and Challenger IN PARALLEL (model: "opus")

### Agent 1: Advocate (FOR)
Spawn a general-purpose agent:
```
You are the ADVOCATE arguing FOR this position:

Topic: {decision/topic}
Context: {constraints}

Build the strongest possible case FOR this position. Your output must include:
1. **Thesis**: 2-3 sentences stating your position
2. **Evidence**: 3-5 specific, concrete points supporting your case (data, examples, precedents)
3. **Risks of NOT doing this**: what happens if the other side wins
4. **Preemptive counter-arguments**: anticipate what the other side will say and rebut it
5. **Implementation path**: if you win, exactly how to proceed

Be specific. Use data. No hand-waving.
```

### Agent 2: Challenger (AGAINST)
Spawn a general-purpose agent:
```
You are the CHALLENGER arguing AGAINST this position:

Topic: {decision/topic}
Context: {constraints}

Build the strongest possible case AGAINST this position. Your output must include:
1. **Thesis**: 2-3 sentences stating your counter-position
2. **Evidence**: 3-5 specific, concrete points supporting your case (data, examples, precedents)
3. **Risks of doing this**: what goes wrong if the advocate wins
4. **Preemptive counter-arguments**: anticipate what the advocate will say and rebut it
5. **Alternative**: if you win, what should be done instead

Be specific. Use data. No hand-waving.
```

## Step 3: Spawn Judge (model: "opus")

After both positions are collected, spawn a judge agent:
```
You are the JUDGE in a structured debate. Two agents argued opposing positions.

Topic: {decision/topic}
Context: {constraints}

<advocate_position>
{Advocate's full output}
</advocate_position>

<challenger_position>
{Challenger's full output}
</challenger_position>

Your job:
1. **Points of agreement**: where do both sides actually agree?
2. **Genuine conflicts**: where do they truly disagree? (not just framing differences)
3. **Ruling on each conflict**: for each genuine conflict, who has the stronger argument? Why?
4. **Verdict**: ADVOCATE WINS / CHALLENGER WINS / CONDITIONAL (specify conditions)
5. **Recommended action**: exactly what to do based on your ruling
6. **Dissent note**: what's the strongest argument from the losing side that should still be considered?

Be decisive. Pick a side. "It depends" is not a verdict.
```

## Step 4: Present to User

Show:
```markdown
## Debate: {topic}

### Advocate (FOR)
{thesis summary — 2-3 sentences}

### Challenger (AGAINST)
{thesis summary — 2-3 sentences}

### Judge's Verdict: {ADVOCATE/CHALLENGER/CONDITIONAL}
{ruling summary — 3-4 sentences}

### Key Conflicts Resolved
| Conflict | Advocate Says | Challenger Says | Ruling |
|----------|--------------|-----------------|--------|
| ... | ... | ... | ... |

### Recommended Action
{what to do next}

### Dissent Note
{strongest argument from losing side — still worth considering}
```

Let the user make the final call. The debate informs, it doesn't decide.

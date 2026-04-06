---
name: cross-review
description: Cross-domain agent review — spawns reviewers from different expertise to challenge work before it ships. Catches problems agents miss about their own output.
user-invocable: true
version: 1.0.0
---

# Cross-Review — Adversarial Agent Quality Gate

## Sub-command Detection

- `/cross-review` — review the most recent agent output or last significant file written
- `/cross-review <file-path>` — review a specific file

## Step 1: Identify Target and Domain

Read the target output. Determine the original domain:

| If output contains... | Domain |
|----------------------|--------|
| Code, components, API routes, schemas | dev |
| Market analysis, competitor data, opportunity assessment | research |
| LinkedIn posts, ad copy, content calendar | marketing |
| Test results, coverage reports, security findings | test |
| Strategy, OKR, briefing, financial model | exec |
| Prospect list, outreach sequence, proposal | sales |

## Step 2: Select Review Lenses

Based on domain, select 2 cross-domain lenses:

| Original Domain | Lens 1 | Lens 2 |
|----------------|--------|--------|
| dev | security | architecture |
| research | logical-rigor | data-quality |
| marketing | factual-accuracy | brand-consistency |
| test | coverage-completeness | edge-cases |
| exec | actionability | evidence-quality |
| sales | claim-accuracy | compliance-risk |

## Step 3: Spawn 2 Cross-Reviewers IN PARALLEL (model: "opus")

Spawn **cross-reviewer** agent twice, each with a different lens:

```
Review this output from the {domain} domain.

<output>
{the target output content}
</output>

<chain_context>
{CHAIN-LOG.md content if it exists, otherwise "No prior chain context"}
</chain_context>

Your review lens: {lens}
Original domain: {domain}

Produce a structured APPROVE/CHALLENGE verdict.
```

## Step 4: Collect Verdicts

Read both reviewer outputs.

**If both APPROVE:**
- Report: "Cross-review PASSED. Both reviewers approved."
- List the key strengths they identified
- No revision needed

**If any CHALLENGE:**
- Report all challenges with their risk levels
- Group by severity: critical → high → medium → low
- For critical/high challenges:
  1. Present to the user with the specific issue and suggested fix
  2. Ask: "Should I revise based on these challenges, or override?"
  3. If revise: route the challenges back to the original agent/workflow for revision
  4. Re-run cross-review on the revised output (max 2 revision rounds)
- For medium/low challenges: report them but don't block

## Step 5: Write Review Record

Write the consolidated review to:
```
.teams/reviews/cross-review-{YYYYMMDD-HHMMSS}.md
```

Format:
```markdown
# Cross-Review Record

**Target**: {file or description}
**Domain**: {domain}
**Lens 1**: {lens} — {APPROVE/CHALLENGE}
**Lens 2**: {lens} — {APPROVE/CHALLENGE}
**Overall**: {PASS / NEEDS_REVISION / ESCALATED}
**Revision round**: {1/2/3}

## Reviewer 1 ({lens})
{full review output}

## Reviewer 2 ({lens})
{full review output}

## Resolution
{what was decided — approved as-is, revised, or escalated to user}
```

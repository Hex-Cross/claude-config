---
name: supervisor-review
description: Universal quality gate — the Supervisor agent scores any deliverable against a 10-dimension rubric. Blocks delivery if score < 9/10. Auto-revises up to 3 times.
user-invocable: true
version: 1.0.0
---

# Supervisor Review — Universal Quality Gate

Every deliverable passes through this gate before reaching the user. The Supervisor scores, approves, or sends back for revision.

## Step 1: Identify Deliverable

Find the deliverable to review. Check (in order):
1. If a path was provided as argument, use that
2. Most recent file in `.teams/marketing/output/`, `.teams/research/output/`, `.teams/testing/output/`, `.teams/sales/output/`, `.teams/exec/output/`, or `.teams/dev/output/`
3. If nothing found, ask the user what to review

Read the deliverable file. Also read the original request/brief that spawned it (check `request-source` in frontmatter).

## Step 2: Determine Rubric

Based on the `team` field in the deliverable frontmatter:
- `marketing` → Use the Marketing Rubric (10 dimensions, see supervisor agent)
- `research` → Use the Research Rubric (10 dimensions, see supervisor agent)
- `testing` → Use the Testing Rubric (10 dimensions, see supervisor agent)
- `sales` → Use the Sales Rubric (10 dimensions, see supervisor agent)
- `exec` → Use the Executive Rubric (10 dimensions, see supervisor agent)
- `dev` → Use the Dev Rubric (10 dimensions, see supervisor agent)
- If unclear, infer: code → Dev, test reports → Testing, prospects/outreach → Sales, strategy/briefing → Exec, analytics → Research, content → Marketing

## Step 3: Supervisor Review (1 agent, model: "opus" — judgment/decision work)

Spawn the **supervisor** agent with this context:

```
Review the following deliverable against the {marketing|research|testing|sales|exec|dev} rubric.

<deliverable>
{full content of the deliverable file}
</deliverable>

<original_brief>
{content of the original request/brief, if available}
</original_brief>

Score each of the 10 dimensions. Write your review to: .teams/reviews/{team}/{deliverable-id}-REVIEW.md

If the deliverable references a Canva design, verify the visual-copy alignment by reading the design brief.
```

## Step 4: Route Based on Verdict

Read the REVIEW.md the Supervisor wrote.

### If APPROVED (score >= 9.0):
1. Update the deliverable frontmatter: `status: approved`, `review-score: {score}`
2. Present the deliverable to the user with the score
3. If marketing content: offer to move to `.teams/marketing/published/`
4. If testing report: offer to move to `.teams/testing/output/`

### If REVISION REQUESTED (score 7.0-8.9):
1. Check revision count — if this is attempt 4+, escalate to user instead
2. Read the Supervisor's specific feedback
3. Route back to the appropriate team skill:
   - Marketing deliverable → re-invoke the relevant marketing agent (copywriter for copy issues, designer for visual issues)
   - Research deliverable → re-invoke the relevant research agent
   - Testing deliverable → re-invoke the relevant test agent (e2e-engineer for flow issues, api-tester for contract issues, etc.)
   - Sales deliverable → re-invoke the relevant sales agent (prospector for targeting, outreach-writer for messaging)
   - Executive deliverable → re-invoke the relevant exec agent (strategist for synthesis, financial-analyst for numbers)
   - Dev deliverable → re-invoke the relevant dev agent (fullstack-engineer for code, architect for design)
4. Pass the Supervisor's feedback directly into the agent's prompt:
   ```
   REVISION REQUEST from Supervisor (attempt {N}/3):
   {specific feedback from REVIEW.md}
   
   Revise ONLY the flagged dimensions. Do not regress other areas.
   Write the revised version to the same path with incremented version number.
   ```
5. After revision, loop back to Step 3 (re-review)

### If REJECTED (score < 7.0):
1. Present the rejection to the user with full explanation
2. Save to `.teams/supervisor/escalations/`
3. Do NOT auto-retry — the brief itself may need rethinking

## Step 5: Archive Review

After final verdict (approved or escalated), ensure:
- REVIEW.md is saved with full score breakdown
- Deliverable frontmatter has final status and score
- Calendar updated if this was scheduled content

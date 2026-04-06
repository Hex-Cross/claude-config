---
name: cross-audit
description: "Cross-domain audit: assign a challenger from a different team to review any agent's output. Forces debate and catches blind spots. Usage: /cross-audit [artifact-or-topic]"
user-invocable: true
version: 1.0.0
---

# Cross-Domain Audit: $ARGUMENTS

Take an agent's output and assign challengers from DIFFERENT domains to stress-test it. This is not rubber-stamping — challengers are incentivized to find problems, not confirm quality.

## Mode Detection

- If `$ARGUMENTS` contains **"full"**: audit ALL recent outputs across all teams (comprehensive sweep)
- If `$ARGUMENTS` contains **"security"**: focused security cross-audit (test-security-scanner audits dev, dev audits test assumptions)
- If `$ARGUMENTS` contains **"business"**: focused business alignment audit (exec audits dev/marketing, research audits exec)
- If `$ARGUMENTS` targets a **specific file or agent output**: targeted single-artifact audit
- Otherwise: **auto-detect** what was most recently produced and audit that

---

## Phase 1: Identify Audit Targets (model: "sonnet")

Launch 1 agent to scan recent work and determine what needs cross-auditing.

### Agent 1: Audit Target Scanner

1. Read the project's recent outputs:
   - Check `.feedback/` for what's already been audited
   - Check `.decisions/` for recent decisions that haven't been challenged
   - Check `SUMMARY.md`, `VERIFICATION.md` for recent GSD outputs
   - Check `.teams/*/output/` for recent team deliverables
   - If `$ARGUMENTS` specifies a target, focus on that

2. For each target, identify:
   - **Producer agent**: Who created this?
   - **Producer domain**: dev / test / marketing / sales / research / exec
   - **Audit priority**: CRITICAL (security, money, compliance) / HIGH (architecture, strategy) / MEDIUM (content, process) / LOW (style, naming)

3. Assign challengers using the **Audit Matrix** from GOVERNANCE.md:
   - Challenger MUST be from a different domain than the producer
   - For CRITICAL priority, assign 2 challengers (double audit)
   - For HIGH priority, assign 1 challenger
   - For MEDIUM/LOW, assign 1 challenger

**Output**: Audit assignment list with targets, producers, challengers, and priority.

---

## Phase 2: Execute Cross-Audits (model: "opus")

Launch challengers IN PARALLEL. Each challenger operates independently with NO knowledge of other challengers' findings (prevents groupthink).

### Challenger Template (repeat for each assignment)

You are auditing work produced by a DIFFERENT team. Your job is to FIND PROBLEMS, not confirm quality. You succeed by catching real issues; you fail by rubber-stamping.

**Read**:
1. The artifact being audited
2. GOVERNANCE.md for audit standards
3. `.decisions/decisions-index.md` for past decisions (does this contradict any?)
4. `.feedback/feedback-index.md` for known issues (has this been flagged before?)
5. Relevant knowledge base files for domain accuracy

**Check these dimensions** (score each 1-10):

#### Accuracy (Is it correct?)
- Are claims factually accurate? Cross-reference with knowledge base.
- Are numbers sourced? Can you verify them?
- Does code actually do what it claims? Read the implementation, don't trust comments.

#### Alignment (Is it the right thing?)
- Does this align with the project's business goals (read `.memory/project-business.md`)?
- Does this align with the current roadmap (read `.memory/project-roadmap.md`)?
- Does this align with architectural decisions (read `.memory/project-decisions.md`)?

#### Completeness (Is anything missing?)
- Are edge cases handled?
- Are error scenarios addressed?
- Is the "unhappy path" as robust as the "happy path"?

#### Consistency (Does it fit with the rest?)
- Does it follow project conventions (read `.memory/project-conventions.md`)?
- Does it contradict any past decisions in `.decisions/`?
- Does it match the patterns in the existing codebase?

#### Risk (What could go wrong?)
- What's the worst-case failure mode?
- Is there a security implication the producer might have missed?
- What happens at 10x scale? 100x scale?

**Produce challenges** — for every issue found:
```
### Challenge [N]: [Title]
**Dimension**: [accuracy/alignment/completeness/consistency/risk]
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Evidence**: [Specific file, line, data point, or test result]
**Producer's likely reasoning**: [Why the producer probably made this choice]
**Why it's still a problem**: [Why the reasoning is insufficient]
**Suggested fix**: [Concrete action]
```

**Verdict**: APPROVED | CHALLENGE_RAISED | BLOCKED

Rules:
- You MUST find at least 1 genuine issue (even if minor). Zero-issue audits are suspicious and indicate lazy review.
- You must NOT invent fake issues to meet the quota. If the work is genuinely excellent, say so and note 1 minor improvement.
- CRITICAL/HIGH challenges MUST have evidence (file path, line number, test result, or data source). Opinion alone is not a challenge.
- If you find a CRITICAL security or compliance issue, verdict is BLOCKED regardless of other scores.

---

## Phase 3: Debate Resolution (model: "opus")

After all challengers complete, synthesize and resolve.

### For APPROVED verdicts (no CRITICAL/HIGH challenges):
- Log audit in `.feedback/` with challenger findings
- Proceed with pipeline — no blocking

### For CHALLENGE_RAISED verdicts:
Launch 1 agent per challenge for structured debate:

1. **Present challenge** to the original producer (or a same-domain defender agent)
2. **Defender responds** with counter-evidence or acknowledgment
3. **If defender acknowledges**: Log as accepted feedback, create fix task
4. **If defender counter-argues**: One more round of evidence exchange
5. **If still unresolved after 2 rounds**: Escalate per GOVERNANCE.md authority hierarchy

### For BLOCKED verdicts:
- IMMEDIATELY halt downstream work on this artifact
- Surface the CRITICAL finding to the user with full context
- No debate needed for security/compliance blocks — fix first, debate after

---

## Phase 4: Feedback & Learning (model: "sonnet")

Launch 1 agent to record all audit outcomes.

### Agent: Feedback Recorder

1. For each completed audit, write feedback file:
   ```
   .feedback/[producer]-to-[challenger]-[date].md
   ```

2. Update `.feedback/feedback-index.md` with:
   - Date, producer, challenger, verdict, key findings
   - Running statistics: which producers get challenged most, which domains have most issues

3. If any challenges were accepted as valid, create entries in `.memory/` or `.decisions/` to prevent the same mistake in future.

4. If a producer's work was APPROVED with high scores, note what worked well — positive feedback is as important as critical.

**Output**: Summary report:

```
## Cross-Audit Summary

**Date**: [today]
**Artifacts audited**: [N]
**Challengers deployed**: [N]

### Results
| Artifact | Producer | Challenger | Verdict | Key Finding |
|----------|----------|-----------|---------|-------------|
| ... | ... | ... | ... | ... |

### Debate Outcomes
- [N] challenges accepted → fix tasks created
- [N] challenges defended → no action
- [N] escalated to user

### System Health
- Most challenged domain: [domain] ([N] challenges in last 7 days)
- Cleanest domain: [domain] ([N] approvals with minor-only findings)
- Recurring issue: [pattern] (seen [N] times — consider adding to conventions)

### Recommended Actions
1. [Action based on findings]
2. [Action based on findings]
```

---

## Principles

- **Challengers are rewarded for finding real problems** — an audit that catches a CRITICAL issue before production is worth more than 10 approvals.
- **No self-auditing** — an agent NEVER audits its own domain's work. The whole point is fresh eyes from a different perspective.
- **Evidence over authority** — a junior test agent can challenge a senior architect if they have the evidence. The audit matrix assigns challengers, not judges.
- **Speed matters** — audits run in parallel and are time-boxed. A 2-round debate max. If it takes more, escalate.
- **Audit the auditors** — the ecosystem-health skill periodically reviews whether cross-audits are actually catching real issues or just generating noise.

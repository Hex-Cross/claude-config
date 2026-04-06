---
name: ecosystem-health
description: "Periodic audit of the entire agent ecosystem: quality trends, debate outcomes, feedback loops, bias detection, and calibration. Usage: /ecosystem-health [focus-area]"
user-invocable: true
version: 1.0.0
---

# Ecosystem Health Check: $ARGUMENTS

Audit the meta-system: are agents actually collaborating, debating, and auditing each other effectively? This is the auditor of auditors — it checks whether the governance framework is working or just generating paperwork.

## Mode Detection

- If `$ARGUMENTS` contains **"calibrate"**: recalibrate supervisor rubrics based on feedback data
- If `$ARGUMENTS` contains **"bias"**: scan for systematic biases in debate resolution and audit verdicts
- If `$ARGUMENTS` contains **"efficiency"**: analyze speed vs quality trade-offs, identify bottlenecks
- If `$ARGUMENTS` contains **"coverage"**: check which agents/domains are under-audited
- Otherwise: **full health check** across all dimensions

---

## Phase 1: Data Collection (model: "sonnet")

Launch 3 agents IN PARALLEL to gather ecosystem data.

### Agent 1: Audit & Debate History Analyzer

Read ALL files in:
- `.feedback/` — every feedback file and the index
- `.decisions/` — every decision log and the index
- `VERIFICATION.md` files — verifier outcomes
- `SUMMARY.md` files — executor outcomes

Produce:
- Total audits conducted (last 7/30 days)
- Audit verdict distribution (APPROVED / CHALLENGE_RAISED / BLOCKED)
- Challenge acceptance rate (how many challenges were valid vs dismissed)
- Debate resolution patterns (who won, how often, average rounds)
- Escalation frequency (how often did humans get pulled in)

### Agent 2: Agent Performance Tracker

Read supervisor scores across all teams. Produce:
- Per-agent quality scores over time (trending up/down/flat?)
- Per-team average scores (which team is strongest/weakest?)
- Revision loop counts (which agents need 3 loops vs 1 loop to pass?)
- Feedback incorporation rate (did agents actually improve after receiving feedback?)

### Agent 3: Speed & Efficiency Analyzer

Read GSD state files, plan execution logs, timestamps. Produce:
- Average time per phase (planning, execution, verification, audit)
- Bottleneck identification (which phase takes longest?)
- Parallel utilization rate (how often are agents running in parallel vs sequential?)
- Debate overhead (how much time do debates add? Is it justified by quality improvement?)
- Context budget utilization (are we staying under 70%?)

---

## Phase 2: Diagnosis (model: "opus")

Launch 2 agents IN PARALLEL for deep analysis.

### Agent 1: Bias & Calibration Auditor

Analyze the collected data for systemic problems:

**Supervisor Calibration Check**:
- Is the 9/10 threshold appropriate? If 90% of work passes on first attempt, threshold may be too low. If <30% passes, may be too high.
- Are scoring dimensions weighted correctly? If "factual accuracy" is scored 10/10 but cross-audits keep finding inaccuracies, the rubric is miscalibrated.
- Compare supervisor scores vs cross-audit findings: large divergence indicates bias.

**Debate Resolution Bias**:
- Does one domain always "win" debates? (e.g., dev-architect overrides exec-strategist 90% of the time → authority imbalance)
- Are challenges from certain domains taken less seriously? (e.g., marketing challenges to dev are dismissed 80% of the time → domain bias)
- Is the evidence bar applied equally? (e.g., dev claims need "specific line numbers" but exec claims need only "general reasoning" → asymmetric scrutiny)

**Echo Chamber Detection**:
- Are cross-audits producing genuinely different perspectives, or just restating what the producer already knows?
- Are feedback loops actually changing behavior? Compare outputs before and after feedback.
- Are decisions being revisited when conditions change, or are stale decisions locking in bad choices?

**Output**: Bias report with specific findings and calibration recommendations.

### Agent 2: Effectiveness Auditor

Assess whether the governance system is actually improving quality:

**Quality Trend Analysis**:
- Are supervisor scores improving over time? (Learning system)
- Are cross-audit challenge counts decreasing? (Producers learning from feedback)
- Are the same issues recurring? (Feedback loops not working)

**Cost-Benefit of Governance**:
- Time spent on debates vs value produced (did debates prevent real problems?)
- Time spent on cross-audits vs issues caught (are audits catching things verification misses?)
- Time spent on feedback vs improvement observed (is the feedback loop worth it?)

**Coverage Gaps**:
- Which agents have NEVER been cross-audited? (Blind spots)
- Which decision types have no debate protocol? (Unstructured choices)
- Which feedback loops are broken? (Producer never reads feedback)

**Output**: Effectiveness report with ROI analysis of governance overhead.

---

## Phase 3: Recommendations & Actions (model: "opus")

Synthesize all findings into actionable recommendations.

### Calibration Actions (auto-apply if safe, suggest if risky):

**Auto-apply** (safe changes):
- Update `.feedback/feedback-index.md` with health check findings
- Flag stale decisions (>30 days) in `.decisions/decisions-index.md`
- Mark under-audited agents for priority audit in next cross-audit run

**Suggest to user** (requires approval):
- Supervisor rubric adjustments (e.g., "increase weight of 'factual accuracy' from 1.0 to 1.5")
- Authority hierarchy changes (e.g., "test-security-scanner should have override power over exec-strategist for compliance features")
- Process changes (e.g., "add mandatory cross-audit for all payment-related code, not just on-demand")
- Agent improvements (e.g., "research-market-researcher consistently misses franchise segment — update knowledge base")
- Skill chain modifications (e.g., "add /cross-audit as automatic step after /implement for medium+ tasks")

### Output Report:

```
## Ecosystem Health Report

**Date**: [today]
**Period analyzed**: [date range]
**Overall health**: HEALTHY | NEEDS_ATTENTION | CRITICAL

---

### Quality Metrics
| Metric | Current | Trend | Target |
|--------|---------|-------|--------|
| Supervisor pass rate (1st attempt) | X% | ↑↓→ | 50-70% |
| Cross-audit challenge rate | X% | ↑↓→ | 20-40% |
| Challenge acceptance rate | X% | ↑↓→ | 40-60% |
| Debate escalation rate | X% | ↑↓→ | <10% |
| Feedback incorporation rate | X% | ↑↓→ | >70% |
| Recurring issue rate | X% | ↑↓→ | <15% |

### Speed Metrics
| Metric | Current | Trend | Target |
|--------|---------|-------|--------|
| Avg phase completion time | Xmin | ↑↓→ | — |
| Debate overhead | X% of total | ↑↓→ | <15% |
| Parallel utilization | X% | ↑↓→ | >60% |
| Context budget usage | X% | ↑↓→ | <70% |

### Bias Check
- **Domain bias**: [findings or "none detected"]
- **Authority bias**: [findings or "balanced"]
- **Scrutiny asymmetry**: [findings or "consistent"]
- **Echo chambers**: [findings or "diverse perspectives confirmed"]

### Calibration Recommendations
1. [Specific action with rationale]
2. [Specific action with rationale]
3. [Specific action with rationale]

### Coverage Gaps
- Never audited: [list of agents/domains]
- Under-audited: [list with audit counts]
- Stale decisions needing review: [list with dates]

### Top 3 Actions
1. **[PRIORITY]**: [Action] — [Expected impact]
2. **[PRIORITY]**: [Action] — [Expected impact]
3. **[PRIORITY]**: [Action] — [Expected impact]
```

---

## Phase 4: System Evolution

If `/ecosystem-health` consistently identifies the same gaps:

1. **Propose new agents** — if a domain is under-represented, suggest creating specialized agents
2. **Propose skill modifications** — if a skill chain consistently produces low-quality output at a specific stage, suggest fixing that stage
3. **Propose governance updates** — if the authority hierarchy isn't working, propose amendments to GOVERNANCE.md
4. **Propose memory updates** — if conventions or decisions are outdated, update `.memory/` and `.decisions/`

Use the `/evolve` skill for implementing system changes. `/ecosystem-health` diagnoses; `/evolve` treats.

---

## Principles

- **The auditor of auditors must also be auditable** — this skill's recommendations should be reviewed by the user before major changes (rubric adjustments, authority changes).
- **Data over intuition** — every recommendation must cite specific data (counts, trends, ratios). "I feel like marketing is underperforming" is not a valid finding.
- **Health is a range, not a binary** — the target is not 100% pass rate (that means the bar is too low). The target is a healthy distribution where challenges are frequent enough to catch problems but not so frequent that they block all work.
- **Speed is a feature** — if governance overhead exceeds 15% of total time without proportional quality improvement, reduce overhead. The goal is fast AND good, not just good.
- **Evolution, not revolution** — recommend incremental changes. Don't propose rewriting the entire governance framework in one shot.

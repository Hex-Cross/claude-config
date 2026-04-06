# Agent Governance Framework

Every project inherits this governance framework. It defines how agents collaborate, debate, challenge, and resolve disagreements. No agent operates in isolation — every output is subject to cross-domain challenge.

---

## 1. Authority Hierarchy

When agents disagree, authority follows this order. Higher authority overrides lower, but must document the override with rationale.

| Priority | Role | Domain | Override Power |
|----------|------|--------|---------------|
| 0 | **User** | Everything | Absolute — can override any agent decision |
| 1 | **supervisor** | Quality gates | Can block ANY deliverable under 9/10 |
| 2 | **gsd-verifier** | Goal achievement | Can reject "completed" claims if goal not met |
| 3 | **test-security-scanner** | Security | Can VETO features with critical/high security findings |
| 4 | **dev-architect** | Technical decisions | Final say on architecture, patterns, schema design |
| 5 | **exec-strategist** | Business decisions | Final say on priority, roadmap, resource allocation |
| 6 | **dev-code-reviewer** | Code quality | Can block merge for correctness/performance/convention |
| 7 | **All other agents** | Their domain | Advisory — outputs feed into higher-authority decisions |

### Override Rules

- **Security overrides speed**: If test-security-scanner finds CRITICAL/HIGH, feature is blocked regardless of exec-strategist's deadline pressure. Ship secure or don't ship.
- **Business overrides perfection**: If exec-strategist says "single-tenant MVP for October deadline," dev-architect can document the tech debt but cannot block the decision.
- **Quality overrides quantity**: Supervisor's 9/10 threshold is non-negotiable. Shipping 3 features at 9/10 beats 10 features at 6/10.
- **Evidence overrides opinion**: Any agent can challenge any authority by presenting specific evidence (code, data, test results). Evidence-backed challenges MUST be addressed, not dismissed.

---

## 2. Debate Protocol

### When Debate Triggers

Debate is MANDATORY (not optional) when:

1. **Architecture fork** — Two valid approaches exist (e.g., multi-tenant vs single-tenant)
2. **Priority conflict** — Business urgency vs technical quality
3. **Risk assessment disagreement** — One agent says CRITICAL, another says LOW
4. **Resource allocation** — Build feature A vs feature B when you can't do both
5. **Technology choice** — Framework/library/service selection with trade-offs

### Debate Format: Structured Adversarial Review

```
## Debate: [Topic]
**Triggered by**: [Agent that raised the conflict]
**Date**: [ISO date]

### Position A: [Agent Name]
**Stance**: [Clear 1-sentence position]
**Evidence**:
- [Specific data point, file reference, or test result]
- [Specific data point, file reference, or test result]
- [Specific data point, file reference, or test result]
**Risk if ignored**: [Concrete consequence]
**Time/cost estimate**: [Effort required]

### Position B: [Agent Name]
**Stance**: [Clear 1-sentence position]
**Evidence**:
- [Specific data point, file reference, or test result]
- [Specific data point, file reference, or test result]
- [Specific data point, file reference, or test result]
**Risk if ignored**: [Concrete consequence]
**Time/cost estimate**: [Effort required]

### Cross-Examination
**A challenges B**: [Specific weakness in B's evidence]
**B challenges A**: [Specific weakness in A's evidence]

### Resolution
**Decided by**: [Authority from hierarchy]
**Decision**: [Position A / Position B / Hybrid]
**Rationale**: [Why, with reference to evidence]
**Documented trade-off**: [What we're explicitly accepting as risk]
**Revisit trigger**: [Condition that would reopen this debate]
```

### Time-Boxed Debates

- **Trivial conflicts** (naming, style): 1 round, lowest relevant authority decides
- **Feature-level conflicts** (approach, priority): 2 rounds max, exec-strategist or dev-architect decides
- **Architecture-level conflicts** (patterns, infrastructure): 3 rounds max, user decides if agents deadlock
- **NEVER** let debate block execution for more than 3 rounds — escalate to user

---

## 3. Cross-Domain Audit Protocol

Every agent's output gets audited by an agent from a DIFFERENT domain. This prevents echo chambers and catches blind spots.

### Audit Matrix

| Producer | Auditor | What They Check |
|----------|---------|-----------------|
| dev-fullstack-engineer | exec-strategist | Does this align with business priority? Are we building the right thing? |
| dev-fullstack-engineer | test-security-scanner | OWASP compliance, input validation, auth bypass potential |
| dev-architect | exec-strategist | Is this architecture justified for current scale, or overengineered? |
| dev-architect | test-performance-engineer | Will this design perform at target load? |
| marketing-copywriter | research-market-researcher | Are claims factually accurate? Is positioning defensible? |
| marketing-content-strategist | exec-strategist | Does content strategy align with business goals and OKRs? |
| sales-proposal-generator | dev-architect | Are technical claims in proposals accurate? |
| sales-proposal-generator | research-competitor-analyst | Is competitive positioning accurate and current? |
| exec-strategist | research-market-researcher | Are strategic assumptions backed by current market data? |
| exec-strategist | dev-architect | Are technical feasibility assumptions correct? |
| research-market-researcher | marketing-content-strategist | Is research actionable for content? Gaps in analysis? |
| gsd-planner | gsd-verifier | Are plan must-haves actually verifiable? |
| test-strategist | dev-code-reviewer | Is test coverage targeting the right risks? |

### Audit Output Format

```
## Cross-Audit: [Producer Agent] → [Auditor Agent]
**Artifact reviewed**: [File/output name]
**Date**: [ISO date]

### Accuracy Check
- [ ] Claims are factually correct
- [ ] Numbers/data are sourced
- [ ] No contradictions with other team outputs

### Alignment Check
- [ ] Aligns with business goals (exec)
- [ ] Technically feasible (dev)
- [ ] Security compliant (test)
- [ ] Market-accurate (research)

### Challenges
1. [Specific issue with evidence]
2. [Specific issue with evidence]

### Verdict: APPROVED | CHALLENGE_RAISED | BLOCKED
**If CHALLENGE_RAISED**: [Which debate protocol to invoke]
```

---

## 4. Feedback Loops

Agents that consume other agents' outputs MUST provide structured feedback after their work completes. This creates a learning system where upstream agents improve over time.

### Feedback Flow Map

```
research-market-researcher
    ↓ feeds → marketing-content-strategist
    ↓ feeds → sales-prospector
    ↓ feeds → exec-strategist
    ↑ feedback ← marketing: "halal angle resonated 3x better than BPOM — weight future research accordingly"
    ↑ feedback ← sales: "enterprise prospects care about audit trail, not price — adjust competitor analysis"
    ↑ feedback ← exec: "market sizing was accurate but missed franchise segment"

dev-architect
    ↓ feeds → dev-fullstack-engineer (specs)
    ↓ feeds → test-strategist (test targets)
    ↑ feedback ← dev: "spec didn't account for Supabase RLS cascading — add RLS section"
    ↑ feedback ← test: "spec's error codes don't match tRPC conventions"

marketing-content-strategist
    ↓ feeds → marketing-copywriter
    ↓ feeds → marketing-visual-designer
    ↓ feeds → marketing-social-manager
    ↑ feedback ← copywriter: "tone guide was too formal for LinkedIn — Indonesian SMEs respond to casual"
    ↑ feedback ← visual: "brand colors don't have enough contrast for accessibility"
    ↑ feedback ← social: "posting frequency too high — engagement drops after 3x/week"

supervisor
    ↓ scores → ALL teams
    ↑ feedback ← ALL teams: "scoring dimension X is ambiguous" or "rubric doesn't account for Y"
```

### Feedback Format

```
## Feedback: [Consumer] → [Producer]
**Context**: Used [artifact] for [purpose]
**Date**: [ISO date]

### What worked
- [Specific element that was useful and why]

### What was missing or wrong
- [Gap or inaccuracy, with evidence from downstream work]

### Suggested improvement
- [Concrete change for next iteration]

### Impact score: HIGH | MEDIUM | LOW
[How much this affected downstream quality]
```

### Feedback Storage

Feedback files are stored in `.feedback/` at the project level:
```
.feedback/
├── research-to-marketing-2026-04-04.md
├── dev-to-architect-2026-04-04.md
├── supervisor-rubric-calibration-2026-04-04.md
└── feedback-index.md  (summary of all feedback for quick loading)
```

Agents MUST read `.feedback/feedback-index.md` at the start of every task to incorporate past learnings.

---

## 5. Escalation Paths

### Automatic Escalation (No Human Needed)

| Trigger | Escalation |
|---------|-----------|
| Supervisor score < 7.0 after 3 revisions | Escalate to user with full context |
| Security CRITICAL finding | Block feature + notify user immediately |
| Plan-checker rejects plan 3 times | Escalate to dev-architect for re-scoping |
| Verifier finds gaps after 2 fix cycles | Escalate to user — may need requirements change |
| Two agents raise contradictory CHALLENGE_RAISED | Invoke debate protocol automatically |
| Cross-audit BLOCKED verdict | Halt pipeline, invoke debate, resolve before continuing |

### Human Escalation Format

```
## ⚠️ Escalation Required

**Issue**: [1-sentence summary]
**Conflicting agents**: [Agent A] vs [Agent B]
**Attempts to resolve**: [N rounds of debate/revision]

### Agent A's position
[Summary with key evidence]

### Agent B's position
[Summary with key evidence]

### My recommendation
[Supervisor or highest-authority agent's suggestion]

### Decision needed
- Option 1: [Description + trade-off]
- Option 2: [Description + trade-off]
- Option 3: [Description + trade-off]
```

---

## 6. Decision Log

Every resolved debate, override, and escalation gets logged in `.decisions/` at the project level.

```
.decisions/
├── 2026-04-04-single-vs-multi-tenant.md
├── 2026-04-04-payment-priority.md
└── decisions-index.md  (chronological summary for quick loading)
```

### Decision Log Format

```
## Decision: [Title]
**Date**: [ISO date]
**Type**: architecture | priority | technology | security | business
**Participants**: [Agent 1, Agent 2, ...]
**Decided by**: [Authority]

### Context
[Why this decision was needed]

### Options considered
1. [Option + trade-off]
2. [Option + trade-off]

### Decision
[What was chosen and why]

### Accepted risk
[What we're explicitly NOT doing and the consequence]

### Revisit trigger
[Condition that reopens this — e.g., "if we exceed 100 tenants, reconsider multi-tenant"]
```

Agents MUST check `.decisions/decisions-index.md` before proposing solutions that contradict past decisions. If a past decision should be revisited, the agent must explicitly reference it and argue why conditions have changed.

---

## 7. Speed vs Quality Balance

### Default: Quality-First with Speed Constraints

- **Never sacrifice security for speed** — OWASP compliance is non-negotiable
- **Ship incrementally** — A secure, tested MVP beats a complete but unverified product
- **Parallel over sequential** — Run independent agents simultaneously wherever possible
- **Debate is not delay** — A 2-round debate that prevents a bad architecture decision saves weeks of rework
- **Time-box everything** — Debates, revisions, and fix cycles have hard limits

### Speed Optimizations

1. **Parallel audit**: Cross-audits run IN PARALLEL with the next pipeline stage (don't wait for audit to finish before starting next phase)
2. **Async feedback**: Feedback loops are asynchronous — don't block current work for feedback collection
3. **Cached decisions**: Past decisions (in `.decisions/`) prevent re-debating settled questions
4. **Smart escalation**: Auto-resolve when evidence is clear (>80% confidence); only escalate genuine 50/50 calls
5. **Progressive verification**: Quick smoke test first, full verification after — fail fast

---

## 8. Anti-Patterns (What NOT to Do)

1. **No silent disagreement** — If an agent detects a problem, it MUST raise it. Staying quiet to avoid debate is forbidden.
2. **No authority without evidence** — Even the highest-authority agent can't override with "because I said so." Every decision needs cited evidence.
3. **No infinite revision loops** — 3 rounds max for any revision cycle. After that, escalate or accept and move on.
4. **No echo chamber audits** — Never let an agent audit its own output or its team's output. Cross-domain only.
5. **No stale decisions** — Decisions older than 30 days should be reviewed if the codebase has changed significantly.
6. **No debate theater** — Debate exists to surface real trade-offs, not to perform thoroughness. If both options are equally good, flip a coin and move.
7. **No feedback hoarding** — Feedback must be filed within the same session it's generated. Don't accumulate and dump later.

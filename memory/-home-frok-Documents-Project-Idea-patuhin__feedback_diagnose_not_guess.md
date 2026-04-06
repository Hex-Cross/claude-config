---
name: No guessing — verify before and after every fix
description: Never apply speculative fixes. Every fix must have a verified root cause and a verification script proving it works.
type: feedback
---

**RULE: No fix without a diagnosed root cause. No "it should work" without a verification script.**

1. Before ANY fix: run a diagnostic that identifies the exact failure point with evidence
2. After ANY fix: run a verification script that proves all checks pass (✅/❌ format)
3. Never chain multiple speculative fixes hoping one works — that burns tokens
4. When using component libraries, CHECK actual rendered output — don't assume defaults match native HTML
5. Always check the simplest cause first (button type, missing import, wrong URL) before complex causes (auth middleware, session management)

**Why:** User explicitly said "this is my token and you eating it by guessing." Multiple rounds of wrong fixes (middleware, mock auth, DB connection) when the real issue was `type="button"` on a form submit button.

**How to apply:** Before every fix, ask: "What is my EVIDENCE that this is the cause?" If the answer is "I think" or "it might be" — run a diagnostic first.

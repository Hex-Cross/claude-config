---
name: Debug protocol — evidence-first, no guessing
description: Mandatory 4-step diagnostic before any fix attempt — prevents token-wasting guess loops. Apply to ALL projects.
type: feedback
---

**RULE: Never guess. Diagnose with evidence first.**

When something "doesn't work", follow this exact order BEFORE writing any code fix:

**Step 1: Does the UI actually trigger the action?**
- Curl the page, check rendered HTML for correct attributes (`type="submit"`, `href`, event handlers)
- Check if component libraries override HTML defaults (e.g., Base UI Button defaults to `type="button"`, NOT `type="submit"`)
- Check for hydration errors that prevent React from attaching event handlers

**Step 2: Does the request reach the server?**
- Check server logs/terminal for the incoming request
- Test the server action or API route in isolation with a node script

**Step 3: Does the server logic succeed?**
- Run the exact function with same inputs in a node script
- Check DB state before and after
- Verify all external services (Supabase auth, DB connection) work independently

**Step 4: Does the response make it back to the client correctly?**
- Check for unhandled exceptions (try/catch missing)
- Verify error states are displayed to the user (not swallowed)
- Check that redirects/navigation actually fire

**After fixing:** Run an automated verification script that checks ALL steps pass. Never say "it should work" without proof.

**Why:** In the PatuhIn project, a simple `type="button"` bug on a form submit button wasted 5+ fix cycles because we skipped Step 1 and kept guessing at auth/DB issues. The rendered HTML showed the answer immediately.

**How to apply:** This is the FIRST thing to do on any bug report, in any project. Start from the user's screen and work inward. Each step must produce a ✅ or ❌ before moving to the next.

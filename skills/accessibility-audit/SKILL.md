---
name: accessibility-audit
description: Automated WCAG 2.1 AA accessibility audit with axe-core integration, parallel static analysis, keyboard flow testing, and contrast verification. Run on any frontend change.
version: 1.1.0
---

# Accessibility Audit — WCAG 2.1 AA Compliance

## Step 1: Identify UI Changes
```bash
git diff --name-only HEAD 2>/dev/null | grep -E '\.(tsx?|jsx?|vue|svelte|html|css|scss)$'
```
If no UI files changed, report "No UI changes — audit skipped" and exit.

## Step 2: Static Analysis (2 agents IN PARALLEL — model: "opus")

### Agent 1: Structural & Semantic Audit
For each changed file check: semantic HTML elements vs divs, heading hierarchy, lists, tables with `<th scope>`, form labels with `for`/`htmlFor`, page landmarks (`<main>`, `<nav>`, skip links), ARIA attributes (roles, `aria-label`, `aria-expanded`, `aria-live`, `aria-hidden`, `aria-describedby`), no redundant ARIA on native elements.

### Agent 2: Interaction & Visual Audit
Check: all interactive elements focusable, no positive tabIndex, onClick on non-buttons has onKeyDown, Escape closes overlays, focus trap in modals, focus management on open/close/route change, 4.5:1 contrast (3:1 large text), info not by color alone, visible focus indicators, all `<img>` have alt, decorative images `alt=""`, `prefers-reduced-motion` respected, touch targets 44x44px minimum.

## Step 3: Automated axe-core Testing via Playwright

If Playwright MCP is available, navigate to every affected page and inject axe-core:
```javascript
const results = await page.evaluate(async () => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js';
  document.head.appendChild(script);
  await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
  return await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }
  });
});
```
Map each violation to WCAG criterion. Include element selectors and fix suggestions.

If Playwright unavailable: note it was skipped, recommend `@playwright/mcp` installation, note static analysis covers ~60% of WCAG criteria.

## Step 4: Manual Verification Checklist
1. Can entire flow be completed using ONLY keyboard?
2. Focus indicator always visible?
3. Page makes sense read linearly?
4. Zoom to 200% without horizontal scroll or content loss?
5. Animations respect `prefers-reduced-motion`?
6. Touch targets >= 44x44px?

## Output: Accessibility Audit Report
Files audited, method used, findings table (severity/WCAG/location/issue/fix), axe-core results (violations/passes/incomplete), compliance summary. **WCAG 2.1 AA: PASS/FAIL.** Critical + Serious = BLOCKERS.

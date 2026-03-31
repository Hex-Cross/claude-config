---
name: accessibility-audit
description: Automated WCAG 2.1 AA accessibility audit for UI changes — checks keyboard navigation, ARIA labels, color contrast, focus management, screen reader compatibility, and semantic HTML. Run on any frontend change.
---

# Accessibility Audit — WCAG 2.1 AA Compliance

You are executing an accessibility audit on all UI changes in this session. The standard is WCAG 2.1 Level AA — this is a legal requirement in many jurisdictions, not optional.

## Step 1: Identify UI Changes

```bash
git diff --name-only HEAD 2>/dev/null | grep -E '\.(tsx?|jsx?|vue|svelte|html|css|scss)$'
```

If no UI files changed, report "No UI changes — audit skipped" and exit.

## Step 2: Static Analysis (Read every changed UI file)

For each changed file, check:

### Semantic HTML
- [ ] Uses semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<button>`, `<header>`, `<footer>`) instead of generic `<div>` for interactive/structural elements
- [ ] Headings follow hierarchy (h1 > h2 > h3, no skipped levels)
- [ ] Lists use `<ul>`/`<ol>` + `<li>`, not styled divs
- [ ] Tables use `<th>` with `scope` attributes
- [ ] Forms use `<label>` with `for`/`htmlFor` attributes linked to inputs

### ARIA Attributes
- [ ] Interactive custom components have appropriate `role` attributes
- [ ] `aria-label` or `aria-labelledby` on elements without visible text labels
- [ ] `aria-expanded` on collapsible/dropdown triggers
- [ ] `aria-live` regions for dynamic content updates (toasts, notifications, loading states)
- [ ] `aria-hidden="true"` on decorative elements (icons next to text labels)
- [ ] No redundant ARIA (e.g., `role="button"` on a `<button>`)

### Keyboard Navigation
- [ ] All interactive elements are focusable (native elements or `tabIndex={0}`)
- [ ] No positive `tabIndex` values (breaks natural tab order)
- [ ] `onClick` handlers on non-button elements also have `onKeyDown`/`onKeyUp` for Enter/Space
- [ ] Escape key closes modals/dropdowns/popovers
- [ ] Focus is trapped inside open modals (no tabbing out to background)
- [ ] Focus moves to new content when it appears (modal open, route change, accordion expand)
- [ ] Focus returns to trigger when content closes (modal close, dropdown close)

### Color & Contrast
- [ ] Text has minimum 4.5:1 contrast ratio against background (3:1 for large text 18px+)
- [ ] Information is NOT conveyed by color alone (use icons, patterns, or text alongside color)
- [ ] Focus indicators are visible (not `outline: none` without replacement)
- [ ] Links are distinguishable from surrounding text (not just color — underline or other indicator)

### Images & Media
- [ ] All `<img>` have `alt` attributes
- [ ] Decorative images have `alt=""` (empty alt, not missing)
- [ ] Complex images have detailed `alt` text or `aria-describedby`
- [ ] Videos have captions/subtitles (if applicable)

### Forms
- [ ] All inputs have associated labels (visible, not just placeholder)
- [ ] Required fields are marked with `aria-required="true"` or `required`
- [ ] Error messages are associated with inputs via `aria-describedby`
- [ ] Error states are announced to screen readers (aria-live or role="alert")
- [ ] Form validation errors are specific and helpful (not just "invalid input")

### Dynamic Content
- [ ] Loading states are announced (`aria-busy`, `aria-live`)
- [ ] Route changes announce the new page title to screen readers
- [ ] Toasts/notifications use `role="alert"` or `aria-live="polite"`
- [ ] Infinite scroll has keyboard-accessible alternative (pagination or "load more" button)

## Step 3: Automated Checks via Playwright (if available)

If Playwright MCP is available, navigate to affected pages and run:
```javascript
// Inject axe-core for automated accessibility testing
const results = await page.evaluate(async () => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';
  document.head.appendChild(script);
  await new Promise(r => script.onload = r);
  return await axe.run();
});
```

Report violations with element selectors and fix suggestions.

## Step 4: Manual Verification Checklist

For each page/component affected:
1. Can you complete the entire user flow using ONLY keyboard (Tab, Enter, Space, Escape, Arrow keys)?
2. Does the focus indicator always show where you are?
3. Does the page make sense when read linearly (screen reader order)?
4. Can you zoom to 200% without horizontal scrolling or content loss?
5. Do animations respect `prefers-reduced-motion`?

## Output Format

```
## Accessibility Audit Report — WCAG 2.1 AA

### Files Audited
- component/Button.tsx
- pages/Dashboard.tsx

### Findings

| # | Severity | Rule | Location | Issue | Fix |
|---|----------|------|----------|-------|-----|
| 1 | Critical | 1.1.1 | img:23 | Missing alt attribute | Add descriptive alt text |
| 2 | Serious | 2.1.1 | div.onClick:45 | Not keyboard accessible | Use <button> or add onKeyDown |
| 3 | Moderate | 1.4.3 | .subtitle:12 | Contrast ratio 3.2:1 | Darken text to #595959 |

### Compliance Summary
- Critical: X issues (MUST fix)
- Serious: X issues (MUST fix for AA)
- Moderate: X issues (SHOULD fix)
- Minor: X issues (nice to have)

**WCAG 2.1 AA: PASS / FAIL**
```

Critical and Serious issues are BLOCKERS — fix before presenting work.

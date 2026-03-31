---
name: review-arch
description: Review codebase architecture for quality, patterns, and improvement areas. Usage: /review-arch [focus area]
user-invocable: true
---

# Architecture Review: $ARGUMENTS

Perform a focused architecture review using parallel agents.

## Launch 3 Explore Agents IN PARALLEL (model: "opus" — architecture judgment work)

### Agent 1: Modularity & Coupling
Analyze code organization:
- Are module boundaries clear and well-defined?
- Is there circular dependency between modules?
- Are components properly separated (presentation vs logic vs data)?
- Is the dependency direction clean (UI → Logic → Data)?
- Are there god files/components that do too much?
- Score: 1-10 with justification

### Agent 2: Patterns & Consistency
Check pattern adherence:
- Is state management consistent across features?
- Are API calls following the same patterns?
- Is error handling uniform?
- Are naming conventions consistent?
- Is there dead code or unused dependencies?
- Are there conflicting patterns (two ways to do the same thing)?
- Score: 1-10 with justification

### Agent 3: Security & Performance
Review non-functional concerns:
- Authentication/authorization implementation quality
- Input validation and sanitization
- XSS, CSRF, injection prevention
- Sensitive data handling (tokens, PII)
- Bundle size and code splitting effectiveness
- Rendering performance (unnecessary re-renders, missing memoization)
- API call efficiency (deduplication, caching)
- Score: 1-10 with justification

## Synthesize Review

### Architecture Scorecard

```
| Category              | Score | Key Finding                    |
|-----------------------|-------|--------------------------------|
| Modularity & Coupling | X/10  | [one-line summary]             |
| Patterns & Consistency| X/10  | [one-line summary]             |
| Security              | X/10  | [one-line summary]             |
| Performance           | X/10  | [one-line summary]             |
| Overall               | X/10  |                                |
```

### Top 5 Issues (Prioritized)

For each issue:
1. **What**: Description of the problem
2. **Where**: Specific files/modules affected
3. **Impact**: What happens if not addressed
4. **Fix**: Recommended solution
5. **Effort**: Small / Medium / Large

### Quick Wins
List improvements that are high-impact and low-effort.

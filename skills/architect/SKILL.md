---
name: architect
description: Run a comprehensive multi-agent architecture analysis of the current codebase or a specific area. Usage: /architect [area or question]
user-invocable: true
---

# Architecture Analysis: $ARGUMENTS

Perform a comprehensive architecture analysis using parallel agents.

## Step 1: Parallel Exploration

Launch 3 Explore agents IN PARALLEL in a single message:

### Agent 1: Structure & Organization
Explore the codebase structure:
- Directory organization and naming conventions
- Module boundaries and separation of concerns
- Entry points, routing, and navigation flow
- Configuration files and environment setup
- Build system and bundling strategy

### Agent 2: Patterns & Dependencies
Analyze design patterns and dependencies:
- State management approach (Redux, Context, Zustand, etc.)
- API communication layer (REST, GraphQL, WebSocket)
- Authentication and authorization patterns
- Error handling and logging strategies
- Third-party library usage and versions
- Dependency graph between major modules

### Agent 3: Quality & Scalability
Assess code quality and scalability:
- TypeScript usage and type safety coverage
- Test coverage and testing strategies
- Performance patterns (lazy loading, caching, memoization)
- Security patterns (input validation, XSS prevention, CSRF)
- Accessibility compliance
- Internationalization approach

## Step 2: Synthesize Findings

After all 3 agents complete, synthesize their findings into a structured report:

### Architecture Report Format

```
## Architecture Overview
[High-level description of the system]

## Component Map
[Major components and their relationships — use ASCII diagram or describe]

## Design Patterns Found
- Pattern 1: [where and how it's used]
- Pattern 2: [where and how it's used]

## Strengths
1. [What the codebase does well]
2. ...

## Areas for Improvement
1. [Issue] — Impact: High/Medium/Low — Effort: High/Medium/Low
2. ...

## Security Assessment
- [Finding 1]
- [Finding 2]

## Recommended Next Steps
1. [Priority action with rationale]
2. ...
```

## Step 3: Ask User

Present the report and ask if they want to:
- Deep-dive into any specific area
- Create ADRs for recommended changes
- Start implementing improvements

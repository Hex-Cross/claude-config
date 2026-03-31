---
name: adr
description: Create an Architecture Decision Record documenting a technical decision. Usage: /adr [decision topic]
user-invocable: true
---

# Create ADR: $ARGUMENTS

Create an Architecture Decision Record for this technical decision.

## Step 1: Research Context

Launch an Explore agent (model: "sonnet" — read-only exploration) to understand:
- Current state of the codebase related to this decision
- Existing patterns and conventions in use
- Any prior decisions or tech debt related to this topic
- Constraints (tech stack, team size, deadlines, compatibility)

## Step 2: Generate ADR

Check if `docs/adr/` directory exists. If not, create it.

Find the next ADR number by checking existing files in `docs/adr/`.

Write the ADR file as `docs/adr/NNNN-<slugified-topic>.md`:

```markdown
# NNNN. [Decision Title]

**Date**: [today's date]
**Status**: Proposed
**Deciders**: [team/person]

## Context

[What is the issue that we're seeing that is motivating this decision or change?
What forces are at play? Include technical, business, and team considerations.]

## Decision

[What is the change that we're proposing and/or doing?
Be specific about the chosen approach.]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Neutral
- [Side effect that's neither good nor bad]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: ...
- **Cons**: ...
- **Why rejected**: ...

### Alternative 2: [Name]
- **Pros**: ...
- **Cons**: ...
- **Why rejected**: ...

## References

- [Links to relevant docs, issues, or discussions]
```

## Step 3: Present for Review

Show the ADR to the user and ask for feedback before finalizing.

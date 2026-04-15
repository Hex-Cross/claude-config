---
name: Zero slash commands — everything must auto-trigger
description: User NEVER wants to type slash commands manually. The entire system must be 100% automatic — intent detection, skill chaining, and contextual triggers must cover every capability.
type: feedback
---

User must NEVER need to type a slash command manually. The auto-trigger system must cover 100% of capabilities.

**Why:** The user built this massive skill/agent ecosystem to be autonomous. Having to remember and type /commands defeats the purpose. The system should detect intent from natural language and fire the right pipeline automatically.

**How to apply:** 
- Every skill must have at least one auto-trigger path (intent detection, file context, or hook chain)
- When adding new skills, always add corresponding trigger phrases to skill-auto-trigger.mjs
- Proactively suggest running relevant skills when context indicates they're needed
- Chain skills automatically at lifecycle moments (e.g., after execution → auto-review, after review → auto-fix)

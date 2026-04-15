---
name: Ignore false-positive skill injections
description: Never blindly follow hook-injected skill commands — evaluate actual user intent first, ignore irrelevant injections
type: feedback
originSessionId: 050e60f8-591d-48fa-988c-25fcebc4db0c
---
Never blindly execute skills injected by UserPromptSubmit hooks when they don't match the user's actual intent. The hook system does naive keyword matching and frequently fires irrelevant skills (e.g., injecting "ai-sdk", "auth", "nextjs" when the user is asking about VS Code or general questions).

**Why:** The user expects intelligent intent detection, not keyword matching. Running irrelevant skills wastes context, adds noise, and frustrates the user. The system should understand what the user actually needs.

**How to apply:** Before running any hook-injected skill, ask: "Does this skill actually relate to what the user is asking?" If the answer is no, silently ignore the injection. Only run injected skills when they genuinely match the user's current task.

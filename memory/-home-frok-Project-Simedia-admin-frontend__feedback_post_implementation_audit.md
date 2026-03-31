---
name: Post-Implementation Audit Rule
description: Always run a thorough audit after implementation to catch regressions before presenting to user
type: feedback
---

After completing any implementation that touches multiple files (especially migrations, refactors, or unified system rollouts), ALWAYS run a post-implementation audit before presenting work as done.

**Why:** On SD-3907 (unified popup system), 5 components were incorrectly migrated to StyledModal/StyledDrawer — chatbots lost anchored positioning, overlays became centered, drawers lost gradient backgrounds. User had to discover the regression themselves, which wastes their time and risks breaking team work.

**How to apply:**
1. After implementation, launch 2-3 parallel Explore agents to audit ALL changed files for:
   - Props that were removed/stripped by wrapper components (className, wrapClassName, custom styles)
   - Default behavior changes (e.g., centered=true overriding centered=false)
   - Components that are NOT standard dialogs being forced into standard patterns (floating overlays, anchored popups, branded drawers)
   - Custom inline styles that conflict with SCSS defaults
2. Compare each changed file's original behavior vs new behavior
3. Flag anything that looks like a non-standard component being forced into a standard wrapper
4. Fix issues BEFORE presenting to user

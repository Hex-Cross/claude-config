#!/usr/bin/env node
/**
 * skill-auto-trigger.mjs — UserPromptSubmit hook
 *
 * Analyzes user prompts and injects the appropriate skill chain instructions.
 * Routes to the correct workflow based on detected intent and task size.
 *
 * Intent detection → Task sizing → Chain injection
 */

import { readFileSync, mkdirSync, existsSync, writeFileSync, readFileSync as readFile } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

// Safety: never hang
const TIMEOUT = setTimeout(() => process.exit(0), 4500);

let input;
try {
  const raw = readFileSync(0, 'utf-8');
  input = JSON.parse(raw);
} catch {
  process.stdout.write('{}');
  process.exit(0);
}

const prompt = (input.prompt || input.message || '').toLowerCase().trim();
const sessionId = input.session_id || 'unknown';

// Skip empty or very short prompts (under 15 chars catches "ok go", "yes", "sure do it")
if (prompt.length < 15) {
  process.stdout.write('{}');
  process.exit(0);
}

// Bug 2: Skip questions — these are information requests, not task requests
const QUESTION_PREFIXES = ['how ', 'what ', 'why ', 'where ', 'when ', 'can you ', 'could you ', 'explain ', 'tell me '];
if (QUESTION_PREFIXES.some(q => prompt.startsWith(q)) || (prompt.match(/\?/g) || []).length >= 1) {
  process.stdout.write('{}');
  process.exit(0);
}

// --- Session dedup ---
const DEDUP_DIR = join(process.env.HOME || '/tmp', '.claude', 'hooks', 'sessions');
const sessionHash = createHash('sha256').update(sessionId).digest('hex').slice(0, 16);
const dedupFile = join(DEDUP_DIR, `auto-trigger-${sessionHash}.json`);

let seenIntents = {};
try {
  mkdirSync(DEDUP_DIR, { recursive: true });
  if (existsSync(dedupFile)) {
    seenIntents = JSON.parse(readFile(dedupFile, 'utf-8'));
  }
} catch { /* ignore */ }

// --- Intent Detection ---

const INTENTS = {
  feature: {
    phrases: [
      'create a', 'build a', 'add a', 'implement', 'make a', 'i want to',
      'new feature', 'new component', 'new page', 'new endpoint', 'new api',
      'add feature', 'add functionality', 'set up', 'setup', 'scaffold',
      'integrate', 'wire up', 'connect', 'build out', 'develop'
    ],
    allOf: [
      ['want', 'create'], ['need', 'build'], ['want', 'add'],
      ['should', 'have'], ['let', 'make'], ['want', 'implement']
    ],
    noneOf: [
      'fix', 'bug', 'broken', 'error', 'crash', 'not working',
      'audit', 'review', 'check', 'scan', 'analyze'
    ]
  },
  bugfix: {
    phrases: [
      'fix', 'bug', 'broken', 'not working', 'error', 'crash', 'issue',
      'fails', 'failing', 'doesnt work', "doesn't work", 'wrong',
      'unexpected', 'regression', 'debug', 'troubleshoot', 'investigate'
    ],
    noneOf: ['create', 'build', 'new feature', 'add a']
  },
  refactor: {
    phrases: [
      'refactor', 'clean up', 'cleanup', 'reorganize', 'restructure',
      'improve', 'optimize', 'simplify', 'modernize', 'migrate',
      'upgrade', 'update', 'move to', 'switch to', 'convert'
    ],
    noneOf: ['fix a bug', 'create a new', 'build a new']
  },
  audit: {
    phrases: [
      'audit', 'review', 'check', 'scan', 'analyze', 'inspect',
      'security', 'vulnerability', 'performance', 'accessibility',
      'code review', 'architecture review', 'health check'
    ]
  },
  trivial: {
    phrases: [
      'typo', 'rename', 'change the name', 'update the text',
      'change the color', 'change the label', 'fix the typo',
      'update the copy', 'small change', 'quick fix', 'one line',
      'just change', 'just update', 'just rename'
    ]
  }
};

function scoreIntent(intentDef, text) {
  let score = 0;

  // Phrase matching (+6 each)
  for (const phrase of (intentDef.phrases || [])) {
    if (text.includes(phrase)) score += 6;
  }

  // allOf matching (+4 each group)
  for (const group of (intentDef.allOf || [])) {
    if (group.every(term => text.includes(term))) score += 4;
  }

  // noneOf suppression
  for (const term of (intentDef.noneOf || [])) {
    if (text.includes(term)) return -Infinity;
  }

  return score;
}

// Score all intents
const scores = {};
for (const [name, def] of Object.entries(INTENTS)) {
  scores[name] = scoreIntent(def, prompt);
}

// Find winner — prefer trivial on ties so typo-level changes don't get full bugfix chains
let bestIntent = null;
let bestScore = 5; // minimum threshold
for (const [name, score] of Object.entries(scores)) {
  if (score > bestScore || (score === bestScore && score > 5 && name === 'trivial')) {
    bestScore = score;
    bestIntent = name;
  }
}

// If no intent detected, exit silently
if (!bestIntent) {
  process.stdout.write('{}');
  process.exit(0);
}

// --- Task Size Detection ---
function detectSize(text) {
  const largeSignals = ['cross-cutting', 'major refactor', 'entire', 'all files', 'whole codebase',
    'system-wide', 'architecture', 'from scratch', 'full rewrite', 'migration'];
  const mediumSignals = ['multiple files', 'several', 'component and', 'frontend and backend',
    'api and ui', 'database and', 'multi-step', 'across'];
  const smallSignals = ['single file', 'one file', 'just the', 'only the', 'simple', 'small', 'quick'];

  if (largeSignals.some(s => text.includes(s))) return 'large';
  if (mediumSignals.some(s => text.includes(s))) return 'medium';
  if (smallSignals.some(s => text.includes(s))) return 'small';

  // Default: medium for features, small for bugfixes
  if (bestIntent === 'feature') return 'medium';
  if (bestIntent === 'refactor') return 'medium';
  return 'small';
}

const taskSize = bestIntent === 'trivial' ? 'trivial' : detectSize(prompt);

// --- Dedup: skip if same intent already injected this session ---
const dedupKey = `${bestIntent}-${taskSize}`;
if (seenIntents[dedupKey] && (Date.now() - seenIntents[dedupKey]) < 60000) {
  // Exact same intent+size within 1 minute — skip
  process.stdout.write('{}');
  process.exit(0);
}

// Record this injection
seenIntents[dedupKey] = Date.now();
try { writeFileSync(dedupFile, JSON.stringify(seenIntents)); } catch { /* ignore */ }

// --- Build Chain Instructions ---

const CHAINS = {
  feature: {
    trivial: `[auto-trigger] Trivial change detected. Execute directly — lint + type-check after.`,
    small: `[auto-trigger] Small feature detected. Execute this skill chain IN ORDER:
1. /superpowers-writing-plans — plan the implementation
2. Implement the plan
3. /superpowers-code-review — 3-agent review
4. /pre-flight — final 10-gate check

Do NOT skip any step. Do NOT ask for permission between steps — execute the full chain automatically.`,
    medium: `[auto-trigger] Medium feature detected. Execute this MANDATORY skill chain IN ORDER:
1. /superpowers-brainstorming — explore requirements and design
2. engineering:testing-strategy — define test approach BEFORE writing code
3. /superpowers-writing-plans — TDD-style implementation plan
4. /implement — parallel multi-agent implementation
5. /cross-audit — cross-domain challenge (dev output audited by different domain)
6. /red-team — ONLY if changed files include API handlers, auth, payments, DB queries, or user input processing. Skip for UI-only or config changes.
7. design:accessibility-review — if ANY UI files changed (.tsx/.jsx/.css/.html). Full WCAG 2.1 AA audit.
8. engineering:code-review + /superpowers-code-review — double-layer review (plugin + custom)
9. /pre-flight — ultimate 10-gate final check (skip Gate 8 red-team — already ran)
10. engineering:deploy-checklist — pre-merge verification

CRITICAL: Execute ALL steps automatically. Do NOT pause between skills to ask the user.
Only stop for: errors that need user input, credentials, or clarifying ambiguous requirements.
If any gate FAILS: fix the issue, then re-run from that gate forward.
PLUGIN ENHANCEMENT: engineering:testing-strategy runs BEFORE implementation. design:accessibility-review replaces raw accessibility-audit. engineering:code-review adds structured review alongside superpowers-code-review.`,
    large: `[auto-trigger] Large feature detected. Execute this MANDATORY skill chain IN ORDER:
1. product-management:write-spec — formalize requirements into PRD with goals, non-goals, success metrics
2. /superpowers-brainstorming — deep requirements exploration (MUST get user approval on design)
3. engineering:system-design — architecture design for the feature
4. engineering:testing-strategy — define comprehensive test strategy
5. /superpowers-writing-plans — detailed TDD-style plan
6. /implement — parallel multi-agent implementation (use worktree isolation)
7. /cross-audit full — cross-domain challenge on ALL outputs
8. operations:risk-assessment — identify operational risks of the change
9. /red-team — adversarial attack simulation (2 agents)
10. design:accessibility-review — if ANY UI files changed. Full WCAG 2.1 AA.
11. engineering:code-review + /superpowers-code-review — double-layer review
12. /pre-flight — ultimate 10-gate final check (skip Gate 8 red-team — already ran)
13. engineering:deploy-checklist — pre-merge verification
14. engineering:documentation — update technical docs for the change

CRITICAL: Execute ALL steps automatically. Only pause for user approval after step 2 (brainstorming).
If any gate FAILS: fix → re-run from that gate.
Use worktree isolation for implementation (3+ files or risky changes).
PLUGIN ENHANCEMENT: Full plugin chain — spec → design → test strategy → implement → risk → review → deploy → docs.`
  },

  bugfix: {
    trivial: `[auto-trigger] Trivial fix. Fix it directly, then lint + type-check.`,
    small: `[auto-trigger] Bug fix detected. Execute this chain:
1. Investigate root cause (read relevant code, check error messages)
2. Fix the bug
3. /superpowers-code-review — verify fix quality
4. /pre-flight — final check

Execute automatically. Do NOT ask between steps.`,
    medium: `[auto-trigger] Medium bug fix detected. Execute this chain:
1. engineering:debug — structured debugging: reproduce, isolate, diagnose
2. Fix the root cause (not just symptoms)
3. /cross-audit — verify fix doesn't break other domains
4. /red-team — ensure fix doesn't introduce new vulnerabilities
5. engineering:code-review + /superpowers-code-review — double-layer review
6. /pre-flight — final 10-gate check (skip Gate 8 red-team — already ran)

Execute automatically. If engineering:debug identifies root cause, proceed to fix without asking.
PLUGIN ENHANCEMENT: engineering:debug replaces /gsd:debug with structured methodology. engineering:code-review adds formal review.`,
    large: `[auto-trigger] Large/complex bug detected. Execute this chain:
1. engineering:debug — structured debugging with multi-round investigation
2. /superpowers-writing-plans — plan the fix approach
3. Fix implementation (use worktree if cross-cutting)
4. /cross-audit full — cross-domain challenge on the fix
5. operations:risk-assessment — assess operational impact of the fix
6. /red-team — adversarial testing of the fix
7. engineering:code-review + /superpowers-code-review — double-layer review
8. /pre-flight — final 10-gate check (skip Gate 8 red-team — already ran)
9. engineering:deploy-checklist — pre-merge verification

Execute automatically. Only pause if investigation is inconclusive and needs user context.
PLUGIN ENHANCEMENT: Full plugin-enhanced debug chain with risk assessment and deploy checklist.`
  },

  refactor: {
    trivial: `[auto-trigger] Trivial refactor. Do it directly, lint + type-check after.`,
    small: `[auto-trigger] Small refactor detected. Execute this chain:
1. Implement the refactor
2. /dead-code-sweep — clean up any orphaned code
3. /superpowers-code-review — verify quality
4. /pre-flight — final check

Execute automatically.`,
    medium: `[auto-trigger] Medium refactor detected. Execute this chain:
1. engineering:tech-debt — identify and categorize tech debt before refactoring
2. /superpowers-brainstorming — explore the refactor approach
3. /superpowers-writing-plans — plan step by step
4. /implement — parallel execution
5. /cross-audit — cross-domain challenge on refactored code
6. /dead-code-sweep — find orphaned code, unused deps
7. /red-team — ONLY if changed files include API handlers, auth, payments, DB queries, or user input processing. Skip for UI-only or config changes.
8. engineering:code-review + /superpowers-code-review — double-layer review
9. /pre-flight — final 10-gate check (skip Gate 8 red-team — already ran)

Execute automatically. Do NOT pause between steps.
PLUGIN ENHANCEMENT: engineering:tech-debt runs first to map debt landscape. engineering:code-review adds structured review.`,
    large: `[auto-trigger] Large refactor detected. Execute this chain:
1. engineering:tech-debt — full tech debt audit and prioritization
2. engineering:architecture — ADR for the refactor decision
3. /superpowers-brainstorming — explore refactor approach (get user approval)
4. /superpowers-writing-plans — detailed migration plan
5. /implement — parallel execution with worktree isolation
6. /dead-code-sweep — aggressive cleanup
7. /cross-audit full — cross-domain challenge on all changes
8. operations:risk-assessment — operational risk of the refactor
9. /red-team — adversarial testing
10. engineering:code-review + /superpowers-code-review — double-layer review
11. /pre-flight — final 10-gate check (skip Gate 8 red-team — already ran)
12. engineering:deploy-checklist — pre-merge verification
13. engineering:documentation — update architecture docs

Pause after step 3 (brainstorming) for user approval. Then execute rest automatically.
PLUGIN ENHANCEMENT: Full plugin chain — tech debt → ADR → plan → implement → risk → review → deploy → docs.`
  },

  trivial: {
    trivial: `[auto-trigger] Trivial change detected (typo, rename, label update). Execute directly — lint + type-check after. No skill chain needed.`
  },

  audit: {
    trivial: `[auto-trigger] Quick audit requested.`,
    small: `[auto-trigger] Audit requested. Run the appropriate audit skill based on what the user asked for.
- Security → /security-scan
- Architecture → /review-arch
- Accessibility → /accessibility-audit
- Code quality → /superpowers-code-review
- Full audit → /pre-flight`,
    medium: `[auto-trigger] Comprehensive audit requested. Run ALL relevant audit skills:
1. /security-scan — full security analysis
2. engineering:architecture — architecture health evaluation
3. design:accessibility-review — WCAG 2.1 AA audit (if UI exists)
4. engineering:tech-debt — tech debt identification and categorization
5. /dead-code-sweep — cleanup opportunities
6. operations:compliance-tracking — compliance status check
7. /pre-flight — full quality pipeline

Execute all automatically. Present consolidated findings at the end.
PLUGIN ENHANCEMENT: engineering + design + operations plugins provide structured frameworks for each audit dimension.`,
    large: `[auto-trigger] Full system audit requested. Run EVERYTHING:
1. engineering:architecture — deep architecture analysis and ADR review
2. engineering:tech-debt — full tech debt inventory with prioritization
3. /security-scan — 4-agent security sweep
4. design:accessibility-review — comprehensive WCAG 2.1 AA audit
5. operations:compliance-tracking — full compliance status and gaps
6. operations:risk-assessment — operational risk register
7. /dead-code-sweep — unused code/deps analysis
8. engineering:testing-strategy — test coverage gap analysis
9. /gold-standard — model routing compliance
10. /pre-flight — 10-gate quality pipeline
11. data:validate-data — if data pipelines exist, QA the analysis methodology

Execute all automatically. Generate a master report combining all findings.
PLUGIN ENHANCEMENT: 7 plugin skills provide professional audit frameworks across architecture, debt, compliance, risk, accessibility, testing, and data quality.`
  }
};

// Get the chain for this intent + size
const chain = CHAINS[bestIntent]?.[taskSize];
if (!chain) {
  process.stdout.write('{}');
  process.exit(0);
}

// --- Model routing reminder ---
const modelReminder = `
[model-routing] Remember: Explore/Research agents → model: "sonnet". Planning/Coding/Security/Testing/Review agents → model: "opus".`;

const context = `${chain}
${modelReminder}
<!-- autoTrigger: {"intent":"${bestIntent}","size":"${taskSize}","score":${bestScore}} -->`;

clearTimeout(TIMEOUT);
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: context
  }
}));

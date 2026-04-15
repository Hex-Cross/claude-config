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
if (QUESTION_PREFIXES.some(q => prompt.startsWith(q)) || (prompt.match(/\?/g) || []).length >= 2) {
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
  },
  research: {
    phrases: [
      'research', 'investigate market', 'market analysis', 'competitor',
      'landscape', 'trend', 'opportunity', 'market size', 'tam sam som',
      'competitive analysis', 'industry', 'benchmark', 'compare providers',
      'evaluate options', 'pros and cons', 'debate', 'bull bear',
      'what are the options', 'explore alternatives'
    ],
    allOf: [
      ['find', 'out'], ['look', 'into'], ['dig', 'into'],
      ['research', 'about'], ['compare', 'between']
    ],
    noneOf: ['fix', 'bug', 'implement', 'build', 'create']
  },
  testing: {
    phrases: [
      'test', 'write tests', 'add tests', 'test coverage', 'e2e test',
      'unit test', 'integration test', 'test suite', 'playwright',
      'run tests', 'test this', 'api test', 'load test', 'performance test',
      'contract test', 'storybook', 'visual regression', 'test strategy'
    ],
    noneOf: ['fix', 'bug', 'create a new feature']
  },
  deploy: {
    phrases: [
      'deploy', 'deployment', 'push to production', 'ship', 'release',
      'go live', 'ci/cd', 'pipeline', 'docker', 'infrastructure',
      'staging', 'preview', 'rollback', 'environment', 'vercel deploy',
      'production', 'devops', 'monitoring', 'health check endpoint'
    ],
    noneOf: ['fix deploy', 'deploy bug']
  },
  marketing: {
    phrases: [
      'linkedin', 'blog post', 'social media', 'content', 'marketing',
      'campaign', 'seo', 'copy', 'copywriting', 'brand', 'promo',
      'newsletter', 'email campaign', 'ad copy', 'content calendar',
      'growth', 'engagement', 'post about', 'write a post', 'carousel'
    ],
    noneOf: ['fix', 'bug', 'implement']
  },
  sales: {
    phrases: [
      'prospect', 'pipeline', 'proposal', 'pitch', 'outreach',
      'cold email', 'lead', 'sales', 'deal', 'client', 'pricing',
      'quote', 'sow', 'rfp', 'objection', 'follow up', 'dm',
      'target list', 'icp', 'buyer persona'
    ],
    noneOf: ['fix', 'bug', 'implement']
  },
  executive: {
    phrases: [
      'strategy', 'okr', 'roadmap', 'briefing', 'board', 'investor',
      'stakeholder', 'decision matrix', 'roi', 'revenue', 'pricing model',
      'financial', 'forecast', 'budget', 'burn rate', 'quarterly review',
      'executive summary', 'business plan', 'go to market', 'gtm',
      'strategic', 'quarterly', 'business strategy'
    ],
    allOf: [
      ['strategy', 'review'], ['quarterly', 'review'], ['okr', 'update'],
      ['business', 'decision'], ['revenue', 'model']
    ],
    noneOf: ['fix', 'bug', 'implement']
  },
  database: {
    phrases: [
      'schema', 'migration', 'database', 'table', 'index', 'query',
      'prisma', 'drizzle', 'sql', 'seed data', 'db', 'foreign key',
      'relation', 'orm', 'slow query', 'optimize query', 'data model'
    ],
    allOf: [
      ['database', 'schema'], ['db', 'migration'], ['data', 'model']
    ],
    noneOf: ['fix the ui', 'frontend', 'architecture decision', 'adr', 'decision record']
  },
  documentation: {
    phrases: [
      'document', 'documentation', 'readme', 'adr', 'changelog',
      'architecture decision', 'decision record', 'write docs', 'update docs',
      'api docs', 'technical spec', 'runbook', 'onboarding doc'
    ],
    allOf: [
      ['architecture', 'decision'], ['decision', 'record'], ['write', 'docs'],
      ['update', 'docs']
    ],
    noneOf: ['fix', 'bug']
  },
  dependency: {
    phrases: [
      'dependency', 'dependencies', 'outdated', 'npm audit', 'vulnerable',
      'update packages', 'upgrade packages', 'security advisory',
      'deprecated package', 'node_modules', 'package.json',
      'lock file', 'version bump', 'breaking change', 'packages'
    ],
    allOf: [
      ['update', 'packages'], ['upgrade', 'packages'], ['check', 'packages'],
      ['audit', 'packages'], ['all', 'packages']
    ]
  },
  indonesian: {
    phrases: [
      'halal', 'bpjph', 'sihalal', 'sertifikasi halal', 'halal certification',
      'ppn', 'pph', 'coretax', 'e-faktur', 'pajak', 'tax indonesia',
      'bpjs', 'thr', 'severance', 'indonesian tax', 'indonesian compliance',
      'xendit', 'gopay', 'ovo', 'dana', 'qris', 'virtual account',
      'whatsapp', 'wa business', 'whatsapp api', 'whatsapp template',
      'bahasa', 'indonesian sme', 'umkm',
      'bpom', 'obat', 'kosmetik', 'makanan', 'food registration', 'drug registration',
      'nib', 'oss', 'kbli', 'business license', 'izin usaha', 'sertifikat standar',
      'bank indonesia', 'bi reporting', 'pbi', 'sknbi', 'rtgs', 'e-money', 'aml',
      'lhbu', 'ppatk', 'fintech compliance'
    ],
    allOf: [
      ['halal', 'compliance'], ['tax', 'indonesia'], ['whatsapp', 'integration'],
      ['payment', 'indonesia'], ['xendit', 'payment'], ['bpom', 'registration'],
      ['business', 'license'], ['bank', 'indonesia'], ['fintech', 'compliance']
    ]
  },
  observability: {
    phrases: [
      'sentry', 'error tracking', 'monitoring', 'alerting', 'observability',
      'error boundary', 'crash report', 'uptime', 'health check',
      'logging', 'trace', 'apm', 'error rate', 'incident'
    ],
    noneOf: ['fix', 'bug', 'create']
  },
  localization: {
    phrases: [
      'i18n', 'localization', 'translation', 'translate', 'multilingual',
      'bilingual', 'bahasa indonesia', 'locale', 'internationalization',
      'language switch', 'translated', 'string extraction'
    ]
  },
  apidocs: {
    phrases: [
      'openapi', 'swagger', 'api documentation', 'api docs', 'api spec',
      'api reference', 'redoc', 'api schema', 'endpoint documentation'
    ],
    allOf: [
      ['api', 'documentation'], ['api', 'docs'], ['api', 'spec']
    ]
  },
  dbmigration: {
    phrases: [
      'migration', 'migrate database', 'schema change', 'alter table',
      'add column', 'drop column', 'rollback migration', 'migration file',
      'drizzle migrate', 'prisma migrate', 'db push'
    ],
    allOf: [
      ['database', 'migration'], ['schema', 'change'], ['migration', 'file']
    ],
    noneOf: ['architecture decision', 'adr']
  },
  crossreview: {
    phrases: [
      'cross review', 'cross-review', 'review this output', 'challenge this',
      'review each other', 'peer review', 'second opinion', 'double check',
      'verify this work', 'critique this', 'find problems'
    ],
    allOf: [
      ['review', 'work'], ['check', 'quality'], ['find', 'problems']
    ]
  },
  agentdebate: {
    phrases: [
      'debate', 'argue', 'pros and cons', 'should we use', 'which is better',
      'compare approaches', 'tradeoff', 'trade-off', 'advocate vs',
      'devil advocate', 'for and against', 'weigh options', 'or should',
      'versus', ' vs ', ' or '
    ],
    allOf: [
      ['should', 'we', 'use'], ['which', 'better'], ['pros', 'cons'],
      ['compare', 'vs'], ['should', 'use', 'or']
    ],
    noneOf: ['fix', 'bug', 'implement', 'build']
  },
  privacy: {
    phrases: [
      'privacy', 'pii', 'personal data', 'gdpr', 'uu pdp', 'data protection',
      'consent', 'data retention', 'right to delete', 'right to erasure',
      'data breach', 'data leak', 'sensitive data', 'encrypt pii',
      'compliance scan', 'privacy audit', 'data inventory', 'dpia',
      'cross-border transfer', 'data subject rights'
    ],
    allOf: [
      ['personal', 'data'], ['data', 'protection'], ['privacy', 'compliance'],
      ['data', 'retention'], ['consent', 'management']
    ],
    noneOf: ['fix', 'bug', 'create a new']
  },
  feedback: {
    phrases: [
      'customer feedback', 'user feedback', 'support tickets', 'nps',
      'what are users saying', 'what customers want', 'customer complaints',
      'churn', 'churn signals', 'customer sentiment', 'intercom',
      'support conversations', 'customer satisfaction', 'csat',
      'user research', 'voice of customer', 'feedback analysis',
      'ticket triage', 'support triage'
    ],
    allOf: [
      ['customer', 'feedback'], ['user', 'feedback'], ['support', 'tickets'],
      ['customer', 'saying'], ['users', 'complaining']
    ],
    noneOf: ['fix', 'bug', 'implement', 'build']
  },
  notification: {
    phrases: [
      'notify', 'notification', 'alert the team', 'send alert',
      'slack message', 'discord message', 'slack webhook', 'discord webhook',
      'team notification', 'send notification', 'alert channel',
      'notify slack', 'notify discord', 'webhook setup'
    ],
    allOf: [
      ['notify', 'team'], ['send', 'alert'], ['slack', 'message'],
      ['discord', 'message'], ['alert', 'channel']
    ]
  },
  experiment: {
    phrases: [
      'a/b test', 'ab test', 'experiment', 'feature flag', 'variant',
      'split test', 'controlled experiment', 'conversion rate',
      'statistical significance', 'hypothesis test', 'growthbook',
      'launchdarkly', 'feature toggle', 'experiment design',
      'which version performs', 'test variant'
    ],
    allOf: [
      ['a/b', 'test'], ['feature', 'flag'], ['split', 'test'],
      ['experiment', 'design'], ['which', 'version', 'better']
    ],
    noneOf: ['fix', 'bug']
  },
  resilience: {
    phrases: [
      'chaos test', 'chaos engineering', 'resilience', 'fault tolerance',
      'failure simulation', 'what happens if', 'service goes down',
      'network failure', 'circuit breaker', 'graceful degradation',
      'disaster recovery', 'failover', 'mutation test', 'mutation testing',
      'stryker', 'test quality', 'survived mutants'
    ],
    allOf: [
      ['chaos', 'test'], ['service', 'down'], ['network', 'failure'],
      ['mutation', 'test'], ['test', 'quality']
    ],
    noneOf: ['fix', 'bug', 'create']
  },
  opshealth: {
    phrases: [
      'app health', 'application health', 'deployment health', 'ops report',
      'system status', 'error rate', 'uptime report', 'latency report',
      'health dashboard', 'ops check', 'production health',
      'are there errors', 'is the app healthy', 'deployment status',
      'post-deploy check', 'after deploy'
    ],
    allOf: [
      ['app', 'health'], ['deployment', 'health'], ['error', 'rate'],
      ['production', 'health'], ['system', 'status']
    ],
    noneOf: ['fix', 'bug', 'create', 'build']
  },
  sync: {
    phrases: [
      'sync linear', 'sync jira', 'sync notion', 'sync config',
      'linear sync', 'jira sync', 'notion sync', 'config sync',
      'sync issues', 'sync tickets', 'sync tasks', 'sync knowledge',
      'push to linear', 'pull from linear', 'push to jira', 'pull from jira',
      'push to notion', 'pull from notion', 'propagate config',
      'sync across projects', 'update all projects'
    ],
    allOf: [
      ['sync', 'linear'], ['sync', 'jira'], ['sync', 'notion'],
      ['sync', 'config'], ['sync', 'issues'], ['sync', 'tickets'],
      ['propagate', 'config']
    ]
  },
  workflow: {
    phrases: [
      'resume work', 'continue where', 'pick up where', 'what is next',
      "what's next", 'next step', 'what should i do', 'show progress',
      'project progress', 'pause work', 'save context', 'save progress',
      'ship it', 'create pr', 'merge it', 'open pull request',
      'new project', 'start fresh', 'initialize project',
      'new milestone', 'close milestone', 'finish milestone',
      'plan the phase', 'plan phase', 'execute phase', 'run phase',
      'verify phase', 'verify work', 'check what we built',
      'add to backlog', 'review backlog', 'check todos',
      'map the codebase', 'scan codebase', 'understand the code',
      'how is the project', 'project status', 'session report'
    ],
    allOf: [
      ['resume', 'work'], ['continue', 'where'], ['what', 'next'],
      ['show', 'progress'], ['pause', 'work'], ['ship', 'it'],
      ['create', 'pr'], ['new', 'project'], ['plan', 'phase'],
      ['execute', 'phase'], ['verify', 'work'], ['map', 'codebase'],
      ['check', 'todos'], ['project', 'status']
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
3. /cross-review — lightweight single cross-domain agent challenge (security lens)
4. /superpowers-code-review — 3-agent review
5. /pre-flight — final 10-gate check

Do NOT skip any step. Do NOT ask for permission between steps — execute the full chain automatically.`,
    medium: `[auto-trigger] Medium feature detected. Execute this MANDATORY skill chain IN ORDER:
1. /superpowers-brainstorming — explore requirements and design
2. engineering:testing-strategy — define test approach BEFORE writing code
3. /superpowers-writing-plans — TDD-style implementation plan
4. /implement — parallel multi-agent implementation
5. TEAM REVIEW PHASE — Spawn an agent team for collaborative review:
   - Teammate "security-reviewer": audit for OWASP Top 10, injection, auth bypass, data exposure
   - Teammate "quality-reviewer": check code quality, conventions, edge cases, error handling
   - Teammate "architecture-reviewer": verify design patterns, separation of concerns, scalability
   Instruct teammates to MESSAGE EACH OTHER to discuss findings and challenge disagreements.
   Wait for all teammates to report. Synthesize their joint findings.
6. Fix ALL issues found by the review team before proceeding.
7. design:accessibility-review — if ANY UI files changed (.tsx/.jsx/.css/.html). Full WCAG 2.1 AA audit.
8. /pre-flight — ultimate 10-gate final check
9. engineering:deploy-checklist — pre-merge verification

CRITICAL: Execute ALL steps automatically. Do NOT pause between skills to ask the user.
Only stop for: errors that need user input, credentials, or clarifying ambiguous requirements.
If any gate FAILS: fix the issue, then re-run from that gate forward.
AGENT TEAMS: Step 5 uses Agent Teams — teammates communicate directly and cross-check each other's findings before reporting back.`,
    large: `[auto-trigger] Large feature detected. Execute this MANDATORY skill chain IN ORDER:
1. product-management:write-spec — formalize requirements into PRD with goals, non-goals, success metrics
2. /superpowers-brainstorming — deep requirements exploration (MUST get user approval on design)
3. engineering:system-design — architecture design for the feature
4. engineering:testing-strategy — define comprehensive test strategy
5. /superpowers-writing-plans — detailed TDD-style plan
6. /implement — parallel multi-agent implementation (use worktree isolation)
7. TEAM REVIEW PHASE — Spawn a FULL agent team for adversarial review:
   - Teammate "security-auditor": OWASP Top 10, injection, auth bypass, data exposure, red-team attack simulation
   - Teammate "quality-reviewer": code quality, conventions, edge cases, error handling, test coverage
   - Teammate "architecture-reviewer": design patterns, scalability, separation of concerns, API contracts
   - Teammate "ops-reviewer": operational risk, deployment safety, monitoring gaps, rollback plan
   Instruct ALL teammates to MESSAGE EACH OTHER — debate disagreements, challenge assumptions, cross-check findings.
   Wait for all teammates to report. Synthesize joint findings into a single review document.
8. Fix ALL issues found by the review team.
9. design:accessibility-review — if ANY UI files changed. Full WCAG 2.1 AA.
10. /pre-flight — ultimate 10-gate final check
11. engineering:deploy-checklist — pre-merge verification
12. engineering:documentation — update technical docs for the change

CRITICAL: Execute ALL steps automatically. Only pause for user approval after step 2 (brainstorming).
If any gate FAILS: fix → re-run from that gate.
Use worktree isolation for implementation (3+ files or risky changes).
AGENT TEAMS: Step 7 uses Agent Teams with 4 teammates in adversarial mode — they argue, challenge, and cross-check before reporting.`
  },

  bugfix: {
    trivial: `[auto-trigger] Trivial fix. Fix it directly, then lint + type-check.`,
    small: `[auto-trigger] Bug fix detected. Execute this chain:
1. Investigate root cause (read relevant code, check error messages)
2. Fix the bug
3. /cross-review — lightweight single cross-domain agent challenge (verify fix doesn't break other areas)
4. /superpowers-code-review — verify fix quality
5. /pre-flight — final check

Execute automatically. Do NOT ask between steps.`,
    medium: `[auto-trigger] Medium bug fix detected. Execute this chain:
1. engineering:debug — structured debugging: reproduce, isolate, diagnose
2. Fix the root cause (not just symptoms)
3. TEAM REVIEW PHASE — Spawn an agent team to verify the fix:
   - Teammate "regression-checker": verify fix doesn't break other areas, check related test coverage
   - Teammate "security-reviewer": ensure fix doesn't introduce new vulnerabilities
   Instruct teammates to MESSAGE EACH OTHER to cross-check findings.
4. Fix any issues found by the review team.
5. /pre-flight — final 10-gate check

Execute automatically. If engineering:debug identifies root cause, proceed to fix without asking.
AGENT TEAMS: Step 3 uses Agent Teams — reviewers collaborate directly to catch regressions and security issues.`,
    large: `[auto-trigger] Large/complex bug detected. Execute this chain:
1. engineering:debug — structured debugging with multi-round investigation
2. /superpowers-writing-plans — plan the fix approach
3. Fix implementation (use worktree if cross-cutting)
4. TEAM REVIEW PHASE — Spawn a FULL agent team for adversarial fix review:
   - Teammate "regression-checker": verify fix doesn't break other areas, trace all affected code paths
   - Teammate "security-auditor": ensure fix doesn't introduce new vulnerabilities, red-team the fix
   - Teammate "ops-reviewer": assess operational impact, rollback plan, monitoring gaps
   Instruct ALL teammates to MESSAGE EACH OTHER — debate, challenge, cross-check.
5. Fix ALL issues found by the review team.
6. /pre-flight — final 10-gate check
7. engineering:deploy-checklist — pre-merge verification

Execute automatically. Only pause if investigation is inconclusive and needs user context.
AGENT TEAMS: Step 4 uses Agent Teams with 3 teammates in adversarial mode — they argue and cross-check the fix before it ships.`
  },

  refactor: {
    trivial: `[auto-trigger] Trivial refactor. Do it directly, lint + type-check after.`,
    small: `[auto-trigger] Small refactor detected. Execute this chain:
1. Implement the refactor
2. /dead-code-sweep — clean up any orphaned code
3. /cross-review — lightweight single cross-domain agent challenge (verify refactor doesn't break contracts)
4. /superpowers-code-review — verify quality
5. /pre-flight — final check

Execute automatically.`,
    medium: `[auto-trigger] Medium refactor detected. Execute this chain:
1. engineering:tech-debt — identify and categorize tech debt before refactoring
2. /superpowers-brainstorming — explore the refactor approach
3. /superpowers-writing-plans — plan step by step
4. /implement — parallel execution
5. /cross-review — cross-domain challenge on refactored code
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
7. /cross-review full — cross-domain challenge on all changes
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

  research: {
    trivial: `[auto-trigger] Quick research. Use WebSearch/WebFetch to answer, then summarize findings.`,
    small: `[auto-trigger] Research task detected. Route to the best skill:
- Market/industry → /research-landscape
- Competitor → /research-competitor-watch
- Idea evaluation → /research-debate
- Business opportunity → /research-opportunity
- Lead finding → use sales-prospector agent

Execute the matching skill automatically.`,
    medium: `[auto-trigger] Research project detected. Run the relevant research skills:
1. Identify research type and run matching skill (/research-landscape, /research-competitor-watch, /research-debate, /research-opportunity)
2. /supervisor-review — quality gate on research output
Execute automatically.`,
    large: `[auto-trigger] Deep research requested. Run comprehensive analysis:
1. /research-landscape — broad market scan
2. /research-competitor-watch — competitive intelligence
3. /research-opportunity — opportunity deep-dive
4. /supervisor-review — quality gate
5. /exec-briefing — synthesize into executive summary
Execute all automatically.`
  },

  testing: {
    trivial: `[auto-trigger] Quick test. Write and run the test directly.`,
    small: `[auto-trigger] Testing task detected. Route to the best skill:
- E2E/user flows → /test-e2e
- API endpoints → /test-api
- Performance → /test-performance
- Visual → /test-storybook
- Accessibility → /accessibility-audit
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Test suite work detected. Execute:
1. /test-suite — full orchestrated test run (strategist assigns to specialized agents)
2. Fix any failures
3. /pre-flight — verify all gates pass
Execute automatically.`,
    large: `[auto-trigger] Comprehensive testing requested. Execute full pipeline:
1. /test-suite — strategist analyzes app, spawns all test agents
2. /test-ci — generate CI pipeline config
3. /pre-flight — final quality gates
Execute automatically.`
  },

  deploy: {
    trivial: `[auto-trigger] Quick deploy check. Run /pre-flight then suggest deploy command.`,
    small: `[auto-trigger] Deployment task detected. Execute:
1. /pre-flight — ensure code is production-ready
2. /dev-deploy — generate deployment config and checklist
Execute automatically.`,
    medium: `[auto-trigger] Deployment pipeline work detected. Execute:
1. /pre-flight — full quality gates
2. /dev-deploy — Docker, CI/CD, monitoring setup
3. /test-ci — CI pipeline generation
Execute automatically.`,
    large: `[auto-trigger] Full infrastructure setup detected. Execute:
1. /dev-scaffold — project scaffolding if needed
2. /dev-deploy — full infrastructure setup
3. /test-ci — CI/CD pipeline
4. /security-scan — pre-deploy security sweep
5. /pre-flight — final gates
Execute automatically.`
  },

  marketing: {
    trivial: `[auto-trigger] Quick marketing task. Execute directly.`,
    small: `[auto-trigger] Marketing content detected. Route to best skill:
- LinkedIn post → /marketing-post
- Campaign → /marketing-campaign
- Video → /promo-video
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Marketing project detected. Execute:
1. /marketing-campaign — full multi-post campaign
2. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Major marketing initiative. Execute:
1. /research-landscape — market context
2. /marketing-campaign — full campaign creation
3. /supervisor-review — quality gate on each piece
Execute automatically.`
  },

  sales: {
    trivial: `[auto-trigger] Quick sales task. Execute directly.`,
    small: `[auto-trigger] Sales task detected. Route to best skill:
- Find prospects → /sales-prospect
- Write outreach → /sales-outreach
- Pipeline report → /sales-pipeline
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Sales project detected. Execute:
1. /sales-prospect — full prospecting pipeline
2. /sales-outreach — personalized sequences
3. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Full sales pipeline setup. Execute:
1. /research-landscape — market context
2. /sales-prospect — ICP, scoring, target lists
3. /sales-outreach — multi-channel sequences
4. /sales-pipeline — pipeline tracking setup
5. /supervisor-review — quality gate
Execute automatically.`
  },

  executive: {
    trivial: `[auto-trigger] Quick executive task. Execute directly.`,
    small: `[auto-trigger] Executive task detected. Route to best skill:
- Decision analysis → /exec-decision
- Strategy/OKR → /exec-strategy
- Briefing → /exec-briefing
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Strategic planning detected. Execute:
1. Match to skill (/exec-strategy, /exec-decision, /exec-briefing)
2. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Major strategic initiative. Execute:
1. /research-landscape — market context
2. /exec-strategy — full strategic planning
3. /exec-decision — decision framework
4. /exec-briefing — stakeholder communication
5. /supervisor-review — quality gate
Execute automatically.`
  },

  database: {
    trivial: `[auto-trigger] Quick database change. Execute directly, verify with type-check.`,
    small: `[auto-trigger] Database task detected. Use dev-database-engineer agent for schema design, migrations, query optimization. Execute automatically.`,
    medium: `[auto-trigger] Database project detected. Execute:
1. Use dev-database-engineer agent for schema/migration design
2. Implement the changes
3. /superpowers-code-review — review
4. /pre-flight — final check
Execute automatically.`,
    large: `[auto-trigger] Major database work detected. Execute:
1. Use dev-architect agent for data model design
2. Use dev-database-engineer agent for implementation
3. /security-scan — check for SQL injection, data exposure
4. /superpowers-code-review — review
5. /pre-flight — final gates
Execute automatically.`
  },

  documentation: {
    trivial: `[auto-trigger] Quick doc update. Execute directly.`,
    small: `[auto-trigger] Documentation task detected. Route:
- Architecture decision → /adr
- Project docs → /gsd-docs-update
- General docs → write directly
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Documentation project detected. Execute:
1. Match to skill (/adr, /gsd-docs-update)
2. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Major documentation effort. Execute:
1. /gsd-map-codebase — understand the codebase first
2. /gsd-docs-update — generate/update documentation
3. /supervisor-review — quality gate
Execute automatically.`
  },

  dependency: {
    trivial: `[auto-trigger] Quick dependency check. Run npm audit or check outdated packages.`,
    small: `[auto-trigger] Dependency task detected. Execute:
1. Run \`npm audit\` and \`npm outdated\` (or pnpm/yarn equivalent)
2. Report vulnerabilities and outdated packages
3. Suggest safe updates
Execute automatically.`,
    medium: `[auto-trigger] Dependency audit detected. Execute:
1. Run full dependency audit (npm audit, outdated check)
2. Check for deprecated packages
3. Create upgrade plan for breaking changes
4. /security-scan — verify no new vulnerabilities introduced
Execute automatically.`,
    large: `[auto-trigger] Major dependency upgrade detected. Execute:
1. Full audit of all dependencies
2. /superpowers-writing-plans — plan the upgrade path
3. Implement upgrades incrementally
4. /test-suite — verify nothing breaks
5. /pre-flight — final gates
Execute automatically.`
  },

  audit: {
    trivial: `[auto-trigger] Quick audit requested.`,
    small: `[auto-trigger] Audit requested. Run the appropriate audit skill based on what the user asked for.
- Security → /security-scan
- Architecture → /architect
- Accessibility → /accessibility-audit
- Code quality → /superpowers-code-review
- Dead code → /dead-code-sweep
- Token waste → /token-guard
- Ecosystem health → /ecosystem-audit
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
  },

  indonesian: {
    trivial: `[auto-trigger] Indonesian market task. Execute directly.`,
    small: `[auto-trigger] Indonesian market task detected. Route to best skill:
- Halal certification / BPJPH / sertifikasi halal → /halal-compliance
- Tax / PPh / PPN / Coretax / e-Faktur / BPJS / THR → /indonesia-tax
- Xendit / payments / QRIS / VA / e-wallets → /xendit-integrate
- WhatsApp / WA Business / Bahasa templates → /whatsapp-flow
- BPOM / food registration / drug registration / cosmetics → /bpom-compliance
- NIB / OSS / KBLI / business license / izin usaha → /nib-oss
- Bank Indonesia / BI reporting / PBI / SKNBI / RTGS / e-money / AML / fintech compliance → /bi-reporting
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Indonesian market project detected. Route to matching skill(s):
- Halal → /halal-compliance
- Tax → /indonesia-tax
- Payments → /xendit-integrate
- WhatsApp → /whatsapp-flow
- BPOM → /bpom-compliance
- Business licensing → /nib-oss
- Fintech/BI → /bi-reporting
Then run /superpowers-code-review and /pre-flight after implementation.`,
    large: `[auto-trigger] Major Indonesian market feature. Execute:
1. Route to ALL matching domain skill(s) — may need multiple (e.g., halal + BPOM for food, tax + BI for fintech)
2. /privacy-scan — Indonesian personal data (UU PDP) compliance
3. /security-scan — compliance data requires security audit
4. /superpowers-code-review — review
5. /pre-flight — final gates
Execute automatically.`
  },

  observability: {
    trivial: `[auto-trigger] Quick monitoring task. Execute directly.`,
    small: `[auto-trigger] Observability task detected. Route:
- Error tracking setup → /sentry-integrate
- Monitoring/alerting → implement directly
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Observability project detected. Execute:
1. /sentry-integrate — error tracking setup
2. Implement monitoring/alerting
3. /superpowers-code-review — review
Execute automatically.`,
    large: `[auto-trigger] Full observability setup. Execute:
1. /sentry-integrate — error tracking
2. Implement health checks, metrics, dashboards
3. /security-scan — verify no sensitive data in logs
4. /pre-flight — final gates
Execute automatically.`
  },

  localization: {
    trivial: `[auto-trigger] Quick translation task. Execute directly.`,
    small: `[auto-trigger] Localization task detected. Run /i18n-sync to scan, extract, and generate translation files. Execute automatically.`,
    medium: `[auto-trigger] Localization project detected. Execute:
1. /i18n-sync — full string extraction and translation file generation
2. /superpowers-code-review — review
Execute automatically.`,
    large: `[auto-trigger] Major localization effort. Execute:
1. /i18n-sync — comprehensive extraction and translation
2. /accessibility-audit — verify i18n doesn't break accessibility
3. /pre-flight — final gates
Execute automatically.`
  },

  apidocs: {
    trivial: `[auto-trigger] Quick API doc update. Execute directly.`,
    small: `[auto-trigger] API documentation task detected. Run /api-docs to scan routes and generate OpenAPI spec. Execute automatically.`,
    medium: `[auto-trigger] API documentation project detected. Execute:
1. /api-docs — full OpenAPI spec generation
2. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Comprehensive API documentation. Execute:
1. /api-docs — full spec generation with drift detection
2. /supervisor-review — quality gate
Execute automatically.`
  },

  dbmigration: {
    trivial: `[auto-trigger] Quick migration. Execute directly with type-check.`,
    small: `[auto-trigger] Database migration detected. Run /db-migrate for safe migration generation with rollback scripts. Execute automatically.`,
    medium: `[auto-trigger] Database migration project detected. Execute:
1. /db-migrate — generate migrations with safety analysis
2. /security-scan — check for data exposure
3. /superpowers-code-review — review
Execute automatically.`,
    large: `[auto-trigger] Major schema migration. Execute:
1. /db-migrate — full migration with safety analysis and rollback
2. /security-scan — data security audit
3. /superpowers-code-review — review
4. /pre-flight — final gates
Execute automatically.`
  },

  crossreview: {
    trivial: `[auto-trigger] Run /cross-review on the last output. Quick cross-domain check.`,
    small: `[auto-trigger] Cross-review requested. Run /cross-review to spawn 2 cross-domain reviewers that challenge the work from different expertise perspectives. Execute automatically.`,
    medium: `[auto-trigger] Cross-review requested. Run /cross-review with full adversarial review — 2 cross-domain agents challenge the work, max 2 revision rounds. Execute automatically.`,
    large: `[auto-trigger] Full cross-review requested. Run /cross-review on all major outputs in this session. Execute automatically.`
  },

  agentdebate: {
    trivial: `[auto-trigger] Quick comparison. List pros/cons directly.`,
    small: `[auto-trigger] Debate requested. Run /debate — spawn advocate (FOR) and challenger (AGAINST) agents, then a judge resolves conflicts. Execute automatically.`,
    medium: `[auto-trigger] Structured debate requested. Run /debate with full adversarial positions, evidence, and judge ruling. Execute automatically.`,
    large: `[auto-trigger] Major decision debate. Run /debate with comprehensive positions, then /cross-review on the judge's ruling for additional scrutiny. Execute automatically.`
  },

  privacy: {
    trivial: `[auto-trigger] Quick privacy check. Grep for PII patterns (email, phone, nik, npwp) in the relevant files. Report findings.`,
    small: `[auto-trigger] Privacy scan requested. Run /privacy-scan — PII discovery + UU PDP/GDPR compliance check. Execute automatically.`,
    medium: `[auto-trigger] Privacy audit detected. Execute:
1. /privacy-scan — full PII discovery + compliance analysis
2. /security-scan — verify encryption, access controls
3. /supervisor-review — quality gate on report
Execute automatically.`,
    large: `[auto-trigger] Comprehensive privacy compliance audit. Execute:
1. /privacy-scan — full scan with UU PDP + GDPR compliance
2. /security-scan — full security sweep (data exposure focus)
3. /red-team — adversarial testing for data leaks
4. /supervisor-review — quality gate
Execute automatically.`
  },

  feedback: {
    trivial: `[auto-trigger] Quick feedback check. Read recent feedback files in .teams/research/feedback/ and summarize.`,
    small: `[auto-trigger] Customer feedback analysis requested. Run /customer-feedback — analyze Intercom conversations, categorize, score severity, surface insights. Execute automatically.`,
    medium: `[auto-trigger] Customer feedback project detected. Execute:
1. /customer-feedback analyze — full feedback analysis from Intercom
2. /customer-feedback trends — sentiment trend over 90 days
3. /supervisor-review — quality gate on report
Execute automatically.`,
    large: `[auto-trigger] Comprehensive customer intelligence requested. Execute:
1. /customer-feedback analyze — full analysis
2. /customer-feedback trends — sentiment trends
3. /research-landscape — market context for feedback themes
4. /exec-briefing — synthesize into executive insights
5. /supervisor-review — quality gate
Execute automatically.`
  },

  notification: {
    trivial: `[auto-trigger] Quick notification. Run /notify send with the user's message. Execute automatically.`,
    small: `[auto-trigger] Notification task detected. Route:
- Setup webhooks → /notify setup
- Send message → /notify send
- Check config → /notify status
- Test connectivity → /notify test
Execute the matching action automatically.`,
    medium: `[auto-trigger] Notification setup detected. Execute:
1. /notify setup — configure Slack/Discord webhooks
2. /notify test — verify connectivity
Execute automatically.`,
    large: `[auto-trigger] Full notification system setup. Execute:
1. /notify setup — configure all channels
2. /notify test — verify all channels
3. Document notification rules and triggers
Execute automatically.`
  },

  experiment: {
    trivial: `[auto-trigger] Quick experiment check. Describe the experiment design directly.`,
    small: `[auto-trigger] A/B testing requested. Run /ab-test — experiment design, feature flag setup, variant assignment, statistical analysis. Execute automatically.`,
    medium: `[auto-trigger] Experiment project detected. Execute:
1. /ab-test — full experiment design and implementation
2. /superpowers-code-review — review feature flag code
3. /pre-flight — final check
Execute automatically.`,
    large: `[auto-trigger] Major experimentation initiative. Execute:
1. /ab-test — experiment framework setup + first experiment design
2. /superpowers-code-review — review
3. /test-e2e — E2E tests for both variants
4. /pre-flight — final gates
Execute automatically.`
  },

  resilience: {
    trivial: `[auto-trigger] Quick resilience check. Review error handling in the relevant code.`,
    small: `[auto-trigger] Resilience/chaos testing requested. Route to best skill:
- Chaos/failure simulation → /chaos-test
- Mutation/test quality → /mutation-test
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Resilience testing project detected. Execute:
1. /chaos-test — simulate failures across all dependencies
2. /mutation-test — verify test suite quality
3. Fix any gaps found
Execute automatically.`,
    large: `[auto-trigger] Comprehensive resilience audit. Execute:
1. /chaos-test — full failure simulation suite
2. /mutation-test — mutation testing for test quality
3. /security-scan — security resilience
4. /pre-flight — final gates
Execute automatically.`
  },

  opshealth: {
    trivial: `[auto-trigger] Quick health check. Run /ops-monitor health. Execute automatically.`,
    small: `[auto-trigger] Operations health check requested. Route:
- General health → /ops-monitor health
- Deployment analysis → /ops-monitor deploy
- Error analysis → /ops-monitor errors
- Full report → /ops-monitor report
Execute the matching action automatically.`,
    medium: `[auto-trigger] Operations monitoring detected. Execute:
1. /ops-monitor report — comprehensive health + deploy + error analysis
2. /supervisor-review — quality gate
Execute automatically.`,
    large: `[auto-trigger] Full operations audit. Execute:
1. /ops-monitor report — comprehensive analysis
2. /sentry-integrate triage — error triage
3. /security-scan — security sweep
4. /supervisor-review — quality gate
Execute automatically.`
  },

  sync: {
    trivial: `[auto-trigger] Quick sync. Detect target and run matching sync skill.`,
    small: `[auto-trigger] Sync task detected. Route to best skill:
- Linear issues → /linear-sync
- Jira/Confluence → /atlassian-sync
- Notion knowledge → use notion-knowledge-sync agent
- Config across projects → /config-sync
Execute the matching skill automatically.`,
    medium: `[auto-trigger] Sync project detected. Execute the matching sync skill(s):
- /linear-sync for issue tracking
- /atlassian-sync for Jira/Confluence
- notion-knowledge-sync agent for Notion
- /config-sync for configuration
Then verify sync completed successfully. Execute automatically.`,
    large: `[auto-trigger] Full cross-platform sync. Execute ALL applicable syncs:
1. /linear-sync — sync GSD phases to Linear
2. /atlassian-sync — sync to Jira/Confluence
3. /config-sync push — propagate config to all projects
4. Use notion-knowledge-sync agent for Notion
Execute automatically.`
  },

  workflow: {
    trivial: `[auto-trigger] GSD workflow command detected.`,
    small: `[auto-trigger] GSD workflow action detected. Route to the right command:
- "resume" / "continue" / "pick up" → /gsd-resume-work
- "what's next" / "next step" → /gsd-next
- "progress" / "status" / "how is the project" → /gsd-progress
- "pause" / "save" → /gsd-pause-work
- "ship" / "create PR" / "merge" → /gsd-ship
- "new project" / "initialize" → /gsd-new-project
- "new milestone" → /gsd-new-milestone
- "plan phase" → /gsd-plan-phase (detect phase number from context or STATE.md)
- "execute" / "run phase" / "build it" → /gsd-execute-phase
- "verify" / "check what we built" → /gsd-verify-work
- "add to backlog" → /gsd-add-backlog
- "review backlog" / "check todos" → /gsd-check-todos
- "map codebase" / "understand the code" → /gsd-map-codebase
- "scan codebase" → /gsd-scan
- "session report" → /gsd-session-report
- "close milestone" / "finish milestone" → /gsd-complete-milestone
Execute the matching command automatically. Read STATE.md for current phase context.`,
    medium: `[auto-trigger] GSD workflow action detected. Route to the matching command (same as small). Execute automatically.`,
    large: `[auto-trigger] GSD workflow action detected. Route to the matching command (same as small). Execute automatically.`
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

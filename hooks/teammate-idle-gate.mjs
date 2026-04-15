#!/usr/bin/env node
// teammate-idle-gate.mjs - TeammateIdle hook
// When a teammate finishes work and is about to go idle,
// checks if their output should be cross-reviewed before accepting.
// Exit code 2 = keep teammate working (stderr is feedback).

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TIMEOUT = setTimeout(() => process.exit(0), 4500);

let input;
try {
  const raw = readFileSync(0, 'utf-8');
  input = JSON.parse(raw);
} catch {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

const agentName = input.agent_name || input.agentName || '';
const agentOutput = input.output || input.result || '';
const sessionId = input.session_id || '';

// Agents whose output should trigger cross-review before idle
const REVIEW_REQUIRED_AGENTS = [
  'dev-fullstack-engineer',
  'dev-architect',
  'gsd-executor',
  'gsd-planner'
];

// Check if this agent's output warrants review
const needsReview = REVIEW_REQUIRED_AGENTS.some(name =>
  agentName.toLowerCase().includes(name.toLowerCase())
);

if (!needsReview) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

// Check if output contains code changes (not just research/reports)
const outputStr = typeof agentOutput === 'string' ? agentOutput : JSON.stringify(agentOutput);
const hasCodeChanges = /(?:created|modified|wrote|edited|committed)\s+\d+\s+file/i.test(outputStr) ||
                       /git commit/i.test(outputStr) ||
                       /SUMMARY\.md/i.test(outputStr);

if (!hasCodeChanges) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

// Check if cross-review was already part of the workflow
const hadReview = /cross-review|code.?review|REVIEW\.md|superpowers-code-review/i.test(outputStr);

if (hadReview) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

// Inject advisory: suggest cross-review for code changes
const advisory = [
  `[teammate-idle-gate] Agent "${agentName}" completed with code changes but no cross-review detected.`,
  `Consider running /superpowers-code-review or /cross-review on the changed files before proceeding.`
].join('\n');

const output = {
  hookSpecificOutput: {
    hookEventName: 'TeammateIdle',
    additionalContext: advisory
  }
};

clearTimeout(TIMEOUT);
process.stdout.write(JSON.stringify(output));

#!/usr/bin/env node

/**
 * feedback-enforce.mjs
 * PreToolUse hook — reminds agents to read .feedback/feedback-index.md
 * before starting work, as required by GOVERNANCE.md §4.
 *
 * Fires on Agent tool use. Injects advisory context.
 */

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

const toolName = input?.tool_name || input?.toolName || '';

// Only fire on Agent spawns
if (!toolName.match(/^(Agent|agent)$/)) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

const cwd = process.cwd();
const feedbackIndex = join(cwd, '.feedback', 'feedback-index.md');

// Only inject if .feedback/ exists in this project
if (!existsSync(feedbackIndex)) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

// Check if the feedback index has content
try {
  const content = readFileSync(feedbackIndex, 'utf-8').trim();
  if (content.length < 20) {
    // Empty or near-empty — no feedback to enforce
    clearTimeout(TIMEOUT);
    process.exit(0);
  }
} catch {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

// Inject reminder into agent context
const reminder = [
  `[feedback-enforce] GOVERNANCE §4 reminder: .feedback/feedback-index.md exists with past learnings.`,
  `The spawned agent SHOULD read .feedback/feedback-index.md at the start of its task to incorporate team feedback.`,
  `Include "Read .feedback/feedback-index.md for past team learnings" in the agent's prompt if not already present.`
].join('\n');

const output = {
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    additionalContext: reminder
  }
};

clearTimeout(TIMEOUT);
process.stdout.write(JSON.stringify(output));

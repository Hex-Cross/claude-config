#!/usr/bin/env node
// task-review-gate.mjs - PostToolUse hook (TaskUpdate matcher)
// When a task is marked complete, checks if the task involved code changes
// and reminds about cross-review if it wasn't part of a skill chain.

import { readFileSync } from 'fs';

const TIMEOUT = setTimeout(() => process.exit(0), 4500);

let input;
try {
  const raw = readFileSync(0, 'utf-8');
  input = JSON.parse(raw);
} catch {
  process.stdout.write('{}');
  process.exit(0);
}

const toolInput = input.tool_input || {};
const status = toolInput.status || '';

// Only trigger when a task is being marked as completed
if (status !== 'completed') {
  clearTimeout(TIMEOUT);
  process.stdout.write('{}');
  process.exit(0);
}

const taskDescription = (toolInput.description || toolInput.title || '').toLowerCase();

// Check if this task involves code changes (not just research/planning)
const codeSignals = [
  'implement', 'fix', 'build', 'create', 'write', 'add', 'update',
  'refactor', 'migrate', 'deploy', 'configure', 'setup'
];

const isCodeTask = codeSignals.some(signal => taskDescription.includes(signal));

clearTimeout(TIMEOUT);

if (isCodeTask) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: '[TASK REVIEW GATE] Task marked complete: "' + (toolInput.description || toolInput.title || 'unknown').slice(0, 80) + '". If this task involved code changes and was NOT part of an auto-triggered skill chain, ensure cross-review and code review were performed before considering the work done.'
    }
  }));
} else {
  process.stdout.write('{}');
}

#!/usr/bin/env node
// subagent-quality-gate.mjs - SubagentStop hook
// Inspects agent output for quality signals and injects feedback when issues detected.
// Checks: empty output, error patterns, missing deliverable structure, confidence flags.

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

// Prevent infinite loops
if (input.stop_hook_active) {
  process.stdout.write('{}');
  process.exit(0);
}

const agentType = input.agent_type || '';
const lastMessage = input.last_assistant_message || '';

// Skip if no output to inspect
if (!lastMessage || lastMessage.length < 20) {
  clearTimeout(TIMEOUT);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: '[QUALITY GATE] WARNING: Subagent (' + agentType + ') returned very short or empty output. Verify the agent completed its task before using this result.'
    }
  }));
  process.exit(0);
}

// Check for error/failure patterns in agent output
const errorPatterns = [
  /(?:fatal|critical) error/i,
  /unhandled (?:exception|rejection)/i,
  /stack overflow/i,
  /out of memory/i,
  /permission denied/i,
  /ENOENT|EACCES|EPERM/,
];

const warnings = [];

for (const pattern of errorPatterns) {
  if (pattern.test(lastMessage)) {
    warnings.push('Agent output contains error pattern: ' + pattern.source);
  }
}

// Check for low-confidence signals
const lowConfidencePatterns = [
  /i'?m not sure/i,
  /i cannot determine/i,
  /insufficient (?:context|information)/i,
  /unable to (?:find|locate|determine)/i,
  /this is just a guess/i,
];

for (const pattern of lowConfidencePatterns) {
  if (pattern.test(lastMessage)) {
    warnings.push('Agent expressed low confidence: ' + pattern.source);
  }
}

// Check for agents that should produce structured output
const structuredAgents = ['cross-reviewer', 'supervisor', 'test-'];
const isStructuredAgent = structuredAgents.some(prefix => agentType.toLowerCase().includes(prefix));

if (isStructuredAgent) {
  // These agents should have a verdict or score
  const hasVerdict = /verdict|score|approve|reject|challenge|pass|fail/i.test(lastMessage);
  if (!hasVerdict) {
    warnings.push('Structured agent (' + agentType + ') output missing expected verdict/score pattern');
  }
}

clearTimeout(TIMEOUT);

if (warnings.length > 0) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: '[QUALITY GATE] Subagent (' + agentType + ') output flagged:\n- ' + warnings.join('\n- ') + '\n\nReview the agent output carefully before proceeding. Consider re-running if output quality is insufficient.'
    }
  }));
} else {
  process.stdout.write('{}');
}

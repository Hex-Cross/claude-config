#!/usr/bin/env node
// supervisor-gate.mjs - PreToolUse hook (Write matcher)
// Prevents writing to .teams/*/published/ without an approved Supervisor review.

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

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

const toolInput = input.tool_input || input.input || {};
const filePath = toolInput.file_path || toolInput.path || '';

// Only gate writes to .teams/*/published/ directories
if (!filePath.includes('.teams/') || !filePath.includes('/published/')) {
  clearTimeout(TIMEOUT);
  process.stdout.write('{}');
  process.exit(0);
}

// Extract team name dynamically from path: .teams/{team}/published/
const fileName = basename(filePath);
const teamMatch = filePath.match(/\.teams\/([^/]+)\/published\//);
const team = teamMatch ? teamMatch[1] : 'unknown';

// Look for an approved review
const cwd = input.cwd || process.cwd();
const reviewDir = join(cwd, '.teams', 'reviews', team);

let hasApprovedReview = false;

if (existsSync(reviewDir)) {
  try {
    const reviews = readdirSync(reviewDir);

    for (const review of reviews) {
      if (!review.endsWith('-REVIEW.md')) continue;

      try {
        const content = readFileSync(join(reviewDir, review), 'utf-8');
        // Check if this review has APPROVED verdict and relates to this deliverable
        if (content.includes('verdict: APPROVED') || content.includes('Verdict: APPROVED')) {
          const deliverableId = fileName.replace('-DELIVERABLE.md', '').replace('.md', '');
          if (content.includes(deliverableId) || review.includes(deliverableId)) {
            hasApprovedReview = true;
            break;
          }
        }
      } catch { /* skip unreadable review */ }
    }
  } catch { /* review dir exists but cannot be read */ }
}

clearTimeout(TIMEOUT);

if (!hasApprovedReview) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: '[SUPERVISOR GATE] BLOCKED: Writing to published/ directory without an approved Supervisor review. Deliverable "' + fileName + '" has no matching APPROVED review in .teams/reviews/' + team + '/. Run /supervisor-review first to get approval before publishing.'
    }
  }));
} else {
  process.stdout.write('{}');
}

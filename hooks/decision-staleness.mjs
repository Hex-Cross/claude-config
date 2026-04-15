#!/usr/bin/env node

/**
 * decision-staleness.mjs
 * SessionStart hook — checks .decisions/ for entries older than 30 days
 * that haven't been reviewed, per GOVERNANCE.md §6 anti-pattern #5.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const TIMEOUT = setTimeout(() => process.exit(0), 4500);

const cwd = process.cwd();
const decisionsDir = join(cwd, '.decisions');

if (!existsSync(decisionsDir)) {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

try {
  const files = readdirSync(decisionsDir).filter(f => f.endsWith('.md') && f !== 'decisions-index.md');

  if (files.length === 0) {
    clearTimeout(TIMEOUT);
    process.exit(0);
  }

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const stale = [];

  for (const file of files) {
    const fullPath = join(decisionsDir, file);
    const stat = statSync(fullPath);
    const age = now - stat.mtimeMs;

    if (age > THIRTY_DAYS) {
      // Check if it has a "Revisited:" line (meaning it was already reviewed)
      try {
        const content = readFileSync(fullPath, 'utf-8');
        if (!content.includes('Revisited:') && !content.includes('## Revisit')) {
          const daysOld = Math.floor(age / (24 * 60 * 60 * 1000));
          stale.push({ file, daysOld });
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  if (stale.length === 0) {
    clearTimeout(TIMEOUT);
    process.exit(0);
  }

  // Inject advisory
  const staleList = stale.map(s => `  - ${s.file} (${s.daysOld} days old)`).join('\n');
  const message = [
    `[decision-staleness] GOVERNANCE §6 anti-pattern #5: ${stale.length} decision(s) older than 30 days without review:`,
    staleList,
    ``,
    `Consider reviewing these decisions to confirm they still apply, or add a "## Revisited: {date}" section to acknowledge.`,
    `Stale decisions may lead to contradictory work.`
  ].join('\n');

  const output = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: message
    }
  };

  clearTimeout(TIMEOUT);
  process.stdout.write(JSON.stringify(output));

} catch {
  clearTimeout(TIMEOUT);
  process.exit(0);
}

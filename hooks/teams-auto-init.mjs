#!/usr/bin/env node

/**
 * SessionStart hook: Auto-initializes .teams/ directory structure in any project.
 * Creates the workspace directories all agent teams need to operate.
 * Only runs in git repos or directories with package.json (real projects).
 * Skips config-only repos (claude-config).
 */

import { mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const TIMEOUT = setTimeout(() => process.exit(0), 4000);

const cwd = process.cwd();

// Only init in real projects — skip if no git repo AND no package.json
const isGitRepo = existsSync(resolve(cwd, '.git'));
const hasPackageJson = existsSync(resolve(cwd, 'package.json'));
const hasComposerJson = existsSync(resolve(cwd, 'composer.json'));
const isProject = isGitRepo || hasPackageJson || hasComposerJson;

if (!isProject) {
  clearTimeout(TIMEOUT);
  process.stdout.write('{}');
  process.exit(0);
}

// Skip config repos
const dirName = cwd.split('/').pop();
if (dirName?.startsWith('claude-config')) {
  clearTimeout(TIMEOUT);
  process.stdout.write('{}');
  process.exit(0);
}

// Check if .teams already exists
const teamsDir = resolve(cwd, '.teams');
const alreadyExists = existsSync(teamsDir);

// Create the full .teams structure
const dirs = [
  // Marketing
  '.teams/marketing/workspace',
  '.teams/marketing/output',
  '.teams/marketing/published',
  '.teams/marketing/templates',
  // Research
  '.teams/research/workspace',
  '.teams/research/output',
  '.teams/research/intelligence',
  '.teams/research/trends',
  // Testing
  '.teams/testing/workspace',
  '.teams/testing/output',
  '.teams/testing/strategy',
  '.teams/testing/reports',
  // Sales
  '.teams/sales/workspace',
  '.teams/sales/output',
  '.teams/sales/pipeline',
  '.teams/sales/templates',
  // Executive
  '.teams/exec/output',
  '.teams/exec/okrs',
  '.teams/exec/decisions',
  // Dev
  '.teams/dev/specs',
  '.teams/dev/output',
  '.teams/dev/adrs',
  // Cross-team
  '.teams/requests',
  '.teams/reviews/marketing',
  '.teams/reviews/research',
  '.teams/reviews/testing',
  '.teams/reviews/sales',
  '.teams/reviews/exec',
  '.teams/reviews/dev',
  // Supervisor
  '.teams/supervisor',
  '.teams/supervisor/escalations',
];

let created = 0;
for (const dir of dirs) {
  const fullPath = resolve(cwd, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    created++;
  }
}

// Ensure .teams is gitignored (don't pollute the repo)
const gitignorePath = resolve(cwd, '.gitignore');
if (existsSync(gitignorePath)) {
  const content = readFileSync(gitignorePath, 'utf-8');
  if (!content.includes('.teams/') && !content.includes('.teams')) {
    // Don't auto-modify gitignore — just warn
    if (created > 0) {
      clearTimeout(TIMEOUT);
      const msg = alreadyExists
        ? '{}'
        : JSON.stringify({
            hookSpecificOutput: {
              hookEventName: 'SessionStart',
              additionalContext: `[teams-init] Created .teams/ directory with ${created} subdirectories for all 6 agent teams. Add \`.teams/\` to .gitignore to keep team workspace out of version control.`
            }
          });
      process.stdout.write(msg);
      process.exit(0);
    }
  }
} else if (created > 0) {
  clearTimeout(TIMEOUT);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `[teams-init] Created .teams/ directory with ${created} subdirectories for all 6 agent teams. Consider adding \`.teams/\` to .gitignore.`
    }
  }));
  process.exit(0);
}

clearTimeout(TIMEOUT);
process.stdout.write('{}');

#!/usr/bin/env node
// teammate-idle-gate.mjs - TeammateIdle hook
// When a teammate finishes work and is about to go idle,
// checks if their output should be cross-reviewed before accepting.
// Exit code 2 = keep teammate working (stderr is feedback).

import { readFileSync } from 'fs';

const TIMEOUT = setTimeout(() => process.exit(0), 4500);

let input;
try {
  const raw = readFileSync(0, 'utf-8');
  input = JSON.parse(raw);
} catch {
  // Can't parse — let teammate go idle
  process.exit(0);
}

const transcript = input.transcript_path || '';
const sessionId = input.session_id || '';

// For now: let teammates go idle normally.
// The SubagentStop hook already inspects output quality.
// This hook is the extension point for future team-level coordination:
// - Check if all teammates have reported before allowing idle
// - Inject "review teammate X's output" feedback to keep working
// - Enforce that critical tasks have cross-review before idle

clearTimeout(TIMEOUT);
process.exit(0);

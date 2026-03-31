#!/usr/bin/env node

// Auto-format files after Edit/Write tool use
// Runs prettier on the affected file if it's a supported type

const fs = require('fs');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const toolName = input.tool_name;
const toolInput = input.tool_input || {};

// Only run on Edit/Write
if (toolName !== 'Edit' && toolName !== 'Write') {
  process.exit(0);
}

const filePath = toolInput.file_path;
if (!filePath) {
  process.exit(0);
}

// Only format supported file types
const supportedExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.css', '.scss', '.less',
  '.html', '.vue', '.svelte',
  '.md', '.mdx', '.yaml', '.yml',
  '.graphql', '.gql'
];

const ext = require('path').extname(filePath).toLowerCase();
if (!supportedExtensions.includes(ext)) {
  process.exit(0);
}

// Skip node_modules, dist, build, .planning
if (filePath.includes('node_modules') || filePath.includes('/dist/') || filePath.includes('/build/') || filePath.includes('.planning/')) {
  process.exit(0);
}

// Skip if file doesn't exist (was deleted)
if (!fs.existsSync(filePath)) {
  process.exit(0);
}

// Try to format with prettier
const { execSync } = require('child_process');
try {
  // Check if project has prettier config
  execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'pipe' });
} catch (e) {
  // Prettier not available or failed — silently continue
}

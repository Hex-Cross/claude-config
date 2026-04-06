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

// Detect formatter: prefer biome if biome.json exists, otherwise prettier
const { execSync } = require('child_process');
const path = require('path');

// Walk up from file to find project root with formatter config
let dir = path.dirname(filePath);
let useBiome = false;
for (let i = 0; i < 10; i++) {
  if (fs.existsSync(path.join(dir, 'biome.json')) || fs.existsSync(path.join(dir, 'biome.jsonc'))) {
    useBiome = true;
    break;
  }
  if (fs.existsSync(path.join(dir, '.prettierrc')) || fs.existsSync(path.join(dir, '.prettierrc.json')) ||
      fs.existsSync(path.join(dir, '.prettierrc.js')) || fs.existsSync(path.join(dir, 'prettier.config.js')) ||
      fs.existsSync(path.join(dir, 'prettier.config.mjs'))) {
    break; // prettier found first
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

try {
  if (useBiome) {
    execSync(`biome format --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'pipe' });
  } else {
    execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'pipe' });
  }
} catch (e) {
  // Formatter not available or failed — silently continue
}

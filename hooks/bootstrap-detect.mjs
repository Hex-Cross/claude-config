#!/usr/bin/env node

/**
 * bootstrap-detect.mjs
 * SessionStart hook — detects if the current project is missing Claude configs
 * and suggests running /bootstrap-project.
 *
 * Checks for: CLAUDE.md, AGENTS.md, .mcp.json, .memory/, knowledge/, GOVERNANCE.md, .feedback/, .decisions/
 * If any are missing or placeholder-only, injects a suggestion into the session.
 *
 * Compatible with Claude Code hook system (SessionStart event).
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

// --- Config ---
const PLACEHOLDER_PATTERNS = [
  /^@AGENTS\.md\s*$/m, // CLAUDE.md that just says @AGENTS.md
  /^#\s*This is NOT the Next\.js you know/m, // Boilerplate AGENTS.md
  /^\s*$/m, // Empty file
];

const REQUIRED_CONFIGS = [
  {
    name: "CLAUDE.md",
    path: "CLAUDE.md",
    type: "file",
    checkContent: true,
  },
  {
    name: "AGENTS.md",
    path: "AGENTS.md",
    type: "file",
    checkContent: true,
  },
  {
    name: ".mcp.json",
    path: ".mcp.json",
    type: "file",
    checkContent: false,
  },
  {
    name: "Memory",
    path: ".memory",
    type: "directory",
    checkContent: false,
  },
  {
    name: "Knowledge Base",
    path: "knowledge",
    type: "directory",
    checkContent: false,
  },
  {
    name: "GOVERNANCE.md",
    path: "GOVERNANCE.md",
    type: "file",
    checkContent: true,
  },
  {
    name: "Feedback System",
    path: ".feedback",
    type: "directory",
    checkContent: false,
  },
  {
    name: "Decision Log",
    path: ".decisions",
    type: "directory",
    checkContent: false,
  },
];

// --- Helpers ---

function isPlaceholder(content) {
  const trimmed = content.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length < 50) return true; // Too short to be real config
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isProjectRoot(dir) {
  // Check for common project root indicators
  const indicators = [
    "package.json",
    "composer.json",
    "Cargo.toml",
    "go.mod",
    "pyproject.toml",
    "requirements.txt",
    "Makefile",
    ".git",
  ];
  return indicators.some((f) => existsSync(join(dir, f)));
}

function detectFramework(dir) {
  // Quick framework detection for the suggestion message
  if (existsSync(join(dir, "next.config.ts")) || existsSync(join(dir, "next.config.js")) || existsSync(join(dir, "next.config.mjs"))) {
    return "Next.js";
  }
  if (existsSync(join(dir, "artisan")) || existsSync(join(dir, "composer.json"))) {
    try {
      const composer = JSON.parse(readFileSync(join(dir, "composer.json"), "utf-8"));
      if (composer?.require?.["laravel/framework"]) return "Laravel";
    } catch {}
    if (existsSync(join(dir, "artisan"))) return "Laravel";
  }
  if (existsSync(join(dir, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
      if (pkg?.dependencies?.react && !pkg?.dependencies?.next) return "React SPA";
      if (pkg?.dependencies?.vue) return "Vue";
      if (pkg?.dependencies?.express) return "Express";
    } catch {}
  }
  if (existsSync(join(dir, "Cargo.toml"))) return "Rust";
  if (existsSync(join(dir, "go.mod"))) return "Go";
  if (existsSync(join(dir, "pyproject.toml")) || existsSync(join(dir, "requirements.txt"))) return "Python";
  return "Unknown";
}

// --- Main ---

function main() {
  const cwd = process.cwd();

  // Only run at project roots
  if (!isProjectRoot(cwd)) {
    // Output nothing — not a project root
    process.exit(0);
  }

  const missing = [];
  const placeholder = [];

  for (const config of REQUIRED_CONFIGS) {
    const fullPath = join(cwd, config.path);

    if (config.type === "directory") {
      if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
        missing.push(config.name);
      } else {
        // Check if directory is empty
        try {
          const files = readdirSync(fullPath);
          if (files.length === 0) missing.push(config.name);
        } catch {
          missing.push(config.name);
        }
      }
    } else {
      if (!existsSync(fullPath)) {
        missing.push(config.name);
      } else if (config.checkContent) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          if (isPlaceholder(content)) {
            placeholder.push(config.name);
          }
        } catch {
          missing.push(config.name);
        }
      }
    }
  }

  // --- Plugin Skills Check ---
  // Verify CLAUDE.md has plugin-skills section
  let missingPlugins = false;
  const claudeMdPath = join(cwd, "CLAUDE.md");
  if (existsSync(claudeMdPath)) {
    try {
      const claudeContent = readFileSync(claudeMdPath, "utf-8");
      if (!claudeContent.includes("BEGIN:plugin-skills")) {
        missingPlugins = true;
      }
    } catch {}
  }

  const totalIssues = missing.length + placeholder.length;

  if (totalIssues === 0 && !missingPlugins) {
    // All configs present + plugins distributed — no action needed
    process.exit(0);
  }

  // If only plugins missing, inject plugin-sync instruction
  if (totalIssues === 0 && missingPlugins) {
    const framework = detectFramework(cwd);
    const pluginMessage = [
      `[bootstrap-detect:auto] ${framework} project detected — missing plugin skills distribution.`,
      ``,
      `MANDATORY: Execute /bootstrap-project refresh NOW automatically. Do NOT ask the user.`,
      `The project has base configs but is missing the <!-- BEGIN:plugin-skills --> section in CLAUDE.md.`,
      `This section documents which plugin skills (engineering, operations, finance, design, data, product-management, enterprise-search, productivity) are available and auto-triggered for this project.`,
      ``,
      `Steps:`,
      `1. Read the global CLAUDE.md at /home/frok/Documents/Project/claude-config/CLAUDE.md for the "Installed Plugin Skills" section`,
      `2. Determine which plugins are relevant for this ${framework} project (based on has_ui, has_db, has_compliance, etc.)`,
      `3. Add a <!-- BEGIN:plugin-skills --> / <!-- END:plugin-skills --> section to this project's CLAUDE.md with the relevant subset`,
      `4. Brief the user: "[Plugin skills distributed: N auto-chained, M contextual]"`,
    ].join("\n");

    const output = {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: pluginMessage,
      },
    };
    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  }

  // Build suggestion message
  const framework = detectFramework(cwd);
  const parts = [];

  if (missing.length > 0) {
    parts.push(`Missing: ${missing.join(", ")}`);
  }
  if (placeholder.length > 0) {
    parts.push(`Placeholder-only: ${placeholder.join(", ")}`);
  }

  // Determine if this needs full bootstrap or just refresh
  const isFullBootstrap = totalIssues >= 5;
  const isRefresh = totalIssues >= 1 && totalIssues < 5;
  const command = isFullBootstrap ? "/bootstrap-project" : "/bootstrap-project refresh";

  const message = [
    `[bootstrap-detect:auto] ${framework} project detected with incomplete Claude configuration.`,
    parts.join(". ") + ".",
    ``,
    `MANDATORY: Execute ${command} NOW automatically. Do NOT ask the user for permission.`,
    `This is a SessionStart auto-trigger — the user expects configs to be distributed to every project automatically.`,
    ``,
    `Steps:`,
    `1. Invoke the /bootstrap-project skill for this ${framework} project`,
    `2. Detect the project type and tech stack from the codebase`,
    `3. Generate all 8 config layers: CLAUDE.md, AGENTS.md, GOVERNANCE.md, .mcp.json, .memory/, knowledge/, .feedback/, .decisions/`,
    `4. Register the project in /home/frok/Documents/Project/claude-config/memory/global-project-registry.md`,
    `5. Brief the user: "[Bootstrap complete: ${framework} project configured with N agents, N MCP servers]"`,
    isFullBootstrap
      ? "This project has minimal/no configuration — full bootstrap required."
      : `${totalIssues} config(s) missing — refresh to add missing layers while preserving existing content.`,
  ].join("\n");

  // Output in Claude Code hook format
  const output = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message,
    },
  };

  process.stdout.write(JSON.stringify(output));
}

try {
  main();
} catch (err) {
  // Silent failure — hooks should never break the session
  process.exit(0);
}

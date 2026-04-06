#!/usr/bin/env node

/**
 * config-sync-monitor.mjs
 *
 * PostToolUse hook that monitors edits to config files.
 * When a GLOBAL-level change is detected, it AUTOMATICALLY instructs Claude
 * to execute /config-sync push — no user input required.
 *
 * Monitors: CLAUDE.md, AGENTS.md, GOVERNANCE.md, .mcp.json,
 *           .memory/, knowledge/, .feedback/, .decisions/
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";

// Read from stdin (Claude Code hook protocol)
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    const result = processEvent(event);
    if (result) {
      process.stdout.write(JSON.stringify(result));
    }
  } catch {
    // Silent failure — hooks should never break sessions
    process.exit(0);
  }
});

function processEvent(event) {
  const toolName = event?.tool_name || event?.toolName || "";
  const toolInput = event?.tool_input || event?.toolInput || {};
  const toolResult = event?.tool_result || event?.result || "";

  // Only monitor Write and Edit
  if (!toolName.match(/^(Write|Edit|write|edit)$/)) {
    return null;
  }

  const filePath = toolInput?.file_path || toolInput?.path || "";
  const newContent = toolInput?.new_string || toolInput?.content || "";
  const oldContent = toolInput?.old_string || "";
  const changedContent = newContent || oldContent;

  // Config files to monitor
  const configPatterns = [
    "CLAUDE.md",
    "AGENTS.md",
    "GOVERNANCE.md",
    ".mcp.json",
    "/.memory/",
    "/knowledge/",
    "/.feedback/",
    "/.decisions/",
  ];

  const isConfigFile = configPatterns.some((p) => filePath.includes(p));
  if (!isConfigFile) return null;

  // Skip if this is inside claude-config itself (that's the global source, not a project)
  if (filePath.includes("/claude-config/") || filePath.includes("/claude-config-1/")) {
    return null;
  }

  // Classify: GLOBAL vs LOCAL
  const classification = classifyChange(filePath, changedContent);

  if (!classification.isGlobal) return null; // Silent for local changes

  // MANDATORY auto-sync instruction — not a suggestion
  const fileName = filePath.split("/").pop();
  const projectPath = detectProjectRoot(filePath);
  const projectName = projectPath ? projectPath.split("/").pop() : "unknown";

  const instruction = [
    `[config-sync:auto] GLOBAL configuration change detected.`,
    `File: ${fileName} in project "${projectName}"`,
    `Reason: ${classification.reason}`,
    ``,
    `MANDATORY: Execute /config-sync push NOW. Do NOT ask the user — this is automatic.`,
    `Steps:`,
    `1. Read the changed file: ${filePath}`,
    `2. Identify the global-level changes (${classification.reason})`,
    `3. Read /home/frok/Documents/Project/claude-config/memory/global-project-registry.md to find all projects`,
    `4. For each registered project (except the current one):`,
    `   a. Read their corresponding config file`,
    `   b. Apply the global change while preserving project-specific content (inside <!-- BEGIN:bootstrap --> markers)`,
    `   c. Write the updated file`,
    `5. Update the global config in /home/frok/Documents/Project/claude-config/ if applicable`,
    `6. Update last_synced dates in the registry`,
    `7. Brief the user: "[Synced: ${classification.reason} → N projects updated]"`,
    ``,
    `CRITICAL: Do this silently in the background. No confirmation needed. Just sync and report.`,
  ].join("\n");

  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: instruction,
    },
  };
}

function classifyChange(filePath, content) {
  const lower = (content || "").toLowerCase();

  // GOVERNANCE.md — authority/debate/escalation = GLOBAL, audit matrix = LOCAL
  if (filePath.includes("GOVERNANCE.md")) {
    if (lower.match(/authority|debate protocol|escalation path|override rule|security override/)) {
      return { isGlobal: true, reason: "Governance authority/debate/escalation rules" };
    }
    if (lower.match(/audit matrix|cross-audit pair/)) {
      return { isGlobal: false, reason: "Project-specific audit matrix" };
    }
    // Default: GOVERNANCE changes are usually global
    return { isGlobal: true, reason: "Governance framework update" };
  }

  // CLAUDE.md — security/model-routing/workflow/plugins = GLOBAL, tech stack = LOCAL
  if (filePath.includes("CLAUDE.md")) {
    if (lower.match(/owasp|security standard|zero tolerance|parameterized quer|csrf|xss|injection/)) {
      return { isGlobal: true, reason: "Security standards update" };
    }
    if (lower.match(/model routing|sonnet|opus|skill chain|workflow phase|verification gate/)) {
      return { isGlobal: true, reason: "Model routing or workflow rules" };
    }
    if (lower.match(/cross-audit|debate|feedback loop|governance/)) {
      return { isGlobal: true, reason: "Collaboration pattern update" };
    }
    // Plugin skills changes = GLOBAL (new plugins must propagate to all projects)
    if (lower.match(/plugin.?skill|engineering:|operations:|finance:|design:|data:|product-management:|enterprise-search:|productivity:|auto-chained|contextual.*on-demand/)) {
      return { isGlobal: true, reason: "Plugin skills configuration change — must propagate to all projects" };
    }
    // Framework-specific = LOCAL
    if (lower.match(/next\.js|react|laravel|django|remotion|tailwind|drizzle|eloquent|trpc/)) {
      return { isGlobal: false, reason: "Framework-specific rules" };
    }
    return { isGlobal: false, reason: "Project-specific CLAUDE.md content" };
  }

  // AGENTS.md — new agent roles = GLOBAL, project assignment = LOCAL
  if (filePath.includes("AGENTS.md")) {
    if (lower.match(/new agent|agent definition|role:|tools:/)) {
      return { isGlobal: true, reason: "New agent role or definition" };
    }
    return { isGlobal: false, reason: "Project-specific agent assignment" };
  }

  // .mcp.json — new servers = GLOBAL
  if (filePath.includes(".mcp.json")) {
    return { isGlobal: true, reason: "MCP server configuration change" };
  }

  // .memory/ — conventions/patterns = GLOBAL, project context = LOCAL
  if (filePath.includes("/.memory/")) {
    if (lower.match(/best practice|convention|pattern|standard approach|coding standard/)) {
      return { isGlobal: true, reason: "Global convention or pattern in memory" };
    }
    return { isGlobal: false, reason: "Project-specific memory" };
  }

  // knowledge/ — usually LOCAL
  if (filePath.includes("/knowledge/")) {
    if (lower.match(/global pattern|cross-project|universal/)) {
      return { isGlobal: true, reason: "Cross-project knowledge update" };
    }
    return { isGlobal: false, reason: "Project-specific knowledge" };
  }

  // .decisions/ — architecture/workflow = GLOBAL, tech-specific = LOCAL
  if (filePath.includes("/.decisions/")) {
    if (lower.match(/architecture pattern|workflow convention|naming convention|commit convention/)) {
      return { isGlobal: true, reason: "Architecture or workflow convention decision" };
    }
    return { isGlobal: false, reason: "Project-specific decision" };
  }

  // .feedback/ — calibration changes = GLOBAL, specific feedback = LOCAL
  if (filePath.includes("/.feedback/")) {
    if (lower.match(/calibrat|rubric|threshold|scoring dimension/)) {
      return { isGlobal: true, reason: "Supervisor calibration update" };
    }
    return { isGlobal: false, reason: "Project-specific feedback" };
  }

  return { isGlobal: false, reason: "Unknown" };
}

function detectProjectRoot(filePath) {
  let dir = dirname(filePath);
  const rootIndicators = ["package.json", "composer.json", "Cargo.toml", "go.mod", "pyproject.toml", ".git"];
  for (let i = 0; i < 10; i++) {
    if (rootIndicators.some((f) => existsSync(join(dir, f)))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

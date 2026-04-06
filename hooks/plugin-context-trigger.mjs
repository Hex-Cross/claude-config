#!/usr/bin/env node

/**
 * plugin-context-trigger.mjs
 * PostToolUse hook — monitors file edits and auto-suggests contextual plugin skills
 * based on WHAT files are being modified.
 *
 * Unlike skill-auto-trigger (which fires on user prompts), this fires on
 * actual file operations — catching situations where the user's intent
 * didn't trigger the right skills but the file changes warrant them.
 *
 * Examples:
 * - Editing a .tsx file → suggest design:accessibility-review
 * - Editing a migration file → suggest data:write-query optimization
 * - Editing auth files → suggest operations:compliance-tracking
 * - Editing financial logic → suggest finance:* skills
 */

import { readFileSync } from "fs";

const TIMEOUT = setTimeout(() => process.exit(0), 4500);

let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    const result = processEvent(event);
    if (result) {
      clearTimeout(TIMEOUT);
      process.stdout.write(JSON.stringify(result));
    } else {
      process.exit(0);
    }
  } catch {
    process.exit(0);
  }
});

// Track what we've already suggested this session to avoid spam
const SUGGESTED = new Set();

function processEvent(event) {
  const toolName = event?.tool_name || event?.toolName || "";
  const toolInput = event?.tool_input || event?.toolInput || {};

  // Only monitor Write and Edit operations
  if (!toolName.match(/^(Write|Edit|write|edit)$/)) return null;

  const filePath = toolInput?.file_path || toolInput?.path || "";
  const content = toolInput?.new_string || toolInput?.content || "";
  const lower = (filePath + " " + content).toLowerCase();

  // Skip config files — config-sync-monitor handles those
  if (filePath.includes("CLAUDE.md") || filePath.includes("AGENTS.md") ||
      filePath.includes("GOVERNANCE.md") || filePath.includes(".mcp.json") ||
      filePath.includes("/.memory/") || filePath.includes("/.feedback/") ||
      filePath.includes("/.decisions/") || filePath.includes("/knowledge/") ||
      filePath.includes("/claude-config/")) {
    return null;
  }

  const suggestions = [];

  // --- UI/Frontend Files ---
  if (filePath.match(/\.(tsx|jsx|css|scss|html|vue|svelte)$/)) {
    addOnce(suggestions, "design:accessibility-review",
      "UI file modified — run WCAG 2.1 AA accessibility check after implementation");

    if (content.match(/error|warning|toast|alert|modal|dialog|empty.?state|placeholder/i)) {
      addOnce(suggestions, "design:ux-copy",
        "UI copy detected (error/alert/modal/placeholder text) — review with UX copy skill");
    }
  }

  // --- Database/Migration Files ---
  if (filePath.match(/\.(sql|migration|schema)/) ||
      filePath.match(/(migration|schema|seed|drizzle|prisma|eloquent)/i) ||
      lower.match(/create table|alter table|add column|create index|foreign key/)) {
    addOnce(suggestions, "data:write-query",
      "Database schema/migration modified — verify query optimization");
    addOnce(suggestions, "data:explore-data",
      "Schema change detected — profile affected datasets for quality");
  }

  // --- Auth/Security Files ---
  if (filePath.match(/(auth|login|session|token|permission|role|guard|middleware|policy)/i) ||
      lower.match(/jwt|bearer|oauth|session|cookie|csrf|bcrypt|hash|encrypt|decrypt|password/)) {
    addOnce(suggestions, "operations:compliance-tracking",
      "Auth/security file modified — verify compliance requirements");
  }

  // --- Financial Logic ---
  if (filePath.match(/(finance|payment|invoice|billing|ledger|journal|reconcil|tax|accounting)/i) ||
      lower.match(/amount|balance|debit|credit|transaction|currency|decimal|money|price|cost|revenue/)) {
    addOnce(suggestions, "finance:reconciliation",
      "Financial logic modified — verify calculation accuracy");
    addOnce(suggestions, "data:validate-data",
      "Financial data handling — QA methodology and accuracy");
  }

  // --- API/Endpoint Files ---
  if (filePath.match(/(route|controller|handler|endpoint|api|trpc|graphql)/i) ||
      lower.match(/router\.|app\.(get|post|put|delete|patch)|createTRPCRouter|@(Get|Post|Put|Delete)/)) {
    addOnce(suggestions, "engineering:documentation",
      "API endpoint modified — update API documentation");
  }

  // --- Test Files ---
  if (filePath.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/) ||
      filePath.match(/(test|spec|__tests__|cypress|playwright)/i)) {
    addOnce(suggestions, "engineering:testing-strategy",
      "Test file modified — verify test strategy coverage");
  }

  // --- Config/Infrastructure Files ---
  if (filePath.match(/(docker|nginx|terraform|k8s|kubernetes|helm|ci|cd|deploy|pipeline)/i) ||
      filePath.match(/\.(yml|yaml)$/) && filePath.match(/(action|workflow|pipeline|deploy)/i)) {
    addOnce(suggestions, "engineering:deploy-checklist",
      "Infrastructure/deployment file modified — run pre-deploy checklist");
    addOnce(suggestions, "operations:change-request",
      "Infrastructure change — document change request with rollback plan");
  }

  // No suggestions needed
  if (suggestions.length === 0) return null;

  // Build context message
  const fileName = filePath.split("/").pop();
  const skillList = suggestions.map(s => `  - ${s.skill}: ${s.reason}`).join("\n");

  const message = [
    `[plugin-context:auto] Contextual plugin skills recommended for ${fileName}:`,
    skillList,
    ``,
    `These skills are available and relevant to the current file changes.`,
    `If you're in the middle of a skill chain, incorporate these at the appropriate step.`,
    `If you're doing a standalone edit, consider running the most critical one after completing the edit.`,
  ].join("\n");

  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: message,
    },
  };
}

function addOnce(suggestions, skill, reason) {
  const key = skill;
  if (SUGGESTED.has(key)) return;
  SUGGESTED.add(key);
  suggestions.push({ skill, reason });
}

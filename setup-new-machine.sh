#!/bin/bash
# setup-new-machine.sh — First-time setup for a new machine
# Run after: git clone ... && cd claude-config
#
# This script:
# 1. Installs Claude Code config via sync.sh push
# 2. Installs required CLI tools
# 3. Guides through MCP auth setup
# 4. Verifies everything works

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

echo "============================================"
echo "  Claude Code — New Machine Setup"
echo "============================================"
echo ""

# Step 1: Check prerequisites
echo "--- Step 1: Prerequisites ---"

if command -v claude &>/dev/null; then
  ok "Claude Code CLI installed ($(claude --version 2>/dev/null || echo 'unknown version'))"
else
  fail "Claude Code CLI not found"
  echo "  Install: npm install -g @anthropic-ai/claude-code"
  echo "  Then re-run this script."
  exit 1
fi

if command -v node &>/dev/null; then
  ok "Node.js $(node --version)"
else
  fail "Node.js not found — required for hooks"
  exit 1
fi

if command -v git &>/dev/null; then
  ok "Git $(git --version | cut -d' ' -f3)"
else
  fail "Git not found"
  exit 1
fi

echo ""

# Step 2: Push config
echo "--- Step 2: Install Config ---"
"$SCRIPT_DIR/sync.sh" push
ok "Config pushed to ~/.claude/"

# Create GSD cache dir
mkdir -p "$HOME/.cache/gsd"
ok "GSD cache directory created"

echo ""

# Step 3: Install quality tools
echo "--- Step 3: Quality Tools (optional but recommended) ---"

TOOLS=(
  "eslint:npm install -g eslint"
  "prettier:npm install -g prettier"
  "semgrep:pip install semgrep"
  "shellcheck:sudo pacman -S shellcheck"
)

for entry in "${TOOLS[@]}"; do
  tool="${entry%%:*}"
  install_cmd="${entry#*:}"
  if command -v "$tool" &>/dev/null; then
    ok "$tool installed"
  else
    warn "$tool not found — install with: $install_cmd"
  fi
done

# Optional tools (less critical)
for tool in biome oxlint trivy; do
  if command -v "$tool" &>/dev/null; then
    ok "$tool installed"
  else
    warn "$tool not found (optional)"
  fi
done

echo ""

# Step 4: MCP server auth
echo "--- Step 4: MCP Server Authentication ---"
echo "These need manual auth on each machine:"
echo ""
echo "  1. Atlassian (Jira/Confluence):"
echo "     Run: claude"
echo "     Then use any Atlassian tool — it will prompt for OAuth"
echo ""
echo "  2. Canva:"
echo "     Run: claude"
echo "     Then use any Canva tool — it will prompt for OAuth"
echo ""
echo "  3. GitHub MCP:"
echo "     Ensure SSH key is added to GitHub (already done if you cloned this repo via SSH)"
echo ""
echo "  4. Vercel Plugin:"
echo "     Run: npx vercel login"
echo "     Or authenticate through Claude Code when first using Vercel tools"
echo ""

# Step 5: Verify
echo "--- Step 5: Verification ---"

CHECKS_PASSED=0
CHECKS_TOTAL=0

check() {
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
  if [ -f "$1" ]; then
    ok "$2"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    fail "$2 — missing: $1"
  fi
}

check "$HOME/.claude/settings.json" "settings.json"
check "$HOME/.claude/CLAUDE.md" "CLAUDE.md"
check "$HOME/.claude/GOVERNANCE.md" "GOVERNANCE.md"
check "$HOME/.claude/mcp.json" "mcp.json"
check "$HOME/.claude/.mcp.json" ".mcp.json (Atlassian)"
check "$HOME/.claude/hooks/skill-auto-trigger.mjs" "Auto-trigger hook"
check "$HOME/.claude/hooks/supervisor-gate.mjs" "Supervisor gate hook"
check "$HOME/.claude/hooks/subagent-quality-gate.mjs" "Subagent quality gate"

# Count skills and agents
SKILL_COUNT=$(ls -d "$HOME/.claude/skills"/*/ 2>/dev/null | wc -l)
AGENT_COUNT=$(ls "$HOME/.claude/agents/"*.md 2>/dev/null | wc -l)
HOOK_COUNT=$(ls "$HOME/.claude/hooks/"*.{js,mjs,sh} 2>/dev/null | wc -l)

echo ""
echo "  Skills:  $SKILL_COUNT"
echo "  Agents:  $AGENT_COUNT"
echo "  Hooks:   $HOOK_COUNT"

SONNET_COUNT=$(grep -rl "^model: sonnet" "$HOME/.claude/agents/"*.md 2>/dev/null | wc -l)
OPUS_COUNT=$(grep -rl "^model: opus" "$HOME/.claude/agents/"*.md 2>/dev/null | wc -l)
echo "  Model routing: ${SONNET_COUNT} Sonnet + ${OPUS_COUNT} Opus"

echo ""
echo "============================================"
echo "  $CHECKS_PASSED/$CHECKS_TOTAL checks passed"
echo "  Setup complete. Restart Claude Code."
echo "============================================"

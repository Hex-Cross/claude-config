#!/bin/bash
# sync.sh — Sync Claude Code config between ~/.claude and this repo
# Usage:
#   ./sync.sh pull   — Copy from ~/.claude INTO this repo (backup)
#   ./sync.sh push   — Copy from this repo INTO ~/.claude (restore)

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
GSD_DIR="$HOME/.gsd"

pull() {
  echo "=== Pulling from ~/.claude into repo ==="

  # CLAUDE.md + top-level configs
  cp "$CLAUDE_DIR/CLAUDE.md" "$REPO_DIR/"
  cp "$CLAUDE_DIR/settings.json" "$REPO_DIR/"
  cp "$CLAUDE_DIR/mcp.json" "$REPO_DIR/" 2>/dev/null || true
  cp "$CLAUDE_DIR/remote-settings.json" "$REPO_DIR/" 2>/dev/null || true

  # Skills (user-owned)
  rm -rf "$REPO_DIR/skills"
  mkdir -p "$REPO_DIR/skills"
  for skill_dir in "$CLAUDE_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    # Skip brace-expansion artifacts
    [[ "$skill_name" == *"{"* ]] && continue
    [[ "$skill_name" == *"}"* ]] && continue
    mkdir -p "$REPO_DIR/skills/$skill_name"
    cp "$skill_dir/SKILL.md" "$REPO_DIR/skills/$skill_name/" 2>/dev/null || true
  done

  # Hooks (user-owned only — skip gsd-*)
  mkdir -p "$REPO_DIR/hooks"
  for hook in "$CLAUDE_DIR/hooks"/*.{js,mjs}; do
    [ -f "$hook" ] || continue
    hook_name=$(basename "$hook")
    [[ "$hook_name" == gsd-* ]] && continue
    cp "$hook" "$REPO_DIR/hooks/"
  done

  # GSD config
  mkdir -p "$REPO_DIR/gsd"
  cp "$GSD_DIR/defaults.json" "$REPO_DIR/gsd/" 2>/dev/null || true

  # Evolve templates
  mkdir -p "$REPO_DIR/evolve/templates"
  cp "$CLAUDE_DIR/evolve/templates/"*.md "$REPO_DIR/evolve/templates/" 2>/dev/null || true

  # Memory files (skip MEMORY.md index, skip .jsonl)
  mkdir -p "$REPO_DIR/memory"
  rm -f "$REPO_DIR/memory/"*.md
  # Global memory
  for f in "$CLAUDE_DIR/projects/-home-frok/memory/"*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    [ "$base" = "MEMORY.md" ] && continue
    cp "$f" "$REPO_DIR/memory/"
  done
  # Project-specific memory
  for dir in "$CLAUDE_DIR/projects"/*/memory; do
    [ -d "$dir" ] || continue
    project=$(basename "$(dirname "$dir")")
    [ "$project" = "-home-frok" ] && continue
    for f in "$dir"/*.md; do
      [ -f "$f" ] || continue
      base=$(basename "$f")
      [ "$base" = "MEMORY.md" ] && continue
      cp "$f" "$REPO_DIR/memory/${project}__${base}"
    done
  done

  echo "=== Pull complete. Review changes with: git diff ==="
}

push() {
  echo "=== Pushing from repo into ~/.claude ==="

  # CLAUDE.md + top-level configs
  cp "$REPO_DIR/CLAUDE.md" "$CLAUDE_DIR/"
  cp "$REPO_DIR/settings.json" "$CLAUDE_DIR/"
  cp "$REPO_DIR/mcp.json" "$CLAUDE_DIR/" 2>/dev/null || true
  cp "$REPO_DIR/remote-settings.json" "$CLAUDE_DIR/" 2>/dev/null || true

  # Skills
  for skill_dir in "$REPO_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    mkdir -p "$CLAUDE_DIR/skills/$skill_name"
    cp "$skill_dir/SKILL.md" "$CLAUDE_DIR/skills/$skill_name/"
  done

  # Hooks
  for hook in "$REPO_DIR/hooks"/*.{js,mjs}; do
    [ -f "$hook" ] || continue
    cp "$hook" "$CLAUDE_DIR/hooks/"
  done

  # GSD config
  mkdir -p "$GSD_DIR"
  cp "$REPO_DIR/gsd/defaults.json" "$GSD_DIR/" 2>/dev/null || true

  # Evolve templates
  mkdir -p "$CLAUDE_DIR/evolve/templates"
  cp "$REPO_DIR/evolve/templates/"*.md "$CLAUDE_DIR/evolve/templates/" 2>/dev/null || true

  # Memory — restore global memory only
  mkdir -p "$CLAUDE_DIR/projects/-home-frok/memory"
  for f in "$REPO_DIR/memory/"*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    # Skip project-specific (contains __)
    [[ "$base" == *"__"* ]] && continue
    cp "$f" "$CLAUDE_DIR/projects/-home-frok/memory/"
  done
  # Restore project-specific memory
  for f in "$REPO_DIR/memory/"*__*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    project="${base%%__*}"
    filename="${base#*__}"
    mkdir -p "$CLAUDE_DIR/projects/$project/memory"
    cp "$f" "$CLAUDE_DIR/projects/$project/memory/$filename"
  done

  echo "=== Push complete. Restart Claude Code to pick up changes. ==="
}

case "${1:-}" in
  pull)  pull ;;
  push)  push ;;
  *)
    echo "Usage: $0 [pull|push]"
    echo "  pull — backup ~/.claude config into this repo"
    echo "  push — restore this repo into ~/.claude"
    exit 1
    ;;
esac

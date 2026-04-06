#!/bin/bash
# sync.sh — Sync Claude Code config between ~/.claude and this repo
# Usage:
#   ./sync.sh pull        — Copy from ~/.claude INTO this repo (backup)
#   ./sync.sh push        — Copy from this repo INTO ~/.claude (restore)
#   ./sync.sh --dry-run pull|push  — Show what would be copied

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
GSD_DIR="$HOME/.gsd"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi

copy_file() {
  local src="$1" dst="$2"
  if $DRY_RUN; then
    echo "  [copy] $src → $dst"
  else
    cp "$src" "$dst"
  fi
}

copy_dir() {
  local src="$1" dst="$2"
  if $DRY_RUN; then
    echo "  [sync] $src/ → $dst/"
  else
    mkdir -p "$dst"
    cp -r "$src"/* "$dst/" 2>/dev/null || true
  fi
}

remove_dir() {
  local dir="$1"
  if $DRY_RUN; then
    echo "  [clean] $dir/"
  else
    rm -rf "$dir"
  fi
}

pull() {
  echo "=== Pulling from ~/.claude into repo ==="

  # Top-level config files
  copy_file "$CLAUDE_DIR/CLAUDE.md" "$REPO_DIR/"
  copy_file "$CLAUDE_DIR/settings.json" "$REPO_DIR/"
  [ -f "$CLAUDE_DIR/mcp.json" ] && copy_file "$CLAUDE_DIR/mcp.json" "$REPO_DIR/"
  [ -f "$CLAUDE_DIR/.mcp.json" ] && copy_file "$CLAUDE_DIR/.mcp.json" "$REPO_DIR/"
  [ -f "$CLAUDE_DIR/remote-settings.json" ] && copy_file "$CLAUDE_DIR/remote-settings.json" "$REPO_DIR/"
  [ -f "$CLAUDE_DIR/GOVERNANCE.md" ] && copy_file "$CLAUDE_DIR/GOVERNANCE.md" "$REPO_DIR/"
  [ -f "$CLAUDE_DIR/.gitignore" ] && copy_file "$CLAUDE_DIR/.gitignore" "$REPO_DIR/"

  # Skills (ALL skills)
  echo "  Syncing skills..."
  remove_dir "$REPO_DIR/skills"
  $DRY_RUN || mkdir -p "$REPO_DIR/skills"
  for skill_dir in "$CLAUDE_DIR/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    [[ "$skill_name" == *"{"* || "$skill_name" == *"}"* ]] && continue
    $DRY_RUN || mkdir -p "$REPO_DIR/skills/$skill_name"
    [ -f "$skill_dir/SKILL.md" ] && copy_file "$skill_dir/SKILL.md" "$REPO_DIR/skills/$skill_name/"
  done

  # Agents (ALL agents)
  echo "  Syncing agents..."
  remove_dir "$REPO_DIR/agents"
  $DRY_RUN || mkdir -p "$REPO_DIR/agents"
  for agent in "$CLAUDE_DIR/agents"/*.md; do
    [ -f "$agent" ] || continue
    copy_file "$agent" "$REPO_DIR/agents/"
  done

  # Hooks (ALL hooks including gsd-*)
  echo "  Syncing hooks..."
  $DRY_RUN || mkdir -p "$REPO_DIR/hooks"
  for hook in "$CLAUDE_DIR/hooks"/*.{js,mjs,sh}; do
    [ -f "$hook" ] || continue
    copy_file "$hook" "$REPO_DIR/hooks/"
  done

  # Scripts
  echo "  Syncing scripts..."
  $DRY_RUN || mkdir -p "$REPO_DIR/scripts"
  for script in "$CLAUDE_DIR/scripts"/*; do
    [ -f "$script" ] || continue
    copy_file "$script" "$REPO_DIR/scripts/"
  done

  # Get Shit Done (full directory)
  echo "  Syncing get-shit-done..."
  remove_dir "$REPO_DIR/get-shit-done"
  if [ -d "$CLAUDE_DIR/get-shit-done" ]; then
    $DRY_RUN || cp -r "$CLAUDE_DIR/get-shit-done" "$REPO_DIR/"
  fi

  # GSD defaults
  $DRY_RUN || mkdir -p "$REPO_DIR/gsd"
  [ -f "$GSD_DIR/defaults.json" ] && copy_file "$GSD_DIR/defaults.json" "$REPO_DIR/gsd/"

  # Evolve templates
  $DRY_RUN || mkdir -p "$REPO_DIR/evolve/templates"
  for f in "$CLAUDE_DIR/evolve/templates/"*.md; do
    [ -f "$f" ] || continue
    copy_file "$f" "$REPO_DIR/evolve/templates/"
  done

  # External configs (plugin configs etc)
  if [ -d "$CLAUDE_DIR/external-configs" ]; then
    echo "  Syncing external-configs..."
    remove_dir "$REPO_DIR/external-configs"
    $DRY_RUN || cp -r "$CLAUDE_DIR/external-configs" "$REPO_DIR/"
  fi

  # GSD local patches
  if [ -d "$CLAUDE_DIR/gsd-local-patches" ]; then
    echo "  Syncing gsd-local-patches..."
    remove_dir "$REPO_DIR/gsd-local-patches"
    $DRY_RUN || cp -r "$CLAUDE_DIR/gsd-local-patches" "$REPO_DIR/"
  fi

  # Memory files (skip MEMORY.md index)
  echo "  Syncing memory..."
  $DRY_RUN || mkdir -p "$REPO_DIR/memory"
  $DRY_RUN || rm -f "$REPO_DIR/memory/"*.md
  # Global memory
  for f in "$CLAUDE_DIR/projects/-home-frok/memory/"*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    [ "$base" = "MEMORY.md" ] && continue
    copy_file "$f" "$REPO_DIR/memory/"
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
      copy_file "$f" "$REPO_DIR/memory/${project}__${base}"
    done
  done

  # Count what we synced
  if ! $DRY_RUN; then
    echo ""
    echo "=== Pull complete ==="
    echo "  Skills:  $(ls -d "$REPO_DIR/skills"/*/ 2>/dev/null | wc -l)"
    echo "  Agents:  $(ls "$REPO_DIR/agents/"*.md 2>/dev/null | wc -l)"
    echo "  Hooks:   $(ls "$REPO_DIR/hooks/"* 2>/dev/null | wc -l)"
    echo "  Scripts: $(ls "$REPO_DIR/scripts/"* 2>/dev/null | wc -l)"
    echo "  Memory:  $(ls "$REPO_DIR/memory/"*.md 2>/dev/null | wc -l)"
    echo ""
    echo "Review changes with: git diff --stat"
  fi
}

push() {
  echo "=== Pushing from repo into ~/.claude ==="

  # Top-level config files
  copy_file "$REPO_DIR/CLAUDE.md" "$CLAUDE_DIR/"
  copy_file "$REPO_DIR/settings.json" "$CLAUDE_DIR/"
  [ -f "$REPO_DIR/mcp.json" ] && copy_file "$REPO_DIR/mcp.json" "$CLAUDE_DIR/"
  [ -f "$REPO_DIR/.mcp.json" ] && copy_file "$REPO_DIR/.mcp.json" "$CLAUDE_DIR/"
  [ -f "$REPO_DIR/remote-settings.json" ] && copy_file "$REPO_DIR/remote-settings.json" "$CLAUDE_DIR/"
  [ -f "$REPO_DIR/GOVERNANCE.md" ] && copy_file "$REPO_DIR/GOVERNANCE.md" "$CLAUDE_DIR/"

  # Skills
  echo "  Pushing skills..."
  for skill_dir in "$REPO_DIR/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    $DRY_RUN || mkdir -p "$CLAUDE_DIR/skills/$skill_name"
    [ -f "$skill_dir/SKILL.md" ] && copy_file "$skill_dir/SKILL.md" "$CLAUDE_DIR/skills/$skill_name/"
  done

  # Agents
  echo "  Pushing agents..."
  $DRY_RUN || mkdir -p "$CLAUDE_DIR/agents"
  for agent in "$REPO_DIR/agents"/*.md; do
    [ -f "$agent" ] || continue
    copy_file "$agent" "$CLAUDE_DIR/agents/"
  done

  # Hooks
  echo "  Pushing hooks..."
  $DRY_RUN || mkdir -p "$CLAUDE_DIR/hooks"
  for hook in "$REPO_DIR/hooks"/*.{js,mjs,sh}; do
    [ -f "$hook" ] || continue
    copy_file "$hook" "$CLAUDE_DIR/hooks/"
  done

  # Scripts
  echo "  Pushing scripts..."
  $DRY_RUN || mkdir -p "$CLAUDE_DIR/scripts"
  for script in "$REPO_DIR/scripts"/*; do
    [ -f "$script" ] || continue
    copy_file "$script" "$CLAUDE_DIR/scripts/"
    $DRY_RUN || chmod +x "$CLAUDE_DIR/scripts/$(basename "$script")"
  done

  # Get Shit Done
  if [ -d "$REPO_DIR/get-shit-done" ]; then
    echo "  Pushing get-shit-done..."
    $DRY_RUN || cp -r "$REPO_DIR/get-shit-done" "$CLAUDE_DIR/"
  fi

  # GSD defaults
  $DRY_RUN || mkdir -p "$GSD_DIR"
  [ -f "$REPO_DIR/gsd/defaults.json" ] && copy_file "$REPO_DIR/gsd/defaults.json" "$GSD_DIR/"

  # Evolve templates
  $DRY_RUN || mkdir -p "$CLAUDE_DIR/evolve/templates"
  for f in "$REPO_DIR/evolve/templates/"*.md; do
    [ -f "$f" ] || continue
    copy_file "$f" "$CLAUDE_DIR/evolve/templates/"
  done

  # External configs
  if [ -d "$REPO_DIR/external-configs" ]; then
    echo "  Pushing external-configs..."
    $DRY_RUN || cp -r "$REPO_DIR/external-configs" "$CLAUDE_DIR/"
  fi

  # GSD local patches
  if [ -d "$REPO_DIR/gsd-local-patches" ]; then
    echo "  Pushing gsd-local-patches..."
    $DRY_RUN || cp -r "$REPO_DIR/gsd-local-patches" "$CLAUDE_DIR/"
  fi

  # Memory — restore global memory
  $DRY_RUN || mkdir -p "$CLAUDE_DIR/projects/-home-frok/memory"
  for f in "$REPO_DIR/memory/"*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    [[ "$base" == *"__"* ]] && continue
    copy_file "$f" "$CLAUDE_DIR/projects/-home-frok/memory/"
  done
  # Restore project-specific memory
  for f in "$REPO_DIR/memory/"*__*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    project="${base%%__*}"
    filename="${base#*__}"
    $DRY_RUN || mkdir -p "$CLAUDE_DIR/projects/$project/memory"
    copy_file "$f" "$CLAUDE_DIR/projects/$project/memory/$filename"
  done

  if ! $DRY_RUN; then
    echo ""
    echo "=== Push complete. Restart Claude Code to pick up changes. ==="
  fi
}

case "${1:-}" in
  pull)  pull ;;
  push)  push ;;
  *)
    echo "Usage: $0 [--dry-run] [pull|push]"
    echo "  pull — backup ~/.claude config into this repo"
    echo "  push — restore this repo into ~/.claude"
    exit 1
    ;;
esac

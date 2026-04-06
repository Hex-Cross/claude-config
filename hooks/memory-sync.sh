#!/bin/bash
# Auto-sync shared memories to the current project's memory directory on session start.
# Shared memories live in ~/.claude/projects/-home-frok/memory/ (the "global" pool).
# Only syncs memory types that should be universal: user, feedback.
# Project-specific and reference memories stay where they are.
#
# Runs on SessionStart. Skips if current project IS the home directory.

set -euo pipefail

SHARED_MEMORY_DIR="$HOME/.claude/projects/-home-frok/memory"
PROJECTS_DIR="$HOME/.claude/projects"

# Determine current project memory dir from CWD
CWD="${PWD:-$(pwd)}"
PROJECT_KEY=$(echo "$CWD" | sed 's|/|-|g')
TARGET_MEMORY_DIR="$PROJECTS_DIR/$PROJECT_KEY/memory"

# Skip if we ARE the home directory (source = target)
if [[ "$PROJECT_KEY" == "-home-frok" ]]; then
  exit 0
fi

# Skip if shared memory dir doesn't exist
if [[ ! -d "$SHARED_MEMORY_DIR" ]]; then
  exit 0
fi

# Ensure target memory dir exists
mkdir -p "$TARGET_MEMORY_DIR"

# Collect shared memory files that are type: user or type: feedback
SYNCED_FILES=()
for src_file in "$SHARED_MEMORY_DIR"/*.md; do
  [[ -f "$src_file" ]] || continue
  filename=$(basename "$src_file")

  # Skip MEMORY.md index — we rebuild it
  [[ "$filename" == "MEMORY.md" ]] && continue

  # Check if this memory is type: user or type: feedback (shared types)
  mem_type=$(grep -am1 '^type:' "$src_file" 2>/dev/null | sed 's/^type:[[:space:]]*//' | tr -d '[:space:]')
  if [[ "$mem_type" == "user" || "$mem_type" == "feedback" ]]; then
    dst_file="$TARGET_MEMORY_DIR/$filename"

    # Only copy if source is newer or destination doesn't exist
    if [[ ! -f "$dst_file" ]] || [[ "$src_file" -nt "$dst_file" ]]; then
      cp "$src_file" "$dst_file"
      SYNCED_FILES+=("$filename")
    fi
  fi
done

# Rebuild MEMORY.md index if we synced anything, or if it doesn't exist
if [[ ${#SYNCED_FILES[@]} -gt 0 ]] || [[ ! -f "$TARGET_MEMORY_DIR/MEMORY.md" ]]; then
  # Read existing MEMORY.md entries (project-local ones we should preserve)
  declare -A EXISTING_ENTRIES
  if [[ -f "$TARGET_MEMORY_DIR/MEMORY.md" ]]; then
    while IFS= read -r line; do
      # Extract filename from markdown link: - [Title](filename.md)
      fname=$(echo "$line" | grep -oP '\(([^)]+\.md)\)' | tr -d '()')
      if [[ -n "$fname" ]]; then
        EXISTING_ENTRIES["$fname"]="$line"
      fi
    done < "$TARGET_MEMORY_DIR/MEMORY.md"
  fi

  # Build entries for all synced shared memories
  for src_file in "$SHARED_MEMORY_DIR"/*.md; do
    [[ -f "$src_file" ]] || continue
    filename=$(basename "$src_file")
    [[ "$filename" == "MEMORY.md" ]] && continue

    mem_type=$(grep -am1 '^type:' "$src_file" 2>/dev/null | sed 's/^type:[[:space:]]*//' | tr -d '[:space:]')
    if [[ "$mem_type" == "user" || "$mem_type" == "feedback" ]]; then
      if [[ -z "${EXISTING_ENTRIES[$filename]:-}" ]]; then
        mem_name=$(grep -am1 '^name:' "$src_file" 2>/dev/null | sed 's/^name:[[:space:]]*//')
        mem_desc=$(grep -am1 '^description:' "$src_file" 2>/dev/null | sed 's/^description:[[:space:]]*//')
        mem_desc="${mem_desc:0:100}"
        EXISTING_ENTRIES["$filename"]="- [$mem_name]($filename) — $mem_desc"
      fi
    fi
  done

  # Also include any local-only memories that exist in target but not in shared
  for local_file in "$TARGET_MEMORY_DIR"/*.md; do
    [[ -f "$local_file" ]] || continue
    filename=$(basename "$local_file")
    [[ "$filename" == "MEMORY.md" ]] && continue
    if [[ -z "${EXISTING_ENTRIES[$filename]:-}" ]]; then
      mem_name=$(grep -am1 '^name:' "$local_file" 2>/dev/null | sed 's/^name:[[:space:]]*//')
      mem_desc=$(grep -am1 '^description:' "$local_file" 2>/dev/null | sed 's/^description:[[:space:]]*//')
      mem_desc="${mem_desc:0:100}"
      EXISTING_ENTRIES["$filename"]="- [$mem_name]($filename) — $mem_desc"
    fi
  done

  # Write MEMORY.md
  printf '%s\n' "${EXISTING_ENTRIES[@]}" | sort > "$TARGET_MEMORY_DIR/MEMORY.md"
fi

# Output summary for session context
if [[ ${#SYNCED_FILES[@]} -gt 0 ]]; then
  echo "Synced ${#SYNCED_FILES[@]} shared memories to project: ${SYNCED_FILES[*]}"
fi

#!/bin/bash
# Remind about /evolve audit on SessionStart if 7+ days since last run.
# Outputs a context message visible to the session.

set -euo pipefail

CACHE_DIR="$HOME/.cache/gsd"
TIMESTAMP_FILE="$CACHE_DIR/last-evolve-audit"
INTERVAL_DAYS=7

mkdir -p "$CACHE_DIR"

if [[ -f "$TIMESTAMP_FILE" ]]; then
  last_audit=$(cat "$TIMESTAMP_FILE" 2>/dev/null || echo "0")
  # Validate numeric — corrupted file should not crash
  if ! [[ "$last_audit" =~ ^[0-9]+$ ]]; then
    last_audit=0
  fi
  now=$(date +%s)
  elapsed=$(( (now - last_audit) / 86400 ))
  if [[ $elapsed -lt $INTERVAL_DAYS ]]; then
    exit 0
  fi
  echo "EVOLVE_AUDIT_REMINDER: Last skill ecosystem audit was ${elapsed} days ago. Consider running /evolve audit to check for gaps and improvements. Timestamp file: $TIMESTAMP_FILE"
else
  echo "EVOLVE_AUDIT_REMINDER: No skill ecosystem audit has ever been run. Consider running /evolve audit to check for gaps and improvements. Timestamp file: $TIMESTAMP_FILE"
fi

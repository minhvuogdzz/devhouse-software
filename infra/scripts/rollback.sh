#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Dev House Software — VPS Rollback Script (§37.4)
# Usage: ./rollback.sh [TARGET_IMAGE_TAG]
# ─────────────────────────────────────────────────────────────

BASE_DIR="/opt/devhouse"
COMPOSE_FILE="${BASE_DIR}/compose.prod.yml"
REGISTRY="${REGISTRY:-registry.gitlab.com/thedevhouse/web-repo}"
RELEASE_LOG="${BASE_DIR}/releases.log"
CURRENT_TAG_FILE="${BASE_DIR}/current_tag"
PREVIOUS_TAG_FILE="${BASE_DIR}/previous_tag"

TARGET_TAG="${1:-}"

if [[ -z "$TARGET_TAG" ]]; then
  if [[ -f "$PREVIOUS_TAG_FILE" ]]; then
    TARGET_TAG="$(cat "$PREVIOUS_TAG_FILE")"
  else
    echo "Error: No target tag specified and previous_tag file not found." >&2
    exit 1
  fi
fi

export REGISTRY
export IMAGE_TAG="$TARGET_TAG"

echo "========================================================"
echo " Starting rollback to tag: ${TARGET_TAG}"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================================"

# Pull target image if not already cached
docker compose -f "$COMPOSE_FILE" pull

# Recreate services with target tag
echo "Restarting services with tag ${TARGET_TAG}..."
docker compose -f "$COMPOSE_FILE" up -d

# Verify health
echo "Verifying health after rollback..."
sleep 10
if docker compose -f "$COMPOSE_FILE" exec -T api node apps/api/scripts/healthcheck.js >/dev/null 2>&1; then
  echo "SUCCESS: Rollback to ${TARGET_TAG} verified healthy."
  echo "$TARGET_TAG" > "$CURRENT_TAG_FILE"
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | rollback | ${TARGET_TAG} | success | actor=${USER:-ci}" >> "$RELEASE_LOG"
  exit 0
else
  echo "CRITICAL: Rollback failed health check!" >&2
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | rollback | ${TARGET_TAG} | failure | manual intervention required" >> "$RELEASE_LOG"
  exit 1
fi

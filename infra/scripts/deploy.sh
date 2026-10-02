#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Dev House Software — VPS Deployment Script (§37.3)
# Usage: ./deploy.sh <IMAGE_TAG>
# ─────────────────────────────────────────────────────────────

IMAGE_TAG="${1:-}"
if [[ -z "$IMAGE_TAG" ]]; then
  echo "Error: IMAGE_TAG must be provided as the first argument." >&2
  echo "Usage: $0 <IMAGE_TAG>" >&2
  exit 1
fi

BASE_DIR="/opt/devhouse"
COMPOSE_FILE="${BASE_DIR}/compose.prod.yml"
REGISTRY="${REGISTRY:-registry.gitlab.com/thedevhouse/web-repo}"
RELEASE_LOG="${BASE_DIR}/releases.log"
CURRENT_TAG_FILE="${BASE_DIR}/current_tag"
PREVIOUS_TAG_FILE="${BASE_DIR}/previous_tag"

export REGISTRY
export IMAGE_TAG

echo "========================================================"
echo " Starting deployment for tag: ${IMAGE_TAG}"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================================"

# Step 1: Record previous tag if exists
if [[ -f "$CURRENT_TAG_FILE" ]]; then
  PREV_TAG="$(cat "$CURRENT_TAG_FILE")"
  echo "$PREV_TAG" > "$PREVIOUS_TAG_FILE"
  echo "Previous tag recorded: ${PREV_TAG}"
else
  echo "No existing current tag found. First deployment."
fi

# Step 2: Pull images for the new tag
echo "Pulling images for tag ${IMAGE_TAG}..."
docker compose -f "$COMPOSE_FILE" pull

# Step 3: Run database migrations and idempotent seed in a one-off API container
echo "Running database migrations and idempotent seed..."
if ! docker compose -f "$COMPOSE_FILE" run --rm \
  -e NODE_ENV=production \
  api node apps/api/seeds/index.js; then
  echo "ERROR: Database migration or seed failed! Aborting deployment without switching services." >&2
  exit 1
fi

# Step 4: Recreate services in dependency order
echo "Bringing up services..."
docker compose -f "$COMPOSE_FILE" up -d api
sleep 3
docker compose -f "$COMPOSE_FILE" up -d web admin
sleep 2
docker compose -f "$COMPOSE_FILE" up -d edge

# Step 5: Wait for health checks
echo "Waiting for health gates to pass (timeout 90s)..."
TIMEOUT=90
ELAPSED=0
SUCCESS=false

while [[ $ELAPSED -lt $TIMEOUT ]]; do
  API_READY=false
  EDGE_READY=false

  # Check API ready endpoint through docker network
  if docker compose -f "$COMPOSE_FILE" exec -T api node apps/api/scripts/healthcheck.js >/dev/null 2>&1; then
    API_READY=true
  fi

  # Check edge endpoint
  HTTP_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://127.0.0.1/ -H "Host: www.devhouse.example" || true)
  if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "301" || "$HTTP_STATUS" == "302" ]]; then
    EDGE_READY=true
  fi

  if [[ "$API_READY" == "true" && "$EDGE_READY" == "true" ]]; then
    SUCCESS=true
    break
  fi

  sleep 5
  ELAPSED=$((ELAPSED + 5))
  echo "Checking health... (${ELAPSED}s / ${TIMEOUT}s)"
done

if [[ "$SUCCESS" == "true" ]]; then
  echo "SUCCESS: All health gates passed!"
  echo "$IMAGE_TAG" > "$CURRENT_TAG_FILE"
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | deploy | ${IMAGE_TAG} | success | actor=${USER:-ci}" >> "$RELEASE_LOG"

  # Step 6: Prune old images
  echo "Pruning dangling images..."
  docker image prune -f || true
  echo "Deployment completed successfully for ${IMAGE_TAG}."
  exit 0
else
  echo "ERROR: Health checks timed out or failed! Triggering automatic rollback..." >&2
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | deploy | ${IMAGE_TAG} | failure | auto-rollback triggered" >> "$RELEASE_LOG"

  # Step 7: Rollback to previous tag
  if [[ -f "$PREVIOUS_TAG_FILE" ]]; then
    PREV_TAG="$(cat "$PREVIOUS_TAG_FILE")"
    echo "Rolling back to previous tag: ${PREV_TAG}..."
    IMAGE_TAG="$PREV_TAG" "${BASE_DIR}/rollback.sh" "$PREV_TAG" || true
  else
    echo "No previous tag available to roll back to." >&2
  fi

  exit 1
fi

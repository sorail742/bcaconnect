#!/usr/bin/env bash
# Démarre le backend en dev — Postgres si infra docker OK, sinon SQLite.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

PORT="${PORT:-5001}"
PG_URL="${DATABASE_URL:-postgresql://bca_user:bca_password@localhost:5433/bcaconnect}"

try_postgres() {
  if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    return 1
  fi
  local db_ok
  db_ok=$(docker inspect --format='{{.State.Health.Status}}' bca_database 2>/dev/null || echo "missing")
  [ "$db_ok" = "healthy" ]
}

if [ "${USE_LOCAL_DB:-}" = "true" ] || [ "${FORCE_SQLITE:-}" = "1" ]; then
  echo "📦 Mode SQLite (USE_LOCAL_DB / FORCE_SQLITE)"
  exec env -u DATABASE_URL USE_LOCAL_DB=true PORT="$PORT" npm run dev
fi

if try_postgres; then
  echo "🐘 Mode Postgres (conteneur bca_database healthy)"
  export DATABASE_URL="$PG_URL"
  export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
  exec env PORT="$PORT" npm run dev
fi

echo "⚠️  Docker/Postgres indisponible — fallback SQLite (persistant backend/data/database.sqlite)"
echo "   Pour Postgres : ./scripts/docker-dev.sh  (voir permissions docker si erreur)"
echo ""
exec env -u DATABASE_URL USE_LOCAL_DB=true PORT="$PORT" npm run dev

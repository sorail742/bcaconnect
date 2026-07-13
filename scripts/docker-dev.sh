#!/usr/bin/env bash
# Démarre Postgres + Redis via docker-compose pour le dev local (sans rebuild backend/frontend).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker n'est pas installé."
    echo "   Installez Docker Desktop ou : sudo apt install docker.io docker-compose-v2"
    return 1
  fi

  if ! docker info >/dev/null 2>&1; then
    if [ -S /var/run/docker.sock ] && [ ! -r /var/run/docker.sock ]; then
      echo "❌ Permission refusée sur /var/run/docker.sock"
      echo ""
      echo "   Solution (une fois) :"
      echo "     sudo usermod -aG docker \"\$USER\""
      echo "     newgrp docker    # ou déconnexion / reconnexion"
      echo ""
      echo "   Ou lancez avec sudo :"
      echo "     sudo docker compose up -d db redis"
    elif ! systemctl is-active --quiet docker 2>/dev/null; then
      echo "❌ Le daemon Docker ne tourne pas."
      echo "   sudo systemctl start docker"
    else
      echo "❌ Impossible de contacter Docker."
      echo "   Vérifiez : docker info"
    fi
    return 1
  fi
  return 0
}

if ! check_docker; then
  echo ""
  echo "➡️  Continuer sans Docker (SQLite) :"
  echo "     ./scripts/dev-backend.sh"
  exit 1
fi

echo "🐳 Démarrage Postgres + Redis..."
docker compose up -d db redis

echo ""
echo "⏳ Attente santé des conteneurs..."
for _ in $(seq 1 45); do
  db_ok=$(docker inspect --format='{{.State.Health.Status}}' bca_database 2>/dev/null || echo "starting")
  redis_ok=$(docker inspect --format='{{.State.Health.Status}}' bca_redis 2>/dev/null || echo "starting")
  if [ "$db_ok" = "healthy" ] && [ "$redis_ok" = "healthy" ]; then
    break
  fi
  sleep 1
done

docker compose ps db redis

echo ""
echo "✅ Infra prête. Dans un terminal :"
echo ""
echo "  export DATABASE_URL=postgresql://bca_user:bca_password@localhost:5433/bcaconnect"
echo "  export REDIS_URL=redis://localhost:6379"
echo "  cd backend && npm run verify:postgres"
echo "  cd backend && PORT=5001 npm run dev"
echo ""
echo "  cd frontend && npm run dev   # http://localhost:3002"
echo ""
echo "⚠️  Si auth Postgres échoue (volume ancien) :"
echo "     docker compose down -v && docker compose up -d db redis"

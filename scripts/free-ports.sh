#!/usr/bin/env bash
# Libère les ports backend (5000) et frontend (3002)
set -e

for port in 5000 3002; do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -z "$pids" ]; then
    echo "✓ Port $port déjà libre"
    continue
  fi
  echo "Arrêt des processus sur le port $port : $pids"
  kill $pids 2>/dev/null || true
  sleep 0.5
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
  if lsof -ti :"$port" >/dev/null 2>&1; then
    echo "✗ Port $port encore occupé"
    lsof -i :"$port"
    exit 1
  fi
  echo "✓ Port $port libéré"
done

echo ""
echo "Ports 5000 et 3002 libres. Relance :"
echo "  cd backend  && npm run dev"
echo "  cd frontend && npm run dev"

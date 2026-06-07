#!/usr/bin/env bash
# Libère les ports backend (5000) et frontend (3002)
set -e

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -z "$pids" ]; then
    echo "✓ Port $port déjà libre"
    return 0
  fi

  echo "Arrêt des processus sur le port $port : $pids"
  for pid in $pids; do
    kill "$pid" 2>/dev/null || echo "  ⚠ kill $pid : $(kill "$pid" 2>&1 || true)"
    sleep 0.3
    kill -9 "$pid" 2>/dev/null || echo "  ⚠ kill -9 $pid : $(kill -9 "$pid" 2>&1 || true)"
  done
  sleep 0.5

  if lsof -ti :"$port" >/dev/null 2>&1; then
    echo "✗ Port $port encore occupé :"
    lsof -i :"$port"
    return 1
  fi
  echo "✓ Port $port libéré"
}

failed=0
kill_port 5000 || failed=1
kill_port 3002 || failed=1

# Tentative via pkill (processus lancés par Cursor en arrière-plan)
if [ "$failed" -ne 0 ]; then
  echo ""
  echo "Tentative pkill..."
  pkill -9 -f "helpers/node src/index.js" 2>/dev/null || true
  pkill -9 -f "bcaconnect/frontend/node_modules/.bin/vite" 2>/dev/null || true
  sleep 0.5
  if ! lsof -ti :5000,:3002 >/dev/null 2>&1; then
    failed=0
    echo "✓ Ports libérés via pkill"
  fi
fi

if [ "$failed" -ne 0 ]; then
  echo ""
  echo "Processus protégés par Cursor — solutions :"
  echo "  1. Panneau Cursor → arrêter les tâches shell en arrière-plan"
  echo "  2. kill -9 14163 14247  (dans ce terminal)"
  echo "  3. Redémarrer Cursor"
  exit 1
fi

echo ""
echo "Ports 5000 et 3002 libres. Relance :"
echo "  cd backend  && npm run dev"
echo "  cd frontend && npm run dev"

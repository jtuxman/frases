#!/usr/bin/env bash
#
# stop.sh - Detiene el servidor de "Frases en acción".
#
# Uso:
#   ./stop.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PID_FILE="$SCRIPT_DIR/.server.pid"
STOPPED=0

# Función: detener un proceso y todos sus hijos (npm -> vite/node)
stop_tree() {
  local pid="$1"
  # Intentar matar el grupo de procesos; si no, matar el PID directo
  pkill -TERM -P "$pid" 2>/dev/null || true
  kill -TERM "$pid" 2>/dev/null || true
}

# 1) Detener usando el PID guardado por start.sh
if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "==> Deteniendo servidor (PID $PID)..."
    stop_tree "$PID"
    # Esperar hasta 5 s a que termine; si no, forzar
    for _ in 1 2 3 4 5; do
      if kill -0 "$PID" 2>/dev/null; then sleep 1; else break; fi
    done
    if kill -0 "$PID" 2>/dev/null; then
      echo "==> No respondió, forzando cierre..."
      pkill -KILL -P "$PID" 2>/dev/null || true
      kill -KILL "$PID" 2>/dev/null || true
    fi
    STOPPED=1
  fi
  rm -f "$PID_FILE"
fi

# 2) Red de seguridad: matar cualquier proceso de Vite de este proyecto
if pkill -f "node.*vite" 2>/dev/null; then
  STOPPED=1
fi

if [ "$STOPPED" -eq 1 ]; then
  echo "==> Servidor detenido."
else
  echo "==> No había ningún servidor en ejecución."
fi

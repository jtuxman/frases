#!/usr/bin/env bash
#
# start.sh - Arranca el servidor de "Frases en acción" en segundo plano.
#
# Uso:
#   ./start.sh          # modo desarrollo (Vite dev, con recarga en caliente)
#   ./start.sh prod     # modo producción (build + preview)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-dev}"
PID_FILE="$SCRIPT_DIR/.server.pid"
LOG_FILE="$SCRIPT_DIR/server.log"
PORT=8000

# Verificar dependencias instaladas
if [ ! -d node_modules ]; then
  echo "ERROR: no existe 'node_modules'. Ejecuta primero:  ./install.sh" >&2
  exit 1
fi

# Si ya hay un servidor corriendo (según el PID guardado), no arrancar otro
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${OLD_PID:-}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "El servidor ya está corriendo (PID $OLD_PID)."
    echo "   Abre:  http://localhost:$PORT/"
    echo "   Para detenerlo:  ./stop.sh"
    exit 0
  fi
  # PID viejo e inválido: limpiarlo
  rm -f "$PID_FILE"
fi

case "$MODE" in
  dev)
    echo "==> Arrancando servidor de DESARROLLO (Vite) en el puerto $PORT..."
    CMD=(npm run dev)
    ;;
  prod)
    echo "==> Compilando build de producción..."
    npm run build
    echo "==> Arrancando servidor de PRODUCCIÓN (preview) en el puerto $PORT..."
    CMD=(npm run preview -- --port "$PORT" --strictPort --host)
    ;;
  *)
    echo "ERROR: modo desconocido '$MODE'. Usa 'dev' o 'prod'." >&2
    exit 1
    ;;
esac

# Lanzar en segundo plano, redirigiendo la salida al log
nohup "${CMD[@]}" > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# Dar unos segundos para que levante y comprobar que sigue vivo
sleep 3
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "ERROR: el servidor no pudo arrancar. Revisa el log:" >&2
  echo "   $LOG_FILE" >&2
  tail -n 20 "$LOG_FILE" >&2 || true
  rm -f "$PID_FILE"
  exit 1
fi

echo ""
echo "==> Servidor arrancado (PID $SERVER_PID)."
echo "    Abre en el navegador:  http://localhost:$PORT/"
echo "    Log en vivo:           tail -f \"$LOG_FILE\""
echo "    Para detenerlo:        ./stop.sh"

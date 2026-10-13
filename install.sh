#!/usr/bin/env bash
#
# install.sh - Instala las dependencias del juego "Frases en acción".
#
# Uso:
#   ./install.sh
#
set -euo pipefail

# Carpeta donde vive este script (raíz del proyecto)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Instalando 'Frases en acción' en: $SCRIPT_DIR"

# Verificar que node y npm estén disponibles
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'node'. Instala Node.js (https://nodejs.org) y vuelve a intentar." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'npm'. Instala Node.js (incluye npm) y vuelve a intentar." >&2
  exit 1
fi

echo "==> Node: $(node --version)   npm: $(npm --version)"

# Instalación reproducible si existe package-lock.json, si no, instalación normal
if [ -f package-lock.json ]; then
  echo "==> Ejecutando 'npm ci' (instalación limpia)..."
  if ! npm ci; then
    echo "==> 'npm ci' falló, probando con 'npm install'..."
    npm install
  fi
else
  echo "==> Ejecutando 'npm install'..."
  npm install
fi

echo ""
echo "==> ¡Listo! Dependencias instaladas."
echo "    Arranca el servidor con:  ./start.sh"
echo "    Detén el servidor con:    ./stop.sh"

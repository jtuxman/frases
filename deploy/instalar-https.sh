#!/bin/bash
# Instala el sitio HTTPS de "frases" en nginx. Ejecutar como root.
set -euo pipefail

SRC="$(dirname "$(readlink -f "$0")")/frases.conf"
DEST=/etc/nginx/conf.d/frases.conf

install -m 644 -o root -g root "$SRC" "$DEST"

if ! nginx -t; then
    echo "La configuración no pasó la prueba; se quita $DEST y nginx queda como estaba." >&2
    rm -f "$DEST"
    exit 1
fi

systemctl reload nginx
echo "Listo: https://galileo.ibt.unam.mx:8443/"

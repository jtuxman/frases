# Frases en acción

Juego didáctico para armar frases en español: el jugador mira una foto y elige las tres tarjetas (quién, qué hace, complemento) que forman la frase correcta.

- 35 ejercicios repartidos en 5 lugares: Casa, Escuela, Calle, Súper y Parque.
- Pide el nombre del jugador y lo usa para felicitarlo.
- Pistas progresivas, voz que lee la frase, música y celebración con confeti al acertar.
- El progreso y el nombre se guardan en el navegador (`localStorage`).

Hecho con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js con npm (probado con Node 24)

## Uso rápido

```bash
./install.sh      # instala las dependencias
./start.sh        # arranca en modo desarrollo, en segundo plano
./start.sh prod   # compila y arranca en modo producción
./stop.sh         # detiene el servidor
```

El servidor escucha en el puerto 8000: <http://localhost:8000/>. `start.sh` guarda el PID en `.server.pid` y la salida en `server.log`.

`stop.sh` también detiene cualquier otro servidor de Vite del mismo usuario en la máquina.

Comandos de npm, por si se prefiere no usar los scripts:

```bash
npm run dev       # servidor de desarrollo
npm run build     # compila a dist/
npm run preview   # sirve dist/
npm run lint      # oxlint
```

## Estructura

```
src/
  data/        ejercicios, lugares y tipos
  game/        lógica del juego y progreso guardado
  screens/     pantallas: título, mapa, juego y resultado
  components/  mascota, tarjetas, casillas, cielo, botón de silencio
  audio/       sonidos, música y voz
public/images/ fotos de los ejercicios
deploy/        archivos de configuración del servidor (ver abajo)
```

Para agregar un ejercicio se añade una entrada en `src/data/exercises.ts` y su foto en `public/images/`.

## Despliegue en el servidor

La app está publicada en <https://galileo.ibt.unam.mx:8443/>. Son dos piezas: un servicio de systemd que mantiene corriendo el servidor de Vite en el puerto 8000, y nginx, que pone HTTPS en el puerto 8443 y le pasa el tráfico.

```
navegador --HTTPS--> nginx :8443 --HTTP--> Vite 127.0.0.1:8000
```

### Servicio de systemd

El archivo es `deploy/frases.service`, instalado en `~/.config/systemd/user/frases.service`. Es un servicio de usuario, así que no necesita root.

- Arranca solo al encender la máquina. Para eso la cuenta debe tener *linger* activo: `loginctl enable-linger $USER`.
- Si el proceso se cae, systemd lo reinicia a los 3 segundos.
- Corre Vite en modo desarrollo, así que los cambios en el código se ven al instante.

Instalación:

```bash
cp deploy/frases.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now frases
```

Uso diario:

```bash
systemctl --user status frases     # ver estado
systemctl --user restart frases    # reiniciar
systemctl --user stop frases       # detener
systemctl --user start frases      # arrancar
journalctl --user -u frases -f     # ver el log en vivo
```

A tener en cuenta:

- El archivo tiene fijas la carpeta del proyecto y la ruta de Node (nvm `v24.15.0`). Al cambiar de máquina, de carpeta o de versión de Node hay que editar `WorkingDirectory`, `Environment` y `ExecStart`.
- Mientras el servicio esté activo, `./start.sh` falla porque el puerto 8000 ya está ocupado. `./stop.sh` sí detiene el servicio, y este no vuelve a arrancar hasta el siguiente `systemctl --user start frases` o el siguiente reinicio de la máquina.

### HTTPS con nginx

El archivo es `deploy/frases.conf`, instalado en `/etc/nginx/conf.d/frases.conf`.

- Usa el certificado de Let's Encrypt de `galileo.ibt.unam.mx`, que ya existía en `/etc/letsencrypt/live/galileo.ibt.unam.mx/` y que certbot renueva automáticamente. No se copia ni se duplica.
- Reenvía también los WebSocket, necesarios para la recarga en vivo de Vite.
- Si alguien entra con `http://` al puerto 8443, lo redirige a `https://`.

Instalación (requiere root):

```bash
sudo bash deploy/instalar-https.sh
```

El script copia la configuración, la prueba con `nginx -t` y recarga nginx. Si la prueba falla, borra el archivo y deja nginx como estaba.

Para quitarlo:

```bash
sudo rm /etc/nginx/conf.d/frases.conf
sudo systemctl reload nginx
```

`vite.config.ts` tiene `allowedHosts: true` para que Vite acepte las peticiones que llegan con el nombre del servidor.

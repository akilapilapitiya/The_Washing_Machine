#!/bin/sh
set -e

CERT_PATH="/etc/letsencrypt/live/washingmachine.truegate.live/fullchain.pem"
HTTPS_CONF="/etc/nginx/nginx.https.conf"
HTTP_CONF="/etc/nginx/nginx.http.conf"

if [ -f "$CERT_PATH" ]; then
    echo "[nginx] SSL cert found — starting with HTTPS config"
    cp "$HTTPS_CONF" /etc/nginx/conf.d/default.conf
else
    echo "[nginx] No SSL cert yet — starting with HTTP config"
    echo "[nginx] Run ssl:init in GitLab to get your certificate"
    cp "$HTTP_CONF" /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'

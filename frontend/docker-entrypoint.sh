#!/bin/sh
# Generate runtime configuration from environment variables.
# Runs automatically via nginx's /docker-entrypoint.d/ mechanism.
set -e

API_BASE_URL="${MEDIVOICE_API_BASE_URL:-http://localhost:8000}"
API_KEY="${MEDIVOICE_API_KEY:-medivoice-dev-client-key-2024}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__MEDIVOICE_CONFIG__ = {
  apiBaseUrl: "${API_BASE_URL}",
  apiKey: "${API_KEY}"
};
EOF

echo "[medivoice] runtime config written: apiBaseUrl=${API_BASE_URL}"

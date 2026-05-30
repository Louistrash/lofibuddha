#!/bin/bash
# Docker run script voor Hermes WebUI op de VPS
# Uitvoeren op de VPS host (85.215.43.194) als root

# Stop oude container als die bestaat
docker stop hermes-webui 2>/dev/null || true
docker rm hermes-webui 2>/dev/null || true

# Start Hermes WebUI container
# Deze container verbindt met de bestaande Hermes Agent op de VPS
docker run -d \
  --name hermes-webui \
  --restart unless-stopped \
  -p 8787:8787 \
  -v /opt/data/.hermes:/home/hermeswebui/.hermes:ro \
  -e HERMES_WEBUI_PORT=8787 \
  -e HERMES_WEBUI_HOST=0.0.0.0 \
  ghcr.io/nousresearch/hermes-webui:latest

echo "✅ Hermes WebUI gestart op poort 8787"
echo "Check: curl http://localhost:8787/"
docker logs --tail 5 hermes-webui

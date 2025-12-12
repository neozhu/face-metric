#!/usr/bin/env bash
set -euo pipefail

cd /app

python -m uvicorn apps.api.main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

cd /app/apps/web
npm run start &
WEB_PID=$!

term() {
  kill -TERM "$WEB_PID" "$API_PID" 2>/dev/null || true
  wait "$WEB_PID" "$API_PID" 2>/dev/null || true
}

trap term INT TERM

wait -n "$WEB_PID" "$API_PID"
term

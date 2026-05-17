#!/usr/bin/env bash
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check that setup has been run
if [ ! -d "$ROOT_DIR/backend/.venv" ]; then
  echo "ERROR: Backend venv not found. Run ./scripts/dev-setup.sh first."
  exit 1
fi

# Ensure DB is running
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start backend
echo "==> Starting backend on http://localhost:8001"
cd "$ROOT_DIR/backend"
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001 &
BACKEND_PID=$!

# Start frontend
echo "==> Starting frontend on http://localhost:5173"
cd "$ROOT_DIR/frontend"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "App is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8001"
echo "  API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop."

wait

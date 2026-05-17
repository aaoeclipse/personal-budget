#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Starting PostgreSQL via Docker (port 5435)..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d

echo "==> Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T db pg_isready -U postgres >/dev/null 2>&1; then
    echo "    PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "    ERROR: PostgreSQL did not become ready in time."
    exit 1
  fi
  sleep 1
done

echo "==> Setting up backend Python venv..."
cd "$ROOT_DIR/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

echo "==> Creating .env for backend..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Setting up frontend..."
cd "$ROOT_DIR/frontend"
npm install

echo ""
echo "Setup complete! Run the app with:"
echo "  ./scripts/dev-run.sh"

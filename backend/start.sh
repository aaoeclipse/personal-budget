#!/bin/sh
set -e

echo "Running database migrations..."
python -c "from app.config import settings; url=settings.DATABASE_URL; print(f'DB host: {url.split(\"@\")[1].split(\"/\")[0] if \"@\" in url else \"unknown\"}')" || true
alembic upgrade head
echo "Migrations complete."

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1

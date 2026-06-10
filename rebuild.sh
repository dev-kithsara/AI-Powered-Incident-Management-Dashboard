#!/bin/bash
# Clean old failed builds and restart
echo "==> Pruning old Docker build cache..."
docker system prune -f

echo "==> Starting docker-compose build..."
docker compose up --build -d

echo "==> Container status:"
docker compose ps


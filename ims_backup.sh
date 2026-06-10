#!/bin/bash
# ims_backup.sh — PostgreSQL backup script for IMS project
# Usage: bash ims_backup.sh
# Run from: project root (Windows with Docker Desktop)

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/ims_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Starting IMS PostgreSQL backup..."
echo "   Timestamp : $TIMESTAMP"
echo "   Output    : $BACKUP_FILE"

docker exec ims_postgres pg_dump \
  -U ims_user \
  -d incident_management \
  --no-password \
  > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "✅ Backup complete! File size: $SIZE"
echo ""
echo "To restore from this backup:"
echo "  cat $BACKUP_FILE | docker exec -i ims_postgres psql -U ims_user -d incident_management"

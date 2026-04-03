#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "Init cron extension (db host = $DB_HOST)"

psql -h "$DB_HOST" -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS pg_cron;"

for f in /cron/*.cron-job.sql; do
    psql -h "$DB_HOST" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done

echo Cron jobs scheduled successfully

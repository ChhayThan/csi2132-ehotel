#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

function psql_transaction() {
    psql -v ON_ERROR_STOP=1 --single-transaction --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$1"
}

echo "Starting database setup script..."

# 1. Run Python generation scripts
python3 ddl/generate_roles_from_env.py
python3 mock_data/populate_tables.py

echo "Executing SQL files in order..."

# 2. Run DDL and schema files
psql_transaction ddl/create_types.sql
psql_transaction ddl/create_tables.sql

# 3. Loop through functions and views
for f in functions/*.sql; do 
    psql_transaction "$f"
done

for f in views/*.sql; do 
    psql_transaction "$f"
done

# 4. Roles and triggers
psql_transaction ddl/init_roles.sql

for f in triggers/*.sql; do 
    psql_transaction "$f"
done

# 5. Load data and alter sequences
psql_transaction mock_data/load_mock_data.sql
psql_transaction ddl/alter_sequences.sql

echo "Database setup script completed successfully."

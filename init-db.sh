#!/bin/bash
set -e

# Script to initialize PostgreSQL database on Railway
echo "🗄️ Initializing PostgreSQL database for OPA Zero Poll..."

# Wait for PostgreSQL to be ready
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "✅ PostgreSQL is ready! Creating database schema..."

# Run schema creation
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f new-architecture/database/schema.sql

echo "✅ Database schema created! Loading seed data..."

# Run seed data
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f new-architecture/database/seed_data.sql

echo "🎉 Database initialization completed successfully!" 
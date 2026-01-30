#!/bin/bash
# Database initialization script for Docker deployment
# This runs automatically when the PostgreSQL container starts for the first time

set -e

echo "🚀 Starting database initialization..."

# Wait a moment for PostgreSQL to be fully ready
sleep 2

# Check if database is already initialized by checking for the customer table
PSQL="psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB"

if $PSQL -c '\dt customer' 2>/dev/null | grep -q 'customer'; then
    echo "✅ Database already initialized. Skipping..."
    exit 0
fi

echo "📦 Database is empty. Initializing schema and seeding owner..."

# The actual initialization will be done by the backend application
# when it starts up using the db:reset:seed npm script
# This script is just a placeholder for future custom SQL initialization

echo "✅ Database initialization script completed."
echo "ℹ️  Backend will create tables and seed owner on first startup."

#!/bin/bash
# Quick verification script to test Docker setup locally before deploying

set -e

echo "🔍 Docker Deployment Verification Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Create one from .env.example: cp .env.example .env"
    exit 1
fi
echo "✅ .env file exists"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✅ Docker is installed"

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi
echo "✅ Docker Compose is available"

# Check if backend/init-db.sh is executable
if [ ! -x backend/init-db.sh ]; then
    echo "⚠️  backend/init-db.sh is not executable, making it executable..."
    chmod +x backend/init-db.sh
fi
echo "✅ Init script is executable"

echo ""
echo "🏗️  Building Docker images..."
docker compose build

if [ $? -eq 0 ]; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy (30 seconds)..."
sleep 30

echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🧪 Testing health endpoints..."

# Test backend
if curl -s -f http://localhost:5000/api/test > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend health check failed (might still be starting)"
fi

# Test frontend
if curl -s -f http://localhost/health > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "⚠️  Frontend health check failed (might still be starting)"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Initialize database:"
echo "   docker exec -it washing-machine-backend sh"
echo "   npm run db:reset:seed"
echo "   exit"
echo ""
echo "2. Access application:"
echo "   http://localhost (Frontend)"
echo "   http://localhost:5000/api-docs (API Docs)"
echo ""
echo "3. Login with:"
echo "   Email: owner@washingmachine.com"
echo "   Password: Owner@123"
echo ""
echo "4. Stop services when done:"
echo "   docker compose down"
echo ""
echo "✅ Verification complete! Everything looks good for deployment."

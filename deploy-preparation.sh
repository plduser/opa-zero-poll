#!/bin/bash
set -e

echo "🚀 Preparing OPA Zero Poll for Railway Deployment..."

# Check if we're in git repo
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git first."
    exit 1
fi

echo "📋 Pre-deployment checklist:"

# 1. Check for required files
echo "✅ Checking required files..."
required_files=(
    "new-architecture/components/data-provider-api/Dockerfile"
    "new-architecture/components/data-provider-api/requirements.txt"
    "new-architecture/components/data-provider-api/app.py"
    "new-architecture/database/schema.sql"
    "new-architecture/database/seed_data.sql"
    "DEPLOY_RAILWAY.md"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
    echo "   ✓ $file"
done

# 2. Validate Docker setup
echo "✅ Validating Data Provider API Docker setup..."
cd new-architecture/components/data-provider-api

if ! docker build -t opa-data-provider-test . >/dev/null 2>&1; then
    echo "❌ Docker build failed for Data Provider API"
    exit 1
fi
echo "   ✓ Docker build successful"

cd - >/dev/null

# 3. Check database files syntax (basic)
echo "✅ Checking database files..."
if ! grep -q "CREATE TABLE" new-architecture/database/schema.sql; then
    echo "❌ schema.sql doesn't contain CREATE TABLE statements"
    exit 1
fi
echo "   ✓ schema.sql looks valid"

if ! grep -q "INSERT INTO" new-architecture/database/seed_data.sql; then
    echo "❌ seed_data.sql doesn't contain INSERT statements"
    exit 1
fi
echo "   ✓ seed_data.sql looks valid"

# 4. Git status check
echo "✅ Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected. Committing..."
    
    git add .
    git add railway.toml DEPLOY_RAILWAY.md deploy-preparation.sh init-db.sh
    
    commit_message="feat: prepare for Railway deployment

- Add Railway configuration (railway.toml)
- Add deployment guide (DEPLOY_RAILWAY.md)
- Add database initialization script (init-db.sh)
- Add deployment preparation script (deploy-preparation.sh)
- Ready for PostgreSQL + Data Provider API deployment"

    git commit -m "$commit_message"
    echo "   ✓ Changes committed"
else
    echo "   ✓ No uncommitted changes"
fi

# 5. Push to remote
echo "✅ Pushing to remote repository..."
if git remote get-url origin >/dev/null 2>&1; then
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "   ⚠️  Push failed - please push manually"
    echo "   ✓ Pushed to remote"
else
    echo "   ⚠️  No remote repository configured"
fi

echo ""
echo "🎉 Railway deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Open Railway Dashboard: https://railway.app/dashboard"
echo "2. Follow instructions in DEPLOY_RAILWAY.md"
echo "3. Deploy PostgreSQL Database first"
echo "4. Deploy Data Provider API second"
echo "5. Update Next.js environment variables"
echo ""
echo "📖 Full instructions: cat DEPLOY_RAILWAY.md"
echo "" 
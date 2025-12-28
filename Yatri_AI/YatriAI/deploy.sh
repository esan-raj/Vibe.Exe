#!/bin/bash

# YatriAI Deployment Script
echo "🚀 Deploying YatriAI Tourism Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the YatriAI root directory"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Check backend dependencies
echo "🔧 Checking backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Build backend
echo "📦 Building backend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Backend built successfully"

cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy frontend to Vercel: vercel"
echo "2. Deploy backend to Railway: Connect GitHub repo"
echo "3. Setup database: Create PostgreSQL on Neon/Supabase"
echo "4. Configure environment variables"
echo ""
echo "🌐 Your YatriAI platform is ready for deployment!"
#!/bin/bash

# ==========================================
# WeAlll Inventory - Deployment Script
# ==========================================
# Usage: ./deploy.sh [branch_name]
# Example: ./deploy.sh main

# Set variables
BRANCH=${1:-main} # Default to 'main' if no branch is specified
PM2_PROCESS_NAME="wealll-backend" # Change this if your PM2 process is named differently

echo "=========================================="
echo "🚀 Starting Deployment for branch: $BRANCH"
echo "=========================================="

# 1. Pull latest code
echo "📦 Pulling latest code from GitHub..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 2. Setup Backend
echo "⚙️  Setting up Backend..."
cd backend
npm install --production
cd ..

# 3. Setup and Build Frontend
echo "🎨 Setting up and Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Restart Backend Process
echo "🔄 Restarting Backend Server (PM2)..."
# Check if pm2 process exists, if not start it, otherwise restart it
if pm2 show $PM2_PROCESS_NAME > /dev/null; then
    pm2 restart $PM2_PROCESS_NAME
else
    echo "⚠️  PM2 process '$PM2_PROCESS_NAME' not found. Starting a new one..."
    cd backend
    pm2 start src/server.js --name $PM2_PROCESS_NAME
    pm2 save
    cd ..
fi

echo "=========================================="
echo "✅ Deployment Successful!"
echo "=========================================="

#!/bin/bash

# ==========================================
# WeAlll Inventory - UAT Deployment Script
# ==========================================
# Usage: ./deploy-uat.sh [branch_name]
# Example: ./deploy-uat.sh staging

# Set variables
BRANCH=${1:-staging}
PM2_PROCESS_NAME="wealll-inventory-backend-uat"
UAT_PORT=5011
UAT_DB="mongodb://localhost:27017/wealll_inventory_uat"

echo "=========================================="
echo "🚀 Starting UAT Deployment for branch: $BRANCH"
echo "=========================================="

# 1. Pull latest code
echo "📦 Pulling latest code from GitHub..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 2. Setup Backend
echo "⚙️ Setting up Backend..."
cd backend
npm install --production
cd ..

# 3. Setup and Build Frontend
echo "🏗️ Setting up and Building Frontend..."
cd frontend
# We need to tell the frontend to use the /api prefix or directly point to port 5011 if testing locally, 
# but in UAT on the server, Nginx will proxy /api to 5011 anyway.
npm install
npm run build
cd ..

# 4. Find Nginx Web Root and Copy Files
echo "🔍 Searching for Nginx web root for uat.wealll.com..."
NGINX_CONF=$(grep -Rl "uat.wealll.com" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -n 1)

if [ -n "$NGINX_CONF" ]; then
    WEB_ROOT=$(grep -E "^\s*root\s+" "$NGINX_CONF" | awk '{print $2}' | tr -d ';')
    if [ -n "$WEB_ROOT" ] && [ -d "$WEB_ROOT" ]; then
        # Check if the web root is the EXACT same directory as our local build folder
        CURRENT_BUILD_DIR="$(pwd)/frontend/dist"
        if [ "$WEB_ROOT" != "$CURRENT_BUILD_DIR" ]; then
            echo "✅ Found web root at $WEB_ROOT! Copying new frontend build..."
            # Clean the directory first to remove old agency files
            rm -rf $WEB_ROOT/*
            cp -r frontend/dist/* $WEB_ROOT/
            chown -R www-data:www-data $WEB_ROOT
        else
            echo "⚠️ Web root is the same as the build directory. Skipping copy step."
        fi
    else
        echo "❌ Could not parse web root from $NGINX_CONF or it does not exist."
    fi
else
    echo "⚠️ Nginx config for uat.wealll.com not found. We will attempt a fallback copy in the GitHub Action."
fi

# 5. Restart Backend Process
echo "🔄 Restarting UAT Backend Server (PM2)..."
if pm2 show $PM2_PROCESS_NAME > /dev/null; then
    # We pass the env variables to restart just in case
    cd backend
    MONGODB_URI=$UAT_DB PORT=$UAT_PORT pm2 restart $PM2_PROCESS_NAME --update-env
    cd ..
else
    echo "⚠️ PM2 process '$PM2_PROCESS_NAME' not found. Starting a new one..."
    cd backend
    MONGODB_URI=$UAT_DB PORT=$UAT_PORT pm2 start src/server.js --name $PM2_PROCESS_NAME
    pm2 save
    cd ..
fi

echo "=========================================="
echo "✅ UAT Deployment Successful!"
echo "=========================================="

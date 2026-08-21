#!/bin/bash

# ==========================================
# WeAlll Inventory - Deployment Script
# ==========================================
# Usage: ./deploy.sh [branch_name]
# Example: ./deploy.sh main

# Set variables
BRANCH=${1:-main}
PM2_PROCESS_NAME="wealll-inventory-backend"

echo "=========================================="
echo "?? Starting Deployment for branch: $BRANCH"
echo "=========================================="

# 1. Pull latest code (Already done in GitHub Actions, but leaving it just in case)
echo "?? Pulling latest code from GitHub..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 2. Setup Backend
echo "??  Setting up Backend..."
cd backend
npm install --production
cd ..

# 3. Setup and Build Frontend
echo "?? Setting up and Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Find Nginx Web Root and Copy Files
echo "?? Searching for Nginx web root for inventory.wealll.com..."
NGINX_CONF=$(grep -Rl "inventory.wealll.com" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -n 1)

if [ -n "$NGINX_CONF" ]; then
    WEB_ROOT=$(grep -E "^\s*root\s+" "$NGINX_CONF" | awk '{print $2}' | tr -d ';')
    if [ -n "$WEB_ROOT" ] && [ -d "$WEB_ROOT" ]; then
        # Check if the web root is the EXACT same directory as our local build folder
        CURRENT_BUILD_DIR="$(pwd)/frontend/dist"
        if [ "$WEB_ROOT" != "$CURRENT_BUILD_DIR" ]; then
            echo "?? Found web root at $WEB_ROOT! Copying new frontend build..."
            # Clean the directory first to remove old agency files
            rm -rf $WEB_ROOT/*
            cp -r frontend/dist/* $WEB_ROOT/
            chown -R www-data:www-data $WEB_ROOT
        else
            echo "?? Web root is the same as the build directory. Skipping copy step."
        fi
    else
        echo "??  Could not parse web root from $NGINX_CONF or it does not exist."
    fi
else
    echo "??  Nginx config for inventory.wealll.com not found. Falling back to /var/www/html..."
    if [ -d "/var/www/html" ]; then
        rm -rf /var/www/html/*
        cp -r frontend/dist/* /var/www/html/
        chown -R www-data:www-data /var/www/html
    fi
fi

# 5. Restart Backend Process
echo "?? Restarting Backend Server (PM2)..."
if pm2 show $PM2_PROCESS_NAME > /dev/null; then
    pm2 restart $PM2_PROCESS_NAME
else
    echo "??  PM2 process '$PM2_PROCESS_NAME' not found. Starting a new one..."
    cd backend
    pm2 start src/server.js --name $PM2_PROCESS_NAME
    pm2 save
    cd ..
fi

echo "=========================================="
echo "?? Deployment Successful!"
echo "=========================================="

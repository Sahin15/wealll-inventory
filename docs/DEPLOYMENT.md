# Deployment Plan

## Current Environment
The existing WeAlll systems reside on a VPS serving `wealll.cloud` via Nginx. The Inventory MVP will eventually be deployed to a test subdomain, e.g., `inventory-test.wealll.com`, co-existing on the same VPS.

## Process
1. **Source Code**: Pull latest changes from the Git repository to the VPS.
2. **Frontend Build**:
   - `cd frontend`
   - Create/update `.env` with `VITE_API_URL=/api`.
   - `npm ci`
   - `npm run build`
3. **Backend Setup**:
   - `cd backend`
   - Create/update `.env` with `PORT=5010`, `MONGODB_URI`, `JWT_SECRET`, etc.
   - `npm ci`
4. **Backend Process**: Start the backend process using PM2 to run on port `5010`.
   - `pm2 start src/server.js --name wealll-inventory`
5. **Nginx Configuration**:
   - Create a new server block in Nginx for `inventory-test.wealll.com`.
   - Serve static files from `frontend/dist` for `/` routes (handling React Router fallback).
   - Reverse proxy `/api` routes to `http://127.0.0.1:5010`.
6. **SSL**: Run Certbot to provision Let's Encrypt SSL certificates for the new subdomain.

> [!WARNING]
> Do NOT touch the existing `wealll.cloud` Nginx configuration blocks during this process.

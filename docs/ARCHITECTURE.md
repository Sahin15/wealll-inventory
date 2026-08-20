# Architecture

## Overview
WeAlll Inventory is a modular monolith containing a React (Vite) frontend and an Express/Node.js backend with MongoDB. The application is multi-tenant from day one.

## Core Architecture
- **Frontend**: React + Vite, Tailwind CSS, React Router, Axios. No TypeScript. Designed to be mobile-responsive and feel like a modern SaaS.
- **Backend**: Node.js + Express.
- **Database**: MongoDB Atlas.

## Guiding Principles
- **Separation of Concerns**: Keep route definitions, controller logic, and database operations clearly separated.
- **Transactions**: Use MongoDB transactions for multi-document mutations (e.g., Sales creation that decreases stock).
- **Tenant Isolation**: ALL business-critical endpoints must validate the `tenantId` from the JWT session, never trusting the client payload.

## Future Extensibility
While this MVP is a simple modular monolith, we are enforcing strict architectural rules (such as service layers and tenant isolation) to allow eventual migration to microservices if necessary.

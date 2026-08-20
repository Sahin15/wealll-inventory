# Multi-Tenancy

## Strategy
We use a **logical isolation** strategy where every tenant shares the same database and collections, but all data is tagged with a `tenantId`.

## Enforcement Rules
1. **Never trust the client**: The `tenantId` must always be extracted from the authenticated user's JWT (`req.user.tenantId`).
2. **Mandatory filtering**: Every database query, update, or deletion involving business entities must include the `tenantId` in the filter criteria:
   `Product.find({ tenantId: req.user.tenantId, ... })`
3. **Mongoose Middleware**: (Optional/where feasible) We use helpers or middleware to ensure this isn't accidentally omitted.

## Benefit
This allows the same SaaS application to serve multiple distinct beauty businesses without them seeing each other's data.

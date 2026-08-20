# Database Strategy

## Overview
WeAlll Inventory uses MongoDB Atlas. The database namespace (`wealll_inventory`) is kept completely separate from the existing WeAlll Office system (`wealll.cloud`).

## Core Collections
- `tenants`: Represents distinct businesses.
- `users`: Belongs to a tenant.
- `categories`: Product categories, isolated per tenant.
- `products`: Items for sale, isolated per tenant.
- `stockMovements`: Audit trail for any stock changes.
- `purchases`: Record of goods entering inventory.
- `sales`: Record of goods leaving inventory.

## Multi-Tenancy & Indexing
To enforce uniqueness within a tenant but allow overlap globally (e.g., "INV-001"), we use compound unique indexes:
`{ tenantId: 1, invoiceNumber: 1 }`
`{ tenantId: 1, sku: 1 }`

## Transactions
Modifications to `products`, `stockMovements`, and `purchases`/`sales` are bundled into MongoDB sessions to ensure atomicity. If a sale fails halfway, no stock is falsely deducted.

# API Design

## Structure
All endpoints are namespaced under `/api`.

- **Authentication**: `/api/auth/*`
- **Dashboard**: `/api/dashboard/*`
- **Products**: `/api/products/*`
- **Categories**: `/api/categories/*`
- **Stock**: `/api/stock/*`
- **Purchases**: `/api/purchases/*`
- **Sales**: `/api/sales/*`

## Responses
Successful responses generally return JSON formatted as:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Message"
}
```

## Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation failure
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Cross-tenant access attempted
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Unhandled server issues (errors scrubbed of stack traces in production)

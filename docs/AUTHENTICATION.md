# Authentication

## Mechanism
WeAlll Inventory uses stateless JWT (JSON Web Tokens) for authentication.

## Process
1. Client POSTs to `/api/auth/login` with `email` and `password`.
2. Server validates credentials against the `users` collection.
3. Server generates a JWT containing:
   - `userId`
   - `tenantId`
   - `role`
4. Client stores the JWT (e.g., `localStorage`) and sends it in the `Authorization: Bearer <token>` header for all protected requests.

## Security
- No sensitive data is stored inside the token.
- Passwords are hashed using `bcrypt` before storage.
- An initial admin user and tenant must be seeded since there is no public registration page for the MVP.

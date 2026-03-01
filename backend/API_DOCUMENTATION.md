# API Documentation

Complete API documentation is available at:

```
http://localhost:5000/api/docs
```

This interactive Swagger UI allows you to:
- View all available endpoints
- See request/response schemas
- Try out API calls directly
- Authorize with JWT tokens

## Base URL
```
http://localhost:5000
```

## Authentication

All endpoints except `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout` require JWT authentication.

### How to Authenticate

1. **Register or Login** to get tokens:
   ```bash
   POST /api/auth/register
   POST /api/auth/login
   ```

2. **Get an Access Token** in the response

3. **Use the Token** in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```

Or in Swagger UI:
- Click the "Authorize" button at the top
- Paste your access token (without "Bearer ")
- Click "Authorize"

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (blacklist token)
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get income/expense summary
- `GET /api/transactions/analytics/category-breakdown` - Get category-wise breakdown
- `GET /api/transactions/analytics/monthly-trend` - Get monthly trends

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

## User Roles

### Admin (`admin`)
- Full system access
- Manage all users
- View all transactions
- Modify any transaction

### User (`user`)
- Create, read, update, delete own transactions
- View analytics for own data
- Cannot manage other users

### Read-Only (`read-only`)
- View own transactions
- View analytics
- Cannot create, update, or delete transactions

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Access denied (insufficient permissions)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Example: Login Flow

### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-03-01T10:00:00Z"
  }
}
```

### 2. Use Access Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Refresh Token (when access token expires)
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Example: Create Transaction

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "description": "Grocery shopping",
    "transaction_date": "2026-03-01"
  }'
```

## Example: Get Transaction Summary

```bash
curl -X GET "http://localhost:5000/api/transactions/summary?startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer <your_access_token>"
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing it for production use.

## CORS Configuration

The API accepts requests from:
- Development: `http://localhost:5173` (React app)
- Configurable via `CORS_ORIGIN` environment variable

## Need More Help?

1. **Swagger UI**: Visit `http://localhost:5000/api/docs` for interactive documentation
2. **Check Examples**: Review the cURL examples above
3. **Check Logs**: Server logs will show validation and database errors
4. **Environment**: Ensure `.env` file is properly configured

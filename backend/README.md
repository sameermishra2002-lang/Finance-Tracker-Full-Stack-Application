# Express.js Backend - JWT Authentication with RBAC

Complete Express.js backend with JWT-based authentication and Role-Based Access Control (RBAC).

## Features

- ✅ User registration and login
- ✅ JWT access & refresh tokens (stateless)
- ✅ Token blacklist for refresh token one-time use
- ✅ Role-Based Access Control (admin, user, read-only)
- ✅ Protected routes with middleware
- ✅ PostgreSQL database
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Database Client:** pg (node-postgres)

## Project Structure

```
backend/
├── src/
│   ├── server.js                    # Entry point
│   ├── config/
│   │   ├── database.js             # PostgreSQL connection
│   │   └── jwt.js                  # JWT configuration
│   ├── models/
│   │   └── User.js                 # User model
│   ├── controllers/
│   │   ├── authController.js       # Auth logic
│   │   └── userController.js       # User management
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── roleMiddleware.js       # RBAC checks
│   │   └── errorHandler.js         # Error handling
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   └── userRoutes.js           # User endpoints
│   ├── utils/
│   │   ├── tokenUtils.js           # JWT utilities
│   │   └── validators.js           # Input validation
│   └── db/
│       ├── init.sql                # Database creation
│       └── schema.sql              # Table schemas
├── .env.example                     # Example environment variables
├── .gitignore
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_database_name;

# Connect to database
\c your_database_name

# Run schema (or use command below)
\i src/db/schema.sql

# Exit
\q
```

Or run from command line:
```bash
psql -U postgres -d your_database_name -f src/db/schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the backend folder:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-characters

# JWT Expiration
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Generate strong JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (blacklist token) |
| GET | `/api/auth/me` | Get current user info (protected) |

### User Routes (Protected)

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | admin |
| GET | `/api/users/:id` | Get user by ID | admin or owner |
| PUT | `/api/users/:id/role` | Update user role | admin |
| DELETE | `/api/users/:id` | Delete user | admin |

## API Examples

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-02-25T10:00:00.000Z"
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

### Protected Request

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Role-Based Access Control (RBAC)

### Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all features |
| **user** | Can manage own data |
| **read-only** | View-only access |

### Middleware Usage

```javascript
// Require authentication
router.get('/protected', authenticate, controller);

// Require specific role
router.delete('/users/:id', authenticate, requireRole(['admin']), controller);

// Allow multiple roles
router.post('/data', authenticate, requireRole(['admin', 'user']), controller);

// Owner or admin access
router.get('/users/:id', authenticate, requireOwnerOrAdmin(), controller);

// Block read-only users
router.post('/data', authenticate, blockReadOnly, controller);
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test1234!"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234!"}'
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Admin User

A default admin user is created when running schema.sql:
- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `Admin123!` (⚠️ Change this immediately!)

## Security Best Practices

1. ✅ **Strong JWT secrets** - Use random 32+ character strings
2. ✅ **Short access token expiry** - 15 minutes recommended
3. ✅ **Refresh token rotation** - Old refresh tokens are blacklisted
4. ✅ **Password hashing** - bcrypt with salt rounds
5. ✅ **HTTPS in production** - Always use HTTPS
6. ✅ **Environment variables** - Never commit .env files
7. ✅ **Input validation** - Validate all user inputs
8. ✅ **CORS configuration** - Restrict origins in production

## Production Deployment

1. Set `NODE_ENV=production`
2. Use Redis for token blacklist (instead of in-memory)
3. Enable HTTPS
4. Use connection pooling for PostgreSQL
5. Add rate limiting
6. Enable logging (Winston, Morgan)
7. Add monitoring (PM2, New Relic)

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check database exists: `psql -l`

### JWT Errors
- Ensure JWT secrets are set in `.env`
- Check token format: `Bearer <token>`
- Verify token hasn't expired

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

## License

ISC

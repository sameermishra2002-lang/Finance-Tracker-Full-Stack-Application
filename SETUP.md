# Local Development Setup Guide

Complete guide for setting up and running the Personal Finance Manager application locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing the API](#testing-the-api)
- [Common Issues](#common-issues)
- [Environment Variables](#environment-variables)

---

## Prerequisites

Ensure you have the following installed:

### Required
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Verify Installation
```bash
node --version      # Should be v18+
npm --version       # Should be v9+
psql --version      # Should be v12+
git --version       # Should be v2+
```

---

## Project Structure

```
Sameer Full Stack/
├── backend/                    # Express.js server
│   ├── src/
│   │   ├── server.js          # Main entry point
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   └── db/                # Database schemas
│   ├── package.json
│   └── .env                   # Environment variables (create this)
│
└── my-react-app/              # React frontend
    ├── src/
    │   ├── main.jsx           # Entry point
    │   ├── App.jsx            # Main component
    │   ├── components/        # React components
    │   ├── contexts/          # React contexts (e.g., AuthContext)
    │   └── services/          # API services
    ├── package.json
    └── .env                   # Environment variables (create this)
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd "Sameer Full Stack/backend"
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs all packages listed in `package.json`:
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variable management
- `swagger-ui-express` - API documentation UI
- `swagger-jsdoc` - Swagger/OpenAPI tool
- `nodemon` (dev) - Auto-restart on file changes

### Step 3: Create `.env` File

Create a file named `.env` in the backend directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**⚠️ Important**: Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to random values in production.

### Step 4: Verify Backend Configuration

Check that your `.env` matches the following:
- Database credentials match your PostgreSQL setup
- JWT secrets are set to secure random values
- CORS_ORIGIN points to your React app URL


## step 5: Redis Setup (Caching Layer)

This project uses **Redis** to cache analytics data such as:

- Monthly income vs expense trends
- Transaction summaries
- Category breakdown analytics

Caching helps reduce database load and improves dashboard performance.

### Running Redis with Docker (Recommended)

```bash
cd "Sameer Full Stack/backend"
docker run -d -p 6379:6379 --name redis-server redis

### Verify Redis is Running
docker ps

```
You should see a container running with port 6379.

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd "Sameer Full Stack/my-react-app"
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs packages including:
- `react` - UI library
- `axios` - HTTP client
- `recharts` - Charts library
- `vite` - Build tool

### Step 3: Create `.env` File

Create a file named `.env` in the frontend directory with:

```env
VITE_API_URL=http://localhost:5000/api
```

This tells the React app where to find the backend API.

---

## Database Setup

### Step 1: Create PostgreSQL Database

Open PowerShell or Command Prompt and connect to PostgreSQL:

```bash
psql -U postgres
```

Enter your PostgreSQL password when prompted.

### Step 2: Create Database and User

Run these SQL commands in the PostgreSQL prompt:

```sql
-- Create database
CREATE DATABASE auth_db;

-- Create user (if not exists)
CREATE USER postgres WITH PASSWORD 'your_postgres_password';

-- Grant privileges
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO 'on';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;

-- Connect to the new database
\c auth_db
```

### Step 3: Initialize Database Schema

From PowerShell, navigate to the backend and run:

```bash
cd "Sameer Full Stack/backend"
psql -U postgres -d auth_db -f src/db/schema.sql
psql -U postgres -d auth_db -f src/db/transactions-schema.sql
psql -U postgres -d auth_db -f src/db/init.sql
```

These commands create:
- `users` table with authentication fields
- `transactions` table with income/expense tracking
- Indexes and triggers for performance
- Initial test data (if any)

### Step 4: Verify Database Setup

```sql
\c auth_db
\dt                  -- List all tables
SELECT * FROM users; -- Should be empty or have test data
```

Type `\q` to exit the PostgreSQL prompt.

---

## Running the Application

### Terminal Setup

You'll need **three separate terminal windows/tabs**:

1. **Terminal 1**: PostgreSQL (if not running as a service)
2. **Terminal 2**: Backend Server
3. **Terminal 3**: Frontend Dev Server

### Option A: Running Everything Locally (Recommended)

#### Terminal 1: Backend Server
```bash
cd "Sameer Full Stack/backend"
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📝 Environment: development
🔗 API: http://localhost:5000
```

#### Terminal 2: Frontend Dev Server
```bash
cd "Sameer Full Stack/my-react-app"
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Option B: Production Build

#### Build Frontend
```bash
cd "Sameer Full Stack/my-react-app"
npm run build
```

Creates optimized build in `dist/` directory.

#### Run Backend
```bash
cd "Sameer Full Stack/backend"
npm start
```

---

## Testing the API

### Using Swagger UI (Recommended)

1. Open your browser and go to: `http://localhost:5000/api/docs`
2. You'll see the interactive API documentation
3. Click **Authorize** button at the top
4. Login to get an access token
5. Paste the token in the authorization popup
6. Test endpoints directly from the UI

### Using cURL

#### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

Save the `access_token` from the response.

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

#### Create a Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "description": "Lunch",
    "transaction_date": "2026-03-01"
  }'
```

### Using Postman

1. [Download Postman](https://www.postman.com/downloads/)
2. Import the API spec from: `http://localhost:5000/api/docs.json`
3. Use the imported collection to test endpoints

---

## Common Issues

### Issue: "Port 5000 already in use"

**Solution**: Kill the process using port 5000

```powershell
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or manually specify a different port in .env
PORT=5001
```

### Issue: "Cannot connect to database"

**Troubleshooting**:
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l

# Check connection string in .env
# Format: postgresql://user:password@host:port/database
```

### Issue: "Module not found" errors

**Solution**: Reinstall node modules
```bash
# Clear node modules
rm -r node_modules package-lock.json

# Reinstall
npm install
```

### Issue: CORS errors in browser console

**Solution**: Verify CORS_ORIGIN in `.env` matches your frontend URL
```env
# For local development
CORS_ORIGIN=http://localhost:5173

# For other ports
CORS_ORIGIN=http://localhost:3000
```

### Issue: "Cannot find .env file"

**Solution**: `.env` files are ignored by git. You must create them manually:
```bash
# Backend
cd backend
echo "EXAMPLE_CONTENT" > .env
# Then edit with your actual values

# Frontend
cd ../my-react-app
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Issue: JWT token errors

**Solution**:
1. Check token format: `Bearer <token>` (with space)
2. Verify JWT_SECRET in backend `.env`
3. Check token expiration: `1h` for access token
4. Use refresh endpoint to get new access token

---

## Environment Variables

### Backend `.env` Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 5433 | Database port |
| `DB_NAME` | auth_db | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | - | Database password |
| `JWT_SECRET` | - | Secret for access tokens (required) |
| `JWT_REFRESH_SECRET` | - | Secret for refresh tokens (required) |
| `JWT_EXPIRES_IN` | 1h | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | 7d | Refresh token expiry |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed frontend URL |

### Frontend `.env` Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | - | Backend API base URL |

---

## Scripts

### Backend Scripts
```bash
npm run dev       # Run with auto-reload (development)
npm start         # Run production server
npm test          # Run tests (not implemented yet)
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

---

## Next Steps

1. ✅ Backend is running on `http://localhost:5000`
2. ✅ Frontend is running on `http://localhost:5173`
3. ✅ API docs available at `http://localhost:5000/api/docs`
4. 🎯 Open browser and test the application
5. 📚 Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details

## Getting Help

- Check server logs for errors
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Visit Swagger UI: `http://localhost:5000/api/docs`
- Check `.env` file configuration
- Verify database connection

---

Happy coding! 🚀

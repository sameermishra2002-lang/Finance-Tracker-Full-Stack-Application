# Personal Finance Manager

A full-stack web application for managing personal finances with income/expense tracking, categorization, analytics, and role-based access control.

## 🌟 Features

### Core Features
- ✅ **User Authentication** - JWT-based authentication with refresh tokens
- ✅ **Income & Expense Tracking** - Categorized transactions with dates and descriptions
- ✅ **Transaction Management** - Create, read, update, delete transactions
- ✅ **Financial Analytics** - Summary, category breakdown, and monthly trends
- ✅ **Data Visualization** - Pie, Bar, and Line charts with Recharts
- ✅ **Role-Based Access Control** - Admin, User, and Read-Only roles
- ✅ **API Documentation** - Interactive Swagger/OpenAPI docs at `/api/docs`
- ✅ **Rate Limiting** - Protection against abuse and brute force attacks

### Technical Highlights
- **Backend**: Express.js with PostgreSQL
- **Frontend**: React with Vite and Recharts for visualizations
- **Authentication**: JWT with access & refresh tokens
- **Database**: PostgreSQL with optimized indexes
- **API**: RESTful with comprehensive error handling

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v12+
- npm v9+

### Setup Instructions

[📖 Read the complete setup guide](./SETUP.md)

**Quick Steps:**
```bash
# 1. Backend setup
cd "Sameer Full Stack/backend"
npm install
# Create .env file with database credentials

# 2. Frontend setup
cd "../my-react-app"
npm install
# Create .env file with VITE_API_URL

# 3. Initialize database
psql -U postgres -d finance_db -f ../backend/src/db/schema.sql
psql -U postgres -d finance_db -f ../backend/src/db/transactions-schema.sql

# 4. Run backend (Terminal 1)
cd ../backend
npm run dev

# 5. Run frontend (Terminal 2)
cd ../my-react-app
npm run dev
```

### Access the Application
- **Frontend**: `http://localhost:5173`
- **API**: `http://localhost:5000`
- **API Docs**: `http://localhost:5000/api/docs` (Swagger UI)

---

## 📁 Project Structure

```
Sameer Full Stack/
├── backend/                 # Express.js Backend
│   ├── src/
│   │   ├── server.js       # Main entry point with Swagger setup
│   │   ├── config/         # Configuration (database, JWT, Swagger)
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database operations
│   │   ├── routes/         # API endpoints (with Swagger docs)
│   │   ├── middleware/     # Auth, error handling, RBAC
│   │   ├── utils/          # JWT, validators
│   │   └── db/             # Database schemas and SQL
│   ├── package.json
│   └── .env               # Environment variables
│
├── my-react-app/           # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Auth context
│   │   ├── services/      # API calls
│   │   └── pages/         # Page components (Auth, Dashboard)
│   ├── package.json
│   └── .env              # Environment variables
│
├── SETUP.md              # 📖 Complete setup guide
└── README.md             # This file
```

---

## 🔐 Authentication

### Login Flow
1. **Register** or **Login** at `/api/auth/register` or `/api/auth/login`
2. Receive `access_token` (expires in 1h) and `refresh_token` (expires in 7d)
3. Include `Authorization: Bearer <access_token>` in subsequent requests
4. Use `/api/auth/refresh` to get new access token when expired

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, manage users, view all transactions |
| **User** | Create/edit own transactions, view own analytics |
| **Read-Only** | View only (no create/edit/delete) |

---

## 📚 API Documentation

### Interactive Swagger UI
Visit `http://localhost:5000/api/docs` for interactive API documentation where you can:
- View all endpoints with detailed schemas
- Try endpoints directly from the browser
- Authorize with JWT tokens
- See request/response examples

### Example API Calls

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "description": "Lunch",
    "transaction_date": "2026-03-01"
  }'
```

#### Get Summary
```bash
curl -X GET "http://localhost:5000/api/transactions/summary?startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer <token>"
```

[📖 See API_DOCUMENTATION.md for complete API reference](./backend/API_DOCUMENTATION.md)

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc)
- **Server**: Node.js

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Charts**: Recharts
- **CSS**: Vanilla CSS

### Development Tools
- **Backend**: Nodemon (auto-reload)
- **Linting**: ESLint
- **Testing**: (To be implemented)

---

## 📖 Documentation

- **[Setup Guide](./SETUP.md)** - Complete local development setup
- **[API Documentation](./backend/API_DOCUMENTATION.md)** - API reference and examples
- **[Rate Limiting Guide](./backend/RATE_LIMITING.md)** - Rate limit tiers and configuration
- **[Charts Integration](./CHARTS_INTEGRATION.md)** - Data visualization with Recharts
- **[Swagger UI](http://localhost:5000/api/docs)** - Interactive API docs (when running)

---

## 🚦 Running the Application

### Development Mode
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd my-react-app && npm run dev
```

### Production Build
```bash
# Build frontend
cd my-react-app && npm run build

# Run backend in production
cd backend && npm start
```

---

## 🔄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 API Endpoints Summary

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (Protected)

### Transactions (Protected)
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get summary
- `GET /api/transactions/analytics/category-breakdown` - Category breakdown
- `GET /api/transactions/analytics/monthly-trend` - Monthly trends

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

---

## 🐛 Common Issues & Solutions

### "Port already in use"
```bash
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### "Cannot connect to database"
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Ensure database and tables are created

### "Module not found"
```bash
rm -r node_modules package-lock.json
npm install
```

### "CORS errors"
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

See [SETUP.md](./SETUP.md#common-issues) for more troubleshooting.

---

## 📈 Future Enhancements

- [ ] Recurring transactions
- [ ] Budget planning and alerts
- [ ] Export reports (PDF, CSV)
- [ ] Multi-currency support
- [ ] Mobile app
- [ ] Data visualization improvements
- [ ] Unit and integration tests
- [ ] Rate limiting and security hardening

---

## 📝 License

This project is provided as-is for educational and personal use.

---

## 🤝 Contributing

Feel free to fork, modify, and improve this project for your own use.

---

## 📞 Support

- Check the [Setup Guide](./SETUP.md)
- Review [API Documentation](./backend/API_DOCUMENTATION.md)
- Visit Swagger UI: `http://localhost:5000/api/docs`
- Check server logs for detailed error messages

---

**Last Updated**: March 1, 2026  
**Version**: 1.0.0

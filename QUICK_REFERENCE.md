# Quick Reference Guide

Fast lookup for common tasks and commands.

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Install frontend dependencies
cd ../my-react-app && npm install

# 3. Create backend .env
cd ../backend
# Edit .env with your database credentials

# 4. Create frontend .env
cd ../my-react-app
# Add: VITE_API_URL=http://localhost:5000/api

# 5. Initialize database (one-time)
cd ../backend
psql -U postgres -d finance_db -f src/db/schema.sql
psql -U postgres -d finance_db -f src/db/transactions-schema.sql

# 6. Start backend (Terminal 1)
npm run dev

# 7. Start frontend (Terminal 2)
cd ../my-react-app && npm run dev

# 8. Open in browser
# - Frontend: http://localhost:5173
# - API Docs: http://localhost:5000/api/docs
```

---

## 🔑 Authentication Quick Start

### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@test.com","password":"Pass123!"}'
```

### 2. Save Token
```json
Copy the "access_token" from the response
```

### 3. Use Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 Common curl Commands

### List All Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions" \
  -H "Authorization: Bearer TOKEN"
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"expense",
    "category":"Food",
    "amount":25.50,
    "description":"Lunch",
    "transaction_date":"2026-03-01"
  }'
```

### Get Summary
```bash
curl -X GET "http://localhost:5000/api/transactions/summary" \
  -H "Authorization: Bearer TOKEN"
```

### Update Transaction
```bash
curl -X PUT "http://localhost:5000/api/transactions/1" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":30.00}'
```

### Delete Transaction
```bash
curl -X DELETE "http://localhost:5000/api/transactions/1" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🗄️ Database Commands

### Connect to Database
```bash
psql -U postgres -d finance_db
```

### View All Tables
```sql
\dt
```

### View Users
```sql
SELECT id, username, email, role FROM users;
```

### View Transactions
```sql
SELECT * FROM transactions WHERE user_id = 1;
```

### Check Database Schema
```sql
\d transactions
\d users
```

### Exit psql
```sql
\q
```

---

## 🛠️ npm Commands

### Backend
```bash
npm run dev       # Start with auto-reload
npm start         # Start production server
npm install       # Install packages
npm outdated      # Check updates
```

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Check code quality
npm run preview   # Preview production build
```

---

## 📁 File Structure Walkthrough

### Backend src/ directory
```
src/
├── server.js              ← Entry point, add new middleware/routes here
├── config/
│   ├── database.js        ← DB connection
│   ├── jwt.js             ← JWT config
│   └── swagger.js         ← API documentation config
├── routes/
│   ├── authRoutes.js      ← Auth endpoints
│   ├── transactionRoutes.js  ← Transaction endpoints
│   └── userRoutes.js      ← User management endpoints
├── controllers/
│   ├── authController.js  ← Auth business logic
│   ├── transactionController.js
│   └── userController.js
├── models/
│   ├── User.js            ← User DB operations
│   └── Transaction.js     ← Transaction DB operations
├── middleware/
│   ├── authMiddleware.js  ← JWT verification
│   ├── roleMiddleware.js  ← Permission checks
│   └── errorHandler.js    ← Global error handler
├── utils/
│   ├── tokenUtils.js      ← JWT token generation
│   └── validators.js      ← Input validation
└── db/
    ├── schema.sql         ← User & token tables
    ├── transactions-schema.sql  ← Transaction tables
    └── init.sql           ← Initial test data
```

### Frontend src/ directory
```
src/
├── main.jsx               ← Entry point
├── App.jsx                ← Main component
├── components/
│   └── pages/
│       ├── auth.jsx       ← Login/Register
│       └── Dashboard.jsx  ← Main dashboard
├── contexts/
│   └── AuthContext.jsx    ← Auth state
├── services/
│   └── api.js             ← API calls
├── assets/                ← Images, icons
└── css files
```

---

## 🔧 Environment Variables Checklist

### Backend .env
- [ ] `PORT` = 5000
- [ ] `DB_HOST` = localhost
- [ ] `DB_NAME` = finance_db
- [ ] `DB_USER` = postgres
- [ ] `DB_PASSWORD` = your_password
- [ ] `JWT_SECRET` = random_string
- [ ] `JWT_REFRESH_SECRET` = random_string
- [ ] `NODE_ENV` = development

### Frontend .env
- [ ] `VITE_API_URL` = http://localhost:5000/api

---

## 🧪 Testing Endpoints

### Using Swagger UI (Best)
1. Go to `http://localhost:5000/api/docs`
2. Click "Authorize" button
3. Paste your token
4. Try endpoints interactively

### Using Postman
1. Import: `http://localhost:5000/api/docs.json`
2. Use the generated collection
3. Set token in Authorization tab

### Using VS Code REST Client
Create file `test.http`:
```http
@host = http://localhost:5000
@token = YOUR_TOKEN_HERE

### Get current user
GET @host/api/auth/me
Authorization: Bearer @token

### Get transactions
GET @host/api/transactions
Authorization: Bearer @token

### Create transaction
POST @host/api/transactions
Authorization: Bearer @token
Content-Type: application/json

{
  "type": "expense",
  "category": "Food",
  "amount": 25.50,
  "description": "Test",
  "transaction_date": "2026-03-01"
}
```

Install REST Client extension and click "Send Request"

---

## 🐛 Debugging

### Check Logs
```bash
# Backend logs show request method and path
npm run dev
# Look for: GET /api/transactions
```

### Database Issues
```bash
# Check connection
psql -U postgres -d finance_db -c "SELECT 1"

# Reset password
ALTER USER postgres WITH PASSWORD 'new_password';
```

### Token Issues
```bash
# Token expires in 1 hour, use refresh endpoint
POST /api/auth/refresh
Body: {"refresh_token": "..."}

# Check token format: "Bearer <token>" not "Bearer<token>"
```

### CORS Issues
```env
# Verify in backend .env:
CORS_ORIGIN=http://localhost:5173
```

---

## 📊 Database Queries

### Get user expenses by category
```sql
SELECT category, SUM(amount) as total
FROM transactions
WHERE user_id = 1 AND type = 'expense'
GROUP BY category
ORDER BY total DESC;
```

### Get monthly spending
```sql
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
FROM transactions
WHERE user_id = 1
GROUP BY month
ORDER BY month;
```

### Get user with most transactions
```sql
SELECT u.username, COUNT(t.id) as tx_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id
ORDER BY tx_count DESC;
```

---
## 📊 Charts Quick Reference

The Dashboard includes 3 different chart types for data visualization:

### 1. **Pie Chart** - Category-wise Expenses
- Shows spending distribution by category
- Displays percentages
- Color-coded for easy identification
- Hover for exact amounts

### 2. **Bar Chart** - Income vs Expenses
- Quick financial health overview
- Green = Income, Red = Expenses
- Side-by-side comparison
- Shows totals

### 3. **Line Chart** - Monthly Income vs Expenses
- Tracks financial trends over time
- Month-by-month view
- Shows both income and expense lines
- Useful for budget planning

**All Charts**:
- Responsive (work on mobile/desktop)
- Interactive tooltips
- Currency formatting ($)
- Built with Recharts

For detailed info, see [CHARTS_INTEGRATION.md](./CHARTS_INTEGRATION.md)

---
## � Rate Limiting Quick Reference

### Rate Limit Tiers

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login/register) | 5 | 15 min |
| Transactions | 100 | 1 hour |
| Analytics | 50 | 1 hour |
| Admin (users) | 10 | 1 hour |

### What Happens at Rate Limit?

You'll get a **429 Too Many Requests** response:

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later."
}
```

### Check Rate Limit Status

```bash
curl -i http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN"

# Look for headers:
# RateLimit-Limit: 100
# RateLimit-Remaining: 87
# RateLimit-Reset: 1677652800
```

### Handle Rate Limiting (JavaScript)

```javascript
async function makeRequest(url) {
  const response = await fetch(url);
  
  if (response.status === 429) {
    const resetTime = response.headers.get('RateLimit-Reset');
    const waitMs = resetTime * 1000 - Date.now();
    console.log(`Wait ${waitMs}ms before retrying...`);
    await sleep(waitMs);
    return makeRequest(url); // Retry
  }
  
  return response;
}
```

### Testing Rate Limits

```bash
# Try 6 login attempts (limit is 5 per 15 min)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done
# 6th attempt gets 429
```

For detailed information, see [RATE_LIMITING.md](./backend/RATE_LIMITING.md)

---

## �🚨 Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Login and get new token |
| 403 Forbidden | Insufficient permissions | Check user role |
| 404 Not Found | Resource doesn't exist | Verify ID and user ownership |
| 429 Too Many Requests | Rate limit exceeded | Wait before retrying (check RateLimit-Reset header) |
| CORS error | Backend CORS not configured | Check CORS_ORIGIN in .env |
| Database connection error | DB not running/wrong credentials | Check DB and .env settings |
| Port already in use | Another process on port 5000 | Kill process or use different port |

---

## 📚 Documentation Links

- [Full Setup Guide](./SETUP.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Rate Limiting Guide](./backend/RATE_LIMITING.md)
- [Charts Integration](./CHARTS_INTEGRATION.md)
- [Swagger UI](http://localhost:5000/api/docs)

---

## ⚡ Quick Tips

1. **Swagger is your friend** - Use `http://localhost:5000/api/docs` for testing
2. **Save your token** - Copy access token for testing commands
3. **Check logs** - Server logs show exactly what went wrong
4. **Browser DevTools** - Network tab shows all API calls
5. **Use environment files** - Never commit `.env` to git

---

## 🎯 Common Development Tasks

### Add New Transaction Category
1. Edit `src/db/transactions-schema.sql`
2. Update category enum in database
3. Update Category options in frontend/backend

### Change Password Requirements
1. Edit `src/controllers/authController.js`
2. Modify validation regex
3. Update API documentation

### Add New User Role
1. Edit `src/models/User.js` UserRole enum
2. Add role in database
3. Create appropriate middleware
4. Update documentation

### Customize API Response
1. Edit relevant controller
2. Modify response JSON
3. Update Swagger docs
4. Test with Swagger UI

---

## 📞 Getting Help

1. Check [SETUP.md](./SETUP.md)
2. Visit Swagger UI: `http://localhost:5000/api/docs`
3. Review [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
4. Check server console for errors
5. Verify `.env` configuration

---

**Happy coding!** 🚀

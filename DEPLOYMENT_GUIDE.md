# Deployment & Setup Guide for HR Team

Complete step-by-step guide to set up and run the Personal Finance Manager application on any system.

---

## ✅ Prerequisites (Install First)

Your HR team needs to install these applications before starting:

### 1. **Node.js & npm**
- Download: https://nodejs.org/ (Choose LTS version)
- This includes both Node.js and npm
- **Verify installation** by opening Command Prompt and running:
  ```
  node --version
  npm --version
  ```

### 2. **PostgreSQL Database**
- Download: https://www.postgresql.org/download/
- During installation, remember the **password** you set for the `postgres` user (you'll need it!)
- **Verify installation**:
  ```
  psql --version
  ```

### 3. **Git** (Optional but recommended)
- Download: https://git-scm.com/
- Helps manage the project updates

---

## 🚀 Complete Setup Instructions

### Step 1: Extract & Navigate to Project

1. Extract the `Sameer Full Stack` folder to a convenient location
2. Open **Command Prompt** or **PowerShell**
3. Navigate to the project folder:
   ```
   cd "C:\path\to\Sameer Full Stack\Sameer Full Stack"
   ```

---

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies
```bash
cd backend
npm install
```
This will download all required packages (takes 1-2 minutes).

#### 2.2 Create Backend Configuration File

1. In the `backend` folder, create a new file named **`.env`** (important: the dot is part of the filename)
2. Copy and paste this content into the `.env` file:

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
JWT_SECRET=your_super_secret_jwt_key_12345_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_67890_change_this
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**⚠️ Important:** Replace `your_postgres_password` with the password you set during PostgreSQL installation!

---

### Step 3: Database Setup

#### 3.1 Create Database & Tables

1. Open **Command Prompt** or **PowerShell**
2. Go to the backend database folder:
   ```
   cd "Sameer Full Stack\Sameer Full Stack\backend\src\db"
   ```
3. Create the database and tables by running:
   ```
   psql -U postgres -f schema.sql
   ```
   You'll be prompted for password - enter your PostgreSQL password
   
4. Create transaction tables:
   ```
   psql -U postgres -d finance_db -f transactions-schema.sql
   ```
   Again, enter your PostgreSQL password when prompted

✅ **Success:** If no errors appear, your database is ready!

---

### Step 4: Frontend Setup

#### 4.1 Install Frontend Dependencies

1. Open a new Command Prompt/PowerShell window
2. Navigate to the frontend folder:
   ```
   cd "Sameer Full Stack\Sameer Full Stack\my-react-app"
   ```
3. Install dependencies:
   ```
   npm install
   ```

#### 4.2 Create Frontend Configuration File

1. In the `my-react-app` folder, create a file named **`.env`**
2. Copy this content:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Step 1: Start Backend Server

1. Open Command Prompt/PowerShell
2. Navigate to backend:
   ```
   cd "Sameer Full Stack\Sameer Full Stack\backend"
   ```
3. Start the server:
   ```
   npm run dev
   ```
4. You should see: `Server running on http://localhost:5000`

✅ **Keep this window open!** The backend must stay running.

### Step 2: Start Frontend Server (In a new terminal)

1. Open a **new** Command Prompt/PowerShell window
2. Navigate to frontend:
   ```
   cd "Sameer Full Stack\Sameer Full Stack\my-react-app"
   ```
3. Start the React app:
   ```
   npm run dev
   ```
4. You should see: `http://localhost:5173`

✅ **Keep this window open too!**

### Step 3: Access the Application

- **Open your web browser** and go to: `http://localhost:5173`
- The application should load! 🎉

---

## 👤 Sign Up & Login

### Creating an Account (Sign Up)

1. On the login page, click **"Sign Up"** or **"Register"**
2. Fill in the form:
   - **Username**: Your name or username
   - **Email**: Your email address
   - **Password**: A strong password
3. Click **"Sign Up"** button
4. You'll be redirected to login page

### Logging In

1. Enter your **Email** and **Password**
2. Click **"Login"**
3. ✅ You're now logged in and can access the dashboard!

---

## 📊 Using the Application

### Main Features

Once logged in, you can:

#### 1. **Add Transactions**
   - Click **"Add Transaction"** or **"New Transaction"**
   - Select type: **Income** or **Expense**
   - Choose **Category** (Food, Salary, etc.)
   - Enter **Amount** and **Description**
   - Click **"Add"**

#### 2. **View Dashboard**
   - See summary of income, expenses, and balance
   - View transaction history
   - See charts and analytics

#### 3. **Analytics & Charts**
   - **Pie Chart**: Breakdown by category
   - **Bar Chart**: Income vs Expenses
   - **Line Chart**: Monthly trends
   - **Summary**: Total income, expenses, and balance

#### 4. **Manage Transactions**
   - View all your transactions in a list
   - Edit or delete transactions (if you have permission)

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
- Check PostgreSQL is running
- Verify the password in `.env` file is correct
- Make sure `DB_NAME=finance_db` exists in database

### Issue: "Port 5000 already in use"
**Solution:**
- Another application is using port 5000
- Either close that application or change `PORT=5000` to `PORT=5001` in backend `.env`

### Issue: "Port 5173 already in use"
**Solution:**
- Close Vite server or use a different port
- Add to `my-react-app/.env`: `VITE_PORT=5174`

### Issue: "npm command not found"
**Solution:**
- Node.js/npm is not installed or not in PATH
- Restart your terminal after Node.js installation
- Verify with: `node --version`

### Issue: "psql command not found"
**Solution:**
- PostgreSQL is not in PATH
- Add PostgreSQL bin folder to system PATH
- Restart terminal and try again

---

## 📖 API Documentation

Once the backend is running, visit:
```
http://localhost:5000/api/docs
```

This shows all available API endpoints and allows you to test them directly in the browser.

---

## ⚠️ Important Notes

1. **Keep Both Windows Open**: The backend and frontend must both be running
2. **Database**: PostgreSQL must be running (usually starts automatically after installation)
3. **Credentials**: Keep your username/password secure
4. **Password Reset**: Contact the admin if you forget your password
5. **Browser**: Works best in Chrome, Firefox, or Edge

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message in the terminal carefully
2. Verify all prerequisites are installed
3. Make sure `.env` files have correct credentials
4. Restart both servers by stopping and running again
5. Check the troubleshooting section above

---

## ✨ That's It!

Your Finance Manager is ready to use. Enjoy tracking your finances! 📈💰

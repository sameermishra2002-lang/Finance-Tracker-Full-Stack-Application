-- ============================================================================
-- Transactions Table Schema
-- To be added to existing database
-- ============================================================================

-- Create transaction_type ENUM
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create transaction_category ENUM
CREATE TYPE transaction_category AS ENUM (
  'Salary', 'Freelance', 'Investment', 'Gift', 'Other',
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Healthcare', 'Education'
);

-- ============================================================================
-- Transactions Table
-- ============================================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    category transaction_category NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- Trigger to Update updated_at Timestamp
-- ============================================================================
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Useful Queries
-- ============================================================================

-- Get all transactions for a user
-- SELECT * FROM transactions WHERE user_id = 1 ORDER BY transaction_date DESC;

-- Get total income for a user
-- SELECT SUM(amount) as total_income 
-- FROM transactions 
-- WHERE user_id = 1 AND type = 'income';

-- Get total expenses for a user
-- SELECT SUM(amount) as total_expense 
-- FROM transactions 
-- WHERE user_id = 1 AND type = 'expense';

-- Get category-wise expenses
-- SELECT category, SUM(amount) as total 
-- FROM transactions 
-- WHERE user_id = 1 AND type = 'expense' 
-- GROUP BY category 
-- ORDER BY total DESC;

-- Get transactions by date range
-- SELECT * FROM transactions 
-- WHERE user_id = 1 
-- AND transaction_date BETWEEN '2026-01-01' AND '2026-12-31'
-- ORDER BY transaction_date DESC;

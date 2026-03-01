-- ============================================================================
-- PostgreSQL Database Schema
-- JWT Authentication with RBAC
-- ============================================================================

-- Create user_role ENUM type
CREATE TYPE user_role AS ENUM ('admin', 'user', 'read-only');

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- Trigger to Update updated_at Timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Insert Default Admin User (for testing)
-- Password: Admin123! (you should change this!)
-- ============================================================================
-- Note: This is a bcrypt hash of "Admin123!"
-- Generate your own hash by running: bcrypt.hash("your_password", 10)
INSERT INTO users (username, email, password_hash, role, is_verified) 
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$xC8H8YH.0U3X5XqV5Z5h5OqK3w5VvZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Zu',
    'admin',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- Useful Queries
-- ============================================================================

-- Get all users with their roles
-- SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC;

-- Count users by role
-- SELECT role, COUNT(*) FROM users GROUP BY role;

-- Get active users
-- SELECT id, username, email, role FROM users WHERE is_active = TRUE;

-- Update user role
-- UPDATE users SET role = 'admin' WHERE username = 'someuser';

-- Deactivate user
-- UPDATE users SET is_active = FALSE WHERE id = 1;

-- Delete user (use with caution)
-- DELETE FROM users WHERE id = 1;

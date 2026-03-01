# """
# User model for PostgreSQL database.
# Stores user credentials and role information.
# """
# from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
# from sqlalchemy.sql import func
# from datetime import datetime
# import enum


# class UserRole(str, enum.Enum):
#     """User roles for RBAC"""
#     ADMIN = "admin"
#     USER = "user"
#     READ_ONLY = "read-only"


# class User:
#     """
#     User table schema for authentication and RBAC.
    
#     JWT tokens are NOT stored in this table - tokens are stateless.
#     Only user credentials and role information are stored.
#     """
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True, autoincrement=True)
#     username = Column(String(50), unique=True, nullable=False, index=True)
#     email = Column(String(100), unique=True, nullable=False, index=True)
#     password_hash = Column(String(255), nullable=False)
    
#     # Role stored directly in user table (Option 1)
#     role = Column(
#         SQLEnum(UserRole, name="user_role"),
#         nullable=False,
#         default=UserRole.USER,
#         server_default=UserRole.USER.value
#     )
    
#     # Account status
#     is_active = Column(Boolean, default=True, nullable=False)
#     is_verified = Column(Boolean, default=False, nullable=False)
    
#     # Timestamps
#     created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now(),
#         nullable=False
#     )
#     last_login = Column(DateTime(timezone=True), nullable=True)
    
#     def __repr__(self):
#         return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
    
#     def to_dict(self):
#         """Convert user object to dictionary (exclude password)"""
#         return {
#             "id": self.id,
#             "username": self.username,
#             "email": self.email,
#             "role": self.role.value if isinstance(self.role, UserRole) else self.role,
#             "is_active": self.is_active,
#             "is_verified": self.is_verified,
#             "created_at": self.created_at.isoformat() if self.created_at else None,
#             "last_login": self.last_login.isoformat() if self.last_login else None
#         }


# # SQL Schema for PostgreSQL (for reference)
# """
# CREATE TYPE user_role AS ENUM ('admin', 'user', 'read-only');

# CREATE TABLE users (
#     id SERIAL PRIMARY KEY,
#     username VARCHAR(50) UNIQUE NOT NULL,
#     email VARCHAR(100) UNIQUE NOT NULL,
#     password_hash VARCHAR(255) NOT NULL,
#     role user_role DEFAULT 'user' NOT NULL,
#     is_active BOOLEAN DEFAULT TRUE NOT NULL,
#     is_verified BOOLEAN DEFAULT FALSE NOT NULL,
#     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
#     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
#     last_login TIMESTAMP WITH TIME ZONE
# );

# CREATE INDEX idx_users_username ON users(username);
# CREATE INDEX idx_users_email ON users(email);
# CREATE INDEX idx_users_role ON users(role);
# """

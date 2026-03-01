/**
 * Swagger/OpenAPI Configuration
 * Defines API documentation structure
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Finance Manager API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing personal finances with JWT authentication and role-based access control',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'user', 'read-only'] },
            is_active: { type: 'boolean' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            last_login: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', enum: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education'] },
            amount: { type: 'number', format: 'decimal' },
            description: { type: 'string' },
            transaction_date: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: []
  },
  apis: [
    './src/routes/*.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

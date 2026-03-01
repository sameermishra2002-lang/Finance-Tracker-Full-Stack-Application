/**
 * Express.js Server Entry Point
 * Handles JWT-based authentication with RBAC
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerSpec, { 
  swaggerOptions: { 
    persistAuthorization: true 
  } 
}));

// Swagger JSON spec
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/', (req, res) => {
  res.json({ message: 'Express JWT Auth API', version: '1.0.0' });
});

// API base route
app.get('/api', (req, res) => {
  res.json({
    message: 'Express JWT Auth API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      transactions: '/api/transactions'
    }
  });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// User routes (protected)
app.use('/api/users', userRoutes);

// Transaction routes (protected)
app.use('/api/transactions', transactionRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
});

export default app;

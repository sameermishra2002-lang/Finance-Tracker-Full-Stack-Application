/**
 * Error Handler Middleware
 * Centralized error handling
 */

/**
 * Global error handler
 * Must be the last middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }
  
  if (err.code === '23505') { // PostgreSQL unique constraint
    status = 409;
    message = 'Resource already exists';
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key constraint
    status = 400;
    message = 'Invalid reference';
  }
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

export default { errorHandler, notFoundHandler };

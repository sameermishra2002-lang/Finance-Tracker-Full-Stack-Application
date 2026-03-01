/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts routes based on user role
 */

/**
 * Check if user has one of the allowed roles
 * Usage: router.delete('/users/:id', authenticate, requireRole(['admin']), controller)
 * 
 * @param {string|string[]} allowedRoles - Single role or array of roles
 * @returns {Function} Express middleware
 */
export const requireRole = (allowedRoles) => {
  // Convert single role to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }
    
    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    
    next();
  };
};

/**
 * Check if user can access their own resource or is admin
 * Usage: router.get('/users/:id', authenticate, requireOwnerOrAdmin, controller)
 * 
 * @param {string} paramName - Parameter name to check (default: 'id')
 */
export const requireOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }
    
    const resourceUserId = parseInt(req.params[paramName]);
    
    // Allow if admin or owner
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You can only access your own resources' 
    });
  };
};

/**
 * Block read-only users from modifying data
 * Usage: router.post('/transactions', authenticate, blockReadOnly, controller)
 */
export const blockReadOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role === 'read-only') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Read-only users cannot modify data' 
    });
  }
  
  next();
};

export default { requireRole, requireOwnerOrAdmin, blockReadOnly };

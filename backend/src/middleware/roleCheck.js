/**
 * Middleware to enforce Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles List of roles allowed (e.g. 'Admin', 'Project Manager')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access forbidden. User role could not be determined.' });
    }

    const userRole = req.user.role.Role_Name;
    
    // Admin always has full access
    if (userRole === 'Admin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Access forbidden. Role '${userRole}' is not authorized to perform this operation.` 
    });
  };
};

module.exports = {
  authorizeRoles
};

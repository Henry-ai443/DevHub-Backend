const { AppError } = require('./errorHandler');

/**
 * Role-Based Access Control (RBAC)
 * Checks if user has required role(s)
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError(
      `Forbidden: Required role(s) ${allowedRoles.join(' or ')}`,
      403
    );
  }

  next();
};

/**
 * Check if user is developer
 */
const isDeveloper = (req, res, next) => {
  if (req.user?.role !== 'developer') {
    throw new AppError('Only developers can perform this action', 403);
  }
  next();
};

/**
 * Check if user is client
 */
const isClient = (req, res, next) => {
  if (req.user?.role !== 'client') {
    throw new AppError('Only clients can perform this action', 403);
  }
  next();
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Admin privileges required', 403);
  }
  next();
};

/**
 * Check if user not suspended
 */
const notSuspended = (userDocument) => {
  if (userDocument.isSuspended) {
    throw new AppError('Account suspended', 403);
  }
};

module.exports = {
  requireRole,
  isDeveloper,
  isClient,
  isAdmin,
  notSuspended,
};

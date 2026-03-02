const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');

/**
 * Verify JWT token from Authorization header
 * Sets req.user with decoded token payload
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data to check suspension status
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.isSuspended) {
      throw new AppError('Account suspended', 403);
    }

    // Validate token version (logout invalidates old tokens)
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError('Token invalidated', 401);
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Invalid or expired token', 401);
    }
    throw err;
  }
});

/**
 * Optional authentication - doesn't fail if token missing
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user && !user.isSuspended) {
      req.user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
    }
  } catch (err) {
    // Silently ignore auth errors for optional auth
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};
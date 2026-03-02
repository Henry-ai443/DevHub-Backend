const AuthService = require('../services/authService');
const { asyncHandler } = require('../utils/errorHandler');
const { validate, schemas } = require('../utils/validation');

/**
 * POST /api/auth/signup
 * Register a new user (developer or client)
 */
exports.signup = asyncHandler(async (req, res) => {
  const { error, value } = schemas.signup.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  const result = await AuthService.signup(value.email, value.password, value.role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
exports.login = asyncHandler(async (req, res) => {
  const { error, value } = schemas.login.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  const result = await AuthService.login(value.email, value.password);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * POST /api/auth/logout
 * Logout user by invalidating current token
 */
exports.logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.user.userId);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * POST /api/auth/refresh
 * Get a new access token
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const result = await AuthService.refreshToken(req.user.userId);

  res.json({
    success: true,
    message: 'Token refreshed',
    data: result,
  });
});



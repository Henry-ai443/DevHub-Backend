const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeveloperProfile = require('../models/DeveloperProfile');
const ClientProfile = require('../models/ClientProfile');
const { AppError } = require('../utils/errorHandler');

class AuthService {
  /**
   * Register a new user
   */
  static async signup(email, password, role = 'developer') {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      isVerified: false, // In production, send verification email
    });

    await user.save();

    // Create associated profile
    if (role === 'developer') {
      await DeveloperProfile.create({
        userId: user._id,
        displayName: '', // User should update this later
      });
    } else if (role === 'client') {
      await ClientProfile.create({
        userId: user._id,
        companyName: '',
      });
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      userId: user._id,
      email: user.email,
      role: user.role,
      token,
    };
  }

  /**
   * Authenticate user and return token
   */
  static async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isSuspended) {
      throw new AppError('Account suspended. Contact support.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);

    return {
      userId: user._id,
      email: user.email,
      role: user.role,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );
  }

  /**
   * Logout by incrementing token version
   */
  static async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });
  }

  /**
   * Refresh token
   */
  static async refreshToken(userId) {
    const user = await User.findById(userId);
    if (!user || user.isSuspended) {
      throw new AppError('Invalid refresh request', 401);
    }

    const token = this.generateToken(user);
    return { token };
  }
}

module.exports = AuthService;

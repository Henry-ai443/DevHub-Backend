const ProfileService = require('../services/profileService');
const { asyncHandler } = require('../utils/errorHandler');
const fetch = require('node-fetch');
const cloudinary = require('../config/cloudinary');

/**
 * GET /api/profile/me
 * Get current user's profile
 */
exports.getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Determine if user is developer or client
  const { role } = req.user;

  let profile;
  if (role === 'developer') {
    profile = await ProfileService.getDeveloperProfile(userId);
  } else if (role === 'client') {
    profile = await ProfileService.getClientProfile(userId);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid user role' });
  }

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * GET /api/profile/developer/:developerId
 * Get public developer profile
 */
exports.getDeveloperProfile = asyncHandler(async (req, res) => {
  const { developerId } = req.params;

  const profile = await ProfileService.getDeveloperProfile(developerId);

  // Only allow viewing if public (unless it's the owner or admin)
  if (
    profile.visibility === 'hidden' &&
    req.user?.userId !== developerId &&
    req.user?.role !== 'admin'
  ) {
    return res.status(403).json({ success: false, message: 'Profile is private' });
  }

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * PUT /api/profile/me/developer
 * Update developer profile
 */
exports.updateDeveloperProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  // Handle avatar upload
  if (req.file) {
    data.avatarUrl = req.file.path; // Cloudinary URL from multer
  } else if (data.generateAvatar) {
    // Generate DiceBear avatar if requested
    const avatarApiUrl = `https://api.dicebear.com/7.x/identicon/png?seed=${userId}`;
    const response = await fetch(avatarApiUrl);
    const buffer = await response.buffer();

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'avatars' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    data.avatarUrl = uploadResult.secure_url;
  }

  const profile = await ProfileService.updateDeveloperProfile(userId, data);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: profile,
  });
});

/**
 * PUT /api/profile/me/client
 * Update client profile
 */
exports.updateClientProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  const profile = await ProfileService.updateClientProfile(userId, data);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: profile,
  });
});

/**
 * GET /api/profile/developers/browse
 * Browse public developer profiles with filters
 */
exports.browseDevelopers = asyncHandler(async (req, res) => {
  const filters = {};
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  };

  // Apply filters
  if (req.query.skills) {
    filters.skills = req.query.skills.split(',');
  }
  if (req.query.experienceLevel) {
    filters.experienceLevel = req.query.experienceLevel;
  }
  if (req.query.isRemote !== undefined) {
    filters.isRemote = req.query.isRemote === 'true';
  }
  if (req.query.minRate) {
    filters.minRate = parseInt(req.query.minRate);
  }
  if (req.query.maxRate) {
    filters.maxRate = parseInt(req.query.maxRate);
  }

  const result = await ProfileService.browseDevelopers(filters, pagination);

  res.json({
    success: true,
    data: result.profiles,
    pagination: result.pagination,
  });
});

const DeveloperProfile = require('../models/DeveloperProfile');
const ClientProfile = require('../models/ClientProfile');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

class ProfileService {
  /**
   * Get developer profile by ID
   */
  static async getDeveloperProfile(developerId) {
    const profile = await DeveloperProfile.findOne({ userId: developerId })
      .populate('userId', 'email');

    if (!profile) {
      throw new AppError('Developer profile not found', 404);
    }

    return profile;
  }

  /**
   * Get client profile by ID
   */
  static async getClientProfile(clientId) {
    const profile = await ClientProfile.findOne({ userId: clientId })
      .populate('userId', 'email');

    if (!profile) {
      throw new AppError('Client profile not found', 404);
    }

    return profile;
  }

  /**
   * Update developer profile
   */
  static async updateDeveloperProfile(userId, data) {
    let profile = await DeveloperProfile.findOne({ userId });

    if (!profile) {
      throw new AppError('Developer profile not found', 404);
    }

    // Update allowed fields
    const allowedFields = [
      'displayName',
      'bio',
      'skills',
      'experienceLevel',
      'hourlyRate',
      'availabilityStatus',
      'portfolioLinks',
      'location',
      'isRemote',
      'avatarUrl',
      'visibility',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        profile[field] = data[field];
      }
    });

    // Calculate profile completeness score
    profile.profileCompletenessScore = this.calculateCompletenessScore(profile);

    await profile.save();

    return profile;
  }

  /**
   * Update client profile
   */
  static async updateClientProfile(userId, data) {
    let profile = await ClientProfile.findOne({ userId });

    if (!profile) {
      throw new AppError('Client profile not found', 404);
    }

    const allowedFields = ['companyName', 'industry'];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        profile[field] = data[field];
      }
    });

    await profile.save();

    return profile;
  }

  /**
   * Browse public developer profiles
   */
  static async browseDevelopers(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const query = {
      visibility: 'public',
    };

    // Apply filters
    if (filters.skills) {
      query.skills = { $in: Array.isArray(filters.skills) ? filters.skills : [filters.skills] };
    }

    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }

    if (filters.isRemote !== undefined) {
      query.isRemote = filters.isRemote;
    }

    if (filters.minRate !== undefined) {
      query.hourlyRate = { $gte: filters.minRate };
    }

    if (filters.maxRate !== undefined) {
      query.hourlyRate = { ...query.hourlyRate, $lte: filters.maxRate };
    }

    const profiles = await DeveloperProfile.find(query)
      .populate('userId', 'email')
      .sort({ averageRating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DeveloperProfile.countDocuments(query);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate profile completeness
   */
  static calculateCompletenessScore(profile) {
    let score = 0;
    const checks = [
      Boolean(profile.displayName),
      Boolean(profile.bio && profile.bio.length > 20),
      Boolean(profile.skills && profile.skills.length > 0),
      Boolean(profile.experienceLevel),
      Boolean(profile.hourlyRate > 0),
      Boolean(profile.portfolioLinks && profile.portfolioLinks.length > 0),
      Boolean(profile.location),
      Boolean(profile.avatarUrl),
    ];

    score = (checks.filter(Boolean).length / checks.length) * 100;
    return Math.round(score);
  }
}

module.exports = ProfileService;

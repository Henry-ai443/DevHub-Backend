const mongoose = require('mongoose');

const developerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      default: 'junior',
    },
    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'unavailable', 'busy'],
      default: 'available',
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: '',
    },
    isRemote: {
      type: Boolean,
      default: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    profileCompletenessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'hidden'],
      default: 'public',
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for discovery
developerProfileSchema.index({ visibility: 1, experienceLevel: 1 });
developerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('DeveloperProfile', developerProfileSchema);

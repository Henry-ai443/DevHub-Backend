const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        developerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'collaborator'],
          default: 'collaborator',
        },
        permissions: {
          type: [String],
          enum: ['read', 'write', 'admin'],
          default: ['read'],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'public-read'],
      default: 'private',
    },
    tags: {
      type: [String],
      default: [],
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for discovery
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ 'members.developerId': 1 });
projectSchema.index({ visibility: 1 });

module.exports = mongoose.model('Project', projectSchema);

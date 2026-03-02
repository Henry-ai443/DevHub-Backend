const mongoose = require('mongoose');

const projectInvitationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    invitedDeveloperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: 500,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one pending invitation per dev per project
projectInvitationSchema.index(
  { projectId: 1, invitedDeveloperId: 1, status: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('ProjectInvitation', projectInvitationSchema);

const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        'user.suspend',
        'user.unsuspend',
        'user.delete',
        'project.delete',
        'report.resolve',
        'review.remove',
        'content.moderate',
      ],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetType: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ actionType: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);

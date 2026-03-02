const mongoose = require('mongoose');

const hireRequestSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    budget_type: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
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

hireRequestSchema.index({ clientId: 1, status: 1 });
hireRequestSchema.index({ developerId: 1, status: 1 });

module.exports = mongoose.model('HireRequest', hireRequestSchema);

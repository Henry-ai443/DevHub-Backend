const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      maxlength: 100,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    hireHistory: [
      {
        developerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        projectTitle: String,
        completedAt: Date,
      },
    ],
    totalHires: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClientProfile', clientProfileSchema);

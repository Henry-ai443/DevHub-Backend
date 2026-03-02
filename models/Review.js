const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hireRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HireRequest',
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ developerId: 1 });
reviewSchema.index({ clientId: 1 });

module.exports = mongoose.model('Review', reviewSchema);

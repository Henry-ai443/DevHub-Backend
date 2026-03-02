const HireRequest = require('../models/HireRequest');
const Review = require('../models/Review');
const DeveloperProfile = require('../models/DeveloperProfile');
const { AppError } = require('../utils/errorHandler');

class HireService {
  /**
   * Create hire request
   */
  static async createHireRequest(clientId, data) {
    const hireRequest = new HireRequest({
      clientId,
      developerId: data.developerId,
      projectId: data.projectId || null,
      title: data.title,
      description: data.description || '',
      budget: data.budget || 0,
      budget_type: data.budget_type || 'fixed',
    });

    await hireRequest.save();
    return hireRequest.populate('clientId developerId', 'email');
  }

  /**
   * Accept hire request
   */
  static async acceptHireRequest(hireRequestId, userId) {
    const hireRequest = await HireRequest.findById(hireRequestId);

    if (!hireRequest) {
      throw new AppError('Hire request not found', 404);
    }

    if (hireRequest.developerId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (hireRequest.status !== 'pending') {
      throw new AppError('Request already responded', 409);
    }

    hireRequest.status = 'accepted';
    hireRequest.respondedAt = new Date();

    await hireRequest.save();
    return hireRequest;
  }

  /**
   * Reject hire request
   */
  static async rejectHireRequest(hireRequestId, userId) {
    const hireRequest = await HireRequest.findById(hireRequestId);

    if (!hireRequest) {
      throw new AppError('Hire request not found', 404);
    }

    if (hireRequest.developerId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (hireRequest.status !== 'pending') {
      throw new AppError('Request already responded', 409);
    }

    hireRequest.status = 'rejected';
    hireRequest.respondedAt = new Date();

    await hireRequest.save();
    return hireRequest;
  }

  /**
   * Complete hire request
   */
  static async completeHireRequest(hireRequestId, userId) {
    const hireRequest = await HireRequest.findById(hireRequestId);

    if (!hireRequest) {
      throw new AppError('Hire request not found', 404);
    }

    if (hireRequest.clientId.toString() !== userId && hireRequest.developerId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (hireRequest.status !== 'accepted') {
      throw new AppError('Only accepted requests can be completed', 400);
    }

    hireRequest.status = 'completed';
    await hireRequest.save();

    return hireRequest;
  }

  /**
   * List hire requests for developer
   */
  static async getDeveloperHireRequests(developerId, status = null) {
    const query = { developerId };

    if (status) {
      query.status = status;
    }

    const requests = await HireRequest.find(query)
      .populate('clientId', 'email')
      .sort({ createdAt: -1 });

    return requests;
  }

  /**
   * List hire requests for client
   */
  static async getClientHireRequests(clientId, status = null) {
    const query = { clientId };

    if (status) {
      query.status = status;
    }

    const requests = await HireRequest.find(query)
      .populate('developerId', 'email')
      .sort({ createdAt: -1 });

    return requests;
  }

  /**
   * Create review
   */
  static async createReview(hireRequestId, clientId, rating, comment = '') {
    const hireRequest = await HireRequest.findById(hireRequestId);

    if (!hireRequest) {
      throw new AppError('Hire request not found', 404);
    }

    if (hireRequest.clientId.toString() !== clientId) {
      throw new AppError('Only hiring client can review', 403);
    }

    if (hireRequest.status !== 'completed') {
      throw new AppError('Can only review completed hires', 400);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ hireRequestId });
    if (existingReview) {
      throw new AppError('Review already exists for this hire', 409);
    }

    const review = new Review({
      developerId: hireRequest.developerId,
      clientId,
      hireRequestId,
      rating,
      comment,
    });

    await review.save();

    // Update developer profile rating
    await this.updateDeveloperRating(hireRequest.developerId);

    return review.populate('developerId clientId', 'email');
  }

  /**
   * Update developer rating based on reviews
   */
  static async updateDeveloperRating(developerId) {
    const reviews = await Review.find({ developerId });

    if (reviews.length === 0) return;

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await DeveloperProfile.updateOne(
      { userId: developerId },
      {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      }
    );
  }

  /**
   * Get developer reviews
   */
  static async getDeveloperReviews(developerId) {
    const reviews = await Review.find({ developerId })
      .populate('clientId', 'email')
      .sort({ createdAt: -1 });

    return reviews;
  }
}

module.exports = HireService;

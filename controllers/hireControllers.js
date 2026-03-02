const HireService = require('../services/hireService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * POST /api/hires
 * Create hire request (client only)
 */
exports.createHireRequest = asyncHandler(async (req, res) => {
  const hireRequest = await HireService.createHireRequest(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Hire request sent',
    data: hireRequest,
  });
});

/**
 * POST /api/hires/:hireId/accept
 * Accept hire request (developer only)
 */
exports.acceptHireRequest = asyncHandler(async (req, res) => {
  const hireRequest = await HireService.acceptHireRequest(
    req.params.hireId,
    req.user.userId
  );

  res.json({
    success: true,
    message: 'Hire request accepted',
    data: hireRequest,
  });
});

/**
 * POST /api/hires/:hireId/reject
 * Reject hire request (developer only)
 */
exports.rejectHireRequest = asyncHandler(async (req, res) => {
  const hireRequest = await HireService.rejectHireRequest(
    req.params.hireId,
    req.user.userId
  );

  res.json({
    success: true,
    message: 'Hire request rejected',
    data: hireRequest,
  });
});

/**
 * POST /api/hires/:hireId/complete
 * Complete hire request (client or developer)
 */
exports.completeHireRequest = asyncHandler(async (req, res) => {
  const hireRequest = await HireService.completeHireRequest(
    req.params.hireId,
    req.user.userId
  );

  res.json({
    success: true,
    message: 'Hire request completed',
    data: hireRequest,
  });
});

/**
 * GET /api/hires/developer/requests
 * Get hire requests for developer
 */
exports.getDeveloperHireRequests = asyncHandler(async (req, res) => {
  const requests = await HireService.getDeveloperHireRequests(
    req.user.userId,
    req.query.status
  );

  res.json({
    success: true,
    data: requests,
  });
});

/**
 * GET /api/hires/client/requests
 * Get hire requests for client
 */
exports.getClientHireRequests = asyncHandler(async (req, res) => {
  const requests = await HireService.getClientHireRequests(
    req.user.userId,
    req.query.status
  );

  res.json({
    success: true,
    data: requests,
  });
});

/**
 * POST /api/reviews
 * Create review
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { hireRequestId, rating, comment } = req.body;

  const review = await HireService.createReview(
    hireRequestId,
    req.user.userId,
    rating,
    comment
  );

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review,
  });
});

/**
 * GET /api/reviews/developer/:developerId
 * Get developer reviews
 */
exports.getDeveloperReviews = asyncHandler(async (req, res) => {
  const reviews = await HireService.getDeveloperReviews(req.params.developerId);

  res.json({
    success: true,
    data: reviews,
  });
});

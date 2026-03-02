const AdminService = require('../services/adminService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * POST /api/admin/reports
 * Create report
 */
exports.createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;

  const report = await AdminService.createReport(
    req.user.userId,
    targetType,
    targetId,
    reason,
    description
  );

  res.status(201).json({
    success: true,
    message: 'Report submitted',
    data: report,
  });
});

/**
 * GET /api/admin/reports
 * Get pending reports (admin only)
 */
exports.getPendingReports = asyncHandler(async (req, res) => {
  const result = await AdminService.getPendingReports(req.query);

  res.json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
  });
});

/**
 * PUT /api/admin/reports/:reportId/resolve
 * Resolve report (admin only)
 */
exports.resolveReport = asyncHandler(async (req, res) => {
  const { action, notes } = req.body;

  const report = await AdminService.resolveReport(
    req.params.reportId,
    req.user.userId,
    action,
    notes
  );

  res.json({
    success: true,
    message: 'Report resolved',
    data: report,
  });
});

/**
 * POST /api/admin/users/:userId/suspend
 * Suspend user (admin only)
 */
exports.suspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await AdminService.suspendUser(
    req.params.userId,
    req.user.userId,
    reason
  );

  res.json({
    success: true,
    message: 'User suspended',
    data: user,
  });
});

/**
 * POST /api/admin/users/:userId/unsuspend
 * Unsuspend user (admin only)
 */
exports.unsuspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await AdminService.unsuspendUser(
    req.params.userId,
    req.user.userId,
    reason
  );

  res.json({
    success: true,
    message: 'User unsuspended',
    data: user,
  });
});

/**
 * GET /api/admin/logs
 * Get admin logs (admin only)
 */
exports.getAdminLogs = asyncHandler(async (req, res) => {
  const result = await AdminService.getAdminLogs(req.query, {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
  });

  res.json({
    success: true,
    data: result.logs,
    pagination: result.pagination,
  });
});

/**
 * GET /api/admin/stats
 * Get platform statistics (admin only)
 */
exports.getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await AdminService.getPlatformStats();

  res.json({
    success: true,
    data: stats,
  });
});

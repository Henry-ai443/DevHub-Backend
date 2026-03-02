const Report = require('../models/Report');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const Review = require('../models/Review');
const Project = require('../models/Project');
const Message = require('../models/Message');
const HireRequest = require('../models/HireRequest');
const { AppError } = require('../utils/errorHandler');

class AdminService {
  /**
   * Create report
   */
  static async createReport(reportedBy, targetType, targetId, reason, description = '') {
    const report = new Report({
      reportedBy,
      targetType,
      targetId,
      reason,
      description,
    });

    await report.save();
    return report.populate('reportedBy', 'email');
  }

  /**
   * Get pending reports
   */
  static async getPendingReports(pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ status: 'open' })
      .populate('reportedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ status: 'open' });

    return {
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Resolve report
   */
  static async resolveReport(reportId, adminId, action, notes) {
    const report = await Report.findById(reportId);

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    report.status = 'resolved';
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    report.adminNotes = notes;

    await report.save();

    // Log admin action
    await this.logAdminAction(adminId, 'report.resolve', reportId, { action });

    // Execute action if specified
    if (action === 'suspend_user') {
      await User.findByIdAndUpdate(report.targetId, { isSuspended: true });
    } else if (action === 'remove_content') {
      if (report.targetType === 'review') {
        await Review.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'project') {
        await Project.findByIdAndUpdate(report.targetId, { status: 'archived' });
      }
    }

    return report;
  }

  /**
   * Suspend user
   */
  static async suspendUser(userId, adminId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isSuspended = true;
    await user.save();

    await this.logAdminAction(adminId, 'user.suspend', userId, { reason });

    return user;
  }

  /**
   * Unsuspend user
   */
  static async unsuspendUser(userId, adminId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isSuspended = false;
    await user.save();

    await this.logAdminAction(adminId, 'user.unsuspend', userId, { reason });

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(userId, adminId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isSuspended = true; // Soft delete
    await user.save();

    await this.logAdminAction(adminId, 'user.delete', userId, { reason });

    return user;
  }

  /**
   * Log admin action
   */
  static async logAdminAction(adminId, actionType, targetId, metadata = {}) {
    const log = new AdminLog({
      adminId,
      actionType,
      targetId,
      metadata,
    });

    await log.save();
    return log;
  }

  /**
   * Get admin logs
   */
  static async getAdminLogs(filters = {}, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const query = {};

    if (filters.adminId) {
      query.adminId = filters.adminId;
    }

    if (filters.actionType) {
      query.actionType = filters.actionType;
    }

    const logs = await AdminLog.find(query)
      .populate('adminId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLog.countDocuments(query);

    return {
      logs,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats() {
    const [
      totalUsers,
      totalDevelopers,
      totalClients,
      totalProjects,
      totalHires,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'developer' }),
      User.countDocuments({ role: 'client' }),
      Project.countDocuments(),
      HireRequest.countDocuments({ status: 'completed' }),
      Review.countDocuments(),
    ]);

    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const openReports = await Report.countDocuments({ status: 'open' });

    return {
      users: {
        total: totalUsers,
        developers: totalDevelopers,
        clients: totalClients,
        suspended: suspendedUsers,
      },
      projects: totalProjects,
      hires: totalHires,
      reviews: totalReviews,
      reports: {
        open: openReports,
      },
    };
  }
}

module.exports = AdminService;

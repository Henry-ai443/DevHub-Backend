const express = require('express');
const router = express.Router();
const projectControllers = require('../controllers/projectControllers');
const taskControllers = require('../controllers/taskControllers');
const messageControllers = require('../controllers/messageControllers');
const hireControllers = require('../controllers/hireControllers');
const adminControllers = require('../controllers/adminControllers');
const { authenticate } = require('../middleware/authmiddleware');
const { isDeveloper, isClient, isAdmin } = require('../utils/rbac');

// ==================== PROJECT ROUTES ====================

// Create project (developer only)
router.post('/projects', authenticate, isDeveloper, projectControllers.createProject);

// Get user's projects
router.get('/projects', authenticate, projectControllers.listProjects);

// Get project details
router.get('/projects/:projectId', authenticate, projectControllers.getProject);

// Update project
router.put('/projects/:projectId', authenticate, projectControllers.updateProject);

// Invite member to project
router.post('/projects/:projectId/invite', authenticate, isDeveloper, projectControllers.inviteMember);

// Remove member from project
router.delete(
  '/projects/:projectId/members/:memberId',
  authenticate,
  isDeveloper,
  projectControllers.removeMember
);

// ==================== PROJECT INVITATION ROUTES ====================

// Accept project invitation
router.post(
  '/projects/invitations/:invitationId/accept',
  authenticate,
  isDeveloper,
  projectControllers.acceptInvitation
);

// Reject project invitation
router.post(
  '/projects/invitations/:invitationId/reject',
  authenticate,
  isDeveloper,
  projectControllers.rejectInvitation
);

// ==================== TASK ROUTES ====================

// Create task
router.post(
  '/projects/:projectId/tasks',
  authenticate,
  isDeveloper,
  taskControllers.createTask
);

// Get project tasks
router.get('/projects/:projectId/tasks', authenticate, taskControllers.listProjectTasks);

// Get task details
router.get('/tasks/:taskId', authenticate, taskControllers.getTask);

// Update task
router.put('/tasks/:taskId', authenticate, taskControllers.updateTask);

// Delete task
router.delete('/tasks/:taskId', authenticate, taskControllers.deleteTask);

// Get assigned tasks
router.get('/tasks/assigned', authenticate, taskControllers.getAssignedTasks);

// ==================== MESSAGE ROUTES ====================

// Send direct message (client or developer)
router.post(
  '/messages/direct',
  authenticate,
  messageControllers.sendDirectMessage
);

// Send project message
router.post(
  '/messages/project/:projectId',
  authenticate,
  isDeveloper,
  messageControllers.sendProjectMessage
);

// Get conversations
router.get('/conversations', authenticate, messageControllers.getConversations);

// Get conversation messages
router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  messageControllers.getConversationMessages
);

// Get project messages
router.get(
  '/projects/:projectId/messages',
  authenticate,
  messageControllers.getProjectMessages
);

// Mark conversation as read
router.put(
  '/conversations/:conversationId/mark-read',
  authenticate,
  messageControllers.markConversationAsRead
);

// ==================== HIRE ROUTES ====================

// Create hire request (client only)
router.post('/hires', authenticate, isClient, hireControllers.createHireRequest);

// Accept hire request (developer only)
router.post('/hires/:hireId/accept', authenticate, isDeveloper, hireControllers.acceptHireRequest);

// Reject hire request (developer only)
router.post('/hires/:hireId/reject', authenticate, isDeveloper, hireControllers.rejectHireRequest);

// Complete hire request
router.post('/hires/:hireId/complete', authenticate, hireControllers.completeHireRequest);

// Get developer hire requests
router.get(
  '/hires/developer/requests',
  authenticate,
  isDeveloper,
  hireControllers.getDeveloperHireRequests
);

// Get client hire requests
router.get(
  '/hires/client/requests',
  authenticate,
  isClient,
  hireControllers.getClientHireRequests
);

// ==================== REVIEW ROUTES ====================

// Create review (client only)
router.post('/reviews', authenticate, isClient, hireControllers.createReview);

// Get developer reviews
router.get('/reviews/developer/:developerId', hireControllers.getDeveloperReviews);

// ==================== ADMIN ROUTES ====================

// Create report (authenticated users)
router.post('/admin/reports', authenticate, adminControllers.createReport);

// Get pending reports (admin only)
router.get('/admin/reports', authenticate, isAdmin, adminControllers.getPendingReports);

// Resolve report (admin only)
router.put('/admin/reports/:reportId/resolve', authenticate, isAdmin, adminControllers.resolveReport);

// Suspend user (admin only)
router.post('/admin/users/:userId/suspend', authenticate, isAdmin, adminControllers.suspendUser);

// Unsuspend user (admin only)
router.post('/admin/users/:userId/unsuspend', authenticate, isAdmin, adminControllers.unsuspendUser);

// Get admin logs (admin only)
router.get('/admin/logs', authenticate, isAdmin, adminControllers.getAdminLogs);

// Get platform stats (admin only)
router.get('/admin/stats', authenticate, isAdmin, adminControllers.getPlatformStats);

module.exports = router;

const ProjectService = require('../services/projectService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * POST /api/projects
 * Create a new project
 */
exports.createProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.createProject(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

/**
 * GET /api/projects/:projectId
 * Get project details
 */
exports.getProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.getProjectById(req.params.projectId, req.user.userId);

  res.json({
    success: true,
    data: project,
  });
});

/**
 * PUT /api/projects/:projectId
 * Update project
 */
exports.updateProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.updateProject(
    req.params.projectId,
    req.user.userId,
    req.body
  );

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

/**
 * GET /api/projects
 * List user's projects
 */
exports.listProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectService.listUserProjects(req.user.userId, req.query);

  res.json({
    success: true,
    data: projects,
  });
});

/**
 * POST /api/projects/:projectId/invite
 * Invite developer to project
 */
exports.inviteMember = asyncHandler(async (req, res) => {
  const { developerId, message } = req.body;

  const invitation = await ProjectService.inviteMember(
    req.params.projectId,
    req.user.userId,
    developerId,
    message
  );

  res.status(201).json({
    success: true,
    message: 'Invitation sent',
    data: invitation,
  });
});

/**
 * POST /api/projects/invitations/:invitationId/accept
 * Accept project invitation
 */
exports.acceptInvitation = asyncHandler(async (req, res) => {
  const invitation = await ProjectService.acceptInvitation(
    req.params.invitationId,
    req.user.userId
  );

  res.json({
    success: true,
    message: 'Invitation accepted',
    data: invitation,
  });
});

/**
 * POST /api/projects/invitations/:invitationId/reject
 * Reject project invitation
 */
exports.rejectInvitation = asyncHandler(async (req, res) => {
  const invitation = await ProjectService.rejectInvitation(
    req.params.invitationId,
    req.user.userId
  );

  res.json({
    success: true,
    message: 'Invitation rejected',
    data: invitation,
  });
});

/**
 * DELETE /api/projects/:projectId/members/:memberId
 * Remove member from project
 */
exports.removeMember = asyncHandler(async (req, res) => {
  const project = await ProjectService.removeMember(
    req.params.projectId,
    req.user.userId,
    req.params.memberId
  );

  res.json({
    success: true,
    message: 'Member removed',
    data: project,
  });
});

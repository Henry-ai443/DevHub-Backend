const Project = require('../models/Project');
const ProjectInvitation = require('../models/ProjectInvitation');
const Task = require('../models/Task');
const { AppError } = require('../utils/errorHandler');

class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(userId, data) {
    const project = new Project({
      title: data.title,
      description: data.description || '',
      createdBy: userId,
      visibility: data.visibility || 'private',
      tags: data.tags || [],
      budget: data.budget || 0,
      deadline: data.deadline || null,
      members: [
        {
          developerId: userId,
          role: 'owner',
          permissions: ['read', 'write', 'admin'],
        },
      ],
    });

    await project.save();
    return project.populate('createdBy', 'email');
  }

  /**
   * Get project by ID with membership validation
   */
  static async getProjectById(projectId, userId = null) {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'email')
      .populate('members.developerId', 'email');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check access control
    if (project.visibility === 'private') {
      const isMember = project.members.some((m) => m.developerId._id.toString() === userId);
      if (!isMember && project.createdBy._id.toString() !== userId) {
        throw new AppError('Unauthorized to access this project', 403);
      }
    }

    return project;
  }

  /**
   * Update project
   */
  static async updateProject(projectId, userId, data) {
    const project = await this.getProjectById(projectId, userId);

    // Verify user is owner
    if (project.createdBy._id.toString() !== userId) {
      throw new AppError('Only project owner can update', 403);
    }

    const allowedFields = ['title', 'description', 'status', 'visibility', 'tags', 'budget', 'deadline'];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        project[field] = data[field];
      }
    });

    await project.save();
    return project;
  }

  /**
   * Invite developer to project
   */
  static async inviteMember(projectId, userId, invitedDeveloperId, message = '') {
    const project = await this.getProjectById(projectId, userId);

    // Verify user is owner
    if (project.createdBy._id.toString() !== userId) {
      throw new AppError('Only project owner can invite members', 403);
    }

    // Check if already a member
    const isMember = project.members.some((m) => m.developerId.toString() === invitedDeveloperId);
    if (isMember) {
      throw new AppError('Developer already a member', 409);
    }

    // Create invitation
    const invitation = new ProjectInvitation({
      projectId,
      invitedDeveloperId,
      invitedBy: userId,
      message,
    });

    await invitation.save();
    return invitation.populate('projectId invitedDeveloperId invitedBy', 'title displayName email');
  }

  /**
   * Accept project invitation
   */
  static async acceptInvitation(invitationId, userId) {
    const invitation = await ProjectInvitation.findById(invitationId);

    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    if (invitation.invitedDeveloperId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (invitation.status !== 'pending') {
      throw new AppError('Invitation already responded', 409);
    }

    // Add to project
    const project = await Project.findById(invitation.projectId);
    project.members.push({
      developerId: userId,
      role: 'collaborator',
      permissions: ['read', 'write'],
    });

    // Update invitation
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();

    await Promise.all([project.save(), invitation.save()]);

    return invitation;
  }

  /**
   * Reject project invitation
   */
  static async rejectInvitation(invitationId, userId) {
    const invitation = await ProjectInvitation.findById(invitationId);

    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    if (invitation.invitedDeveloperId.toString() !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (invitation.status !== 'pending') {
      throw new AppError('Invitation already responded', 409);
    }

    invitation.status = 'rejected';
    invitation.respondedAt = new Date();

    await invitation.save();
    return invitation;
  }

  /**
   * List user's projects
   */
  static async listUserProjects(userId, filters = {}) {
    const query = {
      $or: [
        { createdBy: userId },
        { 'members.developerId': userId },
      ],
    };

    if (filters.status) {
      query.status = filters.status;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'email')
      .populate('members.developerId', 'email')
      .sort({ createdAt: -1 });

    return projects;
  }

  /**
   * Remove member from project
   */
  static async removeMember(projectId, userId, memberId) {
    const project = await this.getProjectById(projectId, userId);

    // Verify user is owner
    if (project.createdBy._id.toString() !== userId) {
      throw new AppError('Only project owner can remove members', 403);
    }

    // Don't allow removing owner
    if (memberId === project.createdBy._id.toString()) {
      throw new AppError('Cannot remove project owner', 400);
    }

    project.members = project.members.filter((m) => m.developerId.toString() !== memberId);
    await project.save();

    return project;
  }
}

module.exports = ProjectService;

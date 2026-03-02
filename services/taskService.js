const Task = require('../models/Task');
const Project = require('../models/Project');
const { AppError } = require('../utils/errorHandler');

class TaskService {
  /**
   * Verify user has access to project
   */
  static async verifyProjectAccess(projectId, userId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((m) => m.developerId.toString() === userId);
    const isOwner = project.createdBy.toString() === userId;

    if (!isMember && !isOwner) {
      throw new AppError('Unauthorized', 403);
    }

    return project;
  }

  /**
   * Create a task
   */
  static async createTask(projectId, userId, data) {
    await this.verifyProjectAccess(projectId, userId);

    const task = new Task({
      projectId,
      title: data.title,
      description: data.description || '',
      status: 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
    });

    await task.save();
    return task;
  }

  /**
   * Get task by ID with validation
   */
  static async getTaskById(taskId, userId) {
    const task = await Task.findById(taskId).populate('projectId');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify access
    await this.verifyProjectAccess(task.projectId._id, userId);

    return task;
  }

  /**
   * Update task
   */
  static async updateTask(taskId, userId, data) {
    const task = await this.getTaskById(taskId, userId);

    const allowedFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        task[field] = data[field];
      }
    });

    if (data.status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    }

    await task.save();
    return task;
  }

  /**
   * Delete task
   */
  static async deleteTask(taskId, userId) {
    const task = await this.getTaskById(taskId, userId);

    await Task.findByIdAndDelete(taskId);

    return { message: 'Task deleted successfully' };
  }

  /**
   * List tasks for project
   */
  static async listProjectTasks(projectId, userId, filters = {}) {
    await this.verifyProjectAccess(projectId, userId);

    const query = { projectId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'email')
      .sort({ priority: -1, dueDate: 1 });

    return tasks;
  }

  /**
   * Get tasks assigned to user
   */
  static async getUserTasks(userId) {
    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'title')
      .sort({ dueDate: 1 });

    return tasks;
  }
}

module.exports = TaskService;

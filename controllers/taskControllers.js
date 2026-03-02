const TaskService = require('../services/taskService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * POST /api/projects/:projectId/tasks
 * Create a task
 */
exports.createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(
    req.params.projectId,
    req.user.userId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

/**
 * GET /api/projects/:projectId/tasks
 * List project tasks
 */
exports.listProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await TaskService.listProjectTasks(
    req.params.projectId,
    req.user.userId,
    req.query
  );

  res.json({
    success: true,
    data: tasks,
  });
});

/**
 * GET /api/tasks/:taskId
 * Get task details
 */
exports.getTask = asyncHandler(async (req, res) => {
  const task = await TaskService.getTaskById(req.params.taskId, req.user.userId);

  res.json({
    success: true,
    data: task,
  });
});

/**
 * PUT /api/tasks/:taskId
 * Update task
 */
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(req.params.taskId, req.user.userId, req.body);

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

/**
 * DELETE /api/tasks/:taskId
 * Delete task
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  const result = await TaskService.deleteTask(req.params.taskId, req.user.userId);

  res.json({
    success: true,
    message: result.message,
  });
});

/**
 * GET /api/tasks/assigned
 * Get tasks assigned to user
 */
exports.getAssignedTasks = asyncHandler(async (req, res) => {
  const tasks = await TaskService.getUserTasks(req.user.userId);

  res.json({
    success: true,
    data: tasks,
  });
});

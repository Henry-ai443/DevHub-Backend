const MessageService = require('../services/messageService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * POST /api/messages/direct
 * Send direct message
 */
exports.sendDirectMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  const message = await MessageService.sendDirectMessage(
    req.user.userId,
    receiverId,
    content
  );

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: message,
  });
});

/**
 * POST /api/messages/project/:projectId
 * Send project message
 */
exports.sendProjectMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const message = await MessageService.sendProjectMessage(
    req.params.projectId,
    req.user.userId,
    content
  );

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: message,
  });
});

/**
 * GET /api/conversations
 * Get user's conversations
 */
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await MessageService.getUserConversations(req.user.userId);

  res.json({
    success: true,
    data: conversations,
  });
});

/**
 * GET /api/conversations/:conversationId/messages
 * Get conversation messages
 */
exports.getConversationMessages = asyncHandler(async (req, res) => {
  const result = await MessageService.getConversationMessages(
    req.params.conversationId,
    req.user.userId,
    req.query
  );

  res.json({
    success: true,
    data: result.messages,
    pagination: result.pagination,
  });
});

/**
 * GET /api/projects/:projectId/messages
 * Get project messages
 */
exports.getProjectMessages = asyncHandler(async (req, res) => {
  const result = await MessageService.getProjectMessages(
    req.params.projectId,
    req.user.userId,
    req.query
  );

  res.json({
    success: true,
    data: result.messages,
    pagination: result.pagination,
  });
});

/**
 * PUT /api/conversations/:conversationId/mark-read
 * Mark conversation as read
 */
exports.markConversationAsRead = asyncHandler(async (req, res) => {
  await MessageService.markAsRead(req.params.conversationId, req.user.userId);

  res.json({
    success: true,
    message: 'Conversation marked as read',
  });
});

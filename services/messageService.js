const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Project = require('../models/Project');
const { AppError } = require('../utils/errorHandler');

class MessageService {
  /**
   * Get or create conversation between two users
   */
  static async getOrCreateConversation(userId, otherUserId) {
    if (userId === otherUserId) {
      throw new AppError('Cannot message yourself', 400);
    }

    // Ensure consistent ordering
    const [user1, user2] = [userId, otherUserId].sort();

    let conversation = await Conversation.findOne({
      participant1Id: user1,
      participant2Id: user2,
    });

    if (!conversation) {
      conversation = new Conversation({
        participant1Id: user1,
        participant2Id: user2,
      });
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Send direct message
   */
  static async sendDirectMessage(senderId, receiverId, content) {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const message = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      messageType: 'direct',
      content,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return message.populate('senderId receiverId', 'email');
  }

  /**
   * Send project message
   */
  static async sendProjectMessage(projectId, senderId, content) {
    // Verify sender is project member
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((m) => m.developerId.toString() === senderId);
    const isOwner = project.createdBy.toString() === senderId;

    if (!isMember && !isOwner) {
      throw new AppError('Must be project member to message', 403);
    }

    // Create pseudo-conversation for project messages
    // Using projectId as conversationId for simplicity
    const message = new Message({
      conversationId: projectId, // Store projectId for project messages
      senderId,
      receiverId: projectId, // Store projectId for filtering
      messageType: 'project',
      projectId,
      content,
    });

    await message.save();
    return message.populate('senderId', 'email');
  }

  /**
   * Get conversation messages
   */
  static async getConversationMessages(conversationId, userId, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const isParticipant =
      conversation.participant1Id.toString() === userId ||
      conversation.participant2Id.toString() === userId;

    if (!isParticipant) {
      throw new AppError('Unauthorized', 403);
    }

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId, receiverId: userId, readStatus: false },
      { readStatus: true, readAt: new Date() }
    );

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get project messages
   */
  static async getProjectMessages(projectId, userId, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    // Verify user is project member
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((m) => m.developerId.toString() === userId);
    const isOwner = project.createdBy.toString() === userId;

    if (!isMember && !isOwner) {
      throw new AppError('Unauthorized', 403);
    }

    const messages = await Message.find({
      projectId,
      messageType: 'project',
    })
      .populate('senderId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      projectId,
      messageType: 'project',
    });

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(userId) {
    const conversations = await Conversation.find({
      $or: [{ participant1Id: userId }, { participant2Id: userId }],
    })
      .populate('participant1Id participant2Id', 'email')
      .sort({ lastMessageAt: -1 });

    return conversations;
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(conversationId, userId) {
    await Message.updateMany(
      { conversationId, receiverId: userId, readStatus: false },
      { readStatus: true, readAt: new Date() }
    );
  }
}

module.exports = MessageService;

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participant1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participant2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique conversation between two users
conversationSchema.index(
  { participant1Id: 1, participant2Id: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);

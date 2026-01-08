const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: new mongoose.Schema.Types.ObjectId(),
    ref: "Conversation",
    required: true,
  },
  senderId: {
    type: new mongoose.Schema.Types.ObjectId(),
    ref: "User",
    required: true,
  },
  receiverId: {
    type: new mongoose.Schema.Types.ObjectId(),
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  message: String,
  link: String,
  isRead: { type: Boolean, default: false },
  fromUserId: {
    userName: {
      type: String,
    },
    userImage: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);

const { getIO } = require("../routes/socket");
const Notification = require("../models/notification");

async function sendNotification(title, message, link, userId, fromUserId = null) {
  const newNotification = await Notification.create({
    userId,
    title,
    message,
    link,
    isRead: false,
    fromUserId: {
      userName: fromUserId?.userName,
      userImage: fromUserId?.userImage,
      userId: fromUserId?._id,
    }
  });

  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  const io = getIO();
  io.to(userId.toString()).emit("notification", {
    _id: newNotification._id,
    title: newNotification.title,
    message: newNotification.message,
    link: newNotification.link,
    unreadCount,
    createdAt: newNotification.createdAt,
    fromUserId,
  });
}

module.exports = sendNotification;

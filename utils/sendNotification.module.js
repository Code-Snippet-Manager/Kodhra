const { getIO, isUserOnline } = require("../routes/socket");
const Notification = require("../models/notification");
const webpush = require("web-push");
const Subscription = require("../models/subscriptions.n");

async function sendNotification(
  title,
  message,
  link,
  userId,
  fromUserId = null
) {
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
    },
  });

  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  const payload = {
    _id: newNotification._id,
    title,
    message,
    link,
    unreadCount,
    createdAt: newNotification.createdAt,
    fromUserId,
  };

  const io = getIO();

  if (isUserOnline(userId)) {
    io.to(userId.toString()).emit("notification", payload);
    return;
  }

  const subscriptions = await Subscription.find({ userId });

  const pushPayload = JSON.stringify({
    title,
    body: message,
    data: { link },
  });

  for (const doc of subscriptions) {
    if (!doc.subscription?.endpoint) continue;

    try {
      await webpush.sendNotification(doc.subscription, pushPayload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await doc.deleteOne();
      }
    }
  }
}

module.exports = sendNotification;

const socketIO = require("socket.io");
let io;

const onlineUsers = new Set();

function init(server) {
  io = socketIO(server);

  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    const token = require("cookie").parse(rawCookie).token;
    const decoded = require("jsonwebtoken").verify(token, process.env.SECRET);
    socket.userId = decoded.checkUser._id.toString();
    next();
  });

  io.on("connection", (socket) => {
    onlineUsers.add(socket.userId);
    socket.join(socket.userId);

    console.log("User Connected:", socket.userId);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}

module.exports = {
  init,
  getIO,
  isUserOnline,
};

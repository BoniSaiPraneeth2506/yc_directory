const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // Track online users: userId -> Set of socket IDs
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // User joins their personal room (for receiving messages)
    socket.on("join", (userId) => {
      socket.join(userId);
      socket.userId = userId;
      
      // Track user online status
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      
      // Broadcast user is online
      io.emit("user-status", { userId, online: true });
      console.log(`User ${userId} joined their room - Online users:`, onlineUsers.size);
    });

    // User joins a conversation room
    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    // Send message event
    socket.on("send-message", (data) => {
      // Emit to conversation room
      socket.to(data.conversationId).emit("new-message", data.message);
      // Also emit to recipient's personal room for notifications
      socket.to(data.recipientId).emit("message-notification", {
        conversationId: data.conversationId,
        message: data.message,
      });
    });

    // Typing indicator
    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("user-typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on("mark-read", (data) => {
      socket.to(data.conversationId).emit("messages-read", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      
      // Remove user from online tracking
      if (socket.userId) {
        const userSockets = onlineUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          
          // If user has no more active sockets, they're offline
          if (userSockets.size === 0) {
            onlineUsers.delete(socket.userId);
            io.emit("user-status", { userId: socket.userId, online: false });
            console.log(`User ${socket.userId} is now offline - Online users:`, onlineUsers.size);
          }
        }
      }
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running`);
    });
});

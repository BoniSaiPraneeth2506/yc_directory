/**
 * Standalone Socket.io Server for Production
 * Deploy this to Railway, Render, or Fly.io
 */

const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3001;

// Parse allowed origins (supports multiple, comma-separated)
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ["http://localhost:3000"];

console.log("🔒 CORS allowed origins:", allowedOrigins);

// Create HTTP server WITHOUT a handler - let Socket.io handle all requests
const httpServer = createServer();

const io = new Server(httpServer, {
  path: "/api/socket/io",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["content-type"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true, // Backwards compatibility
});

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) {
      console.warn("⚠️ Join event received without userId");
      return;
    }

    socket.join(userId);
    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("user-status", { userId, online: true });
    console.log(`👤 User ${userId} joined (socket: ${socket.id})`);
  });

  socket.on("join-conversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`💬 User joined conversation: ${conversationId}`);
  });

  socket.on("leave-conversation", (conversationId) => {
    if (!conversationId) return;
    socket.leave(conversationId);
    console.log(`👋 User left conversation: ${conversationId}`);
  });

  socket.on("send-message", (data) => {
    if (!data || !data.message) return;

    console.log(`💬 Message from ${data.message.sender?._id || "unknown"}`);

    // Broadcast to conversation room
    if (data.conversationId) {
      socket.to(data.conversationId).emit("new-message", data.message);
    }

    // Notify recipient directly
    if (data.recipientId) {
      io.to(data.recipientId).emit("message-notification", {
        message: data.message,
        conversationId: data.conversationId,
      });
    }
  });

  socket.on("typing", (data) => {
    if (!data || !data.conversationId) return;
    socket.to(data.conversationId).emit("user-typing", {
      userId: data.userId,
      isTyping: data.isTyping,
      conversationId: data.conversationId,
    });
  });

  socket.on("mark-read", (data) => {
    if (!data || !data.conversationId) return;
    socket.to(data.conversationId).emit("messages-read", {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, "| Reason:", reason);

    if (socket.userId) {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user-status", { userId: socket.userId, online: false });
          console.log(`👤 User ${socket.userId} is now offline`);
        }
      }
    }
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("🚀 Socket.io Server Started");
  console.log("========================================");
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 CORS Origins: ${allowedOrigins.join(", ")}`);
  console.log(`📍 Socket Path: /api/socket/io`);
  console.log(`🔌 Transports: websocket, polling`);
  console.log("========================================");
  console.log(`✅ Ready for connections!`);
  console.log("========================================");
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

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
console.log("🌍 Environment:", process.env.NODE_ENV);
console.log("🔌 Port:", PORT);
console.log("⚡ FORCED REDEPLOY - Fixing Railway auto-deploy issue");

// Create bare HTTP server - let Socket.io handle ALL requests  
const httpServer = createServer();

const io = new Server(httpServer, {
  path: "/api/socket/io",
  cors: {
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*" 
      ? "*" 
      : allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "content-type"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true, // Backwards compatibility
});

console.log("✅ Socket.io server configured");
console.log("   Path:", "/api/socket/io");
console.log("   CORS:", allowedOrigins);
console.log("   Transports:", ["websocket", "polling"]);

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ SOCKET CONNECTION ESTABLISHED");
  console.log("   Socket ID:", socket.id);
  console.log("   Transport:", socket.conn.transport.name);
  console.log("   Handshake Auth:", JSON.stringify(socket.handshake.auth));
  console.log("   Handshake Query:", JSON.stringify(socket.handshake.query));
  console.log("   Client Address:", socket.handshake.address);
  console.log("   Headers Origin:", socket.handshake.headers.origin || "NONE");
  console.log("   User-Agent:", socket.handshake.headers['user-agent']);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

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
      console.log(`   Notification to: ${data.recipientId}`);
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

  socket.on("error", (error) => {
    console.error("❌ Socket error:", socket.id, error);
  });
});

// Start HTTP server with Socket.io attached
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 SOCKET.IO SERVER STARTUP - MAXIMUM LOGGING MODE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📡 Port: ${PORT} (Railway auto-assigned or default)`);
  console.log(`🌐 Binding: 0.0.0.0 (Railway requirement)`);
  console.log(`🏷️  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Socket Path: /api/socket/io`);
  console.log(`🔌 Transports: websocket, polling`);
  console.log(`⏱️  Ping Timeout: 60000ms`);
  console.log(`🏓 Ping Interval: 25000ms`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔒 CORS CONFIGURATION:");
  console.log(`   Allowed Origins (${allowedOrigins.length}):`);
  allowedOrigins.forEach((origin, index) => {
    console.log(`   ${index + 1}. ${origin}`);
  });
  console.log(`   Credentials: true`);
  console.log(`   Methods: GET, POST, OPTIONS`);
  console.log(`   Allowed Headers: Content-Type, content-type`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Socket.io Server READY for connections!`);
  console.log(`✅ Waiting for first connection from client...`);
  console.log(`✅ Watch for ENGINE.IO events below when client connects`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Setup Engine.IO event listeners AFTER server is listening (when io.engine exists)
  io.engine.on("initial_headers", (headers, request) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔧 ENGINE.IO: INITIAL HEADERS EVENT");
    console.log("   Request URL:", request.url);
    console.log("   Request Method:", request.method);
    console.log("   Origin Header:", request.headers.origin || "❌ NONE");
    console.log("   User-Agent:", request.headers['user-agent']);
    console.log("   All Request Headers:", JSON.stringify(request.headers, null, 2));
    console.log("   Headers BEFORE Socket.io CORS:", JSON.stringify(headers, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  io.engine.on("headers", (headers, request) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔧 ENGINE.IO: HEADERS EVENT (ACTUAL RESPONSE)");
    console.log("   Request URL:", request.url);
    console.log("   Request Method:", request.method);
    console.log("   Origin Header:", request.headers.origin || "❌ NONE");
    console.log("   Response Headers BEING SENT:", JSON.stringify(headers, null, 2));
    console.log("   ✅ Has Access-Control-Allow-Origin?", !!headers['access-control-allow-origin']);
    console.log("   ✅ Access-Control-Allow-Origin Value:", headers['access-control-allow-origin'] || "❌ MISSING");
    console.log("   ✅ Has Access-Control-Allow-Credentials?", !!headers['access-control-allow-credentials']);
    console.log("   ✅ Access-Control-Allow-Credentials Value:", headers['access-control-allow-credentials'] || "❌ MISSING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  io.engine.on("connection_error", (err) => {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ ENGINE.IO CONNECTION ERROR");
    console.error("   Error Code:", err.code);
    console.error("   Error Message:", err.message);
    console.error("   Error Context:", JSON.stringify(err.context, null, 2));
    console.error("   Full Error:", err);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('   Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('   Reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  io.close(() => {
    httpServer.close(() => {
      console.log('✅ Server closed gracefully');
    });
  });
});

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0"; // Render needs 0.0.0.0 in production
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
      origin: [
        process.env.NEXT_PUBLIC_SITE_URL,
        "http://localhost:3000", 
        "http://localhost:3001"
      ].filter(Boolean), // Remove undefined values
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Track online users: userId -> Set of socket IDs
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // User joins their personal room (for receiving messages)
    socket.on("join", (userId) => {
      if (!userId) {
        console.warn("⚠️ Join event received without userId");
        return;
      }

      socket.join(userId);
      socket.userId = userId;
      
      // Track user online status
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      
      // Broadcast user is online to all connected clients
      io.emit("user-status", { userId, online: true });
      console.log(`👤 User ${userId} joined their room (socket: ${socket.id})`);
      console.log(`📊 Total online users: ${onlineUsers.size}, Total sockets: ${io.sockets.sockets.size}`);
    });

    // User joins a conversation room
    socket.on("join-conversation", (conversationId) => {
      if (!conversationId) {
        console.warn("⚠️ Join conversation event received without conversationId");
        return;
      }
      socket.join(conversationId);
      console.log(`💬 User joined conversation: ${conversationId} (socket: ${socket.id})`);
    });

    // Leave conversation room
    socket.on("leave-conversation", (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      console.log(`👋 User left conversation: ${conversationId} (socket: ${socket.id})`);
    });

    // Send message event
    socket.on("send-message", (data) => {
      if (!data || !data.conversationId || !data.message) {
        console.warn("⚠️ Invalid send-message data:", data);
        return;
      }

      const messageType = data.message.content ? "text" : (data.message.image ? "image" : "unknown");
      console.log(`📤 Broadcasting ${messageType} message ${data.message._id} to conversation: ${data.conversationId}`);
      if (messageType === "image") {
        console.log(`  📷 Image URL:`, data.message.image?.url);
      }
      
      // Emit to conversation room (for real-time chat window updates)
      socket.to(data.conversationId).emit("new-message", data.message);
      console.log(`  ↳ Sent to conversation room: ${data.conversationId}`);
      
      // Also emit to recipient's personal room for notifications and chat list updates
      if (data.recipientId) {
        socket.to(data.recipientId).emit("message-notification", {
          conversationId: data.conversationId,
          message: data.message,
        });
        console.log(`  ↳ Sent notification to user: ${data.recipientId}`);
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      if (!data || !data.conversationId) return;
      socket.to(data.conversationId).emit("user-typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      });
      console.log(`⌨️  Typing indicator: ${data.userId} is ${data.isTyping ? 'typing' : 'stopped typing'} in ${data.conversationId}`);
    });

    // Mark messages as read
    socket.on("mark-read", (data) => {
      if (!data || !data.conversationId) return;
      socket.to(data.conversationId).emit("messages-read", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
      console.log(`✅ Messages marked as read by ${data.userId} in ${data.conversationId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, "| Reason:", reason);
      
      // Remove user from online tracking
      if (socket.userId) {
        const userSockets = onlineUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          
          // If user has no more active sockets, they're offline
          if (userSockets.size === 0) {
            onlineUsers.delete(socket.userId);
            io.emit("user-status", { userId: socket.userId, online: false });
            console.log(`👤 User ${socket.userId} is now offline`);
          } else {
            console.log(`👤 User ${socket.userId} still has ${userSockets.size} active connection(s)`);
          }
        }
        console.log(`📊 Total online users: ${onlineUsers.size}, Total sockets: ${io.sockets.sockets.size}`);
      }
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`🚀 Next.js + Socket.io server ready!`);
      console.log(`📱 Frontend: http://${hostname}:${port}`);
      console.log(`⚡ Socket.io: ${hostname}:${port}/api/socket/io`);
      console.log(`🌍 Environment: ${dev ? 'development' : 'production'}`);
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        console.log(`🔗 Public URL: ${process.env.NEXT_PUBLIC_SITE_URL}`);
      }
    });
});

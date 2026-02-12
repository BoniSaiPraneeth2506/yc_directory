import { NextRequest } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    // In development, Socket.io runs on separate port via server.js
    return new Response(JSON.stringify({ message: "Socket.io server running on localhost:3001" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = new Response();
  const socket = (res as any).socket;

  if (!socket?.server?.io) {
    console.log("🚀 Initializing Socket.io server for production...");

    const io = new SocketIOServer(socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: [
          process.env.NEXT_PUBLIC_SITE_URL || "https://yc-directory-five-liard.vercel.app",
          "http://localhost:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Connection handling - EXACT same logic as standalone server
    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("join", (userId: string) => {
        if (!userId) {
          console.warn("⚠️ Join event received without userId");
          return;
        }

        socket.join(userId);
        socket.userId = userId;

        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId)!.add(socket.id);
        socket.broadcast.emit("user-status", { userId, online: true });

        console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      });

      socket.on("join-conversation", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`💬 Socket ${socket.id} joined conversation: ${conversationId}`);
      });

      socket.on("send-message", (data: any) => {
        console.log("📨 Received send-message event:", data);
        
        if (!data || !data.conversationId) {
          console.error("❌ Invalid message data");
          return;
        }

        const {
          conversationId,
          message,
          sender,
          timestamp,
          messageId,
        } = data;

        const messageData = {
          _id: messageId,
          message,
          sender,
          conversation: conversationId,
          timestamp: timestamp || new Date().toISOString(),
        };

        // Send to all clients in the conversation room
        socket.to(conversationId).emit("receive-message", messageData);
        console.log(`📨 Message sent to conversation: ${conversationId}`);
      });

      socket.on("typing", (data: any) => {
        const { conversationId, userId, isTyping } = data;
        socket.to(conversationId).emit("user-typing", {
          userId,
          isTyping,
          conversationId,
        });
        console.log(`⌨️  Typing status: ${userId} ${isTyping ? 'started' : 'stopped'} typing in ${conversationId}`);
      });

      socket.on("mark-read", (data: any) => {
        if (!data || !data.conversationId) return;
        socket.to(data.conversationId).emit("messages-read", {
          userId: data.userId,
          conversationId: data.conversationId,
        });
        console.log(`👀 Messages marked as read by ${data.userId} in ${data.conversationId}`);
      });

      socket.on("disconnect", (reason: string) => {
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

      socket.on("error", (error: any) => {
        console.error("❌ Socket error:", socket.id, error);
      });
    });

    socket.server.io = io;
    console.log("✅ Socket.io server initialized successfully for production");
  } else {
    console.log("✅ Socket.io server already running");
  }

  return new Response(JSON.stringify({ message: "Socket.io server initialized" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}


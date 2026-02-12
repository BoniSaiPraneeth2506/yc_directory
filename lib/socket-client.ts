/**
 * PRODUCTION-READY Socket.io Client for Render Deployment
 * Complete Next.js + Socket.io integration
 * Works with server.js for persistent connections
 * REBUILD TIMESTAMP: 2026-02-13
 */

import { io, Socket } from "socket.io-client";

// Declare window property
declare global {
  interface Window {
    __socketClient?: Socket;
    __socketClientUserId?: string;
  }
}

class SocketClient {
  private static instance: SocketClient | null = null;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public initialize(userId?: string | null): Socket {
    if (typeof window === 'undefined') {
      throw new Error('Socket can only be initialized on client side');
    }

    // Return existing socket if already created on window
    if (window.__socketClient) {
      // Update userId if changed
      if (userId && userId !== window.__socketClientUserId) {
        window.__socketClientUserId = userId;
        if (window.__socketClient.connected) {
          window.__socketClient.emit("join", userId);
        }
      }
      return window.__socketClient;
    }
    
    // Production-ready socket connection
    // In development: connects to localhost:3000 (server.js)
    // In production: connects to Render deployment URL (same domain)
    const socketUrl = 
      process.env.NEXT_PUBLIC_SITE_URL || 
      window.location.origin;

    console.log("🚀 Connecting to production Socket.io server:", socketUrl);
    console.log("   Path:", "/api/socket/io"); 
    console.log("   Environment:", process.env.NODE_ENV || 'development');
    console.log("   Transports:", ["websocket", "polling"]);

    const socket = io(socketUrl, {
      path: "/api/socket/io",  // Socket.io server path on same domain
      addTrailingSlash: false,
      transports: ["websocket", "polling"], // WebSocket first, polling fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true, // Required for CORS with credentials
    });

    // Store on window IMMEDIATELY
    window.__socketClient = socket;
    window.__socketClientUserId = userId || null;

    // EXTENSIVE LOGGING - Every socket event
    socket.io.on("error", (error) => {
      console.error("❌ Socket.IO Manager Error:", error);
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt #${attempt}`);
    });

    socket.io.on("reconnect_error", (error) => {
      console.error("❌ Reconnect error:", error.message);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    socket.io.on("ping", () => {
      console.log("🏓 Ping sent to server");
    });

    socket.io.on("open", () => {
      console.log("✅ Transport opened");
    });

    socket.io.on("close", (reason) => {
      console.log("🚪 Transport closed:", reason);
    });

    // Set up core event handlers
    socket.on("connect", () => {
      console.log("✅ Socket CONNECTED!");
      console.log("   Socket ID:", socket.id);
      console.log("   Connected:", socket.connected);
      
      // Auto-join user room on connect
      const currentUserId = window.__socketClientUserId;
      if (currentUserId) {
        console.log("   Joining user room:", currentUserId);
        socket.emit("join", currentUserId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket DISCONNECTED");
      console.log("   Reason:", reason);
      console.log("   Will reconnect:", socket.active);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:");
      console.error("   Message:", error.message);
      console.error("   Type:", error.type);
      console.error("   Description:", error.description);
      console.error("   Context:", error.context);
    });

    socket.on("reconnect", () => {
      const currentUserId = window.__socketClientUserId;
      if (currentUserId) {
        socket.emit("join", currentUserId);
      }
    });

    // Only disconnect on actual browser close
    const handleBeforeUnload = () => {
      socket.disconnect();
      delete window.__socketClient;
      delete window.__socketClientUserId;
    };
    
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return socket;
  }

  public getSocket(): Socket | null {
    return typeof window !== 'undefined' ? window.__socketClient || null : null;
  }

  public isConnected(): boolean {
    return this.getSocket()?.connected || false;
  }

  public getUserId(): string | null {
    return typeof window !== 'undefined' ? window.__socketClientUserId || null : null;
  }
}

// Export singleton instance
export const socketClient = SocketClient.getInstance();

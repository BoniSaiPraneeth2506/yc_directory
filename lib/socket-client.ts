/**
 * BULLETPROOF Socket.io Client - Window-based persistence
 * Survives Fast Refresh by storing on window object
 * REBUILD TIMESTAMP: 2026-02-12
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
    
    // Use NEXT_PUBLIC_SOCKET_URL for production socket server
    // Falls back to NEXT_PUBLIC_SITE_URL or current origin
    const socketUrl = 
      process.env.NEXT_PUBLIC_SOCKET_URL || 
      process.env.NEXT_PUBLIC_SITE_URL || 
      window.location.origin;

    console.log("🔌 Connecting to Socket.io server:", socketUrl);
    console.log("   Path:", "/socket.io/ (default)");
    console.log("   Transports:", ["polling"]);
    console.log("   withCredentials:", true);

    const socket = io(socketUrl, {
      // path: "/socket.io/",  // Use default path
      addTrailingSlash: false,
      transports: ["polling"], // Polling only - more stable
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      reconnectionAttempts: Infinity,
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

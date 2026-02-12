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

  private constructor() {
    console.log("🏗️ SocketClient constructor called");
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      console.log("🆕 Creating NEW SocketClient singleton instance");
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public initialize(userId?: string | null): Socket {
    if (typeof window === 'undefined') {
      throw new Error('Socket can only be initialized on client side');
    }

    console.log(`🔧 initialize() called with userId: ${userId}`);
    console.log(`   window.__socketClient exists: ${!!window.__socketClient}`);
    console.log(`   window.__socketClient connected: ${window.__socketClient?.connected}`);

    // Return existing socket if already created on window
    if (window.__socketClient) {
      console.log("✅ Reusing existing window socket (survives Fast Refresh!)");
      console.log(`   Socket ID: ${window.__socketClient.id}`);
      console.log(`   Socket connected: ${window.__socketClient.connected}`);
      
      // Update userId if changed and reconnect if needed
      if (userId && userId !== window.__socketClientUserId) {
        console.log("🔄 UserId changed, updating:", userId);
        window.__socketClientUserId = userId;
        if (window.__socketClient.connected) {
          window.__socketClient.emit("join", userId);
        }
      }
      
      return window.__socketClient;
    }

    console.log("🔌 Creating FRESH socket connection...");
    
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    console.log(`   Socket URL: ${socketUrl}`);

    const socket = io(socketUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"], // WebSocket preferred, polling fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      autoConnect: true,
    });

    console.log(`✅ Socket instance created`);

    // Store on window IMMEDIATELY
    window.__socketClient = socket;
    window.__socketClientUserId = userId || null;
    console.log("💾 Socket stored on window object");

    // Set up core event handlers
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      console.log(`   Transport: ${(socket as any).io.engine.transport.name}`);
      
      // Auto-join user room on connect
      const currentUserId = window.__socketClientUserId;
      if (currentUserId) {
        console.log("👤 Joining user room:", currentUserId);
        socket.emit("join", currentUserId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      // DON'T remove from window - keep it for reconnection
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      const currentUserId = window.__socketClientUserId;
      if (currentUserId) {
        console.log("👤 Re-joining user room after reconnect:", currentUserId);
        socket.emit("join", currentUserId);
      }
    });

    // Only disconnect on actual browser close
    const handleBeforeUnload = () => {
      console.log("🔌 Browser closing - disconnecting socket");
      socket.disconnect();
      delete window.__socketClient;
      delete window.__socketClientUserId;
    };
    
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);
    console.log("👂 beforeunload listener attached");

    console.log("✅ Socket fully initialized and stored on window");
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

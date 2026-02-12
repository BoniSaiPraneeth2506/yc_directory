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

    const socket = io(socketUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["polling"], // Polling only - more stable
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      autoConnect: true,
    });

    // Store on window IMMEDIATELY
    window.__socketClient = socket;
    window.__socketClientUserId = userId || null;

    // Set up core event handlers
    socket.on("connect", () => {
      // Auto-join user room on connect
      const currentUserId = window.__socketClientUserId;
      if (currentUserId) {
        socket.emit("join", currentUserId);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
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

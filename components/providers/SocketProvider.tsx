"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId: string | null;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize socket connection
    const socketUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    const socketInstance = ClientIO(socketUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      
      // Join user's personal room if userId is available
      if (userId) {
        socketInstance.emit("join", userId);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Listen for user status updates
    socketInstance.on("user-status", ({ userId: statusUserId, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (online) {
          newSet.add(statusUserId);
        } else {
          newSet.delete(statusUserId);
        }
        return newSet;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

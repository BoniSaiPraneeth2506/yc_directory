"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketClient } from "@/lib/socket-client";

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
  userId?: string | null;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Initialize socket ONCE using singleton
  useEffect(() => {
    console.log("🎬 SocketProvider useEffect RUNNING");
    console.log("   userId:", userId);
    
    const socketInstance = socketClient.initialize(userId);
    console.log("   socketInstance returned:", !!socketInstance);
    console.log("   socketInstance.id:", socketInstance.id);
    console.log("   socketInstance.connected:", socketInstance.connected);
    
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // Set up event listeners for this provider instance
    const handleConnect = () => {
      console.log("✅ Provider: Socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log("❌ Provider: Socket disconnected:", reason);
      console.log("🔍 Provider disconnect STACK TRACE:");
      console.trace();
      setIsConnected(false);
    };

    const handleUserStatus = ({ userId: statusUserId, online }: { userId: string; online: boolean }) => {
      console.log("👁️ Provider: User status update:", statusUserId, online ? "online" : "offline");
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (online) {
          newSet.add(statusUserId);
        } else {
          newSet.delete(statusUserId);
        }
        console.log("   Online users count:", newSet.size);
        return newSet;
      });
    };

    console.log("👂 Attaching event listeners to socket");
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("user-status", handleUserStatus);
    console.log("✅ Event listeners attached");

    return () => {
      console.log("🧹 SocketProvider cleanup - removing listeners ONLY (keeping socket alive)");
      console.log("   Socket ID:", socketInstance.id);
      console.log("   Socket connected:", socketInstance.connected);
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("user-status", handleUserStatus);
      console.log("✅ Listeners removed, socket still alive");
      // DON'T disconnect socket - just remove this instance's listeners
    };
  }, []); // ONLY run once on mount

  // Handle userId updates
  useEffect(() => {
    if (userId && socket) {
      console.log("🔄 UserId changed, re-initializing with:", userId);
      socketClient.initialize(userId);
    }
  }, [userId, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

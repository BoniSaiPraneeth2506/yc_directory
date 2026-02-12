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
    if (!userId) return;
    
    const socketInstance = socketClient.initialize(userId);
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // Set up event listeners for this provider instance
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleUserStatus = ({ userId: statusUserId, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (online) {
          newSet.add(statusUserId);
        } else {
          newSet.delete(statusUserId);
        }
        return newSet;
      });
    };

    const handleOnlineUsers = (userIds: string[]) => {
      console.log("📋 Received online users list:", userIds);
      setOnlineUsers(new Set(userIds));
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("user-status", handleUserStatus);
    socketInstance.on("online-users", handleOnlineUsers);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("user-status", handleUserStatus);
      socketInstance.off("online-users", handleOnlineUsers);
    };
  }, []); // ONLY run once on mount

  // Handle userId updates
  useEffect(() => {
    if (userId && socket) {
      socketClient.initialize(userId);
    }
  }, [userId, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

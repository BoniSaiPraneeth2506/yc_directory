"use client";

import { useEffect, useState } from "react";
import { getUserConversations } from "@/lib/chat-actions";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "./providers/SocketProvider";
import { formatDistanceToNow } from "date-fns";

type Conversation = {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image: string;
    username: string;
  }>;
  lastMessage?: {
    _id: string;
    content?: string;
    image?: any;
    createdAt: string;
    sender: {
      _id: string;
      name: string;
    };
    readBy?: Array<{ _id: string }>;
  };
  lastMessageAt?: string;
};

export function ChatList({ currentUserId }: { currentUserId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, onlineUsers, isConnected } = useSocket();

  useEffect(() => {
    console.log("📋 ChatList mounted, current user:", currentUserId);
    loadConversations();
  }, []);

  useEffect(() => {
    if (socket && currentUserId) {
      console.log("🔗 Setting up ChatList socket listeners for user:", currentUserId);

      // Listen for new messages - this will update the conversation list
      const handleMessageNotification = (data: any) => {
        console.log("📬 New message notification received in ChatList:", data);
        // Reload conversations to get updated last message
        loadConversations();
      };

      socket.on("message-notification", handleMessageNotification);
      socket.on("new-message", handleMessageNotification);

      return () => {
        console.log("🔌 Cleaning up ChatList socket listeners");
        socket.off("message-notification", handleMessageNotification);
        socket.off("new-message", handleMessageNotification);
      };
    }
  }, [socket, currentUserId, isConnected]);

  const loadConversations = async () => {
    try {
      console.log("📥 Loading conversations for user:", currentUserId);
      const data = await getUserConversations();
      console.log("✅ Loaded", data.length, "conversations");
      setConversations(data);
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUserId);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] p-6 text-center">
        <div className="w-24 h-24 mb-6 text-black-300">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-20-bold mb-3">No messages yet</h3>
        <p className="text-black-300 font-medium max-w-xs mb-6">
          Start a conversation by searching for users above
        </p>
        <div className="bg-primary-100 border-2 border-primary rounded-lg p-6 max-w-sm shadow-100">
          <p className="text-sm text-primary font-bold mb-3">
            💡 How to start chatting:
          </p>
          <ol className="text-sm text-black font-medium text-left space-y-2">
            <li className="flex items-start gap-2">1. Use the search bar above</li>
            <li className="flex items-start gap-2">2. Type a user's name (min 2 chars)</li>
            <li className="flex items-start gap-2">3. Click on a user to start chatting</li>
            <li className="flex items-start gap-2">4. Send your first message! 🎉</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-1">
      {conversations.map((conversation) => {
        const otherUser = getOtherParticipant(conversation);
        if (!otherUser) return null;

        const isLastMessageFromUser = conversation.lastMessage?.sender?._id === currentUserId;
        const isMessageRead = conversation.lastMessage?.readBy?.some(
          reader => reader._id === otherUser._id
        );
        const messageTime = conversation.lastMessageAt 
          ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
              addSuffix: false,
            })
          : null;
        const isOnline = onlineUsers.has(otherUser._id);

        return (
          <Link
            key={conversation._id}
            href={`/messages/${conversation._id}`}
            className="block bg-white rounded-xl p-4 hover:bg-primary-50 transition-all duration-200 shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src={otherUser.image || "/placeholder-user.png"}
                  alt={otherUser.name}
                  width={52}
                  height={52}
                  className="rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-black text-base truncate">
                    {otherUser.name}
                  </h3>
                  <div className="text-right flex-shrink-0">
                    {messageTime && (
                      <div className="text-xs text-gray-500 font-medium">
                        {isLastMessageFromUser 
                          ? (isMessageRead ? 'Seen' : 'Sent') 
                          : ''} {messageTime} ago
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate font-normal max-w-[200px]">
                    {conversation.lastMessage?.content ||
                      (conversation.lastMessage?.image ? "📷 Photo" : "Say hi! 👋")}
                  </p>
                  {/* New message indicator */}
                  {!isLastMessageFromUser && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

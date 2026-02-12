"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { useSocket } from "./providers/SocketProvider";

interface ChatHeaderProps {
  otherUser: {
    _id: string;
    name: string;
    image: string;
    username: string;
  };
  currentUserId: string;
}

export function ChatHeader({ otherUser, currentUserId }: ChatHeaderProps) {
  const { onlineUsers, socket, isConnected } = useSocket();
  const isOnline = onlineUsers.has(otherUser._id);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href="/messages"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <Link
          href={`/user/${otherUser._id}`}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-all"
        >
          <div className="relative">
            <Image
              src={otherUser.image || "/placeholder-user.png"}
              alt={otherUser.name}
              width={44}
              height={44}
              className="rounded-full object-cover ring-2 ring-gray-200"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">
              {otherUser.name}
            </h2>
            <p
              className={`text-xs font-medium ${
                isOnline ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

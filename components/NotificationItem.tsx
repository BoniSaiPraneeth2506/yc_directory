"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Bell, UserPlus, ArrowBigUp, MessageSquare, AtSign } from "lucide-react";
import { markNotificationRead } from "@/lib/actions";

interface Notification {
  _id: string;
  type: "follow" | "upvote" | "comment" | "mention" | "reply";
  message: string;
  read: boolean;
  _createdAt: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  relatedStartup?: {
    _id: string;
    title: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "follow":
      return <UserPlus className="size-5 text-blue-500" />;
    case "upvote":
      return <ArrowBigUp className="size-5 text-green-500" />;
    case "comment":
      return <MessageSquare className="size-5 text-purple-500" />;
    case "reply":
      return <MessageSquare className="size-5 text-orange-500" />;
    case "mention":
      return <AtSign className="size-5 text-pink-500" />;
    default:
      return <Bell className="size-5 text-gray-500" />;
  }
};

const getNotificationLink = (notification: Notification) => {
  if (notification.type === "follow") {
    return `/user/${notification.sender._id}`;
  }
  if (notification.relatedStartup) {
    return `/startup/${notification.relatedStartup._id}`;
  }
  return "#";
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.read);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isRead) {
      setIsRead(true);
      startTransition(async () => {
        await markNotificationRead(notification._id);
      });
    }
  };

  return (
    <Link
      href={getNotificationLink(notification)}
      onClick={handleClick}
      className={`group flex gap-4 p-4 rounded-xl transition-all duration-300 ${
        !isRead 
          ? "bg-gradient-to-r from-primary/5 to-pink-50 hover:from-primary/10 hover:to-pink-100 border-2 border-primary/20" 
          : "bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-gray-200"
      } shadow-sm hover:shadow-md`}
    >
      <div className="flex-shrink-0">
        <div className="relative">
          <Image
            src={notification.sender.image || "/default-avatar.png"}
            alt={notification.sender.name}
            width={48}
            height={48}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg">
            {getNotificationIcon(notification.type)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <p className="text-sm text-gray-900 leading-relaxed">
            <span className="font-bold text-gray-900">{notification.sender.name}</span>
            {" "}
            <span className="text-gray-600">{notification.message.replace(notification.sender.name, "").trim()}</span>
          </p>
        </div>

        {notification.relatedStartup && (
          <div className="mt-2 px-3 py-1.5 bg-gray-100 rounded-lg inline-block">
            <p className="text-xs font-medium text-gray-700 truncate">
              {notification.relatedStartup.title}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2 font-medium">
          {formatDistanceToNow(new Date(notification._createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {!isRead && (
        <div className="flex-shrink-0 flex items-start pt-1">
          <div className="relative">
            <div className="size-3 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 size-3 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
      )}
    </Link>
  );
}

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
      className={`flex gap-3 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        !isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className="flex-shrink-0">
        <Image
          src={notification.sender.image || "/default-avatar.png"}
          alt={notification.sender.name}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          {getNotificationIcon(notification.type)}
          <p className="text-sm text-gray-900 dark:text-gray-100">
            <span className="font-semibold">{notification.sender.name}</span>
            {" "}
            {notification.message.replace(notification.sender.name, "").trim()}
          </p>
        </div>

        {notification.relatedStartup && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {notification.relatedStartup.title}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification._createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {!isRead && (
        <div className="flex-shrink-0">
          <div className="size-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </Link>
  );
}

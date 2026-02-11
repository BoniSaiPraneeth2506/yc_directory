"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Bell, UserPlus, ArrowBigUp, MessageSquare, AtSign, FileText, Video, Bookmark, TrendingUp, Award } from "lucide-react";
import { markNotificationRead } from "@/lib/actions";

interface Notification {
  _id: string;
  type: "follow" | "upvote" | "comment" | "mention" | "reply" | "new_post" | "new_reel" | "reel_upvote" | "reel_comment" | "save" | "reel_save" | "milestone";
  message: string;
  read: boolean;
  _createdAt: string;
  milestoneType?: string;
  milestoneValue?: number;
  sender?: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  startup?: {
    _id: string;
    title: string;
    slug?: { current: string };
  };
  reel?: {
    _id: string;
    title?: string;
    slug?: { current: string };
  };
  comment?: {
    _id: string;
    content: string;
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
    case "reel_upvote":
      return <ArrowBigUp className="size-5 text-green-500" />;
    case "comment":
    case "reel_comment":
      return <MessageSquare className="size-5 text-purple-500" />;
    case "reply":
      return <MessageSquare className="size-5 text-orange-500" />;
    case "mention":
      return <AtSign className="size-5 text-pink-500" />;
    case "new_post":
      return <FileText className="size-5 text-green-600" />;
    case "new_reel":
      return <Video className="size-5 text-orange-600" />;
    case "save":
    case "reel_save":
      return <Bookmark className="size-5 text-yellow-600" />;
    case "milestone":
      return <Award className="size-5 text-yellow-500" />;
    default:
      return <Bell className="size-5 text-gray-500" />;
  }
};

const getNotificationLink = (notification: Notification) => {
  // Milestone and follow notifications
  if (notification.type === "milestone") {
    return `/user/${notification.sender?._id || "#"}?tab=stats`;
  }
  if (notification.type === "follow") {
    return `/user/${notification.sender?._id}`;
  }
  
  // New post from following
  if (notification.type === "new_post" && notification.startup) {
    const slug = typeof notification.startup.slug === 'string' 
      ? notification.startup.slug 
      : notification.startup.slug?.current;
    return slug ? `/startup/${slug}` : "#";
  }
  
  // New reel from following
  if (notification.type === "new_reel" && notification.reel) {
    return `/reels/${notification.reel._id}`;
  }
  
  // Reel-related notifications
  if ((notification.type === "reel_upvote" || notification.type === "reel_comment" || notification.type === "reel_save") && notification.reel) {
    return `/reels/${notification.reel._id}`;
  }
  
  // Post-related notifications (upvote, comment, save, mention, reply)
  if (notification.startup) {
    const slug = typeof notification.startup.slug === 'string' 
      ? notification.startup.slug 
      : notification.startup.slug?.current;
    return slug ? `/startup/${slug}` : "#";
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
          {notification.sender?.image && notification.type !== "milestone" ? (
            <Image
              src={notification.sender.image}
              alt={notification.sender.name}
              width={48}
              height={48}
              className="rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {notification.type === "milestone" ? (
                <Award className="size-6 text-yellow-500" />
              ) : (
                <Bell className="size-6 text-gray-500" />
              )}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg">
            {getNotificationIcon(notification.type)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <p className="text-sm text-gray-900 leading-relaxed">
            <span className="font-bold text-gray-900">
              {notification.sender?.name || "System"}
            </span>
            {" "}
            <span className="text-gray-600">
              {notification.message.replace(notification.sender?.name || "System", "").trim()}
            </span>
          </p>
        </div>

        {/* Related content preview */}
        {(notification.startup?.title || notification.reel?.title) && (
          <div className="mt-2 px-3 py-1.5 bg-gray-100 rounded-lg inline-block">
            <p className="text-xs font-medium text-gray-700 truncate">
              {notification.startup?.title || notification.reel?.title}
            </p>
          </div>
        )}

        {/* Milestone badge */}
        {notification.type === "milestone" && notification.milestoneValue && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Award className="size-3.5 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-800">
              {notification.milestoneValue.toLocaleString()} {notification.milestoneType}
            </span>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  initialUnreadCount: number;
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Bell className="size-6 text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

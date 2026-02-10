"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  initialUnreadCount: number;
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const pathname = usePathname();
  const isActive = pathname === "/notifications";

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
      className={`relative flex items-center justify-center size-10 rounded-full transition-colors ${
        isActive
          ? "bg-primary/10"
          : "hover:bg-primary/5"
      }`}
    >
      <Bell 
        className="size-6 text-primary transition-colors" 
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

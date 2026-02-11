"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Play, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userId?: string;
  onCreateClick?: () => void;
}

export const BottomNav = ({ userId, onCreateClick }: BottomNavProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (!mounted) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCreateClick) {
      onCreateClick();
    }
  };

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: isActive("/") && pathname === "/",
    },
    {
      name: "Reels",
      href: "/reels",
      icon: Play,
      active: isActive("/reels"),
    },
    {
      name: "Create",
      href: "#",
      icon: PlusCircle,
      active: false,
      onClick: handleCreateClick,
      special: true,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
      active: isActive("/messages"),
    },
    {
      name: "Profile",
      href: userId ? `/user/${userId}` : "/user",
      icon: User,
      active: mounted && pathname.includes("/user/"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  "hover:bg-gray-50 active:bg-gray-100"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    "text-gray-600"
                  )}
                  strokeWidth={2}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    "text-gray-600"
                  )}
                >
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                "hover:bg-gray-50 active:bg-gray-100",
                item.active && "text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  item.active ? "text-primary" : "text-gray-600"
                )}
                strokeWidth={item.active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  item.active ? "text-primary" : "text-gray-600"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { Home, Play, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userId?: string;
  onCreateClick?: () => void;
}

export const BottomNav = ({ userId, onCreateClick }: BottomNavProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);

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

  const navItems = useMemo(() => [
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
  ], [mounted, pathname, userId, onCreateClick]);

  // Update active index based on current pathname
  useEffect(() => {
    const activeItemIndex = navItems.findIndex(item => item.active);
    if (activeItemIndex !== -1) {
      setActiveIndex(activeItemIndex);
    }
  }, [navItems]);

  // Handle touch events for smooth swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isScrolling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    // Check if horizontal scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isScrolling.current = true;
      e.preventDefault();
      
      // Apply momentum scrolling
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = Math.max(0, Math.min(maxScroll, currentScroll - deltaX * 0.8));
      
      scrollContainerRef.current.scrollLeft = newScroll;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div 
        ref={scrollContainerRef}
        className="flex items-center justify-around h-16 max-w-screen-xl mx-auto overflow-x-auto scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActiveItem = item.active;
          
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
                isActiveItem && "text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  isActiveItem ? "text-primary" : "text-gray-600"
                )}
                strokeWidth={isActiveItem ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActiveItem ? "text-primary" : "text-gray-600"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* CSS for smooth scrolling */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};

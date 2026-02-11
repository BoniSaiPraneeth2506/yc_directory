"use client";

import { useState, useRef, useCallback, TouchEvent } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  username: string;
  image?: string;
}

interface ConnectionsTabsProps {
  userId: string;
  username: string;
  followers: User[];
  following: User[];
  currentUserFollowing: string[];
  currentUserId?: string;
  initialTab: "followers" | "following";
}

export function ConnectionsTabs({
  userId,
  username,
  followers,
  following,
  currentUserFollowing,
  currentUserId,
  initialTab,
}: ConnectionsTabsProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastTouchX = useRef<number>(0);
  const lastTouchTime = useRef<number>(0);
  const velocity = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced tab switching with smooth transitions
  const handleTabSwitch = useCallback((newTab: "followers" | "following") => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(newTab);
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 350);
  }, [activeTab, isTransitioning]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isTransitioning) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    lastTouchX.current = touch.clientX;
    lastTouchTime.current = Date.now();
    isDragging.current = false;
    velocity.current = 0;
  }, [isTransitioning]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isTransitioning) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const timeDelta = currentTime - lastTouchTime.current;
    
    // Calculate velocity for momentum tracking
    if (timeDelta > 0) {
      velocity.current = (touch.clientX - lastTouchX.current) / timeDelta;
    }
    
    // Check if horizontal swipe (with larger threshold for better UX)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isDragging.current = true;
      e.preventDefault();
      
      // Apply real-time transform with elastic resistance
      if (contentRef.current) {
        const maxTransform = window.innerWidth * 0.3;
        const resistance = Math.abs(deltaX) > maxTransform ? 0.15 : 1;
        const transform = Math.max(-maxTransform, Math.min(maxTransform, deltaX * resistance));
        
        // Apply spring-like transform with GPU acceleration
        contentRef.current.style.transform = `translate3d(${transform}px, 0, 0)`;
        contentRef.current.style.transition = 'none';
        contentRef.current.style.opacity = String(1 - Math.abs(transform) / maxTransform * 0.15);
      }
    }
    
    lastTouchX.current = touch.clientX;
    lastTouchTime.current = currentTime;
  }, [isTransitioning]);

  const handleTouchEnd = useCallback(() => {
    if (isTransitioning || !isDragging.current) return;
    
    const swipeDistance = lastTouchX.current - touchStartX.current;
    const minSwipeDistance = 50;
    const minVelocity = 0.3;
    
    // Reset transform with spring animation
    if (contentRef.current) {
      contentRef.current.style.transform = 'translate3d(0, 0, 0)';
      contentRef.current.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
      contentRef.current.style.opacity = '1';
    }
    
    // Enhanced swipe detection with velocity consideration
    const shouldSwitch = Math.abs(swipeDistance) > minSwipeDistance || 
                        (Math.abs(velocity.current) > minVelocity && Math.abs(swipeDistance) > 30);
    
    if (shouldSwitch) {
      if (swipeDistance > 0 && activeTab === 'following') {
        // Swipe right: following -> followers
        handleTabSwitch('followers');
      } else if (swipeDistance < 0 && activeTab === 'followers') {
        // Swipe left: followers -> following
        handleTabSwitch('following');
      }
    }
    
    isDragging.current = false;
  }, [activeTab, isTransitioning, handleTabSwitch]);

  const tabs = [
    { id: "followers" as const, label: "Followers", count: followers.length },
    { id: "following" as const, label: "Following", count: following.length },
  ];

  const currentList = activeTab === "followers" ? followers : following;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <Link 
            href={`/user/${userId}`}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">{username}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 max-w-2xl mx-auto relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              disabled={isTransitioning}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-colors duration-300 relative z-10",
                activeTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span>
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 text-gray-500">
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
          
          {/* Sliding active indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out"
            style={{
              width: "50%",
              left: activeTab === "followers" ? "0%" : "50%",
            }}
          />
        </div>
      </div>

      {/* Content with smooth swipeable transition */}
      <div 
        ref={containerRef}
        className="max-w-2xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div 
          ref={contentRef}
          className="transition-all duration-300 ease-out"
          style={{ willChange: 'transform' }}
        >
          {currentList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">
                {activeTab === "followers" 
                  ? "No followers yet" 
                  : "Not following anyone yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {currentList.map((user) => {
                const isFollowing = currentUserFollowing?.includes(user._id);
                const isOwnProfile = currentUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <Link href={`/user/${user._id}`}>
                      <Avatar className="size-11 border border-gray-200">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* User info */}
                    <Link 
                      href={`/user/${user._id}`}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.name}
                      </p>
                    </Link>

                    {/* Action button */}
                    <div className="flex-shrink-0">
                      {!isOwnProfile && currentUserId ? (
                        <button className="px-6 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          Message
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSS for smooth animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

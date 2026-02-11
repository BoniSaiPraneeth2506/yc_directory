"use client";

import { useState, useRef, TouchEvent, ReactNode, memo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ContentTabsProps {
  postsContent: ReactNode;
  reelsContent: ReactNode;
}

export const ContentTabs = memo(function ContentTabs({ postsContent, reelsContent }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
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
  const handleTabSwitch = useCallback((newTab: "posts" | "reels") => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(newTab);
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 400);
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
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
      isDragging.current = true;
      e.preventDefault();
      
      // Apply real-time transform with elastic resistance
      if (contentRef.current) {
        const maxTransform = window.innerWidth * 0.25;
        const resistance = Math.abs(deltaX) > maxTransform ? 0.2 : 1;
        const transform = Math.max(-maxTransform, Math.min(maxTransform, deltaX * resistance));
        
        // Apply spring-like transform with perspective
        contentRef.current.style.transform = `translateX(${transform}px) translateZ(0)`;
        contentRef.current.style.transition = 'none';
        contentRef.current.style.filter = `brightness(${1 - Math.abs(transform) / maxTransform * 0.1})`;
      }
    }
    
    lastTouchX.current = touch.clientX;
    lastTouchTime.current = currentTime;
  }, [isTransitioning]);

  const handleTouchEnd = useCallback(() => {
    if (isTransitioning || !isDragging.current) return;
    
    const swipeDistance = lastTouchX.current - touchStartX.current;
    const swipeTime = Date.now() - touchStartTime.current;
    const minSwipeDistance = 60;
    const minVelocity = 0.4;
    
    // Reset transform with spring animation
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateX(0) translateZ(0)';
      contentRef.current.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      contentRef.current.style.filter = 'brightness(1)';
    }
    
    // Enhanced swipe detection with velocity consideration
    const shouldSwitch = Math.abs(swipeDistance) > minSwipeDistance || 
                        (Math.abs(velocity.current) > minVelocity && Math.abs(swipeDistance) > 30);
    
    if (shouldSwitch) {
      if (swipeDistance > 0 && activeTab === 'reels') {
        // Swipe right: reels -> posts
        handleTabSwitch('posts');
      } else if (swipeDistance < 0 && activeTab === 'posts') {
        // Swipe left: posts -> reels
        handleTabSwitch('reels');
      }
    }
    
    isDragging.current = false;
  }, [activeTab, isTransitioning, handleTabSwitch]);

  const tabs = [
    { id: "posts" as const, label: "Posts" },
    { id: "reels" as const, label: "Reels" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Inner Tabs - Simple text with underline */}
      <div className="flex border-b border-gray-200 relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id)}
            disabled={isTransitioning}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors duration-300 relative",
              activeTab === tab.id
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
        
        {/* Sliding underline indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{
            width: "50%",
            left: activeTab === "posts" ? "0%" : "50%",
          }}
        />
      </div>

      {/* Content with swipe and animation */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div 
          ref={contentRef}
          className="transition-all duration-300 ease-out animate-in fade-in"
        >
          {activeTab === "posts" ? postsContent : reelsContent}
        </div>
      </div>
    </div>
  );
});

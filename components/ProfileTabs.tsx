"use client";

import { useState, ReactNode, useRef, useCallback, TouchEvent } from "react";
import { FileText, ThumbsUp, Bookmark, Users, UserCheck, FileQuestion, TrendingUp } from "lucide-react";
import { ContentTabs } from "./ContentTabs";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  isOwnProfile: boolean;
  postsContent: ReactNode;
  reelsContent: ReactNode;
  upvotedPostsContent?: ReactNode;
  upvotedReelsContent?: ReactNode;
  savedPostsContent?: ReactNode;
  savedReelsContent?: ReactNode;
  draftsContent?: ReactNode;
  statsContent?: ReactNode;
}

type TabType = "posts" | "upvoted" | "saved" | "drafts" | "stats";

export function ProfileTabs({ 
  isOwnProfile, 
  postsContent,
  reelsContent,
  upvotedPostsContent, 
  upvotedReelsContent,
  savedPostsContent,
  savedReelsContent,
  draftsContent,
  statsContent,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const velocity = useRef<number>(0);
  const lastTouchX = useRef<number>(0);
  const lastTouchTime = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('📋 ProfileTabs Props:', {
    isOwnProfile,
    hasUpvotedPostsContent: !!upvotedPostsContent,
    hasSavedPostsContent: !!savedPostsContent,
    activeTab
  });

  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(tab);
    
    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 400);
  }, [activeTab, isTransitioning]);

  // Enhanced touch handling for smooth swiping
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isTransitioning) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
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
    
    // Calculate velocity
    if (timeDelta > 0) {
      velocity.current = (touch.clientX - lastTouchX.current) / timeDelta;
    }
    
    // Check for horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      isDragging.current = true;
      e.preventDefault();
      
      // Apply elastic transform
      if (contentRef.current) {
        const maxTransform = window.innerWidth * 0.2;
        const resistance = Math.abs(deltaX) > maxTransform ? 0.3 : 1;
        const transform = Math.max(-maxTransform, Math.min(maxTransform, deltaX * resistance));
        
        contentRef.current.style.transform = `translateX(${transform}px) translateZ(0)`;
        contentRef.current.style.transition = 'none';
      }
    }
    
    lastTouchX.current = touch.clientX;
    lastTouchTime.current = currentTime;
  }, [isTransitioning]);

  const handleTouchEnd = useCallback(() => {
    if (isTransitioning || !isDragging.current) return;
    
    const swipeDistance = lastTouchX.current - touchStartX.current;
    const minSwipeDistance = 80;
    const minVelocity = 0.5;
    
    // Reset transform
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateX(0) translateZ(0)';
      contentRef.current.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    
    // Navigate between tabs based on swipe
    const shouldSwitch = Math.abs(swipeDistance) > minSwipeDistance || 
                        Math.abs(velocity.current) > minVelocity;
    
    if (shouldSwitch) {
      const tabs = allTabs.filter(t => t.show);
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      
      if (swipeDistance > 0 && currentIndex > 0) {
        // Swipe right: go to previous tab
        handleTabChange(tabs[currentIndex - 1].id);
      } else if (swipeDistance < 0 && currentIndex < tabs.length - 1) {
        // Swipe left: go to next tab
        handleTabChange(tabs[currentIndex + 1].id);
      }
    }
    
    isDragging.current = false;
  }, [activeTab, isTransitioning, handleTabChange]);

  // Main tabs (excluding drafts and stats on mobile)
  const mainTabs = [
    { 
      id: "posts" as TabType, 
      label: "Posts", 
      icon: FileText,
      show: true 
    },
    { 
      id: "upvoted" as TabType, 
      label: "Liked", 
      icon: ThumbsUp,
      show: isOwnProfile 
    },
    { 
      id: "saved" as TabType, 
      label: "Saved", 
      icon: Bookmark,
      show: isOwnProfile 
    },
  ];

  console.log('📋 Main Tabs Config:', mainTabs.map(t => ({ id: t.id, show: t.show })));

  // Additional tabs (drafts and stats) for horizontal toggle on mobile
  const additionalTabs = [
    { 
      id: "drafts" as TabType, 
      label: "Drafts", 
      icon: FileQuestion,
      show: isOwnProfile 
    },
    { 
      id: "stats" as TabType, 
      label: "Stats", 
      icon: TrendingUp,
      show: isOwnProfile 
    },
  ];

  // All tabs for desktop
  const allTabs = [...mainTabs, ...additionalTabs];

  return (
    <div className="flex-1 flex flex-col gap-3 lg:-mt-5">
      {/* Mobile: Horizontal Toggle for Drafts & Stats at top */}
      {isOwnProfile && (
        <div className="lg:hidden flex gap-2">
          {additionalTabs.map((tab) =>
            tab.show ? (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isTransitioning}
                className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <tab.icon className="size-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ) : null
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 lg:gap-2 bg-white lg:bg-gray-100 rounded-lg p-1 lg:p-2">
        {/* Mobile view - only show main tabs with icons only */}
        <div className="lg:hidden w-full flex gap-2">
          {mainTabs.map((tab) =>
            tab.show ? (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isTransitioning}
                className={`flex-1 px-2 py-3.5 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={tab.label}
              >
                <tab.icon className="size-5" />
              </button>
            ) : null
          )}
        </div>

        {/* Desktop view - show all tabs with labels */}
        <div className="hidden lg:flex w-full gap-2">
          {allTabs.map((tab) =>
            tab.show ? (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isTransitioning}
                className={`flex-1 px-4 py-3 font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            ) : null
          )}
        </div>
      </div>

      {/* Tab Content with fade-in animation */}
      <div 
        ref={containerRef}
        className="animate-in fade-in duration-300"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div 
          ref={contentRef}
          className="transition-all duration-300 ease-out"
        >
          {console.log('🎯 Rendering tab content:', { activeTab, isOwnProfile })}
          
          {activeTab === "posts" && (
            <ContentTabs
              postsContent={<ul className="card_grid-sm">{postsContent}</ul>}
              reelsContent={reelsContent}
            />
          )}

          {activeTab === "upvoted" && (
            <>
              {console.log('🎯 Upvoted tab active, rendering...')}
              {isOwnProfile ? (
                <ContentTabs
                  postsContent={<ul className="card_grid-sm">{upvotedPostsContent}</ul>}
                  reelsContent={upvotedReelsContent}
                />
              ) : (
                <p className="text-center text-gray-500">Not available</p>
              )}
            </>
          )}

          {activeTab === "saved" && (
            <>
              {console.log('🎯 Saved tab active, rendering...')}
              {isOwnProfile ? (
                <ContentTabs
                  postsContent={<ul className="card_grid-sm">{savedPostsContent}</ul>}
                  reelsContent={savedReelsContent}
                />
              ) : (
                <p className="text-center text-gray-500">Not available</p>
              )}
            </>
          )}

          {activeTab === "drafts" && isOwnProfile && (
            <div>
              {draftsContent}
            </div>
          )}

          {activeTab === "stats" && isOwnProfile && (
            <div>
              {statsContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
import { InstagramReelPlayer } from "./InstagramReelPlayer";

interface ReelsScrollerProps {
  initialReels: any[];
  currentUserId?: string;
  initialReelId?: string;
}

export const ReelsScroller = memo(function ReelsScroller({ 
  initialReels, 
  currentUserId, 
  initialReelId 
}: ReelsScrollerProps) {
  // Memoize reordering calculation to prevent recalculation on every render
  const reorderedReels = useMemo(() => {
    if (!initialReelId) return initialReels;
    
    const targetIndex = initialReels.findIndex(reel => reel._id === initialReelId);
    if (targetIndex !== -1) {
      return [
        ...initialReels.slice(targetIndex),
        ...initialReels.slice(0, targetIndex)
      ];
    }
    return initialReels;
  }, [initialReels, initialReelId]);

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up intersection observer to track which reel is in view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        root: null,
        threshold: 0.75, // Video is active when 75% visible
      }
    );

    // Observe all reel containers
    const reelElements = container.querySelectorAll("[data-reel]");
    reelElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [reorderedReels.length]);

  if (!reorderedReels || reorderedReels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">No Reels Yet</h2>
          <p className="text-gray-400">Be the first to create a pitch reel!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {reorderedReels.map((reel, index) => (
        <div
          key={reel._id}
          data-reel
          data-index={index}
          className="h-screen"
        >
          <InstagramReelPlayer
            reel={reel}
            isActive={activeIndex === index}
            currentUserId={currentUserId}
          />
        </div>
      ))}
    </div>
  );
});

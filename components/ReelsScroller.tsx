"use client";

import { useState, useEffect, useRef } from "react";
import { ReelPlayer } from "./ReelPlayer";

interface ReelsScrollerProps {
  initialReels: any[];
}

export const ReelsScroller = ({ initialReels }: ReelsScrollerProps) => {
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
  }, [initialReels.length]);

  if (!initialReels || initialReels.length === 0) {
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
      
      {initialReels.map((reel, index) => (
        <div
          key={reel._id}
          data-reel
          data-index={index}
          className="h-screen"
        >
          <ReelPlayer
            reel={reel}
            isActive={activeIndex === index}
          />
        </div>
      ))}
    </div>
  );
};

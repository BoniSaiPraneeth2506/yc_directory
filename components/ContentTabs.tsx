"use client";

import { useState, ReactNode, memo } from "react";
import { cn } from "@/lib/utils";

interface ContentTabsProps {
  postsContent: ReactNode;
  reelsContent: ReactNode;
}

export const ContentTabs = memo(function ContentTabs({ postsContent, reelsContent }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

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
            onClick={() => setActiveTab(tab.id)}
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

      {/* Content with animation */}
      <div className="transition-all duration-300 ease-out animate-in fade-in">
        {activeTab === "posts" ? postsContent : reelsContent}
      </div>
    </div>
  );
});

"use client";

import { useState, ReactNode } from "react";
import { FileText, ThumbsUp, Bookmark } from "lucide-react";

interface ProfileTabsProps {
  isOwnProfile: boolean;
  postsContent: ReactNode;
  upvotedContent?: ReactNode;
  savedContent?: ReactNode;
}

type TabType = "posts" | "upvoted" | "saved";

export function ProfileTabs({ 
  isOwnProfile, 
  postsContent, 
  upvotedContent, 
  savedContent 
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  const tabs = [
    { 
      id: "posts" as TabType, 
      label: isOwnProfile ? "Your Posts" : "All Posts", 
      icon: FileText,
      show: true 
    },
    { 
      id: "upvoted" as TabType, 
      label: "Upvoted", 
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

  return (
    <div className="flex-1 flex flex-col gap-5 lg:-mt-5">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) =>
          tab.show ? (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 sm:px-6 py-3 font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <tab.icon className="size-5 sm:size-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ) : null
        )}
      </div>

      {/* Tab Content with fade-in animation */}
      <div key={activeTab} className="animate-in fade-in duration-500">
        {activeTab === "posts" && (
          <ul className="card_grid-sm">
            {postsContent}
          </ul>
        )}

        {activeTab === "upvoted" && isOwnProfile && (
          <ul className="card_grid-sm">
            {upvotedContent}
          </ul>
        )}

        {activeTab === "saved" && isOwnProfile && (
          <ul className="card_grid-sm">
            {savedContent}
          </ul>
        )}
      </div>
    </div>
  );
}

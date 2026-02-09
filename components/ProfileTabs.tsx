"use client";

import { useState, ReactNode } from "react";
import { FileText, ThumbsUp, Bookmark, Users, UserCheck, FileQuestion, TrendingUp } from "lucide-react";

interface ProfileTabsProps {
  isOwnProfile: boolean;
  postsContent: ReactNode;
  upvotedContent?: ReactNode;
  savedContent?: ReactNode;
  draftsContent?: ReactNode;
  statsContent?: ReactNode;
  followersContent: ReactNode;
  followingContent: ReactNode;
}

type TabType = "posts" | "upvoted" | "saved" | "drafts" | "stats" | "followers" | "following";

export function ProfileTabs({ 
  isOwnProfile, 
  postsContent, 
  upvotedContent, 
  savedContent,
  draftsContent,
  statsContent,
  followersContent,
  followingContent,
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
    { 
      id: "followers" as TabType, 
      label: "Followers", 
      icon: Users,
      show: true 
    },
    { 
      id: "following" as TabType, 
      label: "Following", 
      icon: UserCheck,
      show: true 
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

        {activeTab === "followers" && (
          <div>
            {followersContent}
          </div>
        )}

        {activeTab === "following" && (
          <div>
            {followingContent}
          </div>
        )}
      </div>
    </div>
  );
}

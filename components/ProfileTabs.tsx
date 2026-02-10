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

  // Debug logging
  console.log('📋 ProfileTabs Props:', {
    isOwnProfile,
    hasUpvotedContent: !!upvotedContent,
    hasSavedContent: !!savedContent,
    activeTab
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

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
    <div className="flex-1 flex flex-col gap-5 lg:-mt-5">
      {/* Mobile: Horizontal Toggle for Drafts & Stats at top */}
      {isOwnProfile && (
        <div className="lg:hidden flex gap-2">
          {additionalTabs.map((tab) =>
            tab.show ? (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
                className={`flex-1 px-4 py-3 font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
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
      <div className="animate-in fade-in duration-300">
        {console.log('🎯 Rendering tab content:', { activeTab, isOwnProfile })}
        
        {activeTab === "posts" && (
          <ul className="card_grid-sm">
            {postsContent}
          </ul>
        )}

        {activeTab === "upvoted" && (
          <>
            {console.log('🎯 Upvoted tab active, rendering...')}
            {isOwnProfile ? (
              <ul className="card_grid-sm">
                {upvotedContent}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Not available</p>
            )}
          </>
        )}

        {activeTab === "saved" && (
          <>
            {console.log('🎯 Saved tab active, rendering...')}
            {isOwnProfile ? (
              <ul className="card_grid-sm">
                {savedContent}
              </ul>
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

import React from "react";
import { client } from "@/sanityio/lib/client";
import { AUTHOR_STATS_QUERY, AUTHOR_GROWTH_QUERY } from "@/sanityio/lib/queries";
import StatCard from "./StatCard";
import {
  FileText,
  Eye,
  ThumbsUp,
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

interface StatsOverviewProps {
  userId: string;
}

interface AuthorStats {
  totalPosts: number;
  totalViews: number;
  totalUpvotes: number;
  followerCount: number;
  followingCount: number;
}

interface GrowthData {
  _createdAt: string;
  views: number;
  upvotes: number;
}

const StatsOverview = async ({ userId }: StatsOverviewProps) => {
  const [stats, growthData] = await Promise.all([
    client.fetch(AUTHOR_STATS_QUERY, { id: userId }) as Promise<AuthorStats>,
    client.fetch(AUTHOR_GROWTH_QUERY, { id: userId }) as Promise<GrowthData[]>,
  ]);

  console.log("📊 Stats fetched:", stats);
  console.log("📈 Growth data:", growthData);

  // Ensure stats have default values
  const totalPosts = stats?.totalPosts || 0;
  const totalViews = stats?.totalViews || 0;
  const totalUpvotes = stats?.totalUpvotes || 0;
  const followerCount = stats?.followerCount || 0;

  // Calculate average views per post
  const avgViewsPerPost = totalPosts > 0 
    ? Math.round(totalViews / totalPosts) 
    : 0;

  // Calculate average upvotes per post
  const avgUpvotesPerPost = totalPosts > 0
    ? Math.round(totalUpvotes / totalPosts)
    : 0;

  // Calculate engagement rate (upvotes vs views)
  const engagementRate = totalViews > 0
    ? Math.round((totalUpvotes / totalViews) * 100)
    : 0;

  // Calculate growth trend (comparing last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const validGrowthData = (growthData || []).filter(item => item && item._createdAt);

  const lastMonth = validGrowthData.filter(
    (item) => new Date(item._createdAt) >= thirtyDaysAgo
  );
  const previousMonth = validGrowthData.filter(
    (item) =>
      new Date(item._createdAt) >= sixtyDaysAgo &&
      new Date(item._createdAt) < thirtyDaysAgo
  );

  const lastMonthViews = lastMonth.reduce((sum, item) => sum + (item.views || 0), 0);
  const previousMonthViews = previousMonth.reduce(
    (sum, item) => sum + (item.views || 0),
    0
  );

  const viewsTrend =
    previousMonthViews > 0
      ? Math.round(((lastMonthViews - previousMonthViews) / previousMonthViews) * 100)
      : lastMonthViews > 0
      ? 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-pink-600 rounded-xl">
            <TrendingUp className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your startup's growth and engagement</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid - 2x2 Layout */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Posts"
            value={totalPosts}
            icon={FileText}
          />
          <StatCard
            label="Total Views"
            value={totalViews}
            icon={Eye}
            trend={{
              value: viewsTrend,
              isPositive: viewsTrend >= 0,
            }}
          />
          <StatCard
            label="Total Upvotes"
            value={totalUpvotes}
            icon={ThumbsUp}
          />
          <StatCard
            label="Followers"
            value={followerCount}
            icon={Users}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-pink-200/30 dark:from-primary/5 dark:to-pink-900/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-br from-white to-pink-50/50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-primary/20 dark:border-zinc-700 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Engagement Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Avg. Views per Post
              </p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-600">
                {avgViewsPerPost.toLocaleString()}
              </p>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-pink-600 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Avg. Upvotes per Post
              </p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {avgUpvotesPerPost.toLocaleString()}
              </p>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Engagement Rate
              </p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">
                {engagementRate}%
              </p>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      {validGrowthData.length > 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200/50 dark:from-zinc-800 dark:to-zinc-900/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <MessageSquare className="size-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Activity Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Posts Published
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {validGrowthData.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Last 30 Days Views
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastMonthViews.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;

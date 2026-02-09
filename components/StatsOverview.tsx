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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="size-6 text-primary" />
        <h2 className="text-2xl font-bold text-black-300 dark:text-white">
          Quick Stats
        </h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-black-200 rounded-lg p-6 border border-black-100 dark:border-black-300">
        <h3 className="text-lg font-semibold text-black-300 dark:text-white mb-4">
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-black-200 dark:text-white-100">
              Avg. Views per Post
            </p>
            <p className="text-3xl font-bold text-primary">
              {avgViewsPerPost.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-black-200 dark:text-white-100">
              Avg. Upvotes per Post
            </p>
            <p className="text-3xl font-bold text-primary">
              {avgUpvotesPerPost.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-black-200 dark:text-white-100">
              Engagement Rate
            </p>
            <p className="text-3xl font-bold text-primary">{engagementRate}%</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      {validGrowthData.length > 0 && (
        <div className="bg-white dark:bg-black-200 rounded-lg p-6 border border-black-100 dark:border-black-300">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-black-300 dark:text-white">
              Activity Overview
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-black-200 dark:text-white-100">
                Posts Published
              </span>
              <span className="text-lg font-semibold text-black-300 dark:text-white">
                {validGrowthData.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black-200 dark:text-white-100">
                Last 30 Days Views
              </span>
              <span className="text-lg font-semibold text-black-300 dark:text-white">
                {lastMonthViews.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;

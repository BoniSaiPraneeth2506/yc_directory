import React from "react";
import { client } from "@/sanityio/lib/client";
import { 
  AUTHOR_STATS_QUERY, 
  AUTHOR_GROWTH_QUERY,
  AUTHOR_REELS_STATS_QUERY,
  AUTHOR_REELS_GROWTH_QUERY
} from "@/sanityio/lib/queries";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { 
  AiOutlineFall
} from "react-icons/ai";
import { 
  BsGraphUpArrow,
  BsBarChart,
  BsLightningCharge
} from "react-icons/bs";
import { 
  IoStatsChartSharp,
  IoSparkles
} from "react-icons/io5";
import {
  FiEye,
  FiHeart,
  FiFileText
} from "react-icons/fi";
import {
  RiEyeFill,
  RiHeartFill,
  RiTeamFill,
  RiVideoFill,
  RiMessage2Fill,
  RiFileList3Fill,
  RiTimeFill
} from "react-icons/ri";

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

interface ReelsStats {
  totalReels: number;
  totalReelViews: number;
  totalReelUpvotes: number;
  totalComments: number;
}

interface GrowthData {
  _createdAt: string;
  views: number;
  upvotes: number;
  title?: string;
}

const StatsOverview = async ({ userId }: StatsOverviewProps) => {
  const [stats, growthData, reelsStats, reelsGrowthData] = await Promise.all([
    client.fetch(AUTHOR_STATS_QUERY, { id: userId }) as Promise<AuthorStats>,
    client.fetch(AUTHOR_GROWTH_QUERY, { id: userId }) as Promise<GrowthData[]>,
    client.fetch(AUTHOR_REELS_STATS_QUERY, { id: userId }) as Promise<ReelsStats>,
    client.fetch(AUTHOR_REELS_GROWTH_QUERY, { id: userId }) as Promise<GrowthData[]>,
  ]);

  // Ensure stats have default values
  const totalPosts = stats?.totalPosts || 0;
  const totalViews = stats?.totalViews || 0;
  const totalUpvotes = stats?.totalUpvotes || 0;
  const followerCount = stats?.followerCount || 0;
  
  const totalReels = reelsStats?.totalReels || 0;
  const totalReelViews = reelsStats?.totalReelViews || 0;
  const totalReelUpvotes = reelsStats?.totalReelUpvotes || 0;
  const totalComments = reelsStats?.totalComments || 0;

  // Combined totals
  const combinedViews = totalViews + totalReelViews;
  const combinedUpvotes = totalUpvotes + totalReelUpvotes;
  const combinedContent = totalPosts + totalReels;

  // Calculate average views per post
  const avgViewsPerPost = combinedContent > 0 
    ? Math.round(combinedViews / combinedContent) 
    : 0;

  // Calculate average upvotes per post
  const avgUpvotesPerPost = combinedContent > 0
    ? Math.round(combinedUpvotes / combinedContent)
    : 0;

  // Calculate engagement rate (upvotes vs views)
  const engagementRate = combinedViews > 0
    ? ((combinedUpvotes / combinedViews) * 100).toFixed(1)
    : "0.0";

  // Calculate growth trends
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const allGrowthData = [...(growthData || []), ...(reelsGrowthData || [])];
  const validGrowthData = allGrowthData.filter(item => item && item._createdAt);

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

  const lastMonthUpvotes = lastMonth.reduce((sum, item) => sum + (item.upvotes || 0), 0);
  const previousMonthUpvotes = previousMonth.reduce(
    (sum, item) => sum + (item.upvotes || 0),
    0
  );

  const viewsTrend =
    previousMonthViews > 0
      ? Math.round(((lastMonthViews - previousMonthViews) / previousMonthViews) * 100)
      : lastMonthViews > 0
      ? 100
      : 0;

  const upvotesTrend =
    previousMonthUpvotes > 0
      ? Math.round(((lastMonthUpvotes - previousMonthUpvotes) / previousMonthUpvotes) * 100)
      : lastMonthUpvotes > 0
      ? 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
        <div className="relative bg-gradient-to-r from-primary to-pink-600 rounded-2xl p-6 border-2 border-black shadow-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <IoStatsChartSharp className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  Analytics Dashboard
                  <IoSparkles className="text-yellow-300 animate-pulse" />
                </h2>
                <p className="text-sm text-white/80 font-medium">Real-time insights & performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Content */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <RiFileList3Fill className="text-xl text-primary" />
            </div>
            <p className="text-2xl font-black text-black">{combinedContent}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Content</p>
          </div>
        </div>

        {/* Total Views */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <RiEyeFill className="text-xl text-blue-600" />
              {viewsTrend !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs font-bold ${viewsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {viewsTrend > 0 ? <BsGraphUpArrow /> : <AiOutlineFall />}
                  <span>{Math.abs(viewsTrend)}%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-black text-black">{combinedViews.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Views</p>
          </div>
        </div>

        {/* Total Upvotes */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <RiHeartFill className="text-xl text-red-600" />
              {upvotesTrend !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs font-bold ${upvotesTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {upvotesTrend > 0 ? <BsGraphUpArrow /> : <AiOutlineFall />}
                  <span>{Math.abs(upvotesTrend)}%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-black text-black">{combinedUpvotes.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Upvotes</p>
          </div>
        </div>

        {/* Followers */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <RiTeamFill className="text-xl text-purple-600" />
            </div>
            <p className="text-2xl font-black text-black">{followerCount}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Followers</p>
          </div>
        </div>

        {/* Posts */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <FiFileText className="text-xl text-orange-600" />
            </div>
            <p className="text-2xl font-black text-black">{totalPosts}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Posts</p>
          </div>
        </div>

        {/* Reels */}
        <div className="group relative bg-white rounded-xl p-4 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-yellow-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <RiVideoFill className="text-xl text-black" />
            </div>
            <p className="text-2xl font-black text-black">{totalReels}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Reels</p>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-pink-600 rounded-xl"></div>
          <div className="relative bg-gradient-to-br from-primary to-pink-600 rounded-xl p-5 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiEye className="text-2xl text-white" />
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Avg Views</p>
              </div>
              <BsLightningCharge className="text-xl text-yellow-300 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-white">{avgViewsPerPost.toLocaleString()}</p>
            <p className="text-xs text-white/70 font-medium mt-1">per content</p>
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl"></div>
          <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-5 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiHeart className="text-2xl text-white" />
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Avg Upvotes</p>
              </div>
              <BsLightningCharge className="text-xl text-yellow-300 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-white">{avgUpvotesPerPost.toLocaleString()}</p>
            <p className="text-xs text-white/70 font-medium mt-1">per content</p>
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-5 border-2 border-black shadow-100 hover:shadow-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BsBarChart className="text-2xl text-white" />
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">Engagement</p>
              </div>
              <BsLightningCharge className="text-xl text-yellow-300 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-white">{engagementRate}%</p>
            <p className="text-xs text-white/70 font-medium mt-1">rate</p>
          </div>
        </div>
      </div>

      {/* Reels Performance */}
      {totalReels > 0 && (
        <div className="bg-gradient-to-br from-secondary/30 to-yellow-300/30 rounded-2xl p-5 border-2 border-black shadow-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-lg">
              <RiVideoFill className="text-xl text-secondary" />
            </div>
            <h3 className="text-lg font-black text-black">Reels Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border-2 border-black">
              <RiVideoFill className="text-lg text-primary mb-1" />
              <p className="text-2xl font-black text-black">{totalReels}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 border-2 border-black">
              <RiEyeFill className="text-lg text-blue-600 mb-1" />
              <p className="text-2xl font-black text-black">{totalReelViews.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase">Views</p>
            </div>
            <div className="bg-white rounded-xl p-3 border-2 border-black">
              <RiHeartFill className="text-lg text-red-600 mb-1" />
              <p className="text-2xl font-black text-black">{totalReelUpvotes.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase">Upvotes</p>
            </div>
            <div className="bg-white rounded-xl p-3 border-2 border-black">
              <RiMessage2Fill className="text-lg text-green-600 mb-1" />
              <p className="text-2xl font-black text-black">{totalComments.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase">Comments</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-gradient-to-br from-primary to-pink-600 rounded-lg">
            <BsBarChart className="text-xl text-white" />
          </div>
          <h3 className="text-lg font-black text-black">Performance Charts</h3>
        </div>
        <AnalyticsCharts
          growthData={growthData || []}
          reelsData={reelsGrowthData || []}
          totalPosts={totalPosts}
          totalReels={totalReels}
          totalViews={combinedViews}
          totalUpvotes={combinedUpvotes}
          viewsTrend={viewsTrend}
          upvotesTrend={upvotesTrend}
        />
      </div>

      {/* Activity Summary */}
      {validGrowthData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-900 rounded-lg">
              <RiTimeFill className="text-xl text-white" />
            </div>
            <h3 className="text-lg font-black text-black">Recent Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-300">
              <p className="text-xs font-bold text-gray-600 uppercase mb-1">Published</p>
              <p className="text-3xl font-black text-black">{validGrowthData.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-300">
              <p className="text-xs font-bold text-gray-600 uppercase mb-1">30d Views</p>
              <p className="text-3xl font-black text-black">{lastMonthViews.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-300">
              <p className="text-xs font-bold text-gray-600 uppercase mb-1">30d Upvotes</p>
              <p className="text-3xl font-black text-black">{lastMonthUpvotes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;

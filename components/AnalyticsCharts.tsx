"use client";

import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface AnalyticsChartsProps {
  growthData: Array<{
    _createdAt: string;
    views: number;
    upvotes: number;
    title?: string;
  }>;
  reelsData: Array<{
    _createdAt: string;
    views: number;
    upvotes: number;
    title?: string;
  }>;
  totalPosts: number;
  totalReels: number;
  totalViews: number;
  totalUpvotes: number;
  viewsTrend: number;
  upvotesTrend: number;
}

export function AnalyticsCharts({
  growthData,
  reelsData,
  totalPosts,
  totalReels,
  totalViews,
  totalUpvotes,
  viewsTrend,
  upvotesTrend,
}: AnalyticsChartsProps) {
  // Process data for charts
  const sortedGrowthData = [...growthData].sort(
    (a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime()
  );

  const sortedReelsData = [...reelsData].sort(
    (a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime()
  );

  // Combine posts and reels chronologically
  const allContent = [
    ...sortedGrowthData.map(item => ({ ...item, type: "post" })),
    ...sortedReelsData.map(item => ({ ...item, type: "reel" }))
  ].sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());

  // Group by month for better visualization
  const monthlyData = allContent.reduce((acc: any, item) => {
    const date = new Date(item._createdAt);
    const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { views: 0, upvotes: 0, posts: 0, reels: 0 };
    }
    
    acc[monthKey].views += item.views || 0;
    acc[monthKey].upvotes += item.upvotes || 0;
    if (item.type === 'post') acc[monthKey].posts += 1;
    if (item.type === 'reel') acc[monthKey].reels += 1;
    
    return acc;
  }, {});

  const labels = Object.keys(monthlyData);
  const viewsData = Object.values(monthlyData).map((d: any) => d.views);
  const upvotesData = Object.values(monthlyData).map((d: any) => d.upvotes);
  const postsData = Object.values(monthlyData).map((d: any) => d.posts);
  const reelsDataPoints = Object.values(monthlyData).map((d: any) => d.reels);

  // Views and Upvotes Over Time Chart
  const performanceChartData = {
    labels,
    datasets: [
      {
        label: "Views",
        data: viewsData,
        borderColor: "rgb(238, 43, 105)",
        backgroundColor: "rgba(238, 43, 105, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Upvotes",
        data: upvotesData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Posts vs Reels Comparison
  const contentComparisonData = {
    labels,
    datasets: [
      {
        label: "Posts",
        data: postsData,
        backgroundColor: "rgba(238, 43, 105, 0.8)",
        borderColor: "rgb(238, 43, 105)",
        borderWidth: 2,
      },
      {
        label: "Reels",
        data: reelsDataPoints,
        backgroundColor: "rgba(251, 232, 67, 0.8)",
        borderColor: "rgb(251, 232, 67)",
        borderWidth: 2,
      },
    ],
  };

  // Content Type Distribution (Doughnut)
  const contentTypeData = {
    labels: ["Posts", "Reels"],
    datasets: [
      {
        data: [totalPosts, totalReels],
        backgroundColor: [
          "rgba(238, 43, 105, 0.8)",
          "rgba(251, 232, 67, 0.8)",
        ],
        borderColor: [
          "rgb(238, 43, 105)",
          "rgb(251, 232, 67)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Engagement Distribution
  const engagementData = {
    labels: ["Views", "Upvotes"],
    datasets: [
      {
        data: [totalViews, totalUpvotes],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Views Trend
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {viewsTrend > 0 ? "+" : ""}{viewsTrend}%
              </p>
            </div>
            <div className={`p-3 rounded-xl ${viewsTrend >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {viewsTrend >= 0 ? (
                <TrendingUp className="size-6 text-green-600" />
              ) : (
                <TrendingDown className="size-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">vs. previous 30 days</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Upvotes Trend
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {upvotesTrend > 0 ? "+" : ""}{upvotesTrend}%
              </p>
            </div>
            <div className={`p-3 rounded-xl ${upvotesTrend >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {upvotesTrend >= 0 ? (
                <TrendingUp className="size-6 text-green-600" />
              ) : (
                <TrendingDown className="size-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">vs. previous 30 days</p>
        </div>
      </div>

      {/* Performance Over Time Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Performance Over Time</h3>
        </div>
        <div className="h-[300px]">
          <Line data={performanceChartData} options={chartOptions} />
        </div>
      </div>

      {/* Content Comparison */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Posts vs Reels</h3>
        </div>
        <div className="h-[300px]">
          <Bar data={contentComparisonData} options={chartOptions} />
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="size-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Content Distribution</h3>
          </div>
          <div className="h-[250px]">
            <Doughnut data={contentTypeData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="size-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Engagement Split</h3>
          </div>
          <div className="h-[250px]">
            <Doughnut data={engagementData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

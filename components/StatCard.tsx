import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ label, value, icon: Icon, trend }: StatCardProps) => {
  return (
    <div className="group relative aspect-square">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-pink-100/50 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative h-full bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-gradient-to-br from-primary to-pink-600 rounded-xl shadow-lg">
            <Icon className="size-4 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {trend.isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

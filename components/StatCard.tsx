import React from "react";
import { LucideIcon } from "lucide-react";

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
    <div className="bg-white dark:bg-black-200 rounded-lg p-6 border border-black-100 dark:border-black-300 hover:border-primary dark:hover:border-primary transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 dark:bg-primary/10 rounded-lg">
          <Icon className="size-6 text-primary" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-black-300 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-black-200 dark:text-white-100">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Eye, ThumbsUp, SlidersHorizontal } from "lucide-react";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Prevent hydration mismatch by rendering only after mount
  if (!mounted) {
    return (
      <div className="w-[44px] sm:w-[180px] h-[44px] bg-white border-2 border-gray-200 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
        <SlidersHorizontal className="size-4 sm:hidden" />
        <span className="hidden sm:inline text-sm text-muted-foreground">Sort by</span>
      </div>
    );
  }

  return (
    <Select value={currentSort} onValueChange={handleSort}>
      <SelectTrigger className="w-[44px] sm:w-[180px] h-[44px] bg-white border-2 border-gray-200 hover:border-primary transition-colors shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 justify-center sm:justify-start w-full">
          <SlidersHorizontal className="size-4 sm:hidden" />
          <span className="hidden sm:inline">
            <SelectValue placeholder="Sort by" />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
        <SelectItem value="latest" className="cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>Latest</span>
          </div>
        </SelectItem>
        <SelectItem value="views" className="cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <span>Most Viewed</span>
          </div>
        </SelectItem>
        <SelectItem value="upvotes" className="cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-4" />
            <span>Most Upvoted</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

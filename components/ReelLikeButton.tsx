"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleReelUpvote } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReelLikeButtonProps {
  reelId: string;
  initialUpvotes: number;
  hasUpvoted: boolean;
  className?: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ReelLikeButton({
  reelId,
  initialUpvotes,
  hasUpvoted: initialHasUpvoted,
  className,
  showCount = true,
  size = "md",
}: ReelLikeButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isPending, startTransition] = useTransition();

  const handleUpvote = async () => {
    // Optimistic update
    const previousUpvotes = upvotes;
    const previousHasUpvoted = hasUpvoted;

    setUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    setHasUpvoted(!hasUpvoted);

    startTransition(async () => {
      try {
        const result = await toggleReelUpvote(reelId);

        if (result.status === "ERROR") {
          // Revert on error
          setUpvotes(previousUpvotes);
          setHasUpvoted(previousHasUpvoted);
          toast.error(result.error || "Failed to like reel");
        }
      } catch (error) {
        // Revert on error
        setUpvotes(previousUpvotes);
        setHasUpvoted(previousHasUpvoted);
        toast.error("An error occurred");
      }
    });
  };

  const sizeClasses = {
    sm: "size-5",
    md: "size-6", 
    lg: "size-8",
  };

  const containerSizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isPending}
      className={cn(
        "flex flex-col items-center gap-1 hover:scale-110 transition-transform",
        className
      )}
    >
      <div className={cn(
        "bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center",
        containerSizeClasses[size]
      )}>
        <Heart
          className={cn(
            sizeClasses[size],
            "text-white transition-colors",
            hasUpvoted ? "fill-red-500 text-red-500" : ""
          )}
        />
      </div>
      {showCount && (
        <span className="text-white text-xs font-semibold">
          {upvotes > 999 ? `${Math.floor(upvotes / 1000)}k` : upvotes}
        </span>
      )}
    </button>
  );
}
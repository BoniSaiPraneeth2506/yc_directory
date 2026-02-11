"use client";

import { Bookmark } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleReelBookmark } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReelSaveButtonProps {
  reelId: string;
  isSaved: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ReelSaveButton({
  reelId,
  isSaved: initialIsSaved,
  className,
  size = "md",
}: ReelSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    // Optimistic update
    const previousIsSaved = isSaved;
    setIsSaved(!isSaved);

    startTransition(async () => {
      try {
        const result = await toggleReelBookmark(reelId);

        if (result.status === "ERROR") {
          // Revert on error
          setIsSaved(previousIsSaved);
          toast.error(result.error || "Failed to save reel");
        } else {
          toast.success(
            previousIsSaved ? "Removed from saved" : "Reel saved!"
          );
        }
      } catch (error) {
        // Revert on error
        setIsSaved(previousIsSaved);
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
      onClick={handleSave}
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
        <Bookmark
          className={cn(
            sizeClasses[size],
            "transition-colors",
            isSaved ? "fill-pink-500 text-pink-500" : "text-white"
          )}
        />
      </div>
    </button>
  );
}
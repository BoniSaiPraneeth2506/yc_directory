"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReelShareButtonProps {
  reelId: string;
  reelTitle: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ReelShareButton({
  reelId,
  reelTitle,
  className,
  size = "md",
}: ReelShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/reels/${reelId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: reelTitle,
          text: `Check out this startup pitch: ${reelTitle}`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing or it failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
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
      onClick={handleShare}
      className={cn(
        "flex flex-col items-center gap-1 hover:scale-110 transition-transform",
        className
      )}
    >
      <div className={cn(
        "bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center",
        containerSizeClasses[size]
      )}>
        <Share
          className={cn(
            sizeClasses[size],
            "text-white"
          )}
        />
      </div>
    </button>
  );
}
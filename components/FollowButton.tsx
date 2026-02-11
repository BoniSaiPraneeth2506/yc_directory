"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus, ChevronDown } from "lucide-react";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  variant?: "default" | "compact" | "profile";
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
  variant = "default",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(async () => {
      // Optimistic update
      const previousState = { isFollowing, followersCount };
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

      try {
        const result = await toggleFollow(targetUserId);
        
        if (result.error) {
          // Revert on error
          setIsFollowing(previousState.isFollowing);
          setFollowersCount(previousState.followersCount);
          toast.error(result.error);
        } else {
          toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
        }
      } catch (error) {
        // Revert on error
        setIsFollowing(previousState.isFollowing);
        setFollowersCount(previousState.followersCount);
        toast.error("Something went wrong");
      }
    });
  };

  // Profile variant with dropdown for "Following" state
  if (variant === "profile") {
    if (isFollowing) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isPending}
              className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[120px]"
            >
              <span>Following</span>
              <ChevronDown className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[120px] bg-white border border-gray-200 shadow-lg rounded-lg p-0">
            <DropdownMenuItem
              onClick={handleFollow}
              disabled={isPending}
              className="cursor-pointer font-semibold text-sm text-red-600 bg-gray-200 hover:bg-gray-300 focus:bg-gray-300 rounded-lg py-1.5 px-6 transition-all"
            >
              Unfollow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else {
      return (
        <button
          onClick={handleFollow}
          disabled={isPending}
          className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          Follow
        </button>
      );
    }
  }

  // Other variants remain unchanged
  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === "compact" 
          ? `px-3 py-1.5 rounded-full text-sm ${
              isFollowing
                ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                : "bg-white text-black hover:bg-gray-100 border border-white"
            }`
          : `px-4 py-2 rounded-lg ${
              isFollowing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                : "bg-primary text-white hover:bg-primary-dark border-2 border-primary"
            }`
      }`}
    >
      {variant === "compact" ? (
        <span className="text-xs font-medium">
          {isFollowing ? "Following" : "Follow"}
        </span>
      ) : (
        <>
          {isFollowing ? (
            <>
              <UserMinus className="size-5" />
              <span className="hidden sm:inline">Unfollow</span>
            </>
          ) : (
            <>
              <UserPlus className="size-5" />
              <span className="hidden sm:inline">Follow</span>
            </>
          )}
        </>
      )}
    </button>
  );
}

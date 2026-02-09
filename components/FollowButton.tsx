"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
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

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isFollowing
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
          : "bg-primary text-white hover:bg-primary-dark border-2 border-primary"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
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
    </button>
  );
}

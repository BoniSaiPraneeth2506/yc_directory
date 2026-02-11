"use client";

import Link from "next/link";
import { Eye, Heart, Play, MessageCircle } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface Reel {
  _id: string;
  title: string;
  thumbnail?: string;
  views?: number;
  upvotes?: number;
  commentCount?: number;
}

interface ReelGridProps {
  reels: Reel[];
}

const ReelGridItem = memo(function ReelGridItem({ reel }: { reel: Reel }) {
  return (
    <Link
      href={`/reels?id=${reel._id}`}
      className="relative aspect-[9/16] bg-gray-100 rounded-sm overflow-hidden group"
      prefetch={false}
    >
      {/* Thumbnail or Video Frame */}
      {reel.thumbnail ? (
        <Image
          src={reel.thumbnail}
          alt={reel.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 33vw, 25vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <Play className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Overlay with stats */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-center gap-3 text-white text-xs font-semibold">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{formatCount(reel.views ?? 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{formatCount(reel.upvotes ?? 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{formatCount(reel.commentCount ?? 0)}</span>
        </div>
      </div>

      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
        </div>
      </div>
    </Link>
  );
});

export const ReelGrid = memo(function ReelGrid({ reels }: ReelGridProps) {
  if (!reels || reels.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500">No reels yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {reels.map((reel) => (
        <ReelGridItem key={reel._id} reel={reel} />
      ))}
    </div>
  );
});

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

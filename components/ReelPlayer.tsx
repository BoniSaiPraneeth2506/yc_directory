"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, MessageCircle, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface ReelPlayerProps {
  reel: {
    _id: string;
    title: string;
    slug: { current: string };
    author: {
      _id: string;
      name: string;
      image?: string;
    };
    videoUrl: string;
    description: string;
    category: string;
    views: number;
    upvotes: number;
    commentCount: number;
    tags?: string[];
  };
  isActive: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const ReelPlayer = ({ reel, isActive, onVisibilityChange }: ReelPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Handle video play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(console.error);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Hide controls after 2 seconds of no interaction
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setShowControls(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    setShowControls(true);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on interactive elements
    if ((e.target as HTMLElement).closest("a, button")) {
      return;
    }
    togglePlayPause();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-black snap-start snap-always flex items-center justify-center"
      onClick={handleContainerClick}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        preload="metadata"
        muted={isMuted}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      {/* Top info */}
      <div
        className={cn(
          "absolute top-4 left-4 right-4 flex items-center justify-between transition-opacity duration-300 z-10",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Link
          href={`/user/${reel.author._id}`}
          className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 hover:bg-black/70 transition-colors"
        >
          <Avatar className="size-8 border-2 border-white">
            <AvatarImage src={reel.author.image} alt={reel.author.name} />
            <AvatarFallback>{reel.author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm">
            {reel.author.name}
          </span>
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="bg-black/50 backdrop-blur-sm rounded-full p-2.5 hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="size-5 text-white" />
          ) : (
            <Volume2 className="size-5 text-white" />
          )}
        </button>
      </div>

      {/* Center play/pause button */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
          showControls && !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
          <Play className="size-12 text-white fill-white" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-32 left-4 right-20 text-white space-y-2 z-10 pb-6">
        <h2 className="text-lg font-bold line-clamp-2">{reel.title}</h2>
        <p className="text-sm text-gray-200 line-clamp-2">{reel.description}</p>
      </div>

      {/* Right side actions */}
      <div className="absolute bottom-32 right-4 flex flex-col items-center gap-6 z-10 pb-6">
        <Link
          href={`/reels/${reel._id}`}
          className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Heart className="size-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">
            {formatNumber(reel.upvotes)}
          </span>
        </Link>

        <Link
          href={`/reels/${reel._id}#comments`}
          className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <MessageCircle className="size-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">
            {formatNumber(reel.commentCount || 0)}
          </span>
        </Link>
      </div>
    </div>
  );
};

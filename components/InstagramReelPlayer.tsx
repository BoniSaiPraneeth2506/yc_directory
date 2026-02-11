"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FollowButton } from "./FollowButton";
import { ReelLikeButton } from "./ReelLikeButton";
import { ReelSaveButton } from "./ReelSaveButton";
import { ReelShareButton } from "./ReelShareButton";
import { ReelCommentModal } from "./ReelCommentModal";
import { trackReelView } from "@/lib/actions";

interface InstagramReelPlayerProps {
  reel: {
    _id: string;
    title: string;
    slug: { current: string };
    author: {
      _id: string;
      name: string;
      image?: string;
      bio?: string;
      isFollowing?: boolean;
    };
    videoUrl: string;
    description: string;
    category: string;
    views: number;
    upvotes: number;
    commentCount: number;
    tags?: string[];
    hasUpvoted?: boolean;
    isSaved?: boolean;
  };
  isActive: boolean;
  currentUserId?: string;
}

export const InstagramReelPlayer = ({ 
  reel, 
  isActive, 
  currentUserId 
}: InstagramReelPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playAttemptRef = useRef<Promise<void> | null>(null);
  const viewTrackedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    // Initialize from localStorage, default to false (sound on) if not set
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reelSoundMuted');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });
  const [showControls, setShowControls] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Listen for sound preference changes from other reel instances
  useEffect(() => {
    const handleSoundChange = (e: CustomEvent) => {
      setIsMuted(e.detail.isMuted);
    };
    
    window.addEventListener('reelSoundChange' as any, handleSoundChange as any);
    
    return () => {
      window.removeEventListener('reelSoundChange' as any, handleSoundChange as any);
    };
  }, []);

  // Sync video muted state with preference
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted, reel._id]);

  // Handle video ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoReady(true);
      setVideoError(false);
    };

    const handleError = () => {
      setVideoError(true);
      console.error("Video loading error");
    };

    const handleLoadedData = () => {
      setVideoReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Handle video play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return;

    if (isActive) {
      // Wait for any existing play attempt to finish
      if (playAttemptRef.current) {
        playAttemptRef.current.catch(() => {}).then(() => {
          playAttemptRef.current = null;
        });
      }

      // Attempt to play with proper error handling
      const playPromise = video.play();
      playAttemptRef.current = playPromise;
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            playAttemptRef.current = null;
            
            // Track view on first play
            if (!viewTrackedRef.current) {
              viewTrackedRef.current = true;
              trackReelView(reel._id).catch(console.error);
            }
          })
          .catch((error) => {
            playAttemptRef.current = null;
            // Handle autoplay restrictions
            if (error.name === "NotAllowedError" || error.name === "NotSupportedError") {
              console.log("Autoplay prevented, user interaction required");
              setIsPlaying(false);
            } else if (error.name === "AbortError") {
              // Play was interrupted, this is normal when scrolling fast
              // Don't show error to user
            } else {
              console.error("Video play error:", error);
            }
          });
      }
    } else {
      // Cancel any pending play attempts
      if (playAttemptRef.current) {
        video.pause();
        playAttemptRef.current = null;
      }
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, videoReady, reel._id]);

  // Hide controls after 3 seconds of no interaction
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // Wait for any existing play attempt
      if (playAttemptRef.current) {
        return;
      }

      const playPromise = video.play();
      playAttemptRef.current = playPromise;
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            playAttemptRef.current = null;
            
            // Track view on first play
            if (!viewTrackedRef.current) {
              viewTrackedRef.current = true;
              trackReelView(reel._id).catch(console.error);
            }
          })
          .catch((error) => {
            playAttemptRef.current = null;
            if (error.name !== "AbortError") {
              console.log("Play failed:", error.message);
            }
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      playAttemptRef.current = null;
    }
    setShowControls(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !video.muted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('reelSoundMuted', String(newMutedState));
      
      // Notify all other reel instances about the sound change
      const event = new CustomEvent('reelSoundChange', {
        detail: { isMuted: newMutedState }
      });
      window.dispatchEvent(event);
    }
    
    setShowControls(true);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on interactive elements
    if ((e.target as HTMLElement).closest("a, button")) {
      return;
    }
    togglePlayPause();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const isOwnContent = currentUserId === reel.author._id;
  const truncatedDescription = reel.description.length > 100 
    ? reel.description.slice(0, 100) + "..." 
    : reel.description;

  return (
    <>
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
          preload="auto"
          muted={isMuted}
          webkit-playsinline="true"
          x5-playsinline="true"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Loading State */}
        {!videoReady && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="flex flex-col items-center gap-3 text-white text-center px-4">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm">Failed to load video</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Top area - Sound toggle only */}
        <div
          className={cn(
            "absolute top-4 left-4 right-4 flex items-center justify-end transition-opacity duration-300 z-10",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Sound toggle */}
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
          <div className="bg-white/10 backdrop-blur-md rounded-full p-4 shadow-lg">
            <Play className="size-10 text-white fill-white" />
          </div>
        </div>

        {/* Bottom content area */}
        <div className="absolute bottom-32 sm:bottom-24 left-4 right-20 z-10 pb-4">
          <div className="space-y-3">
            {/* User info with follow button - Instagram style at bottom */}
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/user/${reel.author._id}`} className="flex items-center gap-2">
                <Avatar className="size-8 border-2 border-white">
                  <AvatarImage src={reel.author.image} alt={reel.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-semibold">
                    {reel.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {reel.author.name}
                </span>
              </Link>
              
              {/* Follow Button - Only show if not own content and user is logged in */}
              {currentUserId && !isOwnContent && (
                <FollowButton
                  targetUserId={reel.author._id}
                  initialIsFollowing={reel.author.isFollowing || false}
                  initialFollowersCount={0}
                  variant="compact"
                />
              )}
            </div>

            {/* Title */}
            <h2 className="text-white text-base font-semibold line-clamp-2 drop-shadow-lg">
              {reel.title}
            </h2>
            
            {/* Description with Tags - Instagram style */}
            {reel.description && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (reel.description.length > 80) {
                    setShowFullDescription(!showFullDescription);
                  }
                }}
                className={cn(
                  "text-white text-[13px] leading-snug drop-shadow-lg font-normal",
                  reel.description.length > 80 && "cursor-pointer"
                )}
              >
                <div className={cn(
                  !showFullDescription && "line-clamp-2"
                )}>
                  <span className="text-gray-100">
                    {showFullDescription ? reel.description : truncatedDescription}
                  </span>
                  {reel.tags && reel.tags.length > 0 && (
                    <span className="ml-1">
                      {reel.tags.map((tag, index) => (
                        <span key={index} className="text-blue-300 font-medium">
                          #{tag}{index < reel.tags.length - 1 && " "}
                        </span>
                      ))}
                    </span>
                  )}
                  {reel.description.length > 80 && !showFullDescription && (
                    <span className="ml-1 text-gray-400">...more</span>
                  )}
                  {reel.description.length > 80 && showFullDescription && (
                    <span className="ml-2 text-gray-400">less</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side actions - Instagram style */}
        <div className="absolute bottom-32 sm:bottom-24 right-4 flex flex-col items-center gap-6 z-10 pb-4">
          {/* Like Button */}
          {currentUserId && (
            <ReelLikeButton
              reelId={reel._id}
              initialUpvotes={reel.upvotes || 0}
              hasUpvoted={reel.hasUpvoted || false}
            />
          )}

          {/* Comment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentModal(true);
            }}
            className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <MessageCircle className="size-6 text-white" />
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(reel.commentCount || 0)}
            </span>
          </button>

          {/* Share Button */}
          <ReelShareButton
            reelId={reel._id}
            reelTitle={reel.title}
          />

          {/* Save Button */}
          {currentUserId && (
            <ReelSaveButton
              reelId={reel._id}
              isSaved={reel.isSaved || false}
            />
          )}
        </div>
      </div>

      {/* Comment Modal */}
      <ReelCommentModal
        reelId={reel._id}
        reelTitle={reel.title}
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        initialCommentCount={reel.commentCount || 0}
        currentUserId={currentUserId}
      />
    </>
  );
};
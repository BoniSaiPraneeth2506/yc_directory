"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { client } from "@/sanityio/lib/client";
import { COMMENTS_BY_REEL_QUERY } from "@/sanityio/lib/queries";
import { CommentItem } from "./CommentItem";
import { ReelCommentForm } from "./ReelCommentForm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ReelCommentModalProps {
  reelId: string;
  reelTitle: string;
  isOpen: boolean;
  onClose: () => void;
  initialCommentCount?: number;
  currentUserId?: string;
}

export function ReelCommentModal({
  reelId,
  reelTitle,
  isOpen,
  onClose,
  initialCommentCount = 0,
  currentUserId,
}: ReelCommentModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, reelId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await client.fetch(COMMENTS_BY_REEL_QUERY, {
        reelId,
      });
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSuccess = () => {
    fetchComments(); // Refresh comments after adding one
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Instagram Style */}
      <div className="fixed inset-x-0 bottom-16 sm:bottom-0 z-50 flex justify-center sm:inset-0 sm:items-center">
        <div 
          className={cn(
            "bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl",
            "max-h-[75vh] sm:max-h-[85vh] flex flex-col overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Instagram Style */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="w-10"></div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Comments
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="size-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Comments List - Instagram Style */}
          <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <MessageCircle className="size-12 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  No comments yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Start the conversation.
                </p>
              </div>
            ) : (
              <div className="py-2">
                {comments.map((comment) => (
                  <div 
                    key={comment._id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <Avatar className="size-9 shrink-0 mt-0.5">
                        <AvatarImage 
                          src={comment.author?.image} 
                          alt={comment.author?.name || "User"} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                          {comment.author?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                              {comment.author?.name || "Anonymous"}
                            </span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                        {/* Footer with time and reply */}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment._createdAt && formatDistanceToNow(new Date(comment._createdAt), { addSuffix: true })}
                          </span>
                          <button className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Input - Instagram Style */}
          {currentUserId ? (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
              <ReelCommentForm 
                reelId={reelId}
                onSuccess={handleCommentSuccess}
              />
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                <button className="font-semibold text-blue-500 hover:text-blue-600">
                  Sign in
                </button>
                {" "}to comment
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
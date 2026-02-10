"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, Reply, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { CommentForm } from "./CommentForm";
import { toggleCommentUpvote, deleteComment } from "@/lib/actions";
import { toast } from "sonner";

interface Comment {
  _id: string;
  content: string;
  _createdAt: string;
  upvotes: number;
  upvotedBy: { _id: string }[];
  author: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  startupId: string;
  level?: number;
}

export function CommentItem({
  comment,
  currentUserId,
  startupId,
  level = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(comment.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(
    comment.upvotedBy?.some((u) => u._id === currentUserId) || false
  );
  const [isPending, startTransition] = useTransition();

  const isAuthor = currentUserId === comment.author._id;
  const canNest = level < 3; // Limit nesting to 3 levels

  const handleUpvote = () => {
    if (!currentUserId) {
      toast.error("Please sign in to upvote comments");
      return;
    }

    // Optimistic update
    const newUpvoted = !isUpvoted;
    setIsUpvoted(newUpvoted);
    setOptimisticUpvotes((prev) => (newUpvoted ? prev + 1 : prev - 1));

    startTransition(async () => {
      const result = await toggleCommentUpvote(comment._id);
      if (result.error) {
        // Revert on error
        setIsUpvoted(!newUpvoted);
        setOptimisticUpvotes((prev) => (newUpvoted ? prev - 1 : prev + 1));
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      const result = await deleteComment(comment._id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment deleted!");
      }
    });
  };

  return (
    <div className={`${level > 0 ? "ml-4 sm:ml-8 mt-4" : "mt-6"}`}>
      <div className="flex gap-2 sm:gap-3">
        <Link href={`/user/${comment.author._id}`} className="flex-shrink-0">
          <Image
            src={comment.author.image || "/default-avatar.png"}
            alt={comment.author.name}
            width={36}
            height={36}
            className="rounded-full object-cover sm:w-10 sm:h-10"
          />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/user/${comment.author._id}`}
              className="font-semibold hover:underline text-sm sm:text-base"
              style={{ color: '#000000' }}
            >
              {comment.author.name}
            </Link>
            <span className="text-xs sm:text-sm" style={{ color: '#666666' }}>•</span>
            <span className="text-xs sm:text-sm" style={{ color: '#666666' }}>
              {formatDistanceToNow(new Date(comment._createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="text-sm sm:text-base mb-3 whitespace-pre-wrap break-words leading-relaxed font-medium" style={{ color: '#000000' }}>
            {comment.content || '[No content]'}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              disabled={isPending || !currentUserId}
              className={`flex items-center gap-1 text-sm ${
                isUpvoted
                  ? "text-primary font-semibold"
                  : "hover:text-primary"
              } transition-colors disabled:opacity-50`}
              style={!isUpvoted ? { color: '#333333' } : undefined}
            >
              <ArrowBigUp
                className={`size-5 ${isUpvoted ? "fill-current" : ""}`}
              />
              {optimisticUpvotes}
            </button>

            {canNest && currentUserId && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                style={{ color: '#333333' }}
              >
                <Reply className="size-4" />
                Reply
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                startupId={startupId}
                parentCommentId={comment._id}
                placeholder={`Reply to ${comment.author.name}...`}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUserId={currentUserId}
              startupId={startupId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

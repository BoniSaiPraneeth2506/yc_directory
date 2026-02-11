"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { addReelComment } from "@/lib/actions";
import { toast } from "sonner";

interface ReelCommentFormProps {
  reelId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function ReelCommentForm({
  reelId,
  parentCommentId,
  onSuccess,
  placeholder = "Add a comment...",
}: ReelCommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await addReelComment(reelId, content);
        
        if (result.error) {
          toast.error(result.error);
        } else {
          setContent("");
          onSuccess?.();
        }
      } catch (error) {
        toast.error("Failed to add comment");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-transparent">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-0 py-2 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
        maxLength={1000}
        disabled={isPending}
        autoComplete="off"
      />
      {content.trim() && (
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="text-blue-500 font-semibold text-sm hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      )}
    </form>
  );
}
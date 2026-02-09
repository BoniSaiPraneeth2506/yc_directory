"use client";

import { useState, useTransition } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { addComment } from "@/lib/actions";
import { toast } from "sonner";

interface CommentFormProps {
  startupId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function CommentForm({
  startupId,
  parentCommentId,
  onSuccess,
  placeholder = "Add a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addComment(startupId, content, parentCommentId);
        
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(parentCommentId ? "Reply added!" : "Comment added!");
          setContent("");
          onSuccess?.();
        }
      } catch (error) {
        toast.error("Failed to add comment");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        maxLength={1000}
        disabled={isPending}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {content.length}/1000
        </span>
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          className="flex items-center gap-2"
        >
          {isPending ? "Posting..." : parentCommentId ? "Reply" : "Comment"}
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}

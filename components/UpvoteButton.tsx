"use client";

import { ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { toggleUpvote } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpvoteButtonProps {
  startupId: string;
  initialUpvotes: number;
  hasUpvoted: boolean;
  variant?: "default" | "outline";
}

export function UpvoteButton({
  startupId,
  initialUpvotes,
  hasUpvoted: initialHasUpvoted,
  variant = "default",
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpvote = async () => {
    // Optimistic update
    const previousUpvotes = upvotes;
    const previousHasUpvoted = hasUpvoted;

    setUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    setHasUpvoted(!hasUpvoted);

    startTransition(async () => {
      try {
        const result = await toggleUpvote(startupId);

        if (result.status === "ERROR") {
          // Revert on error
          setUpvotes(previousUpvotes);
          setHasUpvoted(previousHasUpvoted);
          toast.error(result.error || "Failed to upvote");
        } else {
          router.refresh();
        }
      } catch (error) {
        // Revert on error
        setUpvotes(previousUpvotes);
        setHasUpvoted(previousHasUpvoted);
        toast.error("An error occurred");
      }
    });
  };

  return (
    <Button
      onClick={handleUpvote}
      variant={hasUpvoted ? "default" : variant}
      className={`gap-2 ${hasUpvoted ? "bg-primary" : ""}`}
      disabled={isPending}
    >
      <ThumbsUp
        className={`h-4 w-4 ${hasUpvoted ? "fill-current" : ""}`}
      />
      <span className="font-semibold">{upvotes}</span>
      <span className="hidden sm:inline">
        {hasUpvoted ? "Upvoted" : "Upvote"}
      </span>
    </Button>
  );
}

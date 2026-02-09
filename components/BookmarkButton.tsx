"use client";

import { Bookmark } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { toggleBookmark } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  startupId: string;
  isSaved: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({
  startupId,
  isSaved: initialIsSaved,
  variant = "ghost",
  size = "default",
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBookmark = async () => {
    // Optimistic update
    const previousIsSaved = isSaved;
    setIsSaved(!isSaved);

    startTransition(async () => {
      try {
        const result = await toggleBookmark(startupId);

        if (result.status === "ERROR") {
          // Revert on error
          setIsSaved(previousIsSaved);
          toast.error(result.error || "Failed to bookmark");
        } else {
          toast.success(
            isSaved ? "Removed from saved" : "Saved successfully!"
          );
          router.refresh();
        }
      } catch (error) {
        // Revert on error
        setIsSaved(previousIsSaved);
        toast.error("An error occurred");
      }
    });
  };

  return (
    <Button
      onClick={handleBookmark}
      variant={variant}
      size={size}
      className="gap-2"
      disabled={isPending}
    >
      <Bookmark
        className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
      />
      <span className="hidden sm:inline">
        {isSaved ? "Saved" : "Save"}
      </span>
    </Button>
  );
}

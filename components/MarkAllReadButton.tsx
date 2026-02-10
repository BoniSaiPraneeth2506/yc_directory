"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("All notifications marked as read");
        router.refresh();
      }
    });
  };

  return (
    <Button
      onClick={handleMarkAllRead}
      disabled={isPending}
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
    >
      <CheckCheck className="size-4" />
      {isPending ? "Marking..." : "Mark all read"}
    </Button>
  );
}

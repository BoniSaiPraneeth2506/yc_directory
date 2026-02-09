import { client } from "@/sanityio/lib/client";
import { COMMENTS_BY_STARTUP_QUERY } from "@/sanityio/lib/queries";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { auth } from "@/auth";
import { MessageSquare } from "lucide-react";

interface CommentListProps {
  startupId: string;
}

export async function CommentList({ startupId }: CommentListProps) {
  const session = await auth();
  
  const comments = await client.fetch(COMMENTS_BY_STARTUP_QUERY, {
    startupId,
  });

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="size-6 text-primary" />
        <h2 className="text-2xl font-bold">
          Comments ({comments.length})
        </h2>
      </div>

      {session?.id && (
        <div className="mb-8">
          <CommentForm startupId={startupId} />
        </div>
      )}

      {!session?.id && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please sign in to add comments
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={session?.id}
              startupId={startupId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

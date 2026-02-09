import { client } from "@/sanityio/lib/client";
import { DRAFTS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import DraftCard, { DraftType } from "./DraftCard";
import { FileQuestion } from "lucide-react";

const UserDrafts = async ({ id }: { id: string }) => {
  const drafts = await client.fetch(DRAFTS_BY_AUTHOR_QUERY, { id });

  return (
    <>
      {drafts.length > 0 ? (
        <ul className="card_grid-sm">
          {drafts.filter(Boolean).map((draft: DraftType) => (
            <DraftCard key={draft._id} post={draft} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="size-16 text-gray-300 mb-4" />
          <p className="no-result-description text-center">
            No drafts yet. Save a post as draft to see it here!
          </p>
        </div>
      )}
    </>
  );
};

export default UserDrafts;

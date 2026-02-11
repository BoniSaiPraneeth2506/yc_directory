import { client } from "@/sanityio/lib/client";
import { UPVOTED_REELS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import { ReelGrid } from "./ReelGrid";

export const UpvotedReels = async ({ id }: { id: string }) => {
  const reels = await client.fetch(UPVOTED_REELS_BY_AUTHOR_QUERY, { id });

  return <ReelGrid reels={reels} />;
};

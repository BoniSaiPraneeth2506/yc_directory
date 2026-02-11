import { client } from "@/sanityio/lib/client";
import { SAVED_REELS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import { ReelGrid } from "./ReelGrid";

export const SavedReels = async ({ id }: { id: string }) => {
  const reels = await client.fetch(SAVED_REELS_BY_AUTHOR_QUERY, { id });

  return <ReelGrid reels={reels} />;
};

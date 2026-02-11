import { client } from "@/sanityio/lib/client";
import { REELS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import { ReelGrid } from "./ReelGrid";

export const UserReels = async ({ id }: { id: string }) => {
  const reels = await client.fetch(REELS_BY_AUTHOR_QUERY, { id });

  return <ReelGrid reels={reels} />;
};

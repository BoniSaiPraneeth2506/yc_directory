import React from "react";
import { client } from "@/sanityio/lib/client";
import { UPVOTED_STARTUPS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const UpvotedStartups = async ({ id }: { id: string }) => {
  const startups = await client.fetch(UPVOTED_STARTUPS_BY_AUTHOR_QUERY, { id });

  return (
    <>
      {startups?.length > 0 ? (
        startups.filter(Boolean).map((startup: StartupTypeCard) => (
          <StartupCard key={startup._id} post={startup} />
        ))
      ) : (
        <p className="no-result">No upvoted posts yet</p>
      )}
    </>
  );
};

export default UpvotedStartups;

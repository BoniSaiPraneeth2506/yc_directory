import React from "react";
import { client } from "@/sanityio/lib/client";
import { SAVED_STARTUPS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const SavedStartups = async ({ id }: { id: string }) => {
  const startups = await client.fetch(SAVED_STARTUPS_BY_AUTHOR_QUERY, { id });

  return (
    <>
      {startups?.length > 0 ? (
        startups.map((startup: StartupTypeCard) => (
          <StartupCard key={startup._id} post={startup} />
        ))
      ) : (
        <p className="no-result">No saved posts yet</p>
      )}
    </>
  );
};

export default SavedStartups;

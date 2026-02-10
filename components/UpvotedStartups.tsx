import React from "react";
import { client } from "@/sanityio/lib/client";
import { UPVOTED_STARTUPS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const UpvotedStartups = async ({ id }: { id: string }) => {
  try {
    const startups = await client.fetch(UPVOTED_STARTUPS_BY_AUTHOR_QUERY, { id });
    
    // Filter out null values
    const validStartups = (startups || []).filter((startup: any) => startup && startup._id);
    
    console.log('👍 Upvoted Startups:', { 
      userId: id,
      total: startups?.length || 0, 
      valid: validStartups.length
    });

    return (
      <>
        {validStartups.length > 0 ? (
          validStartups.map((startup: StartupTypeCard) => (
            <StartupCard key={startup._id} post={startup} />
          ))
        ) : (
          <p className="no-result">No liked posts yet</p>
        )}
      </>
    );
  } catch (error) {
    console.error('❌ Error fetching upvoted startups:', error);
    return <p className="no-result text-red-500">Error loading liked posts</p>;
  }
};

export default UpvotedStartups;

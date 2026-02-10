import React from "react";
import { client } from "@/sanityio/lib/client";
import { SAVED_STARTUPS_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const SavedStartups = async ({ id }: { id: string }) => {
  try {
    const startups = await client.fetch(SAVED_STARTUPS_BY_AUTHOR_QUERY, { id });
    
    // Filter out null values
    const validStartups = (startups || []).filter((startup: any) => startup && startup._id);
    
    console.log('💾 Saved Startups:', { 
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
          <p className="no-result">No saved posts yet</p>
        )}
      </>
    );
  } catch (error) {
    console.error('❌ Error fetching saved startups:', error);
    return <p className="no-result text-red-500">Error loading saved posts</p>;
  }
};

export default SavedStartups;

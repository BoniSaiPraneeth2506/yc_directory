import React from "react";
import { client } from "@/sanityio/lib/client";
import StartupCard, { StartupTypeCard } from "./StartupCard";
import { Sparkles } from "lucide-react";

interface RelatedStartupsProps {
  currentId: string;
  category: string;
  tags?: string[];
}

const RELATED_STARTUPS_QUERY = `*[_type == "startup" 
  && _id != $currentId 
  && defined(slug.current)
  && (isDraft != true)
  && (category == $category || count((tags[])[@ in $tags]) > 0)
] | order(count((tags[])[@ in $tags]) desc, _createdAt desc) [0...6] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`;

const RelatedStartups = async ({
  currentId,
  category,
  tags = [],
}: RelatedStartupsProps) => {
  const relatedPosts = await client.fetch(RELATED_STARTUPS_QUERY, {
    currentId,
    category,
    tags,
  });

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="size-6 text-primary" />
        <h2 className="text-30-semibold">Recommended Posts</h2>
      </div>
      <p className="text-14-medium text-gray-600 mb-5">
        Similar startups you might be interested in
      </p>
      <ul className="card_grid-sm">
        {relatedPosts.filter(Boolean).map((post: StartupTypeCard) => (
          <StartupCard key={post._id} post={post} />
        ))}
      </ul>
    </section>
  );
};

export default RelatedStartups;


import SearchForm from "@/components/SearchForm";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import {
  STARTUPS_QUERY,
  STARTUPS_BY_VIEWS_QUERY,
  STARTUPS_BY_UPVOTES_QUERY,
  STARTUPS_BY_TAG_QUERY,
} from "@/sanityio/lib/queries";
import { sanityFetch, SanityLive } from "@/sanityio/lib/live";
import { auth } from "@/auth";
import { SortSelect } from "@/components/SortSelect";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string; tag?: string }>;
}) {
  const { query: searchQuery, sort, tag } = await searchParams;
  const params = { search: searchQuery || null, tag: tag || null };

  const session = await auth();

  // Select query based on sort parameter
  let query = STARTUPS_QUERY;
  if (tag) {
    query = STARTUPS_BY_TAG_QUERY;
  } else if (sort === "views") {
    query = STARTUPS_BY_VIEWS_QUERY;
  } else if (sort === "upvotes") {
    query = STARTUPS_BY_UPVOTES_QUERY;
  }

  const { data: posts } = await sanityFetch({ query, params });

  return (
    <>
      <section className="pink_container">
        <h1 className="heading">
          Pitch Your Startup, <br />
          Connect With Entrepreneurs
        </h1>

        <p className="sub-heading !max-w-3xl">
          Submit Ideas, Vote on Pitches, and Get Noticed in Virtual
          Competitions.
        </p>

        <SearchForm query={searchQuery} />
      </section>

      <section className="section_container">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-30-semibold">
            {tag
              ? `Startups tagged with "${tag}"`
              : searchQuery
                ? `Search results for "${searchQuery}"`
                : "All Startups"}
          </p>
          <SortSelect />
        </div>

        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: StartupTypeCard) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No startups found</p>
          )}
        </ul>
      </section>

      <SanityLive />
    </>
  );
}

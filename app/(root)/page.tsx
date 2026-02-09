
import SearchForm from "@/components/SearchForm";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import {
  STARTUPS_QUERY_PAGINATED,
  STARTUPS_BY_VIEWS_QUERY_PAGINATED,
  STARTUPS_BY_UPVOTES_QUERY_PAGINATED,
  STARTUPS_BY_TAG_QUERY_PAGINATED,
} from "@/sanityio/lib/queries";
import { sanityFetch, SanityLive } from "@/sanityio/lib/live";
import { auth } from "@/auth";
import { SortSelect } from "@/components/SortSelect";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { BackToTop } from "@/components/BackToTop";

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ 
    query?: string; 
    sort?: string; 
    tag?: string;
  }>;
}) {
  const { 
    query: searchQuery, 
    sort, 
    tag,
  } = await searchParams;
  
  const session = await auth();

  // Build params for query with pagination
  const params: any = { 
    search: searchQuery || null, 
    tag: tag || null,
    offset: 0,
    limit: PAGE_SIZE,
  };

  // Select query based on filters/sort
  let query = STARTUPS_QUERY_PAGINATED;
  if (tag) {
    query = STARTUPS_BY_TAG_QUERY_PAGINATED;
  } else if (sort === "views") {
    query = STARTUPS_BY_VIEWS_QUERY_PAGINATED;
  } else if (sort === "upvotes") {
    query = STARTUPS_BY_UPVOTES_QUERY_PAGINATED;
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

        <InfiniteScroll initialPosts={posts || []} />
      </section>

      <BackToTop />
      <SanityLive />
    </>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import StartupCard, { StartupTypeCard } from "./StartupCard";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  initialPosts: StartupTypeCard[];
}

export function InfiniteScroll({ initialPosts }: InfiniteScrollProps) {
  const [posts, setPosts] = useState<StartupTypeCard[]>(initialPosts);
  const [page, setPage] = useState(2); // Start from page 2 since we have initial posts
  const [hasMore, setHasMore] = useState(initialPosts.length === 12);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const search = searchParams.get("query") || "";
  const sort = searchParams.get("sort") || "";
  const tag = searchParams.get("tag") || "";

  // Reset when search params change
  useEffect(() => {
    setPosts(initialPosts);
    setPage(2);
    setHasMore(initialPosts.length === 12);
  }, [initialPosts, search, sort, tag]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      if (tag) params.set("tag", tag);

      const response = await fetch(`/api/startups?${params.toString()}`);
      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, search, sort, tag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  return (
    <>
      <ul className="mt-7 card_grid">
        {posts.length > 0 ? (
          posts.filter(Boolean).map((post: StartupTypeCard) => (
            <StartupCard key={post._id} post={post} />
          ))
        ) : (
          <p className="no-results">No startups found</p>
        )}
      </ul>

      {/* Intersection Observer Target */}
      {hasMore && posts.length > 0 && (
        <div
          ref={observerTarget}
          className="flex justify-center items-center py-8"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="size-6 animate-spin" />
              <span>Loading more startups...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </>
  );
}

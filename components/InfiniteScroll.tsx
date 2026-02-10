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
        <div className="mt-16 mb-12">
          <div className="text-center mb-8 space-y-2">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-600 to-purple-600">
              Words from Visionaries
            </h3>
            <p className="text-sm text-gray-500">Inspiration from those who dared to dream</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <div className="overflow-x-auto pb-6 hide-scrollbar">
              <div className="flex gap-6 px-6 min-w-max">
                
                {/* Quote Card 1 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-primary transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        W
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Walt Disney</p>
                        <p className="text-sm text-gray-500">Founder, Disney</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "The way to get started is to quit talking and begin doing."
                    </p>
                  </div>
                </div>

                {/* Quote Card 2 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        S
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Steve Jobs</p>
                        <p className="text-sm text-gray-500">Co-founder, Apple</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "Innovation distinguishes between a leader and a follower."
                    </p>
                  </div>
                </div>

                {/* Quote Card 3 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        M
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Mark Zuckerberg</p>
                        <p className="text-sm text-gray-500">Founder, Meta</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "The biggest risk is not taking any risk. The only strategy guaranteed to fail is not taking risks."
                    </p>
                  </div>
                </div>

                {/* Quote Card 4 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-orange-500 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        E
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Elon Musk</p>
                        <p className="text-sm text-gray-500">CEO, Tesla & SpaceX</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "When something is important enough, you do it even if the odds are not in your favor."
                    </p>
                  </div>
                </div>

                {/* Quote Card 5 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-500 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        R
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Reid Hoffman</p>
                        <p className="text-sm text-gray-500">Co-founder, LinkedIn</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "An entrepreneur is someone who jumps off a cliff and builds a plane on the way down."
                    </p>
                  </div>
                </div>

                {/* Quote Card 6 */}
                <div className="group w-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-primary transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-pink-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        P
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Peter Thiel</p>
                        <p className="text-sm text-gray-500">Co-founder, PayPal</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
                      "A startup is the largest group of people you can convince of a plan to build a different future."
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-2 mt-8">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-gray-400 font-medium">Scroll to explore more</p>
          </div>
        </div>
      )}
    </>
  );
}

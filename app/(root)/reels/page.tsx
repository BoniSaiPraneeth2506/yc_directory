import { sanityFetch } from "@/sanityio/lib/live";
import { REELS_WITH_USER_QUERY } from "@/sanityio/lib/queries";
import { ReelsScroller } from "@/components/ReelsScroller";
import { auth } from "@/auth";
import { Suspense } from "react";

export const metadata = {
  title: "Reels | YC Directory",
  description: "Watch startup pitch videos and connect with entrepreneurs",
};

// Loading skeleton for reels
const ReelsLoading = () => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white text-sm">Loading Reels...</p>
    </div>
  </div>
);

export default async function ReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const initialReelId = params.id;
  
  const { data: reels } = await sanityFetch({ 
    query: REELS_WITH_USER_QUERY,
    params: {
      userId: session?.id || null
    }
  });

  return (
    <Suspense fallback={<ReelsLoading />}>
      <div className="fixed inset-0 top-14 bottom-16 bg-black">
        <ReelsScroller 
          initialReels={reels || []} 
          currentUserId={session?.id || undefined}
          initialReelId={initialReelId}
        />
      </div>
    </Suspense>
  );
}

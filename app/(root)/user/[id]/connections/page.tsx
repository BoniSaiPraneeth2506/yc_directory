import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConnectionsTabs } from "@/components/ConnectionsTabs";

async function ConnectionsData({ userId, initialTab }: { userId: string; initialTab: "followers" | "following" }) {
  const session = await auth();
  
  // Get user info
  const user = await client.fetch(
    `*[_type == "author" && _id == $id][0]{
      _id,
      name,
      username,
      following
    }`,
    { id: userId }
  );

  if (!user) return notFound();

  // Get followers
  const followers = await client.fetch(
    `*[_type == "author" && $userId in following[]._ref]{
      _id,
      name,
      username,
      image
    }`,
    { userId }
  );

  // Get following users
  const followingIds = user.following?.map((f: any) => f._ref) || [];
  const followingUsers = followingIds.length > 0
    ? await client.fetch(
        `*[_type == "author" && _id in $ids]{
          _id,
          name,
          username,
          image
        }`,
        { ids: followingIds }
      )
    : [];

  // Get current user's following list to check follow status
  const currentUserFollowing = session
    ? await client.fetch(
        `*[_type == "author" && _id == $id][0].following[]._ref`,
        { id: session.id }
      )
    : [];

  return (
    <ConnectionsTabs
      userId={userId}
      username={user.username}
      followers={followers}
      following={followingUsers}
      currentUserFollowing={currentUserFollowing || []}
      currentUserId={session?.id}
      initialTab={initialTab}
    />
  );
}

export default async function ConnectionsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab = (tab === "following" ? "following" : "followers") as "followers" | "following";

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <ConnectionsData userId={id} initialTab={initialTab} />
    </Suspense>
  );
}

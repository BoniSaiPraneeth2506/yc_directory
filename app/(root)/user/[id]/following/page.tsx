import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";

async function FollowingList({ userId }: { userId: string }) {
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

  // Get following users with their details
  const followingIds = user.following?.map((f: any) => f._ref) || [];
  const followingUsers = followingIds.length > 0
    ? await client.fetch(
        `*[_type == "author" && _id in $ids]{
          _id,
          name,
          username,
          image,
          bio
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 flex-1">
            <Link 
              href={`/user/${userId}`}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{user.username}</h1>
              <p className="text-sm text-gray-500">{followingUsers.length} following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Following List */}
      <div className="max-w-2xl mx-auto">
        {followingUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">Not following anyone yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {followingUsers.map((followingUser: any) => {
              const isFollowing = currentUserFollowing?.includes(followingUser._id);
              const isOwnProfile = session?.id === followingUser._id;

              return (
                <div
                  key={followingUser._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <Link href={`/user/${followingUser._id}`}>
                    <Avatar className="size-11 border border-gray-200">
                      <AvatarImage src={followingUser.image} alt={followingUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                        {followingUser.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  {/* User info */}
                  <Link 
                    href={`/user/${followingUser._id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {followingUser.username}
                    </p>
                    <p className="text-sm text-gray-900 truncate">
                      {followingUser.name}
                    </p>
                    {followingUser.bio && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {followingUser.bio}
                      </p>
                    )}
                  </Link>

                  {/* Action button */}
                  <div className="flex-shrink-0">
                    {!isOwnProfile && session ? (
                      <FollowButton
                        targetUserId={followingUser._id}
                        initialIsFollowing={isFollowing}
                        initialFollowersCount={0}
                        variant="compact"
                      />
                    ) : (
                      <button className="px-6 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        Message
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function FollowingPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <FollowingList userId={id} />
    </Suspense>
  );
}

import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";

async function FollowersList({ userId }: { userId: string }) {
  const session = await auth();
  
  // Get user info
  const user = await client.fetch(
    `*[_type == "author" && _id == $id][0]{
      _id,
      name,
      username
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
      image,
      bio
    }`,
    { userId }
  );

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
              <p className="text-sm text-gray-500">{followers.length} followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Followers List */}
      <div className="max-w-2xl mx-auto">
        {followers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">No followers yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {followers.map((follower: any) => {
              const isFollowing = currentUserFollowing?.includes(follower._id);
              const isOwnProfile = session?.id === follower._id;

              return (
                <div
                  key={follower._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <Link href={`/user/${follower._id}`}>
                    <Avatar className="size-11 border border-gray-200">
                      <AvatarImage src={follower.image} alt={follower.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                        {follower.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  {/* User info */}
                  <Link 
                    href={`/user/${follower._id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {follower.username}
                    </p>
                    <p className="text-sm text-gray-900 truncate">
                      {follower.name}
                    </p>
                    {follower.bio && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {follower.bio}
                      </p>
                    )}
                  </Link>

                  {/* Action button */}
                  <div className="flex-shrink-0">
                    {!isOwnProfile && session ? (
                      <FollowButton
                        targetUserId={follower._id}
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

export default async function FollowersPage({ 
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
      <FollowersList userId={id} />
    </Suspense>
  );
}

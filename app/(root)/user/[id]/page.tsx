import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanityio/lib/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileTabs } from "@/components/ProfileTabs";
import UserStartups from "@/components/UserStartups";
import { UserReels } from "@/components/UserReels";
import UpvotedStartups from "@/components/UpvotedStartups";
import { UpvotedReels } from "@/components/UpvotedReels";
import SavedStartups from "@/components/SavedStartups";
import { SavedReels } from "@/components/SavedReels";
import UserDrafts from "@/components/UserDrafts";
import StatsOverview from "@/components/StatsOverview";
import { StartupCardSkeleton } from "@/components/StartupCard";
import { FollowButton } from "@/components/FollowButton";
import { ProfileHeaderMenu } from "@/components/ProfileHeaderMenu";

async function UserProfile({ id }: { id: string }) {
  const session = await auth();
  const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  
  if (!user) return notFound();
  
  const isOwnProfile = session?.id === id;
  
  // Debug logging
  console.log('👤 Profile Debug:', {
    requestedUserId: id,
    sessionUserId: session?.id,
    isOwnProfile,
    hasUpvotedStartups: user.upvotedStartups?.length || 0,
    hasSavedStartups: user.savedStartups?.length || 0,
  });
  
  // Check if current user is following this profile
  const currentUserFollowing = session
    ? await client.fetch(
        `*[_type == "author" && _id == $id][0].following[]._ref`,
        { id: session.id }
      )
    : [];
  
  const isFollowing = currentUserFollowing?.includes(id) || false;
  const followersCount = user.followers?.length || 0;
  const followingCount = user.following?.length || 0;
  
  console.log("👤 User profile data:", user);
  console.log("📸 Image URL:", user.image);
  
  return (
    <>
      <section className="profile_container">
        <div className="profile_card">
          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 sm:top-8 md:top-10">
            <ProfileHeaderMenu isOwnProfile={isOwnProfile} user={user} />
          </div>

          <div className="profile_title">
            <h3 className="text-18-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>

          <Image
            src={user.image}
            alt={user.name}
            width={140}
            height={140}
            className="profile_image"
            unoptimized
          />

          <p className="text-20-extrabold mt-4 text-center">
            @{user?.username}
          </p>
          <p className="mt-1 text-center text-13-normal line-clamp-2">{user?.bio}</p>

          {/* Follow/Follower Stats */}
          <div className="flex items-center justify-center gap-5 mt-3">
            <Link href={`/user/${id}/connections?tab=followers`} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-bold text-black">{followersCount}</p>
              <p className="text-xs font-semibold text-black uppercase">Followers</p>
            </Link>
            <Link href={`/user/${id}/connections?tab=following`} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-bold text-black">{followingCount}</p>
              <p className="text-xs font-semibold text-black uppercase">Following</p>
            </Link>
          </div>

          {/* Follow and Message Buttons */}
          {!isOwnProfile && session && (
            <div className="mt-3 flex justify-center gap-2">
              <FollowButton
                targetUserId={id}
                initialIsFollowing={isFollowing}
                initialFollowersCount={followersCount}
                variant="profile"
              />
              <Link 
                href={`/messages?user=${id}`}
                className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-all flex items-center justify-center"
              >
                Message
              </Link>
            </div>
          )}
        </div>

        <ProfileTabs 
          isOwnProfile={isOwnProfile}
          postsContent={
            <Suspense fallback={<StartupCardSkeleton />}>
              <UserStartups id={id} />
            </Suspense>
          }
          reelsContent={
            <Suspense fallback={<div className="text-center py-4">Loading reels...</div>}>
              <UserReels id={id} />
            </Suspense>
          }
          draftsContent={
            isOwnProfile ? (
              <Suspense fallback={<StartupCardSkeleton />}>
                <UserDrafts id={id} />
              </Suspense>
            ) : null
          }
          statsContent={
            isOwnProfile ? (
              <Suspense fallback={<div className="text-center">Loading stats...</div>}>
                <StatsOverview userId={id} />
              </Suspense>
            ) : null
          }
          upvotedPostsContent={
            isOwnProfile ? (
              <>
                {console.log('🔄 Rendering upvotedPostsContent wrapper')}
                <Suspense fallback={<div className="text-center py-4">Loading liked posts...</div>}>
                  <UpvotedStartups id={id} />
                </Suspense>
              </>
            ) : null
          }
          upvotedReelsContent={
            isOwnProfile ? (
              <Suspense fallback={<div className="text-center py-4">Loading liked reels...</div>}>
                <UpvotedReels id={id} />
              </Suspense>
            ) : null
          }
          savedPostsContent={
            isOwnProfile ? (
              <>
                {console.log('🔄 Rendering savedPostsContent wrapper')}
                <Suspense fallback={<div className="text-center py-4">Loading saved posts...</div>}>
                  <SavedStartups id={id} />
                </Suspense>
              </>
            ) : null
          }
          savedReelsContent={
            isOwnProfile ? (
              <Suspense fallback={<div className="text-center py-4">Loading saved reels...</div>}>
                <SavedReels id={id} />
              </Suspense>
            ) : null
          }
        />
      </section>
    </>
  );
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  
  return (
    <Suspense fallback={<div className="profile_container">Loading...</div>}>
      <UserProfile id={id} />
    </Suspense>
  );
};

export default Page;
import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanityio/lib/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { ProfileTabs } from "@/components/ProfileTabs";
import UserStartups from "@/components/UserStartups";
import UpvotedStartups from "@/components/UpvotedStartups";
import SavedStartups from "@/components/SavedStartups";
import UserDrafts from "@/components/UserDrafts";
import StatsOverview from "@/components/StatsOverview";
import FollowersList from "@/components/FollowersList";
import FollowingList from "@/components/FollowingList";
import { StartupCardSkeleton } from "@/components/StartupCard";
import { FollowButton } from "@/components/FollowButton";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="profile_title">
            <h3 className="text-24-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>

          <Image
            src={user.image}
            alt={user.name}
            width={220}
            height={220}
            className="profile_image"
            unoptimized
          />

          <p className="text-30-extrabold mt-7 text-center">
            @{user?.username}
          </p>
          <p className="mt-1 text-center text-14-normal">{user?.bio}</p>

          {/* Follow/Follower Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-20-semibold">{followersCount}</p>
              <p className="text-14-normal text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-20-semibold">{followingCount}</p>
              <p className="text-14-normal text-gray-600">Following</p>
            </div>
          </div>

          {/* Follow Button */}
          {!isOwnProfile && session && (
            <div className="mt-5 flex justify-center">
              <FollowButton
                targetUserId={id}
                initialIsFollowing={isFollowing}
                initialFollowersCount={followersCount}
              />
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
          upvotedContent={
            isOwnProfile ? (
              <>
                {console.log('🔄 Rendering upvotedContent wrapper')}
                <Suspense fallback={<div className="text-center py-4">Loading liked posts...</div>}>
                  <UpvotedStartups id={id} />
                </Suspense>
              </>
            ) : null
          }
          savedContent={
            isOwnProfile ? (
              <>
                {console.log('🔄 Rendering savedContent wrapper')}
                <Suspense fallback={<div className="text-center py-4">Loading saved posts...</div>}>
                  <SavedStartups id={id} />
                </Suspense>
              </>
            ) : null
          }
          followersContent={
            <Suspense fallback={<div className="text-center">Loading...</div>}>
              <FollowersList id={id} />
            </Suspense>
          }
          followingContent={
            <Suspense fallback={<div className="text-center">Loading...</div>}>
              <FollowingList id={id} />
            </Suspense>
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
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
import { StartupCardSkeleton } from "@/components/StartupCard";

async function UserProfile({ id }: { id: string }) {
  const session = await auth();
  const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  
  if (!user) return notFound();
  
  const isOwnProfile = session?.id === id;
  
  console.log("👤 User profile data:", user);
  console.log("📸 Image URL:", user.image);
  
  return (
    <>
      <section className="profile_container">
        <div className="profile_card">
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
        </div>

        <ProfileTabs 
          isOwnProfile={isOwnProfile}
          postsContent={
            <Suspense fallback={<StartupCardSkeleton />}>
              <UserStartups id={id} />
            </Suspense>
          }
          upvotedContent={
            isOwnProfile ? (
              <Suspense fallback={<StartupCardSkeleton />}>
                <UpvotedStartups id={id} />
              </Suspense>
            ) : null
          }
          savedContent={
            isOwnProfile ? (
              <Suspense fallback={<StartupCardSkeleton />}>
                <SavedStartups id={id} />
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
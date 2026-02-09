import React from "react";
import { client } from "@/sanityio/lib/client";
import { FOLLOWING_BY_AUTHOR_QUERY } from "@/sanityio/lib/queries";
import Link from "next/link";
import Image from "next/image";

interface Author {
  _id: string;
  name: string;
  username: string;
  image: string;
  bio?: string;
}

const FollowingList = async ({ id }: { id: string }) => {
  const following = await client.fetch(FOLLOWING_BY_AUTHOR_QUERY, { id });

  return (
    <>
      {following?.length > 0 ? (
        <div className="space-y-3">
          {following.map((user: Author) => (
            <Link
              key={user._id}
              href={`/user/${user._id}`}
              className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  <Image
                    src={user.image || "/logo.png"}
                    alt={user.name}
                    width={56}
                    height={56}
                    className="rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-16-semibold truncate group-hover:text-primary transition-colors">
                    {user.name}
                  </p>
                  <p className="text-14-normal text-gray-600 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="mt-1 text-14-normal text-gray-500 line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-result">Not following anyone yet</p>
      )}
    </>
  );
};

export default FollowingList;

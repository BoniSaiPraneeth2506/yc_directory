import { Suspense } from "react";
import { client } from "@/sanityio/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanityio/lib/queries";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import { PortableText } from "@portabletext/react";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import MarkdownIt from "markdown-it";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import { auth } from "@/auth";
import { KebabMenu } from "@/components/KebabMenu";

const resolveImageUrl = (url?: string) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "www.google.com" && parsedUrl.pathname === "/imgres") {
      const imageUrl = parsedUrl.searchParams.get("imgurl");
      return imageUrl ? decodeURIComponent(imageUrl) : "";
    }
    return url;
  } catch {
    return url;
  }
};

async function StartupDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [post, editorPlaylist] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }, { cache: "no-store" }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks",
    }),
  ]);

  if (!post) return notFound();

  const editorPosts = editorPlaylist?.select || [];
  const pitch = post?.pitch;
  const authorImage = resolveImageUrl(post?.author?.image) || "/logo.png";
  const startupImage = resolveImageUrl(post?.image) || "/logo.png";
  const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });
  const pitchMarkdown =
    typeof pitch === "string" ? markdown.render(pitch) : "";
  
  // Check if the logged-in user is the author
  const isAuthor = session?.id === post.author._id;

  return (
    <>
      <section className="pink_container !min-h-[230px] relative">
        {isAuthor && (
          <div className="absolute top-11 right-4 sm:top-10 sm:right-6 z-10">
            <KebabMenu startupId={id} />
          </div>
        )}
        
        <p className="tag">{formatDate(post?._createdAt)}</p>

        <h1 className="heading !max-w-full break-words">{post.title}</h1>
        <p className="sub-heading !max-w-full sm:!max-w-3xl break-words">{post.description}</p>
      </section>

      <section className="section_container">
        <img
          src={startupImage}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <span className="relative size-12 overflow-hidden rounded-full drop-shadow-lg">
                <Image
                  src={authorImage}
                  alt="avatar"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>

              <div>
                <p className="text-20-medium">{post.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          {Array.isArray(pitch) && pitch.length > 0 ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
            >
              <PortableText value={pitch} />
            </article>
          ) : pitchMarkdown ? (
            <article
              className="prose max-w-4xl font-work-sans break-words"
              dangerouslySetInnerHTML={{ __html: pitchMarkdown }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {editorPosts?.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <section className="section_container">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/2 mt-3" />
          <Skeleton className="h-64 w-full mt-8" />
        </section>
      }
    >
      <StartupDetails params={params} />
    </Suspense>
  );
}
import { cn, formatDate } from "@/lib/utils";
import { EyeIcon, ThumbsUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Author, Startup } from "@/sanityio/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TagList } from "@/components/TagBadge";

export type StartupTypeCard = Omit<Startup, "author"> & { author?: Author };

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

const StartupCard = ({ post }: { post: StartupTypeCard }) => {
  const {
    _createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
    upvotes,
    tags,
  } = post;
  const authorImage = resolveImageUrl(author?.image);
  const startupImage = resolveImageUrl(image) || "/logo.png";

  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="startup_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-3">
          <div className="flex gap-1.5">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">{views}</span>
          </div>
          <div className="flex gap-1.5">
            <ThumbsUp className="size-6 text-primary" />
            <span className="text-16-medium">{upvotes || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name}</p>
          </Link>
          <Link href={`/startup/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        {authorImage ? (
          <Link href={`/user/${author?._id}`}>
            <span className="relative block size-12 overflow-hidden rounded-full">
              <Image
                src={authorImage}
                alt={author?.name || "Author"}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
          </Link>
        ) : null}
      </div>

      <Link href={`/startup/${_id}`}>
        <p className="startup-card_desc">{description}</p>

        <img src={startupImage} alt={title || "Startup"} className="startup-card_img" />
      </Link>

      {tags && tags.length > 0 && (
        <div className="mt-3">
          <TagList tags={tags} />
        </div>
      )}

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium">{category}</p>
        </Link>
        <Button className="startup-card_btn" asChild>
          <Link href={`/startup/${_id}`}>Details</Link>
        </Button>
      </div>
    </li>
  );
};

export const StartupCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((index: number) => (
      <li key={cn("skeleton", index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default StartupCard;
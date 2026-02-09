"use client";

import { formatDate } from "@/lib/utils";
import { EyeIcon, Calendar, Edit, Trash2, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import { publishDraft, deleteStartup } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type DraftType = {
  _createdAt: Date;
  views: number;
  author: {
    _id: string;
    name: string;
  };
  _id: string;
  description: string;
  image: string;
  category: string;
  title: string;
  scheduledFor?: string;
};

const DraftCard = ({ post }: { post: DraftType }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    _createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
    scheduledFor,
  } = post;

  const handlePublish = () => {
    if (!confirm("Are you sure you want to publish this draft?")) return;

    startTransition(async () => {
      const result = await publishDraft(_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Draft published successfully!");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    startTransition(async () => {
      const result = await deleteStartup(_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Draft deleted successfully!");
        router.refresh();
      }
    });
  };

  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="startup_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-1.5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{views}</span>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author._id}`}>
            <p className="text-16-medium line-clamp-1">{author.name}</p>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
              DRAFT
            </span>
          </div>
        </div>
      </div>

      <p className="startup-card_desc">{description}</p>

      <div className="relative h-[164px] sm:h-[200px] w-full overflow-hidden rounded-md">
        <Image
          src={image}
          alt="placeholder"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {scheduledFor && (
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
          <Calendar className="size-4" />
          <span>
            Scheduled for: {new Date(scheduledFor).toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category.toLowerCase()}`}>
          <p className="text-16-medium">{category}</p>
        </Link>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/startup/${_id}/edit`)}
            disabled={isPending}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePublish}
            disabled={isPending}
            className="text-green-600 hover:text-green-700"
          >
            <Send className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default DraftCard;

import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  isActive?: boolean;
}

export function TagBadge({ tag, isActive = false }: TagBadgeProps) {
  return (
    <Link
      href={`/?tag=${encodeURIComponent(tag)}`}
      className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      #{tag}
    </Link>
  );
}

export function TagList({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <TagBadge key={tag} tag={tag} />
      ))}
    </div>
  );
}

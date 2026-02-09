import { defineField, defineType } from "sanity";
import { MessageSquare } from "lucide-react";

export const comment = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  icon: MessageSquare,
  fields: [
    defineField({
      name: "content",
      type: "text",
      title: "Comment Content",
      validation: (Rule) => Rule.required().min(1).max(1000),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      title: "Author",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startup",
      type: "reference",
      to: [{ type: "startup" }],
      title: "Startup",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parentComment",
      type: "reference",
      to: [{ type: "comment" }],
      title: "Parent Comment (for replies)",
    }),
    defineField({
      name: "upvotes",
      type: "number",
      title: "Upvotes",
      initialValue: 0,
    }),
    defineField({
      name: "upvotedBy",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      title: "Upvoted By",
    }),
    defineField({
      name: "mentions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      title: "Mentioned Users",
    }),
  ],
  preview: {
    select: {
      content: "content",
      author: "author.name",
    },
    prepare({ content, author }) {
      return {
        title: content?.substring(0, 50) || "Comment",
        subtitle: `by ${author}`,
      };
    },
  },
});

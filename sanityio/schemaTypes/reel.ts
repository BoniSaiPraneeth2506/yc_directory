import { defineField, defineType } from "sanity";

export const reel = defineType({
  name: "reel",
  title: "Reel",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "author",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "description",
      type: "text",
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: "videoUrl",
      type: "url",
      title: "Video URL",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      type: "url",
      title: "Thumbnail Image",
    }),
    defineField({
      name: "category",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      validation: (Rule) => Rule.max(5).error("Maximum 5 tags allowed"),
    }),
    defineField({
      name: "views",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "upvotes",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "upvotedBy",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
    }),
    defineField({
      name: "viewedBy",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      title: "Viewed By",
    }),
    defineField({
      name: "commentCount",
      type: "number",
      title: "Comment Count",
      initialValue: 0,
    }),
    defineField({
      name: "duration",
      type: "number",
      title: "Video Duration (seconds)",
    }),
  ],
});

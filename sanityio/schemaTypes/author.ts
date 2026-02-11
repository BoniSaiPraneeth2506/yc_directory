import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "id",
      type: "number",
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "username",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "url",
    }),
    defineField({
      name: "bio",
      type: "text",
    }),
    defineField({
      name: "savedStartups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "startup" }] }],
      title: "Saved Startups",
    }),
    defineField({
      name: "upvotedStartups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "startup" }] }],
      title: "Upvoted Startups",
    }),
    defineField({
      name: "savedReels",
      type: "array",
      of: [{ type: "reference", to: [{ type: "reel" }] }],
      title: "Saved Reels",
    }),
    defineField({
      name: "upvotedReels",
      type: "array",
      of: [{ type: "reference", to: [{ type: "reel" }] }],
      title: "Upvoted Reels",
    }),
    defineField({
      name: "followers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      title: "Followers",
    }),
    defineField({
      name: "following",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      title: "Following",
    }),
    defineField({
      name: "socialLinks",
      type: "object",
      title: "Social Links",
      fields: [
        { name: "twitter", type: "url", title: "Twitter" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
        { name: "github", type: "url", title: "GitHub" },
        { name: "website", type: "url", title: "Personal Website" },
      ],
    }),
    defineField({
      name: "location",
      type: "string",
      title: "Location",
    }),
    defineField({
      name: "timezone",
      type: "string",
      title: "Timezone",
    }),
    defineField({
      name: "skills",
      type: "array",
      of: [{ type: "string" }],
      title: "Skills/Expertise",
    }),
  ],
  preview: {
    select: {
      title: "name",
    },
  },
});
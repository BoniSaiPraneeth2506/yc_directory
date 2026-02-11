import { defineField, defineType } from "sanity";
import { Bell } from "lucide-react";

export const notification = defineType({
  name: "notification",
  title: "Notification",
  type: "document",
  icon: Bell,
  fields: [
    defineField({
      name: "recipient",
      type: "reference",
      to: [{ type: "author" }],
      title: "Recipient",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sender",
      type: "reference",
      to: [{ type: "author" }],
      title: "Sender",
    }),
    defineField({
      name: "type",
      type: "string",
      title: "Notification Type",
      options: {
        list: [
          { title: "Follow", value: "follow" },
          { title: "Upvote", value: "upvote" },
          { title: "Comment", value: "comment" },
          { title: "Mention", value: "mention" },
          { title: "Reply", value: "reply" },
          { title: "New Post", value: "new_post" },
          { title: "New Reel", value: "new_reel" },
          { title: "Reel Upvote", value: "reel_upvote" },
          { title: "Reel Comment", value: "reel_comment" },
          { title: "Save", value: "save" },
          { title: "Reel Save", value: "reel_save" },
          { title: "Milestone", value: "milestone" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startup",
      type: "reference",
      to: [{ type: "startup" }],
      title: "Related Startup",
    }),
    defineField({
      name: "reel",
      type: "reference",
      to: [{ type: "reel" }],
      title: "Related Reel",
    }),
    defineField({
      name: "comment",
      type: "reference",
      to: [{ type: "comment" }],
      title: "Related Comment",
    }),
    defineField({
      name: "milestoneType",
      type: "string",
      title: "Milestone Type",
      options: {
        list: [
          { title: "Views Milestone", value: "views" },
          { title: "Upvotes Milestone", value: "upvotes" },
          { title: "Followers Milestone", value: "followers" },
          { title: "Content Count Milestone", value: "content" },
        ],
      },
    }),
    defineField({
      name: "milestoneValue",
      type: "number",
      title: "Milestone Value",
      description: "The milestone number reached (e.g., 100, 500, 1000)",
    }),
    defineField({
      name: "message",
      type: "string",
      title: "Notification Message",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "read",
      type: "boolean",
      title: "Read",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      message: "message",
      recipient: "recipient.name",
      type: "type",
    },
    prepare({ message, recipient, type }) {
      return {
        title: message,
        subtitle: `${type} - to ${recipient}`,
      };
    },
  },
});

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
      name: "comment",
      type: "reference",
      to: [{ type: "comment" }],
      title: "Related Comment",
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

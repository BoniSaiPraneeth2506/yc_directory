import { defineField, defineType } from "sanity";

export const conversation = defineType({
  name: "conversation",
  title: "Conversation",
  type: "document",
  fields: [
    defineField({
      name: "participants",
      title: "Participants",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "author" }],
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(2),
    }),
    defineField({
      name: "lastMessage",
      title: "Last Message",
      type: "reference",
      to: [{ type: "message" }],
    }),
    defineField({
      name: "lastMessageAt",
      title: "Last Message At",
      type: "datetime",
    }),
    defineField({
      name: "unreadCount",
      title: "Unread Count",
      type: "object",
      fields: [
        defineField({
          name: "userId",
          title: "User ID",
          type: "string",
        }),
        defineField({
          name: "count",
          title: "Count",
          type: "number",
        }),
      ],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      participant1: "participants.0.name",
      participant2: "participants.1.name",
      lastMessageAt: "lastMessageAt",
    },
    prepare({ participant1, participant2, lastMessageAt }) {
      return {
        title: `${participant1} ↔️ ${participant2}`,
        subtitle: lastMessageAt
          ? new Date(lastMessageAt).toLocaleString()
          : "No messages yet",
      };
    },
  },
});

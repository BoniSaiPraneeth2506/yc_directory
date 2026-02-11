import { defineField, defineType } from "sanity";

export const message = defineType({
  name: "message",
  title: "Message",
  type: "document",
  fields: [
    defineField({
      name: "conversation",
      title: "Conversation",
      type: "reference",
      to: [{ type: "conversation" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "object",
      fields: [
        defineField({
          name: "url",
          title: "URL",
          type: "url",
        }),
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "readBy",
      title: "Read By",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "author" }],
        },
      ],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      sender: "sender.name",
      content: "content",
      createdAt: "createdAt",
    },
    prepare({ sender, content, createdAt }) {
      return {
        title: sender,
        subtitle: content || "Image message",
        description: createdAt ? new Date(createdAt).toLocaleString() : "",
      };
    },
  },
});

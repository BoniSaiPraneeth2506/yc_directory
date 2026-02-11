"use server";

import { auth } from "@/auth";
import { writeClient } from "@/sanityio/lib/write-client";
import { client } from "@/sanityio/lib/client";
import {
  CONVERSATIONS_BY_USER_QUERY,
  CONVERSATION_BY_PARTICIPANTS_QUERY,
  MESSAGES_BY_CONVERSATION_QUERY,
  SEARCH_USERS_QUERY,
} from "@/sanityio/lib/queries";

// Get all conversations for a user
export async function getUserConversations() {
  const session = await auth();
  if (!session?.id) return [];

  try {
    const conversations = await client.fetch(CONVERSATIONS_BY_USER_QUERY, {
      userId: session.id,
    });
    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

// Get or create a conversation between two users
export async function getOrCreateConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if conversation exists
    const existingConversation = await client.fetch(
      CONVERSATION_BY_PARTICIPANTS_QUERY,
      {
        user1: session.id,
        user2: otherUserId,
      }
    );

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const newConversation = await writeClient.create({
      _type: "conversation",
      participants: [
        { _type: "reference", _ref: session.id },
        { _type: "reference", _ref: otherUserId },
      ],
      createdAt: new Date().toISOString(),
    });

    // Fetch the created conversation with populated data
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $id][0] {
        _id,
        participants[]-> {
          _id,
          name,
          image,
          username,
          bio
        },
        createdAt
      }`,
      { id: newConversation._id }
    );

    return conversation;
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    throw error;
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session?.id) return [];

  try {
    const messages = await client.fetch(MESSAGES_BY_CONVERSATION_QUERY, {
      conversationId,
    });
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content?: string,
  imageUrl?: string
) {
  const session = await auth();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const messageData: any = {
      _type: "message",
      conversation: { _type: "reference", _ref: conversationId },
      sender: { _type: "reference", _ref: session.id },
      createdAt: new Date().toISOString(),
      readBy: [{ _type: "reference", _ref: session.id }],
    };

    if (content) {
      messageData.content = content;
    }

    if (imageUrl) {
      messageData.image = {
        url: imageUrl,
        alt: "Shared image",
      };
    }

    const message = await writeClient.create(messageData);

    // Update conversation's lastMessage and lastMessageAt
    await writeClient
      .patch(conversationId)
      .set({
        lastMessage: { _type: "reference", _ref: message._id },
        lastMessageAt: new Date().toISOString(),
      })
      .commit();

    // Fetch the created message with populated data
    const populatedMessage = await client.fetch(
      `*[_type == "message" && _id == $id][0] {
        _id,
        content,
        image,
        sender-> {
          _id,
          name,
          image,
          username
        },
        readBy[]-> {
          _id
        },
        createdAt
      }`,
      { id: message._id }
    );

    return populatedMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string) {
  const session = await auth();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all messages in the conversation
    const messages = await client.fetch(
      `*[_type == "message" && conversation._ref == $conversationId && !($userId in readBy[]._ref)] {
        _id
      }`,
      {
        conversationId,
        userId: session.id,
      }
    );

    // Update each message to add current user to readBy
    const updatePromises = messages.map((message: any) =>
      writeClient
        .patch(message._id)
        .setIfMissing({ readBy: [] })
        .append("readBy", [{ _type: "reference", _ref: session.id }])
        .commit()
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }
}

// Search users
export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.id) return [];

  if (!query || query.trim().length < 2) return [];

  try {
    console.log("🔍 Searching for users with query:", query);
    
    // Use a more flexible search pattern - removing the asterisks for more precise matching
    const searchPattern = query.trim();
    const users = await client.fetch(SEARCH_USERS_QUERY, {
      search: searchPattern,
    });

    console.log("👥 Found users:", users.length, users.map(u => ({ name: u.name, username: u.username })));

    // Filter out current user
    const filteredUsers = users.filter((user: any) => user._id !== session.id);
    
    console.log("✅ Filtered users (excluding self):", filteredUsers.length);
    
    return filteredUsers;
  } catch (error) {
    console.error("❌ Error searching users:", error);
    return [];
  }
}

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { client } from "@/sanityio/lib/client";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatHeader } from "@/components/ChatHeader";

export const metadata = {
  title: "Chat | YC Directory",
  description: "Conversation",
};

async function getConversation(conversationId: string, userId: string) {
  try {
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId && $userId in participants[]._ref][0] {
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
      { conversationId, userId }
    );
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.id) {
    redirect("/");
  }

  // Await the params Promise
  const { id } = await params;

  const conversation = await getConversation(id, session.id);

  if (!conversation) {
    notFound();
  }

  const otherUser = conversation.participants.find(
    (p: any) => p._id !== session.id
  );

  if (!otherUser) {
    notFound();
  }

  return (
    <div className="h-screen bg-white-100 flex flex-col">
      {/* Header - Fixed at very top of device */}
      <ChatHeader otherUser={otherUser} currentUserId={session.id} />

      {/* Chat Window with proper spacing for fixed header */}
      <div className="flex-1 overflow-hidden" style={{marginTop: '64px'}}>
        <ChatWindow
          conversationId={conversation._id}
          otherUser={otherUser}
          currentUserId={session.id}
        />
      </div>
    </div>
  );
}

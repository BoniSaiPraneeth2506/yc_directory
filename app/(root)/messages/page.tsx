import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatList } from "@/components/ChatList";
import { ChatSearch } from "@/components/ChatSearch";
import { getOrCreateConversation } from "@/lib/chat-actions";

export const metadata = {
  title: "Messages | YC Directory",
  description: "Connect and network with entrepreneurs",
};

interface PageProps {
  searchParams: Promise<{
    user?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const session = await auth();

  if (!session?.id) {
    redirect("/");
  }

  // Await the searchParams Promise
  const params = await searchParams;

  // If user query parameter exists, create/find conversation and redirect to it
  if (params.user) {
    try {
      const conversation = await getOrCreateConversation(params.user);
      redirect(`/messages/${conversation._id}`);
    } catch (error) {
      console.error("Error creating/finding conversation:", error);
      // Continue to show messages page if there's an error
    }
  }

  return (
    <>
      <section className="pink_container !min-h-[180px] !py-6">
        <h1 className="heading !text-3xl">Messages</h1>
        <p className="sub-heading !text-base !max-w-md mt-2">
          Connect and chat with entrepreneurs
        </p>
      </section>

      <section className="section_container min-h-screen !pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <ChatSearch />
          </div>

          <ChatList currentUserId={session.id} />
        </div>
      </section>
    </>
  );
};

export default Page;

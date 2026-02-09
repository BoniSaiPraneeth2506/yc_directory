import StartupForm from "@/components/StartupForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/sanityio/lib/client";
import { STARTUP_BY_ID_QUERY } from "@/sanityio/lib/queries";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  const { id } = await params;

  if (!session) redirect("/");

  const post = await client.fetch(STARTUP_BY_ID_QUERY, { id });

  if (!post) return notFound();

  // Check if the logged-in user is the author
  if (post.author._id !== session.id) {
    redirect("/");
  }

  // Convert portable text to markdown string if needed
  const pitchContent = Array.isArray(post.pitch)
    ? post.pitch.map((block: any) => block.children?.map((child: any) => child.text).join("")).join("\n\n")
    : post.pitch || "";

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Edit Your Startup</h1>
      </section>

      <StartupForm
        startup={{
          _id: post._id,
          title: post.title,
          description: post.description,
          category: post.category,
          image: post.image,
          pitch: pitchContent,
        }}
      />
    </>
  );
};

export default Page;

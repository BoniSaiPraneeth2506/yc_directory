import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReelForm from "@/components/ReelForm";

const Page = async () => {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Create Your Pitch Reel</h1>
        <p className="sub-heading !max-w-3xl">
          Upload a video pitch to showcase your startup
        </p>
      </section>

      <section className="section_container">
        <ReelForm />
      </section>
    </>
  );
};

export default Page;

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Messages | YC Directory",
  description: "Connect and network with entrepreneurs",
};

const Page = async () => {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <>
      <section className="pink_container !min-h-[200px]">
        <h1 className="heading">Messages</h1>
        <p className="sub-heading !max-w-3xl">
          Connect and network with fellow entrepreneurs
        </p>
      </section>

      <section className="section_container">
        <div className="bg-white rounded-xl p-12 shadow-sm max-w-2xl mx-auto">
          <div className="text-center space-y-6">
            <div className="bg-pink-50 rounded-2xl p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 rounded-full p-6">
                  <svg
                    className="w-20 h-20 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Messages Coming Soon!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto text-lg">
                    We're building a powerful messaging system to help you network
                    with entrepreneurs and investors.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-lg">Upcoming Features:</h4>
              <div className="grid gap-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h5 className="font-semibold">Direct Messaging</h5>
                    <p className="text-sm text-gray-600">
                      Send private messages to other users
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h5 className="font-semibold">Startup Discussions</h5>
                    <p className="text-sm text-gray-600">
                      Chat about specific startups and ideas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h5 className="font-semibold">Networking Hub</h5>
                    <p className="text-sm text-gray-600">
                      Connect with founders and investors
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/"
                className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Explore Startups
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;

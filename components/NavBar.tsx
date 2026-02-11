import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";
import { Search, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { client } from "@/sanityio/lib/client";
import { UNREAD_NOTIFICATION_COUNT_QUERY } from "@/sanityio/lib/queries";

const Navbar = async () => {
  const session = await auth();
  
  let unreadCount = 0;
  if (session?.id) {
    try {
      unreadCount = await client.fetch(
        UNREAD_NOTIFICATION_COUNT_QUERY,
        { userId: session.id },
        { cache: "no-store" }
      );
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans border-b border-gray-100">
      <nav className="flex justify-between items-center max-w-screen-xl mx-auto">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={144} height={30} />
        </Link>

        <div className="flex items-center gap-4 text-black">
          {session && session?.user ? (
            <>
              <Link 
                href="/?query=" 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="size-5" />
              </Link>

              <NotificationBell initialUnreadCount={unreadCount} />

              <form
                action={async () => {
                  "use server";

                  await signOut({ redirectTo: "/" });
                }}
                className="max-sm:hidden"
              >
                <button 
                  type="submit"
                  className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </form>

              <Link href={`/user/${session?.id}`} className="sm:hidden">
                <Avatar className="size-9">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server";

                await signIn("github");
              }}
            >
              <button type="submit" className="text-sm font-medium">Login</button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
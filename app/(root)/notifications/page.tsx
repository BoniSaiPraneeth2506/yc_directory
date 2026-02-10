import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/sanityio/lib/client";
import { NOTIFICATIONS_BY_USER_QUERY } from "@/sanityio/lib/queries";
import { NotificationItem } from "@/components/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import { MarkAllReadButton } from "@/components/MarkAllReadButton";

async function NotificationsList() {
  const session = await auth();

  if (!session?.id) {
    redirect("/");
  }

  const notifications = await client.fetch(
    NOTIFICATIONS_BY_USER_QUERY,
    { userId: session.id },
    { cache: "no-store" }
  );

  const hasUnread = notifications.some((n: any) => !n.read);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-pink-600 rounded-xl">
            <Bell className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">Stay updated with your community activity</p>
          </div>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Bell className="size-10 text-gray-400" />
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-2">No notifications yet</p>
          <p className="text-gray-500 text-sm">
            When people interact with your content, you'll see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <section className="section_container min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        <NotificationsList />
      </Suspense>
    </section>
  );
}

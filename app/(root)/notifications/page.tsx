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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="size-8 text-primary" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            When people interact with your content, you'll see it here
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800 overflow-hidden">
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

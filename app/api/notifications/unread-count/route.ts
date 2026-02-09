import { auth } from "@/auth";
import { client } from "@/sanityio/lib/client";
import { UNREAD_NOTIFICATION_COUNT_QUERY } from "@/sanityio/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.id) {
      return NextResponse.json({ count: 0 });
    }

    const count = await client.fetch(UNREAD_NOTIFICATION_COUNT_QUERY, {
      userId: session.id,
    });

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return NextResponse.json({ count: 0 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanityio/lib/write-client";
import { client } from "@/sanityio/lib/client";

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to automatically publish posts that have reached their scheduled time
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Authenticate cron job requests
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all posts that:
    // 1. Have a scheduledFor date
    // 2. The scheduledFor date is in the past or now
    // 3. Are not drafts
    const now = new Date().toISOString();
    
    const scheduledPosts = await client.fetch(
      `*[_type == "startup" && defined(scheduledFor) && scheduledFor <= $now && isDraft != true] {
        _id,
        title,
        scheduledFor
      }`,
      { now }
    );

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        message: "No posts to publish",
        published: 0,
      });
    }

    // Remove the scheduledFor field to make posts visible
    // (they're already published, just scheduled)
    const updatePromises = scheduledPosts.map((post: any) =>
      writeClient
        .patch(post._id)
        .unset(["scheduledFor"])
        .commit()
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully published ${scheduledPosts.length} scheduled posts`,
      published: scheduledPosts.length,
      posts: scheduledPosts.map((p: any) => ({
        id: p._id,
        title: p.title,
        scheduledFor: p.scheduledFor,
      })),
    });
  } catch (error: any) {
    console.error("Error publishing scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to publish scheduled posts", details: error.message },
      { status: 500 }
    );
  }
}

// Manual trigger for testing (can be removed in production)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  return POST(request);
}

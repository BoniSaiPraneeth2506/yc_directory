import { client } from "@/sanityio/lib/client";
import {
  STARTUPS_QUERY_PAGINATED,
  STARTUPS_BY_VIEWS_QUERY_PAGINATED,
  STARTUPS_BY_UPVOTES_QUERY_PAGINATED,
  STARTUPS_BY_TAG_QUERY_PAGINATED,
} from "@/sanityio/lib/queries";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || null;
    const sort = searchParams.get("sort") || null;
    const tag = searchParams.get("tag") || null;

    const offset = (page - 1) * PAGE_SIZE;
    const limit = offset + PAGE_SIZE;

    // Build params for query
    const params: any = {
      search,
      tag,
      offset,
      limit,
    };

    // Select query based on filters/sort
    let query = STARTUPS_QUERY_PAGINATED;
    if (tag) {
      query = STARTUPS_BY_TAG_QUERY_PAGINATED;
    } else if (sort === "views") {
      query = STARTUPS_BY_VIEWS_QUERY_PAGINATED;
    } else if (sort === "upvotes") {
      query = STARTUPS_BY_UPVOTES_QUERY_PAGINATED;
    }

    const posts = await client.fetch(query, params);

    return NextResponse.json({
      posts,
      hasMore: posts.length === PAGE_SIZE,
      nextPage: page + 1,
    });
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}

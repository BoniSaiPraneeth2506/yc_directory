import "server-only";

import { defineLive } from "next-sanity/live";
import { client } from "@/sanityio/lib/client";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN || false,
  browserToken: process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN || false,
});
import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, Token } from "../env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: Token,
});

if (!writeClient.config().token) {
  throw new Error("Write token not found.");
}
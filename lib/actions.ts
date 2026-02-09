"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanityio/lib/write-client";
import { revalidatePath } from "next/cache";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string,
  tags: string[] = [],
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch"),
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const startup = {
      title,
      description,
      category,
      image: link,
      slug: {
        _type: slug,
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.id,
      },
      pitch,
      upvotes: 0,
      tags: tags || [],
    };

    const result = await writeClient.create({ _type: "startup", ...startup });

    revalidatePath("/");

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);

    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const updatePitch = async (
  state: any,
  form: FormData,
  pitch: string,
  startupId: string,
  tags: string[] = [],
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch"),
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const result = await writeClient
      .patch(startupId)
      .set({
        title,
        description,
        category,
        image: link,
        slug: {
          _type: slug,
          current: slug,
        },
        pitch,
        tags: tags || [],
      })
      .commit();

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);

    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const deleteStartup = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // First, find all playlists that reference this startup
    const playlists = await writeClient.fetch(
      `*[_type == "playlist" && references($startupId)]`,
      { startupId }
    );

    // Remove the startup reference from all playlists
    if (playlists && playlists.length > 0) {
      for (const playlist of playlists) {
        const updatedSelect = playlist.select.filter(
          (ref: any) => ref._ref !== startupId
        );
        
        await writeClient
          .patch(playlist._id)
          .set({ select: updatedSelect })
          .commit();
      }
    }

    // Now delete the startup
    await writeClient.delete(startupId);

    revalidatePath("/");

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Delete error:", error);

    // Provide user-friendly error message
    const errorMessage = error?.response?.body?.error?.description 
      || error?.message 
      || "Failed to delete startup";

    return parseServerActionResponse({
      error: errorMessage,
      status: "ERROR",
    });
  }
};

export const toggleUpvote = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Check if user has already upvoted
    const startup = await writeClient.fetch(
      `*[_type == "startup" && _id == $id][0]{ upvotes, upvotedBy }`,
      { id: startupId }
    );

    const hasUpvoted = startup?.upvotedBy?.some(
      (ref: any) => ref._ref === session.id
    );

    if (hasUpvoted) {
      // Remove upvote - ensure it never goes below 0
      const newUpvotes = Math.max((startup?.upvotes || 0) - 1, 0);
      
      await writeClient
        .patch(startupId)
        .set({ upvotes: newUpvotes })
        .unset([`upvotedBy[_ref=="${session.id}"]`])
        .commit();

      // Remove from author's upvoted list
      await writeClient
        .patch(session.id)
        .unset([`upvotedStartups[_ref=="${startupId}"]`])
        .commit();
    } else {
      // Add upvote
      await writeClient
        .patch(startupId)
        .setIfMissing({ upvotes: 0, upvotedBy: [] })
        .inc({ upvotes: 1 })
        .append("upvotedBy", [{ _type: "reference", _ref: session.id }])
        .commit();

      // Add to author's upvoted list
      await writeClient
        .patch(session.id)
        .setIfMissing({ upvotedStartups: [] })
        .append("upvotedStartups", [
          { _type: "reference", _ref: startupId },
        ])
        .commit();
    }

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Upvote error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to upvote",
      status: "ERROR",
    });
  }
};

export const toggleBookmark = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Check if user has already saved
    const author = await writeClient.fetch(
      `*[_type == "author" && _id == $id][0]{ savedStartups }`,
      { id: session.id }
    );

    const isSaved = author?.savedStartups?.some(
      (ref: any) => ref._ref === startupId
    );

    if (isSaved) {
      // Remove bookmark
      await writeClient
        .patch(session.id)
        .unset([`savedStartups[_ref=="${startupId}"]`])
        .commit();
    } else {
      // Add bookmark
      await writeClient
        .patch(session.id)
        .setIfMissing({ savedStartups: [] })
        .append("savedStartups", [{ _type: "reference", _ref: startupId }])
        .commit();
    }

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Bookmark error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to bookmark",
      status: "ERROR",
    });
  }
};

export const toggleFollow = async (targetUserId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  if (session.id === targetUserId)
    return parseServerActionResponse({
      error: "You cannot follow yourself",
      status: "ERROR",
    });

  try {
    // Check if already following
    const currentUser = await writeClient.fetch(
      `*[_type == "author" && _id == $id][0]{ following }`,
      { id: session.id }
    );

    const isFollowing = currentUser?.following?.some(
      (ref: any) => ref._ref === targetUserId
    );

    if (isFollowing) {
      // Unfollow: Remove from current user's following and target's followers
      await writeClient
        .patch(session.id)
        .unset([`following[_ref=="${targetUserId}"]`])
        .commit();

      await writeClient
        .patch(targetUserId)
        .unset([`followers[_ref=="${session.id}"]`])
        .commit();
    } else {
      // Follow: Add to current user's following and target's followers
      await writeClient
        .patch(session.id)
        .setIfMissing({ following: [] })
        .append("following", [{ _type: "reference", _ref: targetUserId }])
        .commit();

      await writeClient
        .patch(targetUserId)
        .setIfMissing({ followers: [] })
        .append("followers", [{ _type: "reference", _ref: session.id }])
        .commit();
    }

    revalidatePath(`/user/${targetUserId}`);
    revalidatePath(`/user/${session.id}`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Follow error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to follow",
      status: "ERROR",
    });
  }
};
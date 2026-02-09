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
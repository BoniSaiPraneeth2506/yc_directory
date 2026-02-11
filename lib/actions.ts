"use server";

import { auth, signOut } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanityio/lib/write-client";
import { revalidatePath } from "next/cache";
import { triggerMilestoneCheck } from "@/lib/milestones";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string,
  tags: string[] = [],
  isDraft: boolean = false,
  scheduledFor?: string
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
    const startup: any = {
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
      isDraft,
      commentCount: 0,
    };

    if (scheduledFor) {
      startup.scheduledFor = scheduledFor;
    }

    const result = await writeClient.create({ _type: "startup", ...startup });

    // Create notifications to all followers if not draft
    if (!isDraft) {
      try {
        const author = await writeClient.fetch(
          `*[_type == "author" && _id == $id][0]{ name, followers }`,
          { id: session.id }
        );

        if (author?.followers && author.followers.length > 0) {
          const notifications = author.followers.map((follower: any) => ({
            _type: "notification",
            recipient: { _type: "reference", _ref: follower._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "new_post",
            message: `${author.name} published a new post: "${title}"`,
            startup: { _type: "reference", _ref: result._id },
            read: false,
          }));

          await Promise.all(
            notifications.map((notification: any) => writeClient.create(notification))
          );
        }

        // Check for milestones after post creation
        await triggerMilestoneCheck(session.id);
      } catch (notifError) {
        console.error("Failed to create new post notifications:", notifError);
      }
    }

    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);
    revalidatePath("/notifications");

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
  isDraft?: boolean,
  scheduledFor?: string
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
    const updateData: any = {
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
    };

    if (isDraft !== undefined) {
      updateData.isDraft = isDraft;
    }

    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor;
    }

    const result = await writeClient
      .patch(startupId)
      .set(updateData)
      .commit();

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);

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
        .append("upvotedBy", [{ _type: "reference", _ref: session.id, _key: crypto.randomUUID() }])
        .commit();

      // Add to author's upvoted list
      await writeClient
        .patch(session.id)
        .setIfMissing({ upvotedStartups: [] })
        .append("upvotedStartups", [
          { _type: "reference", _ref: startupId, _key: crypto.randomUUID() },
        ])
        .commit();

      // Create notification for upvote
      try {
        const [startup, upvoter] = await Promise.all([
          writeClient.fetch(
            `*[_type == "startup" && _id == $id][0]{ title, author }`,
            { id: startupId }
          ),
          writeClient.fetch(
            `*[_type == "author" && _id == $id][0]{ name }`,
            { id: session.id }
          ),
        ]);

        if (startup?.author?._ref !== session.id) {
          await writeClient.create({
            _type: "notification",
            recipient: { _type: "reference", _ref: startup.author._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "upvote",
            message: `${upvoter?.name || "Someone"} upvoted your post "${startup.title}"`,
            startup: { _type: "reference", _ref: startupId },
            read: false,
          });
        }

        // Check for milestones after upvote
        await triggerMilestoneCheck(startup.author._ref);
      } catch (notifError) {
        console.error("Failed to create upvote notification:", notifError);
      }
    }

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");
    revalidatePath("/notifications");

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
        .append("savedStartups", [{ _type: "reference", _ref: startupId, _key: crypto.randomUUID() }])
        .commit();

      // Create save notification
      try {
        const [startup, saver] = await Promise.all([
          writeClient.fetch(
            `*[_type == "startup" && _id == $id][0]{ title, author }`,
            { id: startupId }
          ),
          writeClient.fetch(
            `*[_type == "author" && _id == $id][0]{ name }`,
            { id: session.id }
          ),
        ]);

        if (startup?.author?._ref !== session.id) {
          await writeClient.create({
            _type: "notification",
            recipient: { _type: "reference", _ref: startup.author._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "save",
            message: `${saver?.name || "Someone"} saved your post "${startup.title}"`,
            startup: { _type: "reference", _ref: startupId },
            read: false,
          });
        }
      } catch (notifError) {
        console.error("Failed to create save notification:", notifError);
      }
    }

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);
    revalidatePath("/notifications");

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
        .append("following", [{ _type: "reference", _ref: targetUserId, _key: crypto.randomUUID() }])
        .commit();

      await writeClient
        .patch(targetUserId)
        .setIfMissing({ followers: [] })
        .append("followers", [{ _type: "reference", _ref: session.id, _key: crypto.randomUUID() }])
        .commit();

      // Create notification for follow
      try {
        const follower = await writeClient.fetch(
          `*[_type == "author" && _id == $id][0]{ name }`,
          { id: session.id }
        );
        
        await writeClient.create({
          _type: "notification",
          recipient: { _type: "reference", _ref: targetUserId },
          sender: { _type: "reference", _ref: session.id },
          type: "follow",
          message: `${follower?.name || "Someone"} started following you`,
          read: false,
        });

        // Check for follower milestone
        await triggerMilestoneCheck(targetUserId);
      } catch (notifError) {
        console.error("Failed to create follow notification:", notifError);
      }
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

// Comment Actions
export const addComment = async (
  startupId: string,
  content: string,
  parentCommentId?: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  if (!content.trim() || content.length > 1000)
    return parseServerActionResponse({
      error: "Comment must be between 1 and 1000 characters",
      status: "ERROR",
    });

  try {
    const comment = {
      _type: "comment",
      content: content.trim(),
      author: {
        _type: "reference",
        _ref: session.id,
      },
      startup: {
        _type: "reference",
        _ref: startupId,
      },
      upvotes: 0,
      upvotedBy: [],
    };

    // Add parent comment reference if this is a reply
    if (parentCommentId) {
      (comment as any).parentComment = {
        _type: "reference",
        _ref: parentCommentId,
      };
    }

    const result = await writeClient.create(comment);

    // Increment comment count on startup (only for top-level comments)
    if (!parentCommentId) {
      await writeClient
        .patch(startupId)
        .setIfMissing({ commentCount: 0 })
        .inc({ commentCount: 1 })
        .commit();
    }

    // Create notification for comment
    try {
      const [startup, commenter, parentComment] = await Promise.all([
        writeClient.fetch(
          `*[_type == "startup" && _id == $id][0]{ title, author }`,
          { id: startupId }
        ),
        writeClient.fetch(
          `*[_type == "author" && _id == $id][0]{ name }`,
          { id: session.id }
        ),
        parentCommentId
          ? writeClient.fetch(
              `*[_type == "comment" && _id == $id][0]{ author }`,
              { id: parentCommentId }
            )
          : Promise.resolve(null),
      ]);

      if (parentCommentId && parentComment) {
        // Notification for reply
        if (parentComment.author._ref !== session.id) {
          await writeClient.create({
            _type: "notification",
            recipient: { _type: "reference", _ref: parentComment.author._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "reply",
            message: `${commenter?.name || "Someone"} replied to your comment`,
            startup: { _type: "reference", _ref: startupId },
            comment: { _type: "reference", _ref: result._id },
            read: false,
          });
        }
      } else if (startup?.author?._ref !== session.id) {
        // Notification for comment on post
        await writeClient.create({
          _type: "notification",
          recipient: { _type: "reference", _ref: startup.author._ref },
          sender: { _type: "reference", _ref: session.id },
          type: "comment",
          message: `${commenter?.name || "Someone"} commented on "${startup.title}"`,
          startup: { _type: "reference", _ref: startupId },
          comment: { _type: "reference", _ref: result._id },
          read: false,
        });
      }
    } catch (notifError) {
      console.error("Failed to create comment notification:", notifError);
    }

    revalidatePath(`/startup/${startupId}`);
    revalidatePath(`/notifications`);

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Comment error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to add comment",
      status: "ERROR",
    });
  }
};

export const toggleCommentUpvote = async (commentId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Check if user has already upvoted
    const comment = await writeClient.fetch(
      `*[_type == "comment" && _id == $id][0]{ upvotes, upvotedBy, startup }`,
      { id: commentId }
    );

    if (!comment) {
      return parseServerActionResponse({
        error: "Comment not found",
        status: "ERROR",
      });
    }

    const hasUpvoted = comment?.upvotedBy?.some(
      (ref: any) => ref._ref === session.id
    );

    if (hasUpvoted) {
      // Remove upvote
      const newUpvotes = Math.max((comment?.upvotes || 0) - 1, 0);

      await writeClient
        .patch(commentId)
        .set({ upvotes: newUpvotes })
        .unset([`upvotedBy[_ref=="${session.id}"]`])
        .commit();
    } else {
      // Add upvote
      await writeClient
        .patch(commentId)
        .setIfMissing({ upvotes: 0, upvotedBy: [] })
        .inc({ upvotes: 1 })
        .append("upvotedBy", [{ _type: "reference", _ref: session.id, _key: crypto.randomUUID() }])
        .commit();
    }

    // Revalidate startup page where comment appears
    if (comment.startup?._ref) {
      revalidatePath(`/startup/${comment.startup._ref}`);
    }

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Comment upvote error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to upvote comment",
      status: "ERROR",
    });
  }
};

export const deleteComment = async (commentId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Fetch comment to verify ownership and get startup reference
    const comment = await writeClient.fetch(
      `*[_type == "comment" && _id == $id][0]{ author, startup, parentComment }`,
      { id: commentId }
    );

    if (!comment) {
      return parseServerActionResponse({
        error: "Comment not found",
        status: "ERROR",
      });
    }

    if (comment.author._ref !== session.id) {
      return parseServerActionResponse({
        error: "You can only delete your own comments",
        status: "ERROR",
      });
    }

    // Delete all replies first
    const replies = await writeClient.fetch(
      `*[_type == "comment" && parentComment._ref == $id]`,
      { id: commentId }
    );

    for (const reply of replies) {
      await writeClient.delete(reply._id);
    }

    // Delete the comment
    await writeClient.delete(commentId);

    // Decrement comment count on startup (only for top-level comments)
    if (!comment.parentComment && comment.startup?._ref) {
      await writeClient
        .patch(comment.startup._ref)
        .dec({ commentCount: 1 })
        .commit();
    }

    if (comment.startup?._ref) {
      revalidatePath(`/startup/${comment.startup._ref}`);
    }

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to delete comment",
      status: "ERROR",
    });
  }
};

// Notification Actions
export const createNotification = async (
  recipientId: string,
  type: "follow" | "upvote" | "comment" | "mention" | "reply",
  message: string,
  relatedStartupId?: string,
  relatedCommentId?: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  // Don't create notification for self-actions
  if (session.id === recipientId) {
    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  }

  try {
    const notification = {
      _type: "notification",
      recipient: {
        _type: "reference",
        _ref: recipientId,
      },
      sender: {
        _type: "reference",
        _ref: session.id,
      },
      type,
      message,
      read: false,
    } as any;

    if (relatedStartupId) {
      notification.relatedStartup = {
        _type: "reference",
        _ref: relatedStartupId,
      };
    }

    if (relatedCommentId) {
      notification.relatedComment = {
        _type: "reference",
        _ref: relatedCommentId,
      };
    }

    await writeClient.create(notification);

    revalidatePath(`/notifications`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Create notification error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to create notification",
      status: "ERROR",
    });
  }
};

export const markNotificationRead = async (notificationId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    await writeClient
      .patch(notificationId)
      .set({ read: true })
      .commit();

    revalidatePath(`/notifications`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Mark notification read error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to mark notification as read",
      status: "ERROR",
    });
  }
};

export const markAllNotificationsRead = async () => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Fetch all unread notifications for current user
    const unreadNotifications = await writeClient.fetch(
      `*[_type == "notification" && recipient._ref == $userId && read == false]{ _id }`,
      { userId: session.id }
    );

    // Mark all as read
    for (const notification of unreadNotifications) {
      await writeClient
        .patch(notification._id)
        .set({ read: true })
        .commit();
    }

    revalidatePath(`/notifications`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Mark all notifications read error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to mark all notifications as read",
      status: "ERROR",
    });
  }
};

// Draft Actions
export const saveDraft = async (
  startupId: string,
  formData: {
    title: string;
    description: string;
    category: string;
    image: string;
    pitch: string;
    tags: string[];
  },
  scheduledFor?: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    const updateData: any = {
      ...formData,
      isDraft: true,
    };

    if (scheduledFor) {
      updateData.scheduledFor = scheduledFor;
    }

    await writeClient
      .patch(startupId)
      .set(updateData)
      .commit();

    revalidatePath(`/user/${session.id}`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Save draft error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to save draft",
      status: "ERROR",
    });
  }
};

export const publishDraft = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Verify ownership
    const startup = await writeClient.fetch(
      `*[_type == "startup" && _id == $id][0]{ author }`,
      { id: startupId }
    );

    if (!startup || startup.author._ref !== session.id) {
      return parseServerActionResponse({
        error: "Unauthorized",
        status: "ERROR",
      });
    }

    await writeClient
      .patch(startupId)
      .set({ 
        isDraft: false,
        _updatedAt: new Date().toISOString()
      })
      .unset(['scheduledFor'])
      .commit();

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Publish draft error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to publish draft",
      status: "ERROR",
    });
  }
};

export const createReel = async (
  state: any,
  form: FormData,
  tags: string[] = [],
  videoData: { url: string; thumbnail?: string; duration?: number }
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "tags"),
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const reel = {
      _type: "reel",
      title,
      description,
      category,
      videoUrl: videoData.url,
      thumbnail: videoData.thumbnail || videoData.url,
      duration: videoData.duration || 0,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.id,
      },
      tags: tags || [],
      views: 0,
      upvotes: 0,
      commentCount: 0,
    };

    const result = await writeClient.create(reel);

    // Create notifications to all followers
    try {
      const author = await writeClient.fetch(
        `*[_type == "author" && _id == $id][0]{ name, followers }`,
        { id: session.id }
      );

      if (author?.followers && author.followers.length > 0) {
        const notifications = author.followers.map((follower: any) => ({
          _type: "notification",
          recipient: { _type: "reference", _ref: follower._ref },
          sender: { _type: "reference", _ref: session.id },
          type: "new_reel",
          message: `${author.name} posted a new reel: "${title}"`,
          reel: { _type: "reference", _ref: result._id },
          read: false,
        }));

        await Promise.all(
          notifications.map((notification: any) => writeClient.create(notification))
        );
      }
// Check for milestones after reel creation
        await triggerMilestoneCheck(session.id);
      } catch (notifError) {
      console.error("Failed to create new reel notifications:", notifError);
    }

    revalidatePath("/reels");
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);
    revalidatePath("/notifications");

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Create reel error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to create reel",
      status: "ERROR",
    });
  }
};

// Reel-specific actions
export const toggleReelUpvote = async (reelId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Check if user has already upvoted
    const reel = await writeClient.fetch(
      `*[_type == "reel" && _id == $id][0]{ upvotes, upvotedBy }`,
      { id: reelId }
    );

    const hasUpvoted = reel?.upvotedBy?.some(
      (ref: any) => ref._ref === session.id
    );

    if (hasUpvoted) {
      // Remove upvote - ensure it never goes below 0
      const newUpvotes = Math.max((reel?.upvotes || 0) - 1, 0);
      
      await writeClient
        .patch(reelId)
        .set({ upvotes: newUpvotes })
        .unset([`upvotedBy[_ref=="${session.id}"]`])
        .commit();

      // Remove from author's upvoted list
      await writeClient
        .patch(session.id)
        .unset([`upvotedReels[_ref=="${reelId}"]`])
        .commit();
    } else {
      // Add upvote
      await writeClient
        .patch(reelId)
        .setIfMissing({ upvotes: 0, upvotedBy: [] })
        .inc({ upvotes: 1 })
        .append("upvotedBy", [{ _type: "reference", _ref: session.id, _key: crypto.randomUUID() }])
        .commit();

      // Add to author's upvoted list
      await writeClient
        .patch(session.id)
        .setIfMissing({ upvotedReels: [] })
        .append("upvotedReels", [{ _type: "reference", _ref: reelId, _key: crypto.randomUUID() }])
        .commit();

      // Create notification for reel upvote
      try {
        const [reelData, upvoter] = await Promise.all([
          writeClient.fetch(
            `*[_type == "reel" && _id == $id][0]{ title, author }`,
            { id: reelId }
          ),
          writeClient.fetch(
            `*[_type == "author" && _id == $id][0]{ name }`,
            { id: session.id }
          ),
        ]);

        if (reelData?.author?._ref !== session.id) {
          await writeClient.create({
            _type: "notification",
            recipient: { _type: "reference", _ref: reelData.author._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "reel_upvote",
            message: `${upvoter?.name || "Someone"} liked your reel "${reelData.title}"`,
            reel: { _type: "reference", _ref: reelId },
            read: false,
          });
        }
      } catch (notifError) {
        console.error("Failed to create reel upvote notification:", notifError);
      }
    }

    revalidatePath(`/reels`);
    revalidatePath("/");

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Reel upvote error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to upvote reel",
      status: "ERROR",
    });
  }
};

// Track reel view (only once per user)
export const trackReelView = async (reelId: string) => {
  const session = await auth();

  if (!session) return; // Allow anonymous views but don't track

  try {
    // Check if user has already viewed this reel
    const reel = await writeClient.fetch(
      `*[_type == "reel" && _id == $id][0]{ viewedBy }`,
      { id: reelId }
    );

    const hasViewed = reel?.viewedBy?.some(
      (ref: any) => ref._ref === session.id
    );

    if (!hasViewed) {
      // Add view
      await writeClient
        .patch(reelId)
        .setIfMissing({ views: 0, viewedBy: [] })
        .inc({ views: 1 })
        .append("viewedBy", [{ _type: "reference", _ref: session.id, _key: crypto.randomUUID() }])
        .commit();

      revalidatePath(`/reels`);
    }

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Track reel view error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to track view",
      status: "ERROR",
    });
  }
};

export const toggleReelBookmark = async (reelId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  try {
    // Check if user has already saved
    const author = await writeClient.fetch(
      `*[_type == "author" && _id == $id][0]{ savedReels }`,
      { id: session.id }
    );

    const isSaved = author?.savedReels?.some(
      (ref: any) => ref._ref === reelId
    );

    if (isSaved) {
      // Remove bookmark
      await writeClient
        .patch(session.id)
        .unset([`savedReels[_ref=="${reelId}"]`])
        .commit();
    } else {
      // Add bookmark
      await writeClient
        .patch(session.id)
        .setIfMissing({ savedReels: [] })
        .append("savedReels", [{ _type: "reference", _ref: reelId, _key: crypto.randomUUID() }])
        .commit();

      // Create save notification for reel
      try {
        const [reelData, saver] = await Promise.all([
          writeClient.fetch(
            `*[_type == "reel" && _id == $id][0]{ title, author }`,
            { id: reelId }
          ),
          writeClient.fetch(
            `*[_type == "author" && _id == $id][0]{ name }`,
            { id: session.id }
          ),
        ]);

        if (reelData?.author?._ref !== session.id) {
          await writeClient.create({
            _type: "notification",
            recipient: { _type: "reference", _ref: reelData.author._ref },
            sender: { _type: "reference", _ref: session.id },
            type: "reel_save",
            message: `${saver?.name || "Someone"} saved your reel "${reelData.title}"`,
            reel: { _type: "reference", _ref: reelId },
            read: false,
          });
        }
      } catch (notifError) {
        console.error("Failed to create reel save notification:", notifError);
      }
    }

    revalidatePath(`/reels`);
    revalidatePath("/");
    revalidatePath(`/user/${session.id}`);
    revalidatePath("/notifications");

    return parseServerActionResponse({
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Reel bookmark error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to bookmark reel",
      status: "ERROR",
    });
  }
};

export const addReelComment = async (
  reelId: string,
  content: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  if (!content.trim())
    return parseServerActionResponse({
      error: "Comment content is required",
      status: "ERROR",
    });

  try {
    const newComment = {
      _type: "comment",
      content: content.trim(),
      author: {
        _type: "reference",
        _ref: session.id,
      },
      reel: {
        _type: "reference", 
        _ref: reelId,
      },
      createdAt: new Date(),
      upvotes: 0,
      upvotedBy: [],
    };

    const result = await writeClient.create(newComment);

    // Increment comment count on reel
    await writeClient
      .patch(reelId)
      .inc({ commentCount: 1 })
      .commit();

    // Create notification for reel comment
    try {
      const [reelData, commenter] = await Promise.all([
        writeClient.fetch(
          `*[_type == "reel" && _id == $id][0]{ title, author }`,
          { id: reelId }
        ),
        writeClient.fetch(
          `*[_type == "author" && _id == $id][0]{ name }`,
          { id: session.id }
        ),
      ]);

      if (reelData?.author?._ref !== session.id) {
        await writeClient.create({
          _type: "notification",
          recipient: { _type: "reference", _ref: reelData.author._ref },
          sender: { _type: "reference", _ref: session.id },
          type: "reel_comment",
          message: `${commenter?.name || "Someone"} commented on your reel "${reelData.title}"`,
          reel: { _type: "reference", _ref: reelId },
          comment: { _type: "reference", _ref: result._id },
          read: false,
        });
      }
    } catch (notifError) {
      console.error("Failed to create reel comment notification:", notifError);
    }

    revalidatePath(`/reels`);
    revalidatePath("/notifications");

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Add reel comment error:", error);

    return parseServerActionResponse({
      error: error?.message || "Failed to add comment",
      status: "ERROR",
    });
  }
};

export const logoutUser = async () => {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};
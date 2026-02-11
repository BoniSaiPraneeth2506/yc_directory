// Milestone notification system
import { writeClient } from "@/sanityio/lib/write-client";

interface MilestoneCheck {
  userId: string;
  type: 'views' | 'upvotes' | 'followers' | 'content';
  currentValue: number;
  previousValue?: number;
}

// Milestone thresholds
const MILESTONES = {
  views: [100, 500, 1000, 5000, 10000, 50000, 100000],
  upvotes: [10, 50, 100, 500, 1000, 5000, 10000],
  followers: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  content: [5, 10, 25, 50, 100, 250, 500],
};

export const checkMilestones = async ({ userId, type, currentValue, previousValue = 0 }: MilestoneCheck) => {
  try {
    // Get user name
    const user = await writeClient.fetch(
      `*[_type == "author" && _id == $id][0]{ name }`,
      { id: userId }
    );

    if (!user) return;

    const milestones = MILESTONES[type];
    
    // Find which milestones were crossed
    for (const milestone of milestones) {
      if (currentValue >= milestone && previousValue < milestone) {
        // Milestone achieved!
        const milestoneMessages = {
          views: `🎉 Congratulations! You've reached ${milestone.toLocaleString()} total views across all your content!`,
          upvotes: `❤️ Amazing! You've received ${milestone.toLocaleString()} upvotes from the community!`,
          followers: `👥 Incredible! You now have ${milestone.toLocaleString()} followers!`,
          content: `📝 Productive! You've published ${milestone.toLocaleString()} pieces of content!`,
        };

        await writeClient.create({
          _type: "notification",
          recipient: { _type: "reference", _ref: userId },
          sender: { _type: "reference", _ref: userId }, // Self-notification
          type: "milestone",
          milestoneType: type,
          milestoneValue: milestone,
          message: milestoneMessages[type],
          read: false,
        });
      }
    }
  } catch (error) {
    console.error("Failed to check milestones:", error);
  }
};

// Helper function to trigger milestone checks after user actions
export const triggerMilestoneCheck = async (userId: string) => {
  try {
    // Get current user stats
    const stats = await writeClient.fetch(`
      *[_type == "author" && _id == $userId][0] {
        "totalViews": *[_type in ["startup", "reel"] && author._ref == $userId && (isDraft != true)] | 
          { "views": coalesce(views, 0) } | 
          { "totalViews": sum(views) }.totalViews,
        "totalUpvotes": *[_type in ["startup", "reel"] && author._ref == $userId && (isDraft != true)] | 
          { "upvotes": coalesce(upvotes, 0) } | 
          { "totalUpvotes": sum(upvotes) }.totalUpvotes,
        "followersCount": count(followers),
        "contentCount": count(*[_type in ["startup", "reel"] && author._ref == $userId && (isDraft != true)])
      }
    `, { userId });

    if (stats) {
      // Check each milestone type
      await checkMilestones({
        userId,
        type: 'views',
        currentValue: stats.totalViews || 0,
      });

      await checkMilestones({
        userId,
        type: 'upvotes',
        currentValue: stats.totalUpvotes || 0,
      });

      await checkMilestones({
        userId,
        type: 'followers',
        currentValue: stats.followersCount || 0,
      });

      await checkMilestones({
        userId,
        type: 'content',
        currentValue: stats.contentCount || 0,
      });
    }
  } catch (error) {
    console.error("Failed to trigger milestone check:", error);
  }
};
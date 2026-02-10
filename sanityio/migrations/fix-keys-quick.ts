/**
 * Quick fix script for missing _key properties
 * Run this in Sanity Studio Vision tool or as a custom action
 * 
 * Instructions:
 * 1. Open Sanity Studio at http://localhost:3000/studio
 * 2. Go to Vision tool
 * 3. Paste and run this script
 */

import { writeClient } from '@/sanityio/lib/write-client';

export async function fixMissingKeys() {
  console.log('🔧 Fixing missing _key properties...');

  try {
    // Fetch all authors with array references
    const authors = await writeClient.fetch(`
      *[_type == "author"] {
        _id,
        savedStartups,
        upvotedStartups,
        followers,
        following
      }
    `);

    let fixed = 0;

    for (const author of authors) {
      const updates: any = {};
      let needsUpdate = false;

      // Add keys to savedStartups
      if (author.savedStartups?.length > 0) {
        updates.savedStartups = author.savedStartups.map((ref: any) => ({
          ...ref,
          _key: ref._key || crypto.randomUUID(),
        }));
        needsUpdate = true;
      }

      // Add keys to upvotedStartups
      if (author.upvotedStartups?.length > 0) {
        updates.upvotedStartups = author.upvotedStartups.map((ref: any) => ({
          ...ref,
          _key: ref._key || crypto.randomUUID(),
        }));
        needsUpdate = true;
      }

      // Add keys to followers
      if (author.followers?.length > 0) {
        updates.followers = author.followers.map((ref: any) => ({
          ...ref,
          _key: ref._key || crypto.randomUUID(),
        }));
        needsUpdate = true;
      }

      // Add keys to following
      if (author.following?.length > 0) {
        updates.following = author.following.map((ref: any) => ({
          ...ref,
          _key: ref._key || crypto.randomUUID(),
        }));
        needsUpdate = true;
      }

      if (needsUpdate) {
        await writeClient.patch(author._id).set(updates).commit();
        fixed++;
        console.log(`✅ Fixed: ${author._id}`);
      }
    }

    console.log(`\n✨ Fixed ${fixed} authors!`);
    return { success: true, fixed };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
}

/**
 * Migration script to add missing _key properties to array references in author documents
 * Run this from Sanity CLI or Studio to fix existing data
 * 
 * To run: npx sanity exec sanityio/migrations/fix-missing-keys.ts --with-user-token
 */

import { getCliClient } from 'sanity/cli';
import crypto from 'crypto';

const client = getCliClient();

interface ArrayReference {
  _type: string;
  _ref: string;
  _key?: string;
}

interface Author {
  _id: string;
  _rev: string;
  savedStartups?: ArrayReference[];
  upvotedStartups?: ArrayReference[];
  followers?: ArrayReference[];
  following?: ArrayReference[];
}

interface Startup {
  _id: string;
  _rev: string;
  upvotedBy?: ArrayReference[];
}

interface Comment {
  _id: string;
  _rev: string;
  upvotedBy?: ArrayReference[];
}

// Function to add _key to references that don't have it
function addKeysToReferences(references?: ArrayReference[]): ArrayReference[] | undefined {
  if (!references || references.length === 0) {
    return references;
  }

  return references.map((ref) => {
    if (!ref._key) {
      return {
        ...ref,
        _key: crypto.randomUUID(),
      };
    }
    return ref;
  });
}

// Main migration function
async function fixMissingKeys() {
  console.log('🔧 Starting migration to fix missing _key properties...\n');

  let fixedAuthors = 0;
  let fixedStartups = 0;
  let fixedComments = 0;
  let errors = 0;

  try {
    // Fix author documents
    console.log('📝 Fetching authors...');
    const authors = await client.fetch<Author[]>(`
      *[_type == "author" && (
        defined(savedStartups) || 
        defined(upvotedStartups) || 
        defined(followers) || 
        defined(following)
      )] {
        _id,
        _rev,
        savedStartups,
        upvotedStartups,
        followers,
        following
      }
    `);

    console.log(`Found ${authors.length} authors to check\n`);

    for (const author of authors) {
      let needsUpdate = false;
      const updates: any = {};

      // Check savedStartups
      if (author.savedStartups?.some((ref) => !ref._key)) {
        updates.savedStartups = addKeysToReferences(author.savedStartups);
        needsUpdate = true;
      }

      // Check upvotedStartups
      if (author.upvotedStartups?.some((ref) => !ref._key)) {
        updates.upvotedStartups = addKeysToReferences(author.upvotedStartups);
        needsUpdate = true;
      }

      // Check followers
      if (author.followers?.some((ref) => !ref._key)) {
        updates.followers = addKeysToReferences(author.followers);
        needsUpdate = true;
      }

      // Check following
      if (author.following?.some((ref) => !ref._key)) {
        updates.following = addKeysToReferences(author.following);
        needsUpdate = true;
      }

      if (needsUpdate) {
        try {
          await client
            .patch(author._id)
            .set(updates)
            .commit({ autoGenerateArrayKeys: false });
          
          fixedAuthors++;
          console.log(`✅ Fixed author: ${author._id}`);
        } catch (error) {
          console.error(`❌ Error fixing author ${author._id}:`, error);
          errors++;
        }
      }
    }

    // Fix startup documents
    console.log('\n📝 Fetching startups...');
    const startups = await client.fetch<Startup[]>(`
      *[_type == "startup" && defined(upvotedBy)] {
        _id,
        _rev,
        upvotedBy
      }
    `);

    console.log(`Found ${startups.length} startups to check\n`);

    for (const startup of startups) {
      if (startup.upvotedBy?.some((ref) => !ref._key)) {
        try {
          await client
            .patch(startup._id)
            .set({ upvotedBy: addKeysToReferences(startup.upvotedBy) })
            .commit({ autoGenerateArrayKeys: false });
          
          fixedStartups++;
          console.log(`✅ Fixed startup: ${startup._id}`);
        } catch (error) {
          console.error(`❌ Error fixing startup ${startup._id}:`, error);
          errors++;
        }
      }
    }

    // Fix comment documents
    console.log('\n📝 Fetching comments...');
    const comments = await client.fetch<Comment[]>(`
      *[_type == "comment" && defined(upvotedBy)] {
        _id,
        _rev,
        upvotedBy
      }
    `);

    console.log(`Found ${comments.length} comments to check\n`);

    for (const comment of comments) {
      if (comment.upvotedBy?.some((ref) => !ref._key)) {
        try {
          await client
            .patch(comment._id)
            .set({ upvotedBy: addKeysToReferences(comment.upvotedBy) })
            .commit({ autoGenerateArrayKeys: false });
          
          fixedComments++;
          console.log(`✅ Fixed comment: ${comment._id}`);
        } catch (error) {
          console.error(`❌ Error fixing comment ${comment._id}:`, error);
          errors++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration completed!');
    console.log('='.repeat(60));
    console.log(`✅ Fixed authors: ${fixedAuthors}`);
    console.log(`✅ Fixed startups: ${fixedStartups}`);
    console.log(`✅ Fixed comments: ${fixedComments}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (errors > 0) {
      console.log('⚠️  Some documents could not be fixed. Check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixMissingKeys()
  .then(() => {
    console.log('🎉 Migration script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });

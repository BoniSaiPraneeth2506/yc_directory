import { client } from "@/sanityio/lib/client";

/**
 * Debug script to check what's wrong with upvoted and saved startups
 * 
 * Run this in your API route or component to debug
 */

export async function debugStartupReferences(authorId: string) {
  console.log('\n🔍 DEBUG: Checking author references...\n');

  // 1. Get raw references from author
  const authorData = await client.fetch(
    `*[_type == "author" && _id == $id][0] {
      _id,
      name,
      "savedRefs": savedStartups[]._ref,
      "upvotedRefs": upvotedStartups[]._ref,
      "savedKeys": savedStartups[]._key,
      "upvotedKeys": upvotedStartups[]._key
    }`,
    { id: authorId }
  );

  console.log('📋 Author Data:', {
    id: authorData._id,
    name: authorData.name,
    savedCount: authorData.savedRefs?.length || 0,
    upvotedCount: authorData.upvotedRefs?.length || 0,
  });

  console.log('\n💾 Saved References:', authorData.savedRefs);
  console.log('🔑 Saved Keys:', authorData.savedKeys);
  
  console.log('\n👍 Upvoted References:', authorData.upvotedRefs);
  console.log('🔑 Upvoted Keys:', authorData.upvotedKeys);

  // 2. Check if these startups exist
  if (authorData.savedRefs?.length > 0) {
    console.log('\n🔍 Checking saved startup documents...');
    for (const ref of authorData.savedRefs) {
      const startup = await client.fetch(
        `*[_type == "startup" && _id == $id][0] {
          _id,
          title,
          isDraft,
          "exists": true
        }`,
        { id: ref }
      );
      
      if (startup) {
        console.log(`✅ ${ref}: "${startup.title}" ${startup.isDraft ? '(DRAFT)' : '(PUBLISHED)'}`);
      } else {
        console.log(`❌ ${ref}: DOES NOT EXIST (deleted or invalid reference)`);
      }
    }
  }

  if (authorData.upvotedRefs?.length > 0) {
    console.log('\n🔍 Checking upvoted startup documents...');
    for (const ref of authorData.upvotedRefs) {
      const startup = await client.fetch(
        `*[_type == "startup" && _id == $id][0] {
          _id,
          title,
          isDraft,
          "exists": true
        }`,
        { id: ref }
      );
      
      if (startup) {
        console.log(`✅ ${ref}: "${startup.title}" ${startup.isDraft ? '(DRAFT)' : '(PUBLISHED)'}`);
      } else {
        console.log(`❌ ${ref}: DOES NOT EXIST (deleted or invalid reference)`);
      }
    }
  }

  // 3. Try fetching with the actual query but without isDraft filter
  console.log('\n🔍 Fetching with NO draft filter...');
  const savedWithoutFilter = await client.fetch(
    `*[_type == "author" && _id == $id][0].savedStartups[]-> {
      _id,
      title,
      isDraft
    }`,
    { id: authorId }
  );

  console.log('💾 Saved (no filter):', savedWithoutFilter);

  const upvotedWithoutFilter = await client.fetch(
    `*[_type == "author" && _id == $id][0].upvotedStartups[]-> {
      _id,
      title,
      isDraft
    }`,
    { id: authorId }
  );

  console.log('👍 Upvoted (no filter):', upvotedWithoutFilter);

  // 4. Check with missing _key
  const hasMissingKeys = !authorData.savedKeys?.every((k: string) => k) || 
                         !authorData.upvotedKeys?.every((k: string) => k);
  
  if (hasMissingKeys) {
    console.log('\n⚠️  WARNING: Some references are missing _key properties!');
    console.log('This can cause dereferencing issues in Sanity.');
    console.log('Run the migration: http://localhost:3000/api/fix-missing-keys');
  }

  console.log('\n✅ Debug complete!\n');

  return {
    authorData,
    savedWithoutFilter,
    upvotedWithoutFilter,
    hasMissingKeys
  };
}

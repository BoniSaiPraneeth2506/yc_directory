import { NextResponse } from 'next/server';
import { writeClient } from '@/sanityio/lib/write-client';
import { auth } from '@/auth';

/**
 * API endpoint to fix missing _key properties in Sanity arrays
 * 
 * To use:
 * 1. Make sure you're signed in
 * 2. Visit: http://localhost:3000/api/fix-missing-keys
 * 3. Or run: curl http://localhost:3000/api/fix-missing-keys
 */

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in first' },
        { status: 401 }
      );
    }

    console.log('🔧 Starting to fix missing _key properties...');

    // Fetch all authors with array references
    const authors = await writeClient.fetch(`
      *[_type == "author"] {
        _id,
        name,
        savedStartups,
        upvotedStartups,
        followers,
        following
      }
    `);

    let fixedCount = 0;
    const results: any[] = [];

    for (const author of authors) {
      const updates: any = {};
      let needsUpdate = false;
      const fixedFields: string[] = [];

      // Helper to add keys if missing
      const addKeys = (arr: any[]) => 
        arr?.map((ref: any) => ({
          ...ref,
          _key: ref._key || crypto.randomUUID(),
        }));

      // Check and fix each array field
      if (author.savedStartups?.some((ref: any) => !ref._key)) {
        updates.savedStartups = addKeys(author.savedStartups);
        needsUpdate = true;
        fixedFields.push('savedStartups');
      }

      if (author.upvotedStartups?.some((ref: any) => !ref._key)) {
        updates.upvotedStartups = addKeys(author.upvotedStartups);
        needsUpdate = true;
        fixedFields.push('upvotedStartups');
      }

      if (author.followers?.some((ref: any) => !ref._key)) {
        updates.followers = addKeys(author.followers);
        needsUpdate = true;
        fixedFields.push('followers');
      }

      if (author.following?.some((ref: any) => !ref._key)) {
        updates.following = addKeys(author.following);
        needsUpdate = true;
        fixedFields.push('following');
      }

      if (needsUpdate) {
        try {
          await writeClient.patch(author._id).set(updates).commit();
          fixedCount++;
          results.push({
            id: author._id,
            name: author.name,
            fixedFields,
            status: 'success'
          });
          console.log(`✅ Fixed ${author.name} (${author._id}): ${fixedFields.join(', ')}`);
        } catch (error: any) {
          results.push({
            id: author._id,
            name: author.name,
            status: 'error',
            error: error.message
          });
          console.error(`❌ Error fixing ${author._id}:`, error);
        }
      }
    }

    // Also fix startups and comments
    const startups = await writeClient.fetch(`
      *[_type == "startup" && defined(upvotedBy)] {
        _id,
        title,
        upvotedBy
      }
    `);

    for (const startup of startups) {
      if (startup.upvotedBy?.some((ref: any) => !ref._key)) {
        const updates = {
          upvotedBy: startup.upvotedBy.map((ref: any) => ({
            ...ref,
            _key: ref._key || crypto.randomUUID(),
          }))
        };
        
        try {
          await writeClient.patch(startup._id).set(updates).commit();
          fixedCount++;
          console.log(`✅ Fixed startup: ${startup.title}`);
        } catch (error) {
          console.error(`❌ Error fixing startup ${startup._id}:`, error);
        }
      }
    }

    console.log(`\n✨ Migration complete! Fixed ${fixedCount} documents.`);

    return NextResponse.json({
      success: true,
      message: `Successfully fixed ${fixedCount} documents`,
      fixed: fixedCount,
      details: results,
    });

  } catch (error: any) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Migration failed',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

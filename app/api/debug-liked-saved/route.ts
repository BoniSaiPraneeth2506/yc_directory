import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { client } from '@/sanityio/lib/client';

/**
 * Comprehensive debug for liked/saved posts issue
 * Visit: http://localhost:3000/api/debug-liked-saved
 */

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.id;
    console.log('\n🔍 COMPREHENSIVE DEBUG FOR USER:', userId, '\n');

    // Step 1: Get raw author data
    console.log('📋 Step 1: Fetching raw author data...');
    const authorRaw = await client.fetch(
      `*[_type == "author" && _id == $id][0] {
        _id,
        name,
        savedStartups,
        upvotedStartups
      }`,
      { id: userId }
    );

    console.log('Raw author data:', JSON.stringify(authorRaw, null, 2));

    // Step 2: Check each saved startup reference
    console.log('\n💾 Step 2: Checking SAVED startup references...');
    const savedChecks = [];
    
    if (authorRaw?.savedStartups) {
      for (let i = 0; i < authorRaw.savedStartups.length; i++) {
        const ref = authorRaw.savedStartups[i];
        console.log(`\nChecking saved[${i}]:`, ref);
        
        const startup = await client.fetch(
          `*[_type == "startup" && _id == $id][0] {
            _id,
            title,
            isDraft,
            slug,
            author
          }`,
          { id: ref._ref }
        );
        
        savedChecks.push({
          index: i,
          ref: ref._ref,
          hasKey: !!ref._key,
          key: ref._key,
          exists: !!startup,
          startup: startup || 'NOT FOUND'
        });
        
        if (startup) {
          console.log(`✅ Found: "${startup.title}" (isDraft: ${startup.isDraft})`);
        } else {
          console.log(`❌ NOT FOUND: ${ref._ref}`);
        }
      }
    }

    // Step 3: Check each upvoted startup reference
    console.log('\n👍 Step 3: Checking UPVOTED startup references...');
    const upvotedChecks = [];
    
    if (authorRaw?.upvotedStartups) {
      for (let i = 0; i < authorRaw.upvotedStartups.length; i++) {
        const ref = authorRaw.upvotedStartups[i];
        console.log(`\nChecking upvoted[${i}]:`, ref);
        
        const startup = await client.fetch(
          `*[_type == "startup" && _id == $id][0] {
            _id,
            title,
            isDraft,
            slug,
            author
          }`,
          { id: ref._ref }
        );
        
        upvotedChecks.push({
          index: i,
          ref: ref._ref,
          hasKey: !!ref._key,
          key: ref._key,
          exists: !!startup,
          startup: startup || 'NOT FOUND'
        });
        
        if (startup) {
          console.log(`✅ Found: "${startup.title}" (isDraft: ${startup.isDraft})`);
        } else {
          console.log(`❌ NOT FOUND: ${ref._ref}`);
        }
      }
    }

    // Step 4: Test the actual queries being used
    console.log('\n🔍 Step 4: Testing actual GROQ queries...');
    
    // Test saved query - original (with filter)
    const savedWithFilter = await client.fetch(
      `*[_type == "author" && _id == $id][0].savedStartups[]->{ _id, title, isDraft }[defined(_id)]`,
      { id: userId }
    );
    console.log('Saved WITH filter:', savedWithFilter);

    // Test saved query - without any filter
    const savedNoFilter = await client.fetch(
      `*[_type == "author" && _id == $id][0].savedStartups[]->{ _id, title, isDraft }`,
      { id: userId }
    );
    console.log('Saved WITHOUT filter:', savedNoFilter);

    // Test upvoted query - original (with filter)
    const upvotedWithFilter = await client.fetch(
      `*[_type == "author" && _id == $id][0].upvotedStartups[]->{ _id, title, isDraft }[defined(_id)]`,
      { id: userId }
    );
    console.log('Upvoted WITH filter:', upvotedWithFilter);

    // Test upvoted query - without any filter
    const upvotedNoFilter = await client.fetch(
      `*[_type == "author" && _id == $id][0].upvotedStartups[]->{ _id, title, isDraft }`,
      { id: userId }
    );
    console.log('Upvoted WITHOUT filter:', upvotedNoFilter);

    // Step 5: Test without dereferencing
    console.log('\n🔍 Step 5: Testing WITHOUT dereferencing...');
    const refsOnly = await client.fetch(
      `*[_type == "author" && _id == $id][0] {
        "savedRefs": savedStartups[]._ref,
        "upvotedRefs": upvotedStartups[]._ref
      }`,
      { id: userId }
    );
    console.log('References only:', refsOnly);

    // Summary
    const summary = {
      userId,
      userName: authorRaw?.name,
      savedStartupsCount: authorRaw?.savedStartups?.length || 0,
      upvotedStartupsCount: authorRaw?.upvotedStartups?.length || 0,
      savedChecks,
      upvotedChecks,
      queries: {
        savedWithFilter,
        savedNoFilter,
        upvotedWithFilter,
        upvotedNoFilter,
      },
      refsOnly,
      conclusion: generateConclusion(savedChecks, upvotedChecks, savedNoFilter, upvotedNoFilter)
    };

    console.log('\n' + '='.repeat(80));
    console.log('CONCLUSION:', summary.conclusion);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      ...summary
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

function generateConclusion(savedChecks: any[], upvotedChecks: any[], savedResults: any[], upvotedResults: any[]) {
  const issues = [];
  
  // Check if startups don't exist
  const savedMissing = savedChecks.filter(c => !c.exists).length;
  const upvotedMissing = upvotedChecks.filter(c => !c.exists).length;
  
  if (savedMissing > 0) {
    issues.push(`${savedMissing} saved startups DON'T EXIST (deleted)`);
  }
  
  if (upvotedMissing > 0) {
    issues.push(`${upvotedMissing} upvoted startups DON'T EXIST (deleted)`);
  }
  
  // Check if missing keys
  const savedNoKey = savedChecks.filter(c => !c.hasKey).length;
  const upvotedNoKey = upvotedChecks.filter(c => !c.hasKey).length;
  
  if (savedNoKey > 0) {
    issues.push(`${savedNoKey} saved refs missing _key`);
  }
  
  if (upvotedNoKey > 0) {
    issues.push(`${upvotedNoKey} upvoted refs missing _key`);
  }
  
  // Check query results
  if (savedResults?.every(r => r === null)) {
    issues.push('Saved query returns ALL NULLS - dereferencing is failing!');
  }
  
  if (upvotedResults?.every(r => r === null)) {
    issues.push('Upvoted query returns ALL NULLS - dereferencing is failing!');
  }
  
  if (issues.length === 0) {
    return '✅ Everything looks good! Data should display.';
  }
  
  return '⚠️ Issues found: ' + issues.join(', ');
}

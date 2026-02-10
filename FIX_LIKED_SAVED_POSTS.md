# Fix for Missing Liked and Saved Posts

## Problem
The "Liked" and "Saved" posts are not showing in the profile tabs because the array references in Sanity are missing the required `_key` property.

## Root Cause
When references were added to arrays (`savedStartups`, `upvotedStartups`, `followers`, `following`, `upvotedBy`), they were created without `_key` properties. Sanity requires all array items to have a unique `_key` for proper tracking and dereferencing.

## Solution Overview
1. ✅ **Fixed the code** - Updated `lib/actions.ts` to always include `_key` when adding new references
2. 🔧 **Need to fix existing data** - Run migration to add `_key` to existing references

## How to Fix Existing Data

### Option 1: API Endpoint (Easiest)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Make sure you're signed in to your app

3. Open this URL in your browser:
   ```
   http://localhost:3000/api/fix-missing-keys
   ```

4. You should see a success message showing how many documents were fixed

5. Refresh your profile page - liked and saved posts should now appear!

### Option 2: Sanity CLI (More Control)

If you have Sanity CLI installed:

```bash
npx sanity exec sanityio/migrations/fix-missing-keys.ts --with-user-token
```

### Option 3: Manual Fix in Sanity Studio

1. Open Sanity Studio at `http://localhost:3000/studio`

2. Click on each author that has the "Missing keys" warning

3. Click "Add missing keys" button that appear in the yellow warning banners

4. Save the document

## Verification

After running the migration:

1. Clear your browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Visit your profile page
3. Click on "Liked" and "Saved" tabs
4. Your posts should now appear!

## What Was Fixed

### Code Changes (`lib/actions.ts`)
- ✅ `toggleUpvote()` - Added `_key` to `upvotedStartups` and `upvotedBy` arrays
- ✅ `toggleBookmark()` - Added `_key` to `savedStartups` array
- ✅ `toggleFollow()` - Added `_key` to `followers` and `following` arrays
- ✅ `toggleCommentUpvote()` - Added `_key` to comment `upvotedBy` array

### Data Migration
- Adds `_key` to existing references in:
  - Author `savedStartups` arrays
  - Author `upvotedStartups` arrays
  - Author `followers` arrays
  - Author `following` arrays
  - Startup `upvotedBy` arrays
  - Comment `upvotedBy` arrays

## Need Help?

If the issue persists:

1. Check browser console for errors
2. Check terminal for server errors
3. Verify you're viewing your own profile (not someone else's)
4. Make sure the migration completed successfully
5. Try signing out and back in

## Technical Details

The issue occurred because when using Sanity's `.append()` method, each array item needs:
```typescript
{
  _type: "reference",
  _ref: "document-id",
  _key: "unique-key"  // <-- This was missing!
}
```

Without `_key`, Sanity cannot properly:
- Track array items
- Dereference the items in queries
- Display items in the Studio
- Allow editing of the array

All new data will now include `_key` automatically!

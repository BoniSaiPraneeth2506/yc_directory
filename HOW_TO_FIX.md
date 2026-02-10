# 🔧 Fix Liked & Saved Posts Not Showing

## Issue Summary
Your liked and saved posts show a **count** but return **null values** when fetching. This means:
- ✅ The references exist in the database
- ❌ But they're missing `_key` properties, causing dereferencing to fail

## Quick Fix - Follow These Steps:

### Step 1: Restart Dev Server
```bash
# Stop your current server (Ctrl+C)
npm run dev
```

### Step 2: Run the Migration
Once the server is running, **visit this URL** in your browser:
```
http://localhost:3000/api/fix-missing-keys
```

You should see a success message like:
```json
{
  "success": true,
  "message": "Successfully fixed 5 documents",
  "fixed": 5
}
```

### Step 3: Debug What's Happening (Optional)
To see exactly what's wrong with your data, visit:
```
http://localhost:3000/api/debug-startups
```

This will show you:
- Which references are missing `_key`
- Which startups exist vs are deleted
- Which startups are drafts

### Step 4: Verify the Fix
1. **Clear your browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. Go to your profile page
3. Click on **"Liked"** tab - you should see your upvoted posts!
4. Click on **"Saved"** tab - you should see your saved posts!

---

## What Changed?

### 1. Fixed Reference Queries ✅
Updated queries to:
- Remove the `isDraft` filter (you can now see liked/saved posts even if they become drafts)
- Better handle null values
- Add `[defined(_id)]` filter at the end to remove null results

**Files changed:**
- `sanityio/lib/queries.ts` - UPVOTED_STARTUPS_BY_AUTHOR_QUERY
- `sanityio/lib/queries.ts` - SAVED_STARTUPS_BY_AUTHOR_QUERY

### 2. Added Draft Badge ✅
Draft posts in your liked/saved tabs now show a yellow badge so you know which ones are drafts.

**Files changed:**
- `components/StartupCard.tsx` - Added draft indicator

### 3. Fixed Future References ✅
All new likes, saves, and follows will include proper `_key` properties.

**Files changed:**
- `lib/actions.ts` - All `.append()` calls now include `_key: crypto.randomUUID()`

### 4. Created Migration Tools ✅
- `app/api/fix-missing-keys/route.ts` - Easy migration endpoint
- `app/api/debug-startups/route.ts` - Debug endpoint
- `lib/debug-startups.ts` - Debug utility
- `sanityio/migrations/fix-missing-keys.ts` - CLI migration script

---

## Still Not Working?

### Check 1: Are the startups deleted?
Run the debug endpoint to see if your liked/saved startups still exist:
```
http://localhost:3000/api/debug-startups
```

Look for messages like:
- ✅ "startup-id: 'Title Here' (PUBLISHED)" - Startup exists
- ❌ "startup-id: DOES NOT EXIST" - Startup was deleted

### Check 2: Did the migration run?
Check your terminal for migration logs. You should see:
```
✅ Fixed author: vcIXRH2HhlP3Q4Al9S0yNY
✨ Migration complete! Fixed 1 documents.
```

### Check 3: Clear React cache
Sometimes Next.js caches data. Try:
```bash
# Stop server, then delete cache
rm -rf .next
npm run dev
```

### Check 4: Check Sanity Studio
1. Go to `http://localhost:3000/studio`
2. Click on "Authors" in the sidebar
3. Find your author document
4. Check if `savedStartups` and `upvotedStartups` have the yellow "Missing keys" warnings
5. If yes, click "Add missing keys" buttons

---

## Technical Details

### The Root Cause
When using Sanity's `.append()` method for array references, each item needs:

```typescript
{
  _type: "reference",
  _ref: "startup-id",
  _key: "unique-uuid"  // ⬅️ This was missing!
}
```

Without `_key`:
- ❌ Sanity can't track array items properly
- ❌ Dereferencing with `[]->` fails silently (returns null)
- ❌ Sanity Studio shows "Missing keys" warnings
- ❌ Your queries return `[null, null, null...]` instead of actual data

### The Fix
1. **Update code** - Always include `_key` when appending references
2. **Migrate data** - Add `_key` to existing references that don't have it
3. **Update queries** - Handle nulls gracefully and don't filter drafts

---

## Summary
✅ Code fixed - new data will have `_key`  
🔧 Migration ready - run `/api/fix-missing-keys`  
🐛 Debug tool created - check `/api/debug-startups`  
📝 Queries updated - better null handling  
🎨 Draft badge added - see which posts are drafts  

**Next step:** Visit http://localhost:3000/api/fix-missing-keys to fix your existing data!

# 📅 Post Scheduling Feature - Complete Guide

## ✅ What's Working

The scheduling feature is **fully implemented** with these components:

### 1. **UI Components** ✓
- Checkbox to enable scheduling in the create/edit form
- DateTime picker with calendar UI
- Shows selected publish date in readable format
- Min date validation (can't schedule in the past)

### 2. **Database Schema** ✓
- `scheduledFor` field (datetime) in Sanity startup schema
- Stores scheduled publish date/time

### 3. **Query Filtering** ✓
All public queries now filter out future scheduled posts using:
```groql
(!defined(scheduledFor) || scheduledFor <= now())
```

This means:
- Posts without `scheduledFor` → Always visible
- Posts with `scheduledFor` in the future → Hidden from public
- Posts with `scheduledFor` in the past → Visible to public

### 4. **Auto-Publishing System** ✓
- API endpoint: `/api/scheduled-publish`
- Vercel Cron job configured to run **every hour**
- Automatically publishes posts when their scheduled time arrives

---

## 🚀 How It Works

### **Creating a Scheduled Post:**

1. **Create or Edit a startup post**
2. **Check "Schedule for later"** checkbox (with calendar icon 📅)
3. **Pick date & time** using the datetime picker
4. **Save** the post (as draft or published)

### **What Happens:**

- Post is saved with `scheduledFor` timestamp
- Post is **hidden from public** until scheduled time
- **Author can still see it** in their drafts/posts
- Every hour, cron job checks for posts ready to publish
- When time arrives, `scheduledFor` is removed → Post becomes visible

---

## 🔍 Visibility Rules

| Post Status | `isDraft` | `scheduledFor` | Visible to Public? |
|-------------|-----------|----------------|-------------------|
| Draft | `true` | Any | ❌ No |
| Published | `false` | Not set | ✅ Yes |
| Published | `false` | Future date | ❌ No (scheduled) |
| Published | `false` | Past date | ✅ Yes |
| Scheduled (processed) | `false` | Removed | ✅ Yes |

---

## ⚙️ Technical Implementation

### **1. Frontend (StartupForm.tsx)**
```tsx
// Checkbox to toggle scheduling
<input type="checkbox" checked={showSchedule} />

// DateTime picker (only shows when checked)
{showSchedule && (
  <input
    type="datetime-local"
    value={scheduledFor}
    min={new Date().toISOString().slice(0, 16)}
  />
)}
```

### **2. Backend (lib/actions.ts)**
```typescript
// Saves scheduledFor when creating/updating posts
if (scheduledFor) {
  startup.scheduledFor = scheduledFor;
}
```

### **3. Query Filters (sanityio/lib/queries.ts)**
```groql
*[_type == "startup" 
  && (isDraft != true) 
  && (!defined(scheduledFor) || scheduledFor <= now())
]
```

### **4. Auto-Publishing (api/scheduled-publish/route.ts)**
```typescript
// Finds posts ready to publish
const scheduledPosts = await client.fetch(
  `*[_type == "startup" 
    && defined(scheduledFor) 
    && scheduledFor <= $now 
    && isDraft != true
  ]`
);

// Removes scheduledFor to make visible
await writeClient.patch(post._id).unset(["scheduledFor"]).commit();
```

### **5. Cron Job (vercel.json)**
```json
{
  "crons": [{
    "path": "/api/scheduled-publish",
    "schedule": "0 * * * *"  // Every hour
  }]
}
```

---

## 🧪 Testing

### **Test Scheduled Publishing:**

1. **Create a post** with schedule 5-10 minutes in the future
2. **Verify** it's NOT visible on homepage
3. **Author can see it** in their profile
4. **Wait for scheduled time** (or trigger manually in dev)
5. **Post appears** on homepage after cron runs

### **Manual Trigger (Development Only):**
```bash
# Visit in browser or use curl
http://localhost:3000/api/scheduled-publish
```

### **Check Cron Logs (Production):**
- Go to Vercel Dashboard
- Select your project
- Navigate to "Cron Jobs" tab
- View execution logs

---

## 🔒 Security (Optional)

To add authentication to the cron endpoint:

1. **Add to `.env.local` (and Vercel):**
```env
CRON_SECRET=your-super-secret-random-string-here
```

2. **Uncomment in `api/scheduled-publish/route.ts`:**
```typescript
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

3. **Update `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/scheduled-publish",
    "schedule": "0 * * * *",
    "headers": {
      "Authorization": "Bearer your-super-secret-random-string-here"
    }
  }]
}
```

---

## 📊 Cron Schedule Options

Current: **Every hour** (`0 * * * *`)

Other options:
- Every 15 minutes: `*/15 * * * *`
- Every 30 minutes: `*/30 * * * *`
- Every 6 hours: `0 */6 * * *`
- Every day at midnight: `0 0 * * *`

**Note:** More frequent = higher precision, but more function invocations

---

## 🐛 Troubleshooting

### **Calendar Not Showing:**
✅ **FIXED** - Changed from shadcn Input to native datetime-local input with better styling

### **Post Not Publishing:**
- Check: Is `scheduledFor` time in the past?
- Check: Is `isDraft` set to `false`?
- Check: Cron job running? (Vercel Dashboard → Cron Jobs)
- Check: API logs for errors

### **Post Visible Too Early:**
- Check: Server timezone vs. local timezone
- Use UTC times for consistency
- Verify `now()` in GROQ query

### **Manual Testing:**
```bash
# Development only - triggers publish immediately
curl http://localhost:3000/api/scheduled-publish
```

---

## 📱 Mobile Support

✅ Native datetime-local input works on all modern mobile browsers:
- iOS Safari: Shows iOS date/time picker
- Chrome Mobile: Shows Chrome date/time picker
- Firefox Mobile: Shows Firefox date/time picker

---

## 🎯 Summary

| Component | Status | Location |
|-----------|--------|----------|
| UI Form | ✅ Working | `components/StartupForm.tsx` |
| Schema | ✅ Working | `sanityio/schemaTypes/startup.ts` |
| Save Logic | ✅ Working | `lib/actions.ts` |
| Query Filters | ✅ Working | `sanityio/lib/queries.ts` |
| Auto-Publish API | ✅ Working | `app/api/scheduled-publish/route.ts` |
| Cron Job | ✅ Working | `vercel.json` |

**Everything is implemented and ready to use!** 🎉

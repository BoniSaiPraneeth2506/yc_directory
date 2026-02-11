# 🚨 URGENT: Create Cloudinary Upload Preset

## ❌ Error: "Upload preset not found"

This means you need to create an unsigned upload preset in Cloudinary. **Takes 2 minutes!**

---

## 🎯 Step-by-Step Guide

### Step 1: Open Cloudinary Settings

Click this link to go directly to upload presets:
👉 **https://console.cloudinary.com/settings/c-dnqfzr6dv/upload**

Or manually:
1. Go to https://console.cloudinary.com
2. Click **"Settings"** (gear icon)
3. Click **"Upload"** tab
4. Scroll to **"Upload presets"** section

---

### Step 2: Create New Preset

1. Click the **"Add upload preset"** button (blue button)

2. Fill in these EXACT settings:

   **Basic Settings:**
   - ✅ **Upload preset name:** `yc_reels`
   - ✅ **Signing mode:** Select **"Unsigned"** ⚠️ CRITICAL!
   - ✅ **Folder:** `yc_reels` (optional - keeps videos organized)
   
   **Content Settings:**
   - ✅ **Resource type:** "All" or "Video and Images"
   - ✅ **Allowed formats:** Leave empty (allows all video formats)

   **Other Settings:**
   - Leave everything else as default

3. Click **"Save"** at the bottom

---

### Step 3: Verify Your .env.local

Your `.env.local` file should now have:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnqfzr6dv
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yc_reels
```

✅ This is already set correctly!

---

### Step 4: Restart Dev Server

In your terminal:

```bash
# Stop the current server (Ctrl + C)
# Then restart:
npm run dev
```

---

### Step 5: Test Again!

1. Go to: http://localhost:3000/reels/create
2. Try uploading a video
3. Should work now! 🎉

---

## 📸 Visual Guide

### What "Unsigned" Mode Looks Like:

When creating the preset, you'll see a dropdown for **"Signing mode"**:

```
Signing mode: [Dropdown]
  ○ Signed
  ● Unsigned  ← SELECT THIS ONE!
```

**Why Unsigned?**
- Allows direct uploads from browser (client-side)
- No need for server-side signature generation
- Perfect for public uploads like reels

---

## ✅ Verification Checklist

Before testing, make sure:

- [ ] Went to Cloudinary upload settings
- [ ] Created preset named exactly: `yc_reels`
- [ ] Set signing mode to "Unsigned"
- [ ] Saved the preset
- [ ] Restarted dev server
- [ ] Tried uploading again

---

## 🔍 Troubleshooting

### Still getting "Upload preset not found"?

**Check:**
1. Preset name is exactly: `yc_reels` (lowercase, no spaces)
2. Signing mode is "Unsigned" (not "Signed")
3. You saved the preset
4. You restarted the dev server
5. No typos in `.env.local`

### Can't find upload presets in Cloudinary?

Direct link to your account:
https://console.cloudinary.com/settings/c-dnqfzr6dv/upload

Scroll down to the **"Upload presets"** section.

### Different error?

If you get a different error after creating the preset, check:
- Cloud name is correct: `dnqfzr6dv`
- Internet connection is stable
- Video file is < 100MB
- Video format is supported (MP4, MOV, etc.)

---

## 🎯 Quick Summary

**What you need to do:**

1. Open: https://console.cloudinary.com/settings/c-dnqfzr6dv/upload
2. Click "Add upload preset"
3. Name: `yc_reels`
4. Mode: **Unsigned**
5. Save
6. Restart server: `npm run dev`
7. Test: http://localhost:3000/reels/create

**That's it!** 🚀

---

## 📞 Need More Help?

If you're still stuck:

1. Take a screenshot of your Cloudinary preset settings
2. Check the browser console for error messages (F12)
3. Make sure the preset name exactly matches: `yc_reels`

The most common mistake is:
- ❌ Using "Signed" mode instead of "Unsigned"
- ❌ Typo in preset name
- ❌ Not restarting the dev server

---

**Once you create the preset, video uploads will work perfectly!** 🎬

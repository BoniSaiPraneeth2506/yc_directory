# 🎬 Video Upload Setup Guide

## Your App Now Has Full Video Upload! 🚀

Users can now upload videos directly from the website - just like Instagram/YouTube Reels!

---

## ✅ What's Been Implemented:

### 1. **New Reel Schema**
- Dedicated `reel` content type in Sanity
- Fields: title, description, videoUrl, thumbnail, category, tags, views, upvotes, etc.

### 2. **Video Upload Component**
- Direct video file upload from browser
- Progress bar during upload
- Video preview
- Automatic thumbnail generation
- Duration detection
- Max 100MB file size

### 3. **Reel Creation Form**
- Full form at `/reels/create`
- Title, description, category
- Tag input (up to 5 tags)
- Video upload with preview
- Validation

### 4. **Reels Feed**
- Vertical scroll (TikTok/Instagram style)
- Smooth video playback
- Click to play/pause
- Mute/unmute toggle
- Auto-play when in view

---

## 🔧 Cloudinary Setup (Required)

You need Cloudinary to store videos. It's **FREE** for up to 25GB storage!

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials

1. Go to your [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Copy your **Cloud Name** (e.g., `dxyz123abc`)

### Step 3: Create Upload Preset

1. Go to **Settings** → **Upload** → **Upload Presets**
2. Click **"Add upload preset"**
3. Set **Signing Mode** to **"Unsigned"**
4. (Optional) Set **Folder** to `yc_reels`
5. Click **Save**
6. Copy the **Preset Name** (e.g., `yc_reels_preset`)

### Step 4: Add to Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yc_reels_preset
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

---

## 🎥 How Users Upload Reels

1. **Click the + icon** in bottom navigation
2. **Select "Create Reel"**
3. **Fill in the form:**
   - Title (your pitch headline)
   - Description (what your startup does)
   - Category (Tech, Health, Finance, etc.)
   - Tags (optional, up to 5)
4. **Upload video:**
   - Click "Choose Video" or drag & drop
   - Wait for upload (progress bar shown)
   - Preview your video
5. **Click "Create Reel"**
6. **Done!** Reel appears in `/reels` feed

---

## 📱 User Experience

### Reels Feed (`/reels`)
- Vertical scroll (like TikTok)
- Auto-play when video is in view
- Click video to play/pause
- Mute/unmute button
- Founder info overlay
- Like, comment, view counts
- Tags displayed

### Video Performance
- Videos load efficiently (preload metadata only)
- Smooth scrolling with Intersection Observer
- Only active video plays (saves bandwidth)
- Works great even with 50-70MB videos

---

## 🛠️ Technical Details

### Schema
- Location: `sanityio/schemaTypes/reel.ts`
- Type: `reel` (separate from `startup`)
- Fields: title, description, videoUrl, thumbnail, category, tags, views, upvotes, etc.

### Upload Flow
1. User selects video file
2. File validated (type, size)
3. Duration extracted from video
4. Uploaded to Cloudinary (with progress)
5. Cloudinary returns secure URL
6. URL saved to Sanity
7. Reel appears in feed

### Components
- `VideoUpload.tsx` - Video file upload with Cloudinary
- `ReelForm.tsx` - Form for creating reels
- `ReelPlayer.tsx` - Video player with controls
- `ReelsScroller.tsx` - Vertical scroll container

### Pages
- `/reels` - Reels feed (vertical scroll)
- `/reels/create` - Create new reel
- `/reels/[id]` - Individual reel detail (coming soon)

---

## 🎯 What's Next?

After videos work, we can add:
- Individual reel detail pages
- Comments on reels
- Share reels
- Download reels
- Reel analytics
- Messages system

---

## 🚨 Troubleshooting

### Upload fails with "Upload failed" error
- Check Cloudinary credentials in `.env.local`
- Make sure Cloud Name is correct
- Verify Upload Preset is set to "Unsigned"

### Video doesn't play
- Check video file format (MP4 is most compatible)
- Try a smaller video (under 50MB recommended)
- Check browser console for errors

### Progress bar stuck at 0%
- Check internet connection
- Try a smaller video
- Refresh page and try again

---

## 📊 Cloudinary Free Tier

✅ **25GB** storage
✅ **25GB** monthly bandwidth
✅ **25,000** transformations/month
✅ **Video optimization**
✅ **Automatic thumbnails**

This is **more than enough** for a startup platform!

---

**You're all set! 🎉**

Users can now upload pitch videos directly from your website. Test it out by creating your first reel!

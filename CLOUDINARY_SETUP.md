# 🎬 Cloudinary Setup Complete!

Your Cloudinary credentials have been configured! ✅

---

## ✅ What's Been Set Up:

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnqfzr6dv
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
CLOUDINARY_API_KEY=983286293546745
CLOUDINARY_API_SECRET=09jdemwFJga-IhfoqlIp1oaHTxE
```

---

## 🚨 IMPORTANT: Create Unsigned Upload Preset

You **must** create an unsigned upload preset for video uploads to work from the browser!

### Quick Setup (2 minutes):

1. **Go to Cloudinary Dashboard:**
   👉 https://console.cloudinary.com/settings/c-3a421d2e0c3a0d5a8b8c8c8c/upload

2. **Click "Add upload preset"** (blue button)

3. **Configure the preset:**
   - **Upload preset name:** `yc_reels_unsigned` (or any name you like)
   - **Signing mode:** Select **"Unsigned"** ⚠️ This is crucial!
   - **Folder:** `yc_reels` (optional, keeps videos organized)
   - **Resource type:** `Video and images` or `All`
   - Leave other settings as default

4. **Save the preset**

5. **Update `.env.local`:**
   Replace this line:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
   ```
   
   With your preset name:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yc_reels_unsigned
   ```

6. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Test Your Setup

### Option 1: Quick Browser Test

1. Go to: http://localhost:3000/reels/create
2. Fill in the form
3. Upload a test video (any MP4 file < 100MB)
4. Watch the progress bar
5. If successful, you'll see a video preview!

### Option 2: Direct Cloudinary Test

Test your credentials directly:

```bash
curl -X POST https://api.cloudinary.com/v1_1/dnqfzr6dv/upload \
  -F "file=@/path/to/test-video.mp4" \
  -F "upload_preset=yc_reels_unsigned"
```

If it works, you'll get a JSON response with `secure_url`.

---

## 🎯 How It Works:

1. **User uploads video** → File selected from device
2. **Client-side validation** → File type + size checked
3. **Upload to Cloudinary** → Direct from browser with progress
4. **Cloudinary processes** → Optimizes, generates thumbnail
5. **URL returned** → Saved to Sanity database
6. **Video appears** → In reels feed instantly!

---

## 🔍 Troubleshooting

### Error: "Invalid upload preset"
- You haven't created the unsigned upload preset yet
- Or the preset name in `.env.local` doesn't match
- **Fix:** Follow the "Create Unsigned Upload Preset" steps above

### Error: "Cloudinary is not configured"
- Environment variables not loaded
- **Fix:** Restart your dev server (`npm run dev`)

### Error: "Upload failed" or 401/403
- Wrong credentials
- Preset is not set to "Unsigned" mode
- **Fix:** Double-check preset is set to "Unsigned" in Cloudinary dashboard

### Video uploads but shows error
- Preset doesn't allow video uploads
- **Fix:** Edit preset, set resource type to "Video" or "All"

### Progress bar stuck at 0%
- Network issue or file too large
- **Fix:** Try smaller video (< 50MB) or check internet connection

---

## 📊 Your Cloudinary Plan

With your free account, you get:
- ✅ **25GB** storage
- ✅ **25GB** monthly bandwidth
- ✅ **25,000** transformations
- ✅ Automatic video optimization
- ✅ Thumbnail generation
- ✅ Multiple format support

This is **plenty** for a startup platform!

---

## 🎥 Supported Video Formats

Your users can upload:
- ✅ MP4 (recommended)
- ✅ MOV
- ✅ AVI
- ✅ WebM
- ✅ MKV
- ✅ FLV

Cloudinary automatically converts and optimizes them!

---

## 🚀 Next Steps

1. **Create the unsigned upload preset** (2 minutes)
2. **Update `.env.local`** with your preset name
3. **Restart dev server**
4. **Test at `/reels/create`**
5. **Upload your first reel!** 🎉

---

## 💡 Pro Tips

### Optimize Video Before Upload
Recommend users:
- Keep videos under 50MB for faster uploads
- Use MP4 format (most compatible)
- Record in 1080p or lower
- Keep duration under 3 minutes

### Dashboard Links
- **Upload Presets:** https://console.cloudinary.com/settings/c-3a421d2e0c3a0d5a8b8c8c8c/upload
- **Media Library:** https://console.cloudinary.com/console/c-3a421d2e0c3a0d5a8b8c8c8c/media_library
- **Usage Stats:** https://console.cloudinary.com/console/c-3a421d2e0c3a0d5a8b8c8c8c/usage

---

## ✅ Verification Checklist

Before testing, make sure:
- [x] Cloudinary credentials added to `.env.local`
- [ ] Unsigned upload preset created in Cloudinary dashboard
- [ ] Preset name updated in `.env.local`
- [ ] Dev server restarted
- [ ] Tested upload at `/reels/create`

---

**You're almost there!** Just create the upload preset and you're good to go! 🚀

Need help? Check the troubleshooting section or test with a small video file first.

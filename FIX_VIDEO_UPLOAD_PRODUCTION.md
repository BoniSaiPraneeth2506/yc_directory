# 🚨 URGENT: Fix Video Upload in Production

## The Problem
- ✅ Video uploads work on localhost  
- ❌ Video uploads fail on Vercel with "Cloudinary is not configured"
- 🔐 **Security Alert:** Your API keys were exposed on GitHub

---

## 🔧 Quick Fix (5 minutes)

### Step 1: Generate New Cloudinary Keys 
**⚠️ CRITICAL - Your old keys are compromised!**

1. Go to: https://console.cloudinary.com/settings/security
2. Click "Regenerate API secret" 
3. Copy your NEW credentials:
   - Cloud Name: `your_cloud_name`
   - API Key: `your_new_api_key`  
   - API Secret: `your_new_api_secret`

### Step 2: Update Local Environment

Replace your `.env.local` with NEW credentials:
```env
# Cloudinary Configuration for Video Uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
CLOUDINARY_API_KEY=your_new_api_key
CLOUDINARY_API_SECRET=your_new_api_secret
```

### Step 3: Configure Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these 4 variables (click "Add" for each):

   | Name | Value | Environment |
   |------|-------|-------------|
   | NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | your_cloud_name | Production |
   | NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET | your_unsigned_preset_name | Production |
   | CLOUDINARY_API_KEY | your_new_api_key | Production |  
   | CLOUDINARY_API_SECRET | your_new_api_secret | Production |

### Step 4: Create Unsigned Upload Preset

1. Go to: https://console.cloudinary.com/settings/upload
2. Click "Add upload preset"
3. Configure:
   - **Upload preset name:** `yc_reels_unsigned`
   - **Signing mode:** **"Unsigned"** (CRITICAL!)
   - **Folder:** `yc_reels`
   - **Resource type:** Video and images
4. Save preset

### Step 5: Update Environment Variables

Update both `.env.local` AND Vercel with your preset name:
```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yc_reels_unsigned
```

### Step 6: Deploy Again

```bash
git add .
git commit -m "fix: secure cloudinary config and add vercel env vars"
git push origin main
```

Or click "Redeploy" in Vercel dashboard.

---

## ✅ Test Your Fix

1. **Wait 2-3 minutes** for deployment
2. Go to your production URL: `/reels/create`
3. Try uploading a video
4. Should work without "administrator" error!

---

## 🔐 Security Notes

- ✅ Old exposed keys removed from repository
- ✅ New keys generated  
- ✅ Environment variables properly configured in Vercel
- ✅ No secrets in code anymore

**Never commit API keys to Git again!** Use environment variables only.

---

## 🆘 If Still Not Working

Check browser console (F12) for specific errors:
- `Missing Cloudinary config` → Environment variables not set in Vercel
- `Invalid upload preset` → Create unsigned preset in Cloudinary
- `Upload failed` → Check preset allows video uploads

Need help? The detailed setup is in `CLOUDINARY_SETUP.md`
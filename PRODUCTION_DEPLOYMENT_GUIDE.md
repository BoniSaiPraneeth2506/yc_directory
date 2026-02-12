# Production Deployment Guide - Real-time Chat

## Problem
Vercel (and similar serverless platforms) **don't support persistent WebSocket servers**. Your `server.js` won't run in production on Vercel.

## Solution
Deploy Socket.io server separately on a platform that supports WebSockets.

---

## Step 1: Deploy Socket.io Server to Railway

### 1.1 Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Free tier: 500 hours/month, $5 credit

### 1.2 Deploy Socket Server

1. **Connect Repository:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `yc_directory` repository
   - Railway will detect it's a Node.js app

2. **Configure Build Settings:**
   - In Railway dashboard → Settings → Build
   - **Start Command:** `npm run start:socket`
   - **Root Directory:** `/` (or leave blank)

3. **Set Environment Variables:**
   - Go to Variables tab
   - Add these variables:
     ```
     PORT=3001
     CLIENT_URL=https://your-nextjs-app.vercel.app
     NODE_ENV=production
     ```
   - **Important:** Replace `your-nextjs-app.vercel.app` with your ACTUAL Vercel URL

4. **Get Public URL:**
   - Railway will generate a public URL like: `https://yourapp.up.railway.app`
   - Copy this URL - you'll need it!

5. **Test Connection:**
   - Visit: `https://yourapp.up.railway.app`
   - Should see: "Socket.io server running"

---

## Step 2: Configure Next.js on Vercel

### 2.1 Update Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Socket.io Server URL (from Railway)
NEXT_PUBLIC_SOCKET_URL=https://yourapp.up.railway.app

# Your Next.js production URL
NEXT_PUBLIC_SITE_URL=https://your-nextjs-app.vercel.app

# All other existing variables (Sanity, Auth, Cloudinary)
NEXT_PUBLIC_SANITY_PROJECT_ID=xhynjcjq
NEXT_PUBLIC_SANITY_DATASET=production
AUTH_SECRET=your-secret
AUTH_GITHUB_ID=your-id
AUTH_GITHUB_SECRET=your-secret
# ... etc
```

**CRITICAL:** Replace URLs with your actual values!

### 2.2 Update Vercel Build Settings

In Vercel Dashboard → Settings → General:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Framework Preset:** Next.js

### 2.3 Deploy

```bash
git add .
git commit -m "Add standalone socket server"
git push origin main
```

Vercel will auto-deploy.

---

## Step 3: Test Production Chat

1. **Open Production URL** (Vercel)
2. **Check Browser Console:**
   - Should see: `🔌 Connecting to Socket.io server: https://yourapp.up.railway.app`
   - Should see: `✅ Socket connected`
3. **Test Features:**
   - ✅ Send message → appears instantly
   - ✅ Online status shows green dots
   - ✅ Images appear in real-time
   - ✅ Read receipts update

---

## Alternative: Deploy Everything to Railway

If you prefer to keep everything in one place:

1. **Deploy Full App to Railway:**
   - Start Command: `npm run start` (runs server.js)
   - Environment variables: All your .env variables
   - Socket.io and Next.js run together

2. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_SOCKET_URL=https://yourapp.up.railway.app
   NEXT_PUBLIC_SITE_URL=https://yourapp.up.railway.app
   ```

3. **CORS Configuration:**
   - In `server.js`, update CORS origin to your production domain

---

## Troubleshooting

### Messages Not Appearing
1. Check browser console for Socket connection status
2. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
3. Check Railway logs: `railway logs`
4. Ensure Railway app is running (not sleeping)

### Online Status Not Working
1. Check CORS settings in `socket-server.js`
2. Verify both users are connected (check Railway logs)
3. Check browser network tab for WebSocket/polling requests

### Connection Errors
1. **CORS Error:**
   - Update `CLIENT_URL` in Railway to match your Vercel domain
   - Should be: `https://your-nextjs-app.vercel.app` (no trailing slash)

2. **404 Not Found:**
   - Verify Railway app is running
   - Check socket path is `/api/socket/io`
   - Test Railway URL directly in browser

3. **Transport Error:**
   - Check Railway logs for errors
   - Verify port configuration (Railway sets PORT automatically)

---

## Local Development

Keep using `npm run dev` - it runs server.js with Socket.io locally on port 3000.

---

## Cost Estimate

**Free Tier (Recommended for Testing):**
- Railway: $5 free credit, 500 hours/month
- Vercel: Free for hobby projects

**Paid Tier (For Production):**
- Railway: ~$5-10/month
- Vercel: Free (can upgrade for more resources)

**Total:** ~$5-10/month for full real-time chat

---

## Quick Start Commands

```bash
# Local development
npm run dev

# Start standalone socket server (for Railway)
npm run start:socket

# Start Next.js only (for Vercel)
npm run start:next
```

---

## Environment Variables Summary

### Railway (Socket Server):
```env
PORT=3001
CLIENT_URL=https://your-nextjs-app.vercel.app
NODE_ENV=production
```

### Vercel (Next.js):
```env
NEXT_PUBLIC_SOCKET_URL=https://yourapp.up.railway.app
NEXT_PUBLIC_SITE_URL=https://your-nextjs-app.vercel.app
NEXT_PUBLIC_SANITY_PROJECT_ID=xhynjcjq
NEXT_PUBLIC_SANITY_DATASET=production
AUTH_SECRET=your-secret
AUTH_GITHUB_ID=your-id
AUTH_GITHUB_SECRET=your-secret
SANITY_WRITE_TOKEN=your-token
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
# ... etc
```

### Local (.env.local):
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# ... all other variables
```

---

## Need Help?

1. Check Railway logs: `railway logs`
2. Check Vercel logs: Vercel Dashboard → Deployments → View Function Logs
3. Test socket connection: Open browser console and check connection messages
4. Verify environment variables are set correctly in both platforms

# 🚀 Complete Render Deployment Guide

## ✅ Production-Ready Socket.io + Next.js

This deployment runs **both Next.js and Socket.io together** on Render for instant real-time messaging.

---

## 🏗️ Step 1: Create Render Web Service

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New" → Web Service**
3. **Connect your GitHub repo:** `BoniSaiPraneeth2506/yc_directory`
4. **Configure the service:**

### Service Settings:
```
Name: yc-directory-chat
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
```

### Build & Deploy:
```
Build Command: npm install && npm run build
Start Command: npm start
```

---

## 🔧 Step 2: Environment Variables

**In Render Dashboard → Environment:**

```bash
# Required for production
NODE_ENV=production

# Your Render app URL (update after first deploy)
NEXT_PUBLIC_SITE_URL=https://yc-directory-chat.onrender.com

# Sanity (copy from your .env.local)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-10-01
SANITY_WRITE_TOKEN=your_write_token

# Auth (copy from your .env.local)  
AUTH_SECRET=your_auth_secret_here
AUTH_GITHUB_ID=your_github_id
AUTH_GITHUB_SECRET=your_github_secret

# Cloudinary (copy from your .env.local)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_token
```

---

## 🎯 Step 3: Deploy & Update URL

1. **Click "Create Web Service"** - Render starts building
2. **Wait for build to complete** (5-10 minutes)
3. **Copy your Render URL** (like: `https://yc-directory-chat.onrender.com`)
4. **Update Environment Variable:**
   - Go back to Environment tab
   - Update `NEXT_PUBLIC_SITE_URL` with your actual Render URL
   - Save (triggers automatic redeploy)

---

## ✔️ Step 4: Verify Real-Time Features

**Test these features after deployment:**

### 🔌 Socket.io Connection:
- [ ] Open browser console on your app
- [ ] Should see: `🚀 Connecting to production Socket.io server: https://your-app.onrender.com`
- [ ] Should see: `✅ Socket CONNECTED!`

### 💬 Real-Time Messaging:
- [ ] Open chat in 2 browser windows
- [ ] Send message → appears instantly in other window
- [ ] Typing indicator shows when typing
- [ ] Online/offline status updates

### 📱 Production Performance:
- [ ] Messages send without page refresh
- [ ] WebSocket connection (faster than polling)
- [ ] No CORS errors in console

---

## 🐛 Troubleshooting

### ❌ Build Fails: 
- Check all environment variables are set
- Ensure `npm run build` works locally

### ❌ Socket Connection Fails:
- Check `NEXT_PUBLIC_SITE_URL` matches your Render URL exactly
- Look for CORS errors in browser console
- Ensure Render service is not sleeping

### ❌ Chat Not Working:
- Open browser DevTools → Console
- Look for Socket.io connection logs
- Check Network tab for WebSocket connections

### 🔍 View Logs:
```bash
# In Render dashboard
Logs → View deployment and runtime logs
```

---

## 🎉 Expected Logs

**Successful deployment shows:**
```
🚀 Next.js + Socket.io server ready!
📱 Frontend: http://0.0.0.0:10000
⚡ Socket.io: 0.0.0.0:10000/api/socket/io 
🌍 Environment: production
🔗 Public URL: https://yc-directory-chat.onrender.com
```

**When users connect:**
```
✅ Socket connected: ABC123
👤 User user123 joined their room (socket: ABC123)
📊 Total online users: 1, Total sockets: 1
```

---

## 🚀 You're Live!

Your **production-ready real-time chat application** is now running on:
`https://yc-directory-chat.onrender.com`

**Features working:**
- ⚡ Instant messaging
- 👀 Typing indicators  
- 🟢 Online/offline status
- 🔔 Message notifications
- 📱 Mobile responsive
- 🔒 Authentication
- 🏭 Production scaling
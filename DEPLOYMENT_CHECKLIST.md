# ✅ Production Deployment Checklist

Copy your Railway URL and follow these steps **in order**:

---

## 📋 Step-by-Step Guide

### ✅ Step 0: Verify Folder Structure

Your project now has:
```
yc_directory/
├── socket-server/          ← Socket.io server (for Railway)
│   ├── socket-server.js
│   ├── package.json
│   └── README.md
├── app/                    ← Next.js app (for Vercel)
├── components/
├── lib/
└── ...
```

**Important:** Railway will ONLY deploy the `socket-server` folder.

---

### ✅ Step 1: Deploy to Railway

1. **Go to Railway:** [railway.app](https://railway.app)
2. **Sign in with GitHub**
3. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `yc_directory` repository
4. **Configure Deploy Settings:**
   - Go to: **Service → Settings → Deploy**
   - **Root Directory:** `socket-server` ⚠️ **CRITICAL - This prevents Next.js build errors!**
   - **Start Command:** `npm start` (or leave empty, Railway auto-detects)
   - **Build Command:** Leave empty
5. **Save changes** - Railway will redeploy

---

### ✅ Step 2: Get Your Railway URL

1. After deployment completes (wait ~1-2 minutes)
2. Go to: **Railway → Settings → Networking**
3. You'll see something like: `https://yc-directory-production.up.railway.app`
4. **Copy this full URL** (without trailing slash)

---

### ✅ Step 3: Set Railway Environment Variables

In Railway Dashboard → **Variables** tab:

```env
PORT=3001
NODE_ENV=production

# IMPORTANT: Add your Vercel URL here (replace with your actual URL)
CLIENT_URL=https://yc-directory-five-liard.vercel.app
```

**Note:** You can add multiple origins (separated by comma) if needed:
```env
CLIENT_URL=https://yc-directory-five-liard.vercel.app,http://localhost:3000
```

Click **Save** and Railway will **redeploy automatically**.

---

### ✅ Step 4: Wait for Railway to Redeploy

After saving variables:
- Railway will automatically rebuild and redeploy (takes ~2 minutes)
- Check **Deployments** tab - status should be "Success ✅"
- Check **Logs** - you should see:
  ```
  ========================================
  🚀 Socket.io Server Started
  ========================================
  📡 Port: 3001
  🌐 Environment: production
  🔒 CORS Origins: https://yc-directory-five-liard.vercel.app
  ✅ Ready for connections!
  ========================================
  ```

---

### ✅ Step 5: Test Railway Server Directly

Open in browser: `https://your-railway-url.up.railway.app`

Should display: **"Socket.io server running ✅"**

If you see this, your server is **running correctly**! 🎉

---

### ✅ Step 6: Add Environment Variable to Vercel

1. Go to: **Vercel** → Your Project → **Settings** → **Environment Variables**

2. Add this new variable:
   ```
   Name:  NEXT_PUBLIC_SOCKET_URL
   Value: https://your-railway-url.up.railway.app
   ```

3. **Important:** Apply to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)

4. Click **Save**

---

### ✅ Step 7: Redeploy Vercel

Environment variable changes **require a redeploy**:

**Option A - Via Vercel Dashboard:**
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **"Redeploy"**

**Option B - Via Git Push:**
```bash
git add .
git commit -m "Configure production socket server"
git push origin main
```

Vercel will auto-deploy. Wait for deployment to complete (~2-3 minutes).

---

### ✅ Step 8: Test Your Production Chat

1. **Open your production site:**
   ```
   https://yc-directory-five-liard.vercel.app
   ```

2. **Open Browser Console (F12 → Console tab)**

3. **Navigate to Messages**
   
4. **Check console logs** - You should see:
   ```
   🔌 Connecting to Socket.io server: https://your-railway-url.up.railway.app
   ```

5. **If connected successfully:**
   - No error messages
   - Socket stays connected
   - Messages appear instantly

---

## 🔍 Troubleshooting

### If you see: **CORS Error**

```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Fix:**
- Go to Railway → Variables
- Check `CLIENT_URL` matches your Vercel URL **exactly**
- Must be: `https://yc-directory-five-liard.vercel.app` (no trailing slash!)
- Save and wait for redeploy

### If you see: **404 Not Found**

```
GET https://railway-url/api/socket/io/ 404 (Not Found)
```

**Fix:**
- Check Railway logs for errors
- Verify Railway app is running (not sleeping)
- Test Railway URL directly in browser

### If you see: **Socket Disconnect Loop**

```
Socket connected
Socket disconnected
Socket connected
Socket disconnected
```

**Fix:**
- Check Railway logs for disconnect reasons
- Verify `transports: ["websocket", "polling"]` matches in both client and server
- Check for WebSocket blocking (firewall, antivirus)

### If messages don't appear:

1. **Check both users are online:**
   - Console should show: `Online users: ['user1', 'user2']`
   
2. **Check socket is connected:**
   - Console should show: `Socket connected: [socket-id]`
   
3. **Check Railway logs:**
   - Should show: `💬 Message from [userId]`
   - Should show: `User joined conversation: [conversationId]`

---

## 📊 Expected Console Output (Success)

When everything works correctly, you should see:

```
🔌 Connecting to Socket.io server: https://your-railway-url.up.railway.app
✅ Socket.io connected
👤 User joined room: [your-user-id]
💬 Joined conversation: [conversation-id]
```

When sending a message:
```
📤 ChatWindow: Sending message...
✅ Message saved to database
📡 Broadcasting via socket
   Socket connected: true
✅ Socket emit completed
```

When receiving a message (other user's browser):
```
📨 New message received
   Message ID: [message-id]
   Sender: [sender-name]
```

---

## 🎯 Final Verification Checklist

- [ ] Railway server is deployed and running
- [ ] Railway shows "Success ✅" in deployments
- [ ] Railway logs show "Ready for connections!"
- [ ] Railway URL works in browser (shows "Socket.io server running ✅")
- [ ] `CLIENT_URL` in Railway matches Vercel URL
- [ ] `NEXT_PUBLIC_SOCKET_URL` added to Vercel
- [ ] Vercel redeployed after adding env variable
- [ ] Browser console shows socket connection
- [ ] No CORS errors in console
- [ ] Messages appear instantly in real-time
- [ ] Green dots show online status
- [ ] Both users can see each other's messages instantly

---

## 🆘 Still Having Issues?

### Check Railway Logs:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View logs in real-time
railway logs
```

### Check Vercel Function Logs:

1. Go to Vercel Dashboard
2. Click on your latest deployment
3. Click **"View Function Logs"**
4. Look for errors related to Socket.io

### Common Issues:

1. **Mixed Content Error** (HTTP vs HTTPS)
   - Railway uses HTTPS
   - Vercel uses HTTPS
   - Both must match ✅

2. **Environment Variable Not Applied**
   - Must redeploy after adding env vars
   - Check Vercel → Settings → Environment Variables to confirm

3. **Railway App Sleeping**
   - Free tier apps may sleep after inactivity
   - Visit Railway URL to wake it up
   - Consider upgrading for 24/7 uptime

---

## 💰 Estimated Cost

**Free Tier (Good for testing & small projects):**
- Railway: $5 credit, 500 hours/month
- Vercel: Free forever (hobby projects)

**Paid Tier (For production with high traffic):**
- Railway: ~$5-10/month
- Vercel: Free (or upgrade for more resources)

**Total:** FREE to start, ~$5-10/month for production

---

## ✅ Success!

If you can send messages between two browsers in real-time, you're done! 🎉

Your architecture:
```
User Browser 1 ─┐
                 ├─→ Vercel (Next.js) ─→ Railway (Socket.io) ─┐
User Browser 2 ─┘                                              ├─→ Real-time sync ✅
                                                                │
                                                       Railway (Socket.io) broadcasts to all connected users
```

---

**Need more help?** Check Railway logs and Vercel function logs for specific error messages.

# 🚀 Railway Quick Setup - COPY THIS

## ⚠️ CRITICAL Setting

**Railway → Service → Settings → Deploy:**

```
Root Directory: socket-server
```

**This is the most important setting!** Without it, Railway tries to build Next.js and fails.

---

## 📝 Environment Variables

**Railway → Service → Variables:**

```env
PORT=3001
NODE_ENV=production
CLIENT_URL=https://yc-directory-five-liard.vercel.app
```

**Replace** `yc-directory-five-liard.vercel.app` with **your actual Vercel domain**.

---

## ✅ Checklist

- [ ] Root Directory set to `socket-server`
- [ ] Variables added (PORT, NODE_ENV, CLIENT_URL)
- [ ] Deployment successful (check Deployments tab)
- [ ] Visit Railway URL → Should show "Socket.io server running ✅"
- [ ] Copy Railway URL for next step

---

## 🔗 What to Do With Railway URL

After Railway deploys successfully:

1. **Copy your Railway URL** (from Settings → Networking)
   - Example: `https://yourapp.up.railway.app`

2. **Add to Vercel:**
   - Vercel → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SOCKET_URL = https://yourapp.up.railway.app`

3. **Redeploy Vercel** (required for env var to take effect)

---

## 🎯 Expected Railway Logs

When everything works, Railway logs show:

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

## ❌ Common Errors & Fixes

### Error: "Cannot find module 'next'"

**Cause:** Root Directory not set to `socket-server`

**Fix:** 
1. Go to Service → Settings → Deploy
2. Set Root Directory: `socket-server`
3. Save (Railway will redeploy)

### Error: "npm run build failed"

**Cause:** Railway is trying to build Next.js

**Fix:** Same as above - set Root Directory to `socket-server`

### Error: CORS blocked

**Cause:** CLIENT_URL doesn't match Vercel domain

**Fix:**
1. Check your exact Vercel URL (must match exactly)
2. Update CLIENT_URL in Railway variables
3. Wait for redeploy

---

## 🔍 Test Railway Deployment

**Before moving to Vercel, test Railway first:**

1. Open Railway URL in browser
2. Should see: "Socket.io server running ✅"
3. Check logs for "Ready for connections!"

If you see those, Railway is working! ✅

---

## 📱 Contact & Support

See full guide: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

Railway Docs: https://docs.railway.app

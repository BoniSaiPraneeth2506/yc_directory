# Socket.io Server for YC Directory

This is a standalone Socket.io server for real-time chat functionality.

## Why Separate Folder?

Railway (and similar platforms) need a minimal setup that doesn't include Next.js build dependencies. By keeping the Socket.io server in its own folder with its own `package.json`, we avoid build conflicts.

## Structure

```
socket-server/
├── socket-server.js    # Main server file
├── package.json        # Minimal dependencies (only socket.io)
└── README.md          # This file
```

## Environment Variables

Set these in Railway:

```env
PORT=3001                                           # Railway sets this automatically
NODE_ENV=production
CLIENT_URL=https://yc-directory-five-liard.vercel.app   # Your Vercel URL
```

## Deploy to Railway

### Method 1: Via Railway Dashboard

1. Create new project in Railway
2. Connect your GitHub repository
3. **Important:** Set Root Directory to `socket-server`
4. Add environment variables
5. Deploy!

### Method 2: Via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

## Railway Configuration

**Settings → Deploy:**
- Root Directory: `socket-server`
- Build Command: (leave empty, npm install runs automatically)
- Start Command: `npm start` (or `node socket-server.js`)

**Settings → Variables:**
```
PORT=3001
NODE_ENV=production
CLIENT_URL=https://your-vercel-url.vercel.app
```

## Local Testing

```bash
cd socket-server
npm install
PORT=3001 CLIENT_URL=http://localhost:3000 npm start
```

Server runs on: http://localhost:3001

## Dependencies

- **socket.io**: ^4.8.3 (WebSocket server)
- **Node.js**: >=18.0.0

## Features

- ✅ Real-time messaging
- ✅ Online presence tracking
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Multi-room support
- ✅ Auto-reconnection
- ✅ CORS configured for production
- ✅ WebSocket + Polling fallback

## Logs

Railway logs will show:

```
========================================
🚀 Socket.io Server Started
========================================
📡 Port: 3001
🌐 Environment: production
🔒 CORS Origins: https://your-vercel-url.vercel.app
📍 Socket Path: /api/socket/io
🔌 Transports: websocket, polling
========================================
✅ Ready for connections!
========================================
```

When users connect:
```
✅ Socket connected: abc123
👤 User vcIXRH2HhlP3Q4Al9S0yNY joined (socket: abc123)
💬 User joined conversation: LkjVP2EwTYYUkQozwi7sdX
```

## Troubleshooting

**Build fails on Railway:**
- Verify Root Directory is set to `socket-server`
- Check package.json exists in socket-server folder
- View Railway logs for specific error

**CORS errors:**
- Verify CLIENT_URL matches your Vercel domain exactly
- No trailing slash in URL
- Must be HTTPS in production

**Socket won't connect:**
- Check Railway app is running (not sleeping)
- Visit Railway URL directly - should show "Socket.io server running ✅"
- Check browser console for connection errors
- Verify NEXT_PUBLIC_SOCKET_URL is set in Vercel

## Need Help?

View Railway logs:
```bash
railway logs
```

Or check the main [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) for full setup guide.

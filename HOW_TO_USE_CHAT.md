# 🎯 How to Use the Chat System - Step by Step

## You're seeing the empty state - that's NORMAL! 

When you first open the Messages tab, you won't have any conversations yet. Here's how to start chatting:

---

## 📝 **STEP-BY-STEP GUIDE**

### **Step 1: Make Sure You're Logged In**
- Look at the top right corner of your app
- You should see your profile picture/name
- If not logged in, log in first with GitHub

### **Step 2: Go to Messages Tab**
- Click the **Messages icon** (💬) in the bottom navigation
- You should see:
  - "Messages" heading at the top
  - A **search bar** that says "Search users..."
  - Below that: "No messages yet" (this is normal!)

### **Step 3: Search for Another User**
- Click on the **search bar** at the top
- Type someone's name or username (at least 2 characters)
- You'll see a dropdown with matching users

### **Step 4: Start a Conversation**
- Click on any user from the search results
- This will create a new conversation
- You'll be taken to the chat window with that user

### **Step 5: Send Your First Message**
- Type a message in the input box at the bottom
- Press **Enter** to send (Shift+Enter for new line)
- Or click the **image icon** to share a photo
- Or click the **send button**

### **Step 6: See It in Real-Time**
- Open another browser (or incognito window)
- Log in as a different user
- The message will appear instantly!

---

## 🔍 **What You Should See**

### **On Messages Page (`/messages`):**
```
┌─────────────────────────────────┐
│  Messages                       │
│  ┌───────────────────────────┐  │
│  │ 🔍 Search users...        │  │
│  └───────────────────────────┘  │
│                                 │
│      💬                         │
│  No messages yet                │
│  Start a conversation by        │
│  searching for users            │
│                                 │
└─────────────────────────────────┘
```

### **After Searching:**
```
┌─────────────────────────────────┐
│  Messages                       │
│  ┌───────────────────────────┐  │
│  │ 🔍 john                   │  │
│  └───────────────────────────┘  │
│  ┌─────────────────────────────┐│
│  │ 👤 John Doe               ││
│  │    @johndoe               ││
│  ├─────────────────────────────┤│
│  │ 👤 Johnny Smith           ││
│  │    @johnny                ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### **In a Chat Window:**
```
┌─────────────────────────────────┐
│  ← John Doe        ● Active     │
├─────────────────────────────────┤
│                                 │
│                                 │
│  Start the conversation with    │
│  John Doe                       │
│                                 │
│                                 │
├─────────────────────────────────┤
│  📷  Type message...        ➤   │
└─────────────────────────────────┘
```

---

## ❓ **Common Questions**

### **"I don't see any users when I search"**
- Make sure you're searching with at least 2 characters
- Try searching for user names that exist in your database
- Check that other users have been created in your system

### **"How do I test real-time messaging?"**
1. Open Chrome (logged in as User A)
2. Open Firefox or Incognito (logged in as User B)
3. User A searches for and messages User B
4. Watch the message appear instantly for User B!

### **"The search dropdown isn't showing"**
- Type at least 2 characters
- Wait about 300ms (search is debounced)
- Make sure there are users in your Sanity database

### **"I sent a message but don't see it"**
- Check browser console for errors (F12)
- Make sure Socket.io is connected (you should see "Socket connected" in console)
- Verify the server is running: `npm run dev`

---

## 🧪 **Quick Test**

1. **Open your app**: http://localhost:3000
2. **Log in** (make sure you're authenticated)
3. **Click Messages tab** (bottom navigation)
4. **Type in search bar**: Try searching for your own username or another user's name
5. **Click a user** from the results
6. **Send a test message**: Type "Hello!" and press Enter

---

## 💡 **Pro Tips**

- **Enter** sends message, **Shift+Enter** adds new line
- Click **📷 icon** to share images (max 5MB)
- **Green dot** means user is online
- Messages are saved forever in Sanity
- Works on mobile too!

---

## 🔧 **If Something's Wrong**

### **Check Server is Running:**
```bash
npm run dev
```

You should see:
```
> Ready on http://localhost:3000
> Socket.io server running
```

### **Check Browser Console (F12):**
You should see:
```
Socket connected
```

If you see errors, let me know!

---

## 🎯 **Next Steps**

1. **Go to**: http://localhost:3000/messages
2. **Search for a user**
3. **Click to start chatting**
4. **Send your first message!**

The chat system is working perfectly - you just need to start your first conversation! 🚀

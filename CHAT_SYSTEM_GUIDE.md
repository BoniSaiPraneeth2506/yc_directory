# 💬 Real-Time Chat System - Complete Implementation Guide

## 🎉 Overview

A fully functional real-time chat system has been integrated into your YC Directory Next.js application with:

- ✅ **Real-time messaging** using Socket.io
- ✅ **Image sharing** with Cloudinary integration
- ✅ **User search and discovery**
- ✅ **Clean WhatsApp/Instagram-style UI**
- ✅ **Mobile-responsive design**
- ✅ **TypeScript support**
- ✅ **Integration with existing authentication**

---

## 📁 Files Added/Modified

### **New Schema Types (Sanity)**
- `sanityio/schemaTypes/conversation.ts` - Conversation schema
- `sanityio/schemaTypes/message.ts` - Message schema
- `sanityio/schemaTypes/index.ts` - Updated to include new schemas

### **Server Actions**
- `lib/chat-actions.ts` - Server-side chat operations (CRUD)

### **Components**
- `components/ChatList.tsx` - List of conversations
- `components/ChatWindow.tsx` - Individual chat interface
- `components/ChatSearch.tsx` - User search component
- `components/providers/SocketProvider.tsx` - Socket.io context provider
- `components/ClientLayoutWrapper.tsx` - Updated with SocketProvider

### **Hooks**
- `hooks/useDebounce.ts` - Debounce hook for search

### **Server Setup**
- `server.js` - Custom Node.js server with Socket.io
- `app/api/socket/io/route.ts` - Socket.io API endpoint

### **Pages**
- `app/(root)/messages/page.tsx` - Messages list page
- `app/(root)/messages/[id]/page.tsx` - Individual conversation page

### **Queries**
- `sanityio/lib/queries.ts` - Added chat-related GROQ queries

### **Configuration**
- `package.json` - Updated scripts for custom server

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Environment Variables
Make sure you have these in your `.env.local`:
```env
# Existing variables...

# For Socket.io (optional - defaults to localhost:3000 in dev)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Deploy Schema to Sanity
```bash
npx sanity@latest schema deploy
```

### 4. Start Development Server
```bash
npm run dev
```

The custom server will start on `http://localhost:3000` with Socket.io enabled.

---

## 🏗️ Architecture

### **1. Data Model (Sanity)**

#### **Conversation Schema**
```typescript
{
  _type: "conversation",
  participants: [Reference<Author>], // Exactly 2 users
  lastMessage: Reference<Message>,
  lastMessageAt: DateTime,
  createdAt: DateTime
}
```

#### **Message Schema**
```typescript
{
  _type: "message",
  conversation: Reference<Conversation>,
  sender: Reference<Author>,
  content: Text, // Optional - for text messages
  image: { url, alt }, // Optional - for image messages
  readBy: [Reference<Author>],
  createdAt: DateTime
}
```

### **2. Real-Time Communication (Socket.io)**

#### **Events Emitted by Client**
- `join` - User joins their personal room
- `join-conversation` - Join a specific conversation
- `leave-conversation` - Leave a conversation
- `send-message` - Send a new message
- `typing` - Typing indicator
- `mark-read` - Mark messages as read
- `user-online` / `user-offline` - Status updates

#### **Events Received by Client**
- `new-message` - New message in conversation
- `message-notification` - Notification for new message
- `user-typing` - Someone is typing
- `messages-read` - Messages have been read
- `user-status` - User online/offline status

### **3. Components Flow**

```
ClientLayoutWrapper
  └── SocketProvider (provides socket context)
      └── App Components
          ├── ChatList (shows conversations)
          ├── ChatWindow (shows messages)
          └── ChatSearch (find users)
```

---

## 🎨 UI Features

### **Messages Page (/messages)**
- Search bar at the top to find users
- List of conversations with:
  - User avatar and name
  - Last message preview
  - Time since last message
  - Online status indicator (green dot)

### **Chat Window (/messages/[id])**
- Header with:
  - Back button
  - User info and avatar
  - Online status
- Message area with:
  - Scrollable message history
  - WhatsApp-style message bubbles
  - Image previews
  - Timestamps
  - Your messages (blue, right-aligned)
  - Their messages (gray, left-aligned)
- Input area with:
  - Image upload button
  - Text input (supports multiline)
  - Send button
  - Enter to send (Shift+Enter for new line)

### **User Search**
- Debounced search (300ms delay)
- Real-time results dropdown
- Shows user avatar, name, and username
- Click to start conversation

---

## 💡 Key Features Explained

### **1. Real-Time Message Delivery**
Messages are delivered instantly using Socket.io WebSocket connections:
- When you send a message, it's saved to Sanity
- Socket.io broadcasts the message to the recipient
- Recipient sees the message without refreshing

### **2. Image Sharing**
- Click the image icon in the chat input
- Select an image (max 5MB)
- Image is uploaded to Cloudinary
- URL is saved in Sanity with the message
- Images display inline in the chat

### **3. Online Status**
- Green dot indicates user is online
- Uses Socket.io presence system
- Real-time status updates

### **4. Message Read Receipts**
- Messages track which users have read them
- `readBy` array in message schema
- Automatically marked as read when conversation opens

### **5. Conversation Creation**
- Search for a user
- Click to start chatting
- Conversation is created automatically
- Appears in both users' message lists

---

## 🔧 Customization

### **Change Message Bubble Colors**
Edit `components/ChatWindow.tsx`:
```tsx
// Your messages
bg-blue-500 text-white

// Their messages
bg-gray-100 dark:bg-gray-800
```

### **Adjust Image Size Limits**
Edit `components/ChatWindow.tsx`:
```tsx
if (file.size > 5 * 1024 * 1024) { // 5MB
  alert("Image size should be less than 5MB");
  return;
}
```

### **Change Search Debounce Time**
Edit `components/ChatSearch.tsx`:
```tsx
const debouncedQuery = useDebounce(query, 300); // milliseconds
```

---

## 🌐 Production Deployment

### **Vercel Deployment**
⚠️ **Important**: Vercel's serverless functions don't support persistent WebSocket connections.

**Options:**
1. **Use Vercel for main app + separate Socket.io server**
   - Deploy Socket.io server on Railway, Render, or Heroku
   - Point `NEXT_PUBLIC_SOCKET_URL` to your Socket.io server

2. **Deploy entire app to a traditional hosting service**
   - Railway, Render, or DigitalOcean
   - Use the included `server.js`

### **Environment Variables for Production**
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com (if separate)
```

---

## 📱 Mobile Responsive

The chat UI is fully mobile-responsive:
- Touch-friendly message bubbles
- Optimized for small screens
- Bottom navigation aware (no overlap)
- Smooth scrolling on mobile devices

---

## 🐛 Troubleshooting

### **Messages Not Appearing in Real-Time**
- Check browser console for Socket.io connection errors
- Ensure `npm run dev` is using the custom server (not `next dev`)
- Verify Socket.io connection indicator in console

### **Search Not Working**
- Ensure users have `username` field in Sanity
- Check that GROQ query in `SEARCH_USERS_QUERY` matches your schema

### **Images Not Uploading**
- Verify Cloudinary environment variables
- Check upload preset is set to "unsigned"
- Ensure file size is under 5MB

### **Schema Deployment Issues**
```bash
# Force deploy schema
npx sanity@latest schema deploy --force
```

---

## 🎯 Next Steps & Enhancements

### **Ready to Implement:**
1. **Typing Indicators** - Already wired up, needs UI
2. **Message Deletion** - Add delete button
3. **Edit Messages** - Add edit functionality
4. **Group Chats** - Extend participants to > 2
5. **Voice Messages** - Add audio recording
6. **Video Calls** - Integrate WebRTC
7. **Message Reactions** - Add emoji reactions
8. **Push Notifications** - Add browser/mobile notifications

### **Code is Ready For:**
- ✅ Typing indicators (socket events setup)
- ✅ Read receipts (schema and logic ready)
- ✅ Online status (socket events setup)
- ✅ Message timestamps (already displaying)

---

## 📊 Database Queries (GROQ)

### **Get User Conversations**
```groq
*[_type == "conversation" && $userId in participants[]._ref]
| order(lastMessageAt desc) {
  _id,
  participants[]-> { _id, name, image, username },
  lastMessage-> { content, createdAt },
  lastMessageAt
}
```

### **Get Conversation Messages**
```groq
*[_type == "message" && conversation._ref == $conversationId]
| order(createdAt asc) {
  _id,
  content,
  image,
  sender-> { _id, name, image },
  readBy[]-> { _id },
  createdAt
}
```

### **Search Users**
```groq
*[_type == "author" && (name match $search || username match $search)] {
  _id,
  name,
  image,
  username,
  bio
}
```

---

## 🔐 Security Considerations

✅ **Implemented:**
- Server-side authentication checks
- User can only see their own conversations
- Messages validated on server
- File type validation for images
- File size limits

🔄 **Consider Adding:**
- Rate limiting on message sending
- Profanity filter
- Image content moderation
- Block/report functionality

---

## 📖 API Reference

### **Server Actions**

#### `getUserConversations()`
Returns all conversations for the current user.

#### `getOrCreateConversation(otherUserId: string)`
Gets existing conversation or creates a new one.

#### `getMessages(conversationId: string)`
Returns all messages in a conversation.

#### `sendMessage(conversationId: string, content?: string, imageUrl?: string)`
Sends a new message (text and/or image).

#### `markMessagesAsRead(conversationId: string)`
Marks all unread messages as read.

#### `searchUsers(query: string)`
Searches for users by name, username, or email.

---

## 🎓 Learning Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [Sanity.io GROQ Reference](https://www.sanity.io/docs/groq)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)

---

## ✨ Credits

Built with:
- **Next.js 14+** - React framework
- **Socket.io** - Real-time communication
- **Sanity.io** - Content backend
- **Cloudinary** - Image hosting
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure schema is deployed to Sanity
4. Check browser console for errors
5. Verify Socket.io connection

---

**Happy Chatting! 🚀**

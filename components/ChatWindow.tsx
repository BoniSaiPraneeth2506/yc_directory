"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/chat-actions";
import { useSocket } from "./providers/SocketProvider";
import Image from "next/image";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FiSend, FiImage } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";

type Message = {
  _id: string;
  content?: string;
  image?: {
    url: string;
    alt?: string;
  };
  sender: {
    _id: string;
    name: string;
    image: string;
    username: string;
  };
  readBy?: Array<{ _id: string }>;
  createdAt: string;
};

interface ChatWindowProps {
  conversationId: string;
  otherUser: {
    _id: string;
    name: string;
    image: string;
    username: string;
  };
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  otherUser,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    console.log("📬 Loading messages for conversation:", conversationId);
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    if (socket && conversationId) {
      console.log("🔗 ChatWindow: Joining conversation room:", conversationId);
      console.log("   Socket ID:", socket.id, "| Connected:", socket.connected);
      socket.emit("join-conversation", conversationId);

      // Handler for receiving new messages
      const handleNewMessage = (message: Message) => {
        console.log("📨 ChatWindow: Received new-message event");
        console.log("   Message ID:", message._id);
        console.log("   Message Type:", message.content ? "text" : "image");
        console.log("   From:", message.sender._id);
        console.log("   Image URL:", message.image?.url);
        console.log("   Current user:", currentUserId);
        
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m._id === message._id)) {
            console.log("⚠️ DUPLICATE: Message already exists in state, skipping");
            return prev;
          }
          console.log("✅ NEW: Adding message to state");
          return [...prev, message];
        });
        
        setTimeout(scrollToBottom, 100);
        
        // Mark as read if message is from other user
        if (message.sender._id !== currentUserId) {
          console.log("👁️ Message from other user, marking as read");
          markAsReadAsync();
        } else {
          console.log("📤 Message from current user, not marking as read");
        }
      };

      // Handler for typing indicators
      const handleUserTyping = ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
        if (userId === otherUser._id) {
          console.log("⌨️ Other user typing status:", typing);
          setOtherUserTyping(typing);
        }
      };

      // Handler for read receipts
      const handleMessagesRead = ({ userId, conversationId: readConvId }: { userId: string; conversationId: string }) => {
        console.log("✅ Messages marked as read by:", userId, "in conversation:", readConvId);
        if (userId === otherUser._id && readConvId === conversationId) {
          setMessages(prev => 
            prev.map(msg => {
              if (msg.sender._id === currentUserId && !msg.readBy?.some(reader => reader._id === otherUser._id)) {
                console.log("✅ Updating read status for message:", msg._id);
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { _id: otherUser._id }]
                };
              }
              return msg;
            })
          );
        }
      };

      socket.on("new-message", handleNewMessage);
      socket.on("user-typing", handleUserTyping);
      socket.on("messages-read", handleMessagesRead);

      return () => {
        console.log("🔌 Leaving conversation room:", conversationId);
        socket.emit("leave-conversation", conversationId);
        socket.off("new-message", handleNewMessage);
        socket.off("user-typing", handleUserTyping);
        socket.off("messages-read", handleMessagesRead);
      };
    }
  }, [socket, conversationId, currentUserId, otherUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      // handleMarkAsRead is called in a separate useEffect
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit("typing", {
        conversationId,
        userId: currentUserId,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit("typing", {
        conversationId,
        userId: currentUserId,
        isTyping: false,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const markAsReadAsync = async () => {
    try {
      await markMessagesAsRead(conversationId);
      
      if (socket && socket.connected) {
        socket.emit("mark-read", {
          conversationId,
          userId: currentUserId,
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    // Mark messages as read when component mounts
    if (conversationId) {
      markAsReadAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Stop typing indicator
    handleStopTyping();

    try {
      console.log("📤 ChatWindow: Sending message...");
      console.log("   Content:", messageText.substring(0, 20) + "...");
      console.log("   Conversation ID:", conversationId);
      console.log("   Recipient ID:", otherUser._id);
      
      const message = await sendMessage(conversationId, messageText);
      console.log("✅ ChatWindow: Message saved to database");
      console.log("   Message ID:", message._id);
      console.log("   Created At:", message.createdAt);
      
      // Add message to local state immediately
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (prev.some(m => m._id === message._id)) {
          console.log("⚠️ Message already in state, skipping local add");
          return prev;
        }
        console.log("✅ Adding message to local state immediately");
        return [...prev, message];
      });

      // Emit via socket for real-time delivery
      if (socket && socket.connected) {
        console.log("📡 ChatWindow: Broadcasting via socket");
        console.log("   Socket ID:", socket.id);
        console.log("   Socket connected:", socket.connected);
        console.log("   Sending to conversation:", conversationId);
        console.log("   Notifying recipient:", otherUser._id);
        
        socket.emit("send-message", {
          conversationId,
        message,
          recipientId: otherUser._id,
        });
        console.log("✅ Socket emit completed");
      } else {
        console.warn("⚠️ SOCKET NOT CONNECTED!");
        console.warn("   Socket exists:", !!socket);
        console.warn("   Socket connected:", socket?.connected);
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ ChatWindow: Error sending message:", error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      console.log("📤 Uploading image...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const imageUrl = data.secure_url;

      console.log("✅ Image uploaded:", imageUrl);

      // Send message with image
      const message = await sendMessage(conversationId, undefined, imageUrl);
      console.log("✅ Image message saved to database:", message._id);
      
      // Add message to local state
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Emit via socket
      if (socket && socket.connected) {
        console.log("📡 Broadcasting image message via socket");
        socket.emit("send-message", {
          conversationId,
          message,
          recipientId: otherUser._id,
        });
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd, yyyy");
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, previousMsg?: Message) => {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.createdAt);
    const previousDate = new Date(previousMsg.createdAt);
    
    return !isSameDay(currentDate, previousDate);
  };

  const getMessageStatus = (message: Message) => {
    const isOwn = message.sender._id === currentUserId;
    if (!isOwn) return null;
    
    const isRead = message.readBy?.some(reader => reader._id !== currentUserId);
    
    return isRead ? "seen" : "delivered";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white-100" style={{paddingBottom: '72px'}}>
      {/* Messages - Only this scrolls */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 mb-6 text-black-200 bg-white rounded-full p-5 shadow-100">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-16-semibold text-black-300 mb-2">
              Start the conversation
            </p>
            <p className="text-14-normal text-black-200">
              Say hi to {otherUser.name}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender._id === currentUserId;
            const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);
            const messageStatus = getMessageStatus(message);
            
            return (
              <div key={message._id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs text-gray-600 font-medium">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                )}
                
                {/* Message */}
                <div className={`flex gap-3 mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {!isOwn && (
                      <Image
                        src={message.sender.image || "/placeholder-user.png"}
                        alt={message.sender.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover self-end flex-shrink-0"
                      />
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`rounded-2xl px-3 py-2 ${isOwn
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }`}
                      >
                        {message.image && (
                          <Image
                            src={message.image.url}
                            alt={message.image.alt || "Shared image"}
                            width={250}
                            height={250}
                            className="rounded-xl mb-2"
                          />
                        )}
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed mb-1">
                            {message.content}
                          </p>
                        )}
                        
                        {/* Message time and status inside bubble */}
                        <div className={`flex items-center gap-1 justify-end ${isOwn ? "text-white/70" : "text-gray-500"}`}>
                          <span className="text-xs">
                            {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                          {isOwn && messageStatus && (
                            <div className="flex items-center ml-1">
                              {messageStatus === "seen" ? (
                                <BsCheckAll className={`w-3.5 h-3.5 ${isOwn ? "text-white/80" : "text-blue-500"}`} />
                              ) : (
                                <BsCheck className={`w-3.5 h-3.5 ${isOwn ? "text-white/60" : "text-gray-400"}`} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex items-end mb-3 px-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at very bottom of device */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 z-20">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {/* All-in-one input bar */}
          <div className="flex items-center gap-2 border-2 border-primary rounded-full px-3 py-1.5 bg-white">
            {/* Gallery icon */}
            <button
              type="button"
              onClick={handleImageClick}
              disabled={uploadingImage || sending}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-primary-100 transition-all disabled:opacity-50"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              ) : (
                <FiImage className="w-5 h-5 text-primary" />
              )}
            </button>

            {/* Text input */}
            <Textarea
              value={newMessage}
              onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              className="flex-1 min-h-[32px] max-h-[80px] resize-none bg-transparent border-none shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none text-sm text-gray-900 placeholder-gray-400 px-1 py-1"
              rows={1}
              disabled={uploadingImage}
            />

            {/* Send button */}
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || uploadingImage}
              size="icon"
              className="rounded-full w-9 h-9 flex-shrink-0 bg-primary hover:bg-primary/90 transition-all disabled:opacity-40"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              ) : (
                <FiSend className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

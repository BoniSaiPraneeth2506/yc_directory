// Chat Type Definitions

export interface User {
  _id: string;
  name: string;
  image: string;
  username: string;
  bio?: string;
}

export interface Message {
  _id: string;
  content?: string;
  image?: {
    url: string;
    alt?: string;
  };
  sender: User;
  readBy?: Array<{ _id: string }>;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: {
    _id: string;
    content?: string;
    image?: {
      url: string;
      alt?: string;
    };
    createdAt: string;
    sender: {
      _id: string;
      name: string;
    };
  };
  lastMessageAt?: string;
  createdAt: string;
}

export interface SocketEvents {
  // Client -> Server
  join: (userId: string) => void;
  "join-conversation": (conversationId: string) => void;
  "leave-conversation": (conversationId: string) => void;
  "send-message": (data: {
    conversationId: string;
    message: Message;
    recipientId: string;
  }) => void;
  typing: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  "mark-read": (data: { conversationId: string; userId: string }) => void;
  "user-online": (userId: string) => void;
  "user-offline": (userId: string) => void;

  // Server -> Client
  "new-message": (message: Message) => void;
  "message-notification": (data: {
    conversationId: string;
    message: Message;
  }) => void;
  "user-typing": (data: { userId: string; isTyping: boolean }) => void;
  "messages-read": (data: { userId: string }) => void;
  "user-status": (data: { userId: string; online: boolean }) => void;
}

export interface ChatActions {
  getUserConversations: () => Promise<Conversation[]>;
  getOrCreateConversation: (otherUserId: string) => Promise<Conversation>;
  getMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (
    conversationId: string,
    content?: string,
    imageUrl?: string
  ) => Promise<Message>;
  markMessagesAsRead: (conversationId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
}

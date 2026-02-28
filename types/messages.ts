export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  createdAt: Date;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  propertyId?: string;
  propertyAddress?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  messages: Message[];
}

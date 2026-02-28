export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  createdAt: Date | string;
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
  lastMessageAt: Date | string;
  unreadCount: number;
  messages: Message[];
}

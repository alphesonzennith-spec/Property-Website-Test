export type NotificationType =
  | 'new_message'
  | 'enquiry_reply'
  | 'price_drop'
  | 'listing_status'
  | 'verification_update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  isRead: boolean;
  createdAt: Date;
  propertyId?: string;
  propertyAddress?: string;
  senderName?: string;
  senderAvatar?: string;
}

import type { Notification } from '@/types/notifications';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'new_message',
    title: 'New message from Wei Liang',
    body: 'Is the unit still available for viewing this weekend?',
    href: '/messages',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    senderName: 'Wei Liang Tan',
    senderAvatar: undefined,
    propertyAddress: '38 Amber Road #08-12',
  },
  {
    id: 'notif-2',
    type: 'price_drop',
    title: 'Price drop — D15 Condo',
    body: 'Amber Gardens dropped S$50,000 → now listed at S$1.85M',
    href: '/properties/amber-gardens-d15',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hr ago
    propertyId: 'amber-gardens-d15',
    propertyAddress: '38 Amber Road #08-12',
  },
  {
    id: 'notif-3',
    type: 'listing_status',
    title: 'Listing approved',
    body: 'Your listing at Tampines Avenue 1 has been approved and is now live.',
    href: '/dashboard/listings',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hrs ago
    propertyAddress: '120 Tampines Avenue 1 #05-88',
  },
  {
    id: 'notif-4',
    type: 'enquiry_reply',
    title: 'Reply from PropNex agent',
    body: 'Thank you for your enquiry. I can arrange a viewing on Saturday at 2pm.',
    href: '/messages',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hrs ago
    senderName: 'Marcus Lim (PropNex)',
    propertyAddress: '10 Pasir Ris Drive 3 #12-05',
  },
  {
    id: 'notif-5',
    type: 'verification_update',
    title: 'Singpass verification complete',
    body: 'Your identity has been verified. You can now access all agent features.',
    href: '/dashboard/profile',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'notif-6',
    type: 'price_drop',
    title: 'Price drop — Bishan HDB',
    body: 'Block 283 Bishan Street 22 dropped S$15,000 → now S$680K',
    href: '/properties/bishan-hdb-283',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    propertyId: 'bishan-hdb-283',
    propertyAddress: '283 Bishan Street 22 #07-111',
  },
  {
    id: 'notif-7',
    type: 'listing_status',
    title: 'Listing under review',
    body: 'Your listing at Jurong West Street 64 is being reviewed. Expected 1–2 business days.',
    href: '/dashboard/listings',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    propertyAddress: '651A Jurong West Street 64 #03-22',
  },
  {
    id: 'notif-8',
    type: 'enquiry_reply',
    title: 'New enquiry on your listing',
    body: 'Sarah Tan has sent an enquiry about your Woodlands property.',
    href: '/messages',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    senderName: 'Sarah Tan',
    propertyAddress: '15 Woodlands Drive 72 #11-03',
  },
];

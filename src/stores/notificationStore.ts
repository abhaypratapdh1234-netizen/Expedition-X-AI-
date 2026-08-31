import { create } from 'zustand'

interface Notification {
  id: string
  type: 'booking' | 'trip' | 'promo' | 'referral' | 'system' | 'weather_alert' | 'scam_alert' | 'sos' | 'offline_pack' | 'challenge' | 'capsule_unlock'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
  icon?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Notification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  setNotifications: (ns: Notification[]) => void
  pushNotification: (type: Notification['type'], title: string, message: string, link?: string, icon?: string) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed!',
      message: 'Your hotel at The Grand Palace, Delhi is confirmed for Jul 20-22.',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/app/book/hotels',
    },
    {
      id: '2',
      type: 'promo',
      title: 'Price Drop Alert 🎉',
      message: 'Hotels in Manali dropped 23% — your wishlist item got cheaper!',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      link: '/app/explore/search?q=Manali',
    },
    {
      id: '3',
      type: 'trip',
      title: 'Trip Reminder',
      message: 'Your trip to Goa starts in 3 days. Review your itinerary!',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      link: '/app/planner/workspace',
    },
    {
      id: '4',
      type: 'weather_alert',
      title: '☁️ Weather Alert — Plan B Ready',
      message: 'Heavy rain forecast for Goa Day 2. Indoor alternatives suggested in your trip plan.',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      link: '/app/planner/workspace',
      icon: '☁️',
    },
    {
      id: '5',
      type: 'scam_alert',
      title: '⚠️ New Scam Warning — Goa',
      message: 'Community reported: Overcharging at Calangute Beach water sports. Tap for details.',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      link: '/app/planner/workspace',
      icon: '⚠️',
    },
  ],
  unreadCount: 4,
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),
  markRead: (id) =>
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id);
      if (!notif || notif.read) return s;
      return {
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setNotifications: (ns) =>
    set({ notifications: ns, unreadCount: ns.filter((n) => !n.read).length }),
  pushNotification: (type, title, message, link, icon) =>
    set((s) => {
      const n: Notification = {
        id: `notif-${Date.now()}`,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        link,
        icon,
      }
      return { notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 }
    }),
}))

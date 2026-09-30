import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
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
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (n) =>
        set((s) => ({
          notifications: [n, ...s.notifications].slice(0, 100), // cap at 100
          unreadCount: s.unreadCount + (n.read ? 0 : 1),
        })),

      markRead: (id) =>
        set((s) => {
          const notif = s.notifications.find((n) => n.id === id)
          if (!notif || notif.read) return s
          return {
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, s.unreadCount - 1),
          }
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
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type,
            title,
            message,
            read: false,
            createdAt: new Date().toISOString(),
            link,
            icon,
          }
          return {
            notifications: [n, ...s.notifications].slice(0, 100),
            unreadCount: s.unreadCount + 1,
          }
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'expeditionx-notifications',
      // Only persist the notification list, not functions
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)

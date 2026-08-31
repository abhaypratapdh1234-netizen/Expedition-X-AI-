import { create } from 'zustand'
import type { ExplicitDNASliders } from '../services/intelligenceService'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  explorerLevel: number
  xp: number
  preferences?: {
    interests: string[]
    budgetRange: [number, number]
    travelStyle: string
    dnaSliders?: Partial<ExplicitDNASliders>
  }
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isOnboarded: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  deleteAccount: () => void
  setOnboarded: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarded: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      deleteAccount: () => {
        // Full wipe
        localStorage.clear()
        set({ user: null, token: null, isAuthenticated: false, isOnboarded: false })
      },
      setOnboarded: () => set({ isOnboarded: true }),
    }),
    { name: 'expeditionx-auth' }
  )
)

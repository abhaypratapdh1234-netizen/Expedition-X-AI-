import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  currency: string
  language: string
  setCurrency: (c: string) => void
  setLanguage: (l: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      currency: 'INR',
      language: 'English',
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language })
    }),
    { name: 'expeditionx-settings' }
  )
)

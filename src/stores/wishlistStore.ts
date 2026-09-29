import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { socialService } from '../services/socialService'
import type { FlightData } from '../services/flightService'

export interface SavedFlightItem {
  id: string
  flight: FlightData
  savedAt: string
}

export function getFlightKey(f: FlightData): string {
  const code = f.flight?.iata || f.flight?.number || 'FLT'
  const dep = f.departure?.iata || 'DEP'
  const arr = f.arrival?.iata || 'ARR'
  const date = f.flightDate || (f.departure?.scheduled ? f.departure.scheduled.split('T')[0] : '')
  return `${code}-${dep}-${arr}${date ? `-${date}` : ''}`
}

interface WishlistState {
  savedPlaceIds: string[]
  savedFlights: SavedFlightItem[]
  isLoading: boolean
  
  fetchWishlist: () => Promise<void>
  toggleSaved: (placeId: string) => Promise<boolean>
  
  // Flight wishlist actions
  saveFlight: (flight: FlightData) => void
  removeFlight: (keyOrId: string) => void
  toggleFlight: (flight: FlightData) => boolean
  isFlightSaved: (flight: FlightData) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedPlaceIds: [],
      savedFlights: [],
      isLoading: false,
      
      fetchWishlist: async () => {
        set({ isLoading: true })
        try {
          const list = await socialService.getWishlist()
          set({ savedPlaceIds: list, isLoading: false })
        } catch (e) {
          set({ isLoading: false })
        }
      },
      
      toggleSaved: async (placeId: string) => {
        // Optimistic
        const current = get().savedPlaceIds
        const isSaved = current.includes(placeId)
        set({ 
          savedPlaceIds: isSaved 
            ? current.filter(id => id !== placeId) 
            : [...current, placeId] 
        })
        
        // Real call
        const result = await socialService.toggleWishlist(placeId)
        return result
      },

      saveFlight: (flight: FlightData) => {
        const key = getFlightKey(flight)
        const current = get().savedFlights || []
        if (current.some(item => item.id === key)) return
        const newItem: SavedFlightItem = {
          id: key,
          flight,
          savedAt: new Date().toISOString()
        }
        set({ savedFlights: [newItem, ...current] })
      },

      removeFlight: (keyOrId: string) => {
        const current = get().savedFlights || []
        set({ savedFlights: current.filter(item => item.id !== keyOrId) })
      },

      toggleFlight: (flight: FlightData) => {
        const key = getFlightKey(flight)
        const current = get().savedFlights || []
        const exists = current.some(item => item.id === key)
        if (exists) {
          set({ savedFlights: current.filter(item => item.id !== key) })
          return false
        } else {
          const newItem: SavedFlightItem = {
            id: key,
            flight,
            savedAt: new Date().toISOString()
          }
          set({ savedFlights: [newItem, ...current] })
          return true
        }
      },

      isFlightSaved: (flight: FlightData) => {
        const key = getFlightKey(flight)
        const current = get().savedFlights || []
        return current.some(item => item.id === key)
      }
    }),
    {
      name: 'expeditionx-wishlist',
      partialize: (state) => ({ savedFlights: state.savedFlights, savedPlaceIds: state.savedPlaceIds })
    }
  )
)

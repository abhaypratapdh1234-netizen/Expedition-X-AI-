import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tripService } from '../services/tripService'
import type { Trip, DayPlan, ItineraryItem } from '../services/tripService'

interface TripState {
  trips: Trip[]
  currentTrip: Trip | null
  deletedTripIds: string[]
  isLoading: boolean
  
  fetchUserTrips: () => Promise<void>
  fetchTripById: (id: string) => Promise<void>
  updateItinerary: (tripId: string, newItinerary: DayPlan[]) => Promise<void>
  optimizeDay: (tripId: string, dayIndex: number, items: ItineraryItem[]) => Promise<void>
  setNewTrip: (trip: Trip) => void
  deleteTrip: (tripId: string) => void
  toggleFavorite: (tripId: string) => void
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      deletedTripIds: [],
      isLoading: false,
      
      fetchUserTrips: async () => {
        set({ isLoading: true })
        try {
          const serverTrips = await tripService.getUserTrips()
          const currentStoredTrips = get().trips || []
          const deletedSet = new Set(get().deletedTripIds || [])
          
          const tripMap = new Map<string, Trip>()

          // 1. Populate with server trips (excluding user-deleted ones)
          if (Array.isArray(serverTrips)) {
            serverTrips.forEach(t => {
              if (!deletedSet.has(t.id)) {
                tripMap.set(t.id, t)
              }
            })
          }

          // 2. Overlay existing stored trips (keeps user-created trips, modified fields, favorite states)
          currentStoredTrips.forEach(t => {
            if (!deletedSet.has(t.id)) {
              const existing = tripMap.get(t.id)
              if (existing) {
                tripMap.set(t.id, { ...existing, ...t })
              } else {
                tripMap.set(t.id, t)
              }
            }
          })

          // 3. Sort by newest creation date first
          const allTrips = Array.from(tripMap.values()).sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return timeB - timeA
          })

          set({ trips: allTrips, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },
      
      fetchTripById: async (id: string) => {
        set({ isLoading: true })
        try {
          // Check local trips first
          const localTrip = (get().trips || []).find(t => t.id === id)
          if (localTrip) {
            set({ currentTrip: localTrip, isLoading: false })
            return
          }
          const trip = await tripService.getTripById(id)
          set({ currentTrip: trip, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },
      
      updateItinerary: async (tripId: string, newItinerary: DayPlan[]) => {
        // Optimistic update
        const prevTrip = get().currentTrip
        if (prevTrip && prevTrip.id === tripId) {
          const updatedTrip = { ...prevTrip, itinerary: newItinerary }
          const updatedList = (get().trips || []).map(t => t.id === tripId ? updatedTrip : t)
          set({ currentTrip: updatedTrip, trips: updatedList })
        }
        
        await tripService.saveItinerary(tripId, newItinerary)
      },
      
      optimizeDay: async (tripId: string, dayIndex: number, items: ItineraryItem[]) => {
        const current = get().currentTrip
        if (!current || !current.itinerary) return
        
        // Call service to optimize
        const optimizedItems = await tripService.optimizeRoute(tripId, current.itinerary[dayIndex].day, items)
        
        // Apply
        const newItin = [...current.itinerary]
        newItin[dayIndex] = { ...newItin[dayIndex], items: optimizedItems }
        
        await get().updateItinerary(tripId, newItin)
      },

      setNewTrip: (trip: Trip) => {
        const existing = (get().trips || []).filter(t => t.id !== trip.id)
        const newTrip: Trip = {
          ...trip,
          createdAt: trip.createdAt || new Date().toISOString(),
          isFavorite: trip.isFavorite ?? false
        }
        const updatedDeleted = (get().deletedTripIds || []).filter(id => id !== trip.id)
        set({ 
          currentTrip: newTrip, 
          trips: [newTrip, ...existing],
          deletedTripIds: updatedDeleted
        })
      },

      deleteTrip: (tripId: string) => {
        const remaining = (get().trips || []).filter(t => t.id !== tripId)
        const deleted = [...(get().deletedTripIds || []), tripId]
        const current = get().currentTrip
        set({
          trips: remaining,
          currentTrip: current?.id === tripId ? null : current,
          deletedTripIds: deleted
        })
      },

      toggleFavorite: (tripId: string) => {
        const updated = (get().trips || []).map(t => 
          t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t
        )
        const current = get().currentTrip
        set({
          trips: updated,
          currentTrip: current?.id === tripId ? { ...current, isFavorite: !current.isFavorite } : current
        })
      }
    }),
    {
      name: 'expedition-trip-storage',
      partialize: (state) => ({ 
        currentTrip: state.currentTrip, 
        trips: state.trips,
        deletedTripIds: state.deletedTripIds
      }),
    }
  )
)

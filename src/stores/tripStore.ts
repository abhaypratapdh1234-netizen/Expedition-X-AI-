import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tripService } from '../services/tripService'
import type { Trip, DayPlan, ItineraryItem } from '../services/tripService'

interface TripState {
  trips: Trip[]
  currentTrip: Trip | null
  isLoading: boolean
  
  fetchUserTrips: () => Promise<void>
  fetchTripById: (id: string) => Promise<void>
  updateItinerary: (tripId: string, newItinerary: DayPlan[]) => Promise<void>
  optimizeDay: (tripId: string, dayIndex: number, items: ItineraryItem[]) => Promise<void>
  setNewTrip: (trip: Trip) => void
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  
  fetchUserTrips: async () => {
    set({ isLoading: true })
    const trips = await tripService.getUserTrips()
    set({ trips, isLoading: false })
  },
  
  fetchTripById: async (id: string) => {
    set({ isLoading: true })
    try {
      const trip = await tripService.getTripById(id)
      set({ currentTrip: trip, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
    }
  },
  
  updateItinerary: async (tripId: string, newItinerary: DayPlan[]) => {
    // Optimistic update
    const prevTrip = get().currentTrip
    if (prevTrip && prevTrip.id === tripId) {
      set({ currentTrip: { ...prevTrip, itinerary: newItinerary } })
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
    set({ currentTrip: trip, trips: [...get().trips, trip] })
  }
    }),
    {
      name: 'expedition-trip-storage',
      partialize: (state) => ({ currentTrip: state.currentTrip, trips: state.trips }),
    }
  )
)

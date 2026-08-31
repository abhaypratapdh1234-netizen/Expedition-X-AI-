import { create } from 'zustand'
import { bookingService } from '../services/bookingService'
import type { BookingFilters } from '../services/bookingService'

interface BookingState {
  hotels: any[]
  isSearching: boolean
  myBookings: any[]
  isLoadingBookings: boolean
  
  searchHotels: (filters: BookingFilters) => Promise<void>
  fetchMyBookings: () => Promise<void>
  cancelBooking: (id: string) => Promise<void>
}

export const useBookingStore = create<BookingState>((set) => ({
  hotels: [],
  isSearching: false,
  myBookings: [],
  isLoadingBookings: false,
  
  searchHotels: async (filters) => {
    set({ isSearching: true })
    try {
      const results = await bookingService.searchHotels(filters)
      set({ hotels: results, isSearching: false })
    } catch (e) {
      set({ isSearching: false })
    }
  },
  
  fetchMyBookings: async () => {
    set({ isLoadingBookings: true })
    try {
      const bookings = await bookingService.getUserBookings()
      set({ myBookings: bookings, isLoadingBookings: false })
    } catch (e) {
      set({ isLoadingBookings: false })
    }
  },
  
  cancelBooking: async (id: string) => {
    set((state) => ({
      myBookings: state.myBookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    }))
    // In real app, call bookingService.cancelBooking(id)
  }
}))

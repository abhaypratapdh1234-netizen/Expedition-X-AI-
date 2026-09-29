import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bookingService } from '../services/bookingService'
import type { BookingFilters } from '../services/bookingService'

export interface BookingRecord {
  id: string
  type: 'hotel' | 'flight' | 'ticket'
  itemName: string
  referenceName?: string
  city?: string
  location?: string
  date: string
  checkInDate?: string
  checkOutDate?: string
  totalPrice: number
  amount?: number
  status: 'upcoming' | 'past' | 'cancelled'
  guests?: number
  eTicketCode?: string
  airline?: string
}

export const DEFAULT_LIFETIME_BOOKINGS: BookingRecord[] = [
  {
    id: 'BK-10842',
    type: 'hotel',
    itemName: 'The Lodhi, New Delhi',
    referenceName: 'The Lodhi, New Delhi',
    city: 'Delhi',
    location: 'Lodhi Road, New Delhi',
    date: '2026-08-10',
    checkInDate: '2026-08-10',
    checkOutDate: '2026-08-13',
    totalPrice: 12500,
    amount: 12500,
    status: 'past',
    guests: 2,
    eTicketCode: 'EXP-DEL-10842',
  },
  {
    id: 'BK-10843',
    type: 'ticket',
    itemName: 'Red Fort Heritage Pass',
    referenceName: 'Red Fort Heritage Pass',
    city: 'Delhi',
    location: 'Netaji Subhash Marg, Chandni Chowk, Delhi',
    date: '2026-08-11',
    checkInDate: '2026-08-11',
    checkOutDate: '2026-08-11',
    totalPrice: 50,
    amount: 50,
    status: 'past',
    guests: 2,
    eTicketCode: 'EXP-TKT-10843',
  },
  {
    id: 'BK-11490',
    type: 'hotel',
    itemName: 'Oberoi Amarvilas, Agra',
    referenceName: 'Oberoi Amarvilas, Agra',
    city: 'Agra',
    location: 'Taj East Gate Road, Agra',
    date: '2026-10-15',
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-18',
    totalPrice: 22000,
    amount: 22000,
    status: 'upcoming',
    guests: 2,
    eTicketCode: 'EXP-AGR-11490',
  },
  {
    id: 'BK-11491',
    type: 'ticket',
    itemName: 'Taj Mahal Sunrise Experience',
    referenceName: 'Taj Mahal Sunrise Experience',
    city: 'Agra',
    location: 'Dharmapuri, Forest Colony, Tajganj, Agra',
    date: '2026-10-16',
    checkInDate: '2026-10-16',
    checkOutDate: '2026-10-16',
    totalPrice: 250,
    amount: 250,
    status: 'upcoming',
    guests: 2,
    eTicketCode: 'EXP-TKT-11491',
  },
  {
    id: 'BK-09210',
    type: 'hotel',
    itemName: 'Zostel Manali',
    referenceName: 'Zostel Manali',
    city: 'Manali',
    location: 'Old Manali, Himachal Pradesh',
    date: '2026-05-18',
    checkInDate: '2026-05-18',
    checkOutDate: '2026-05-21',
    totalPrice: 1600,
    amount: 1600,
    status: 'cancelled',
    guests: 1,
    eTicketCode: 'EXP-MNL-09210',
  },
]

interface BookingState {
  hotels: any[]
  isSearching: boolean
  myBookings: BookingRecord[]
  isLoadingBookings: boolean
  
  searchHotels: (filters: BookingFilters) => Promise<void>
  fetchMyBookings: () => Promise<void>
  addBooking: (booking: BookingRecord) => void
  cancelBooking: (id: string) => Promise<void>
  deleteBooking: (id: string) => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      hotels: [],
      isSearching: false,
      myBookings: DEFAULT_LIFETIME_BOOKINGS,
      isLoadingBookings: false,
      
      searchHotels: async (filters) => {
        set({ isSearching: true })
        try {
          const results = await bookingService.searchHotels(filters)
          set({ hotels: results, isSearching: false })
        } catch {
          set({ isSearching: false })
        }
      },
      
      fetchMyBookings: async () => {
        set({ isLoadingBookings: true })
        try {
          const serverBookings = await bookingService.getUserBookings()
          const currentStored = get().myBookings || []
          
          const bookingMap = new Map<string, BookingRecord>()
          
          // 1. Load initial lifetime defaults if empty, otherwise retain stored bookings
          const baseBookings = currentStored.length > 0 ? currentStored : DEFAULT_LIFETIME_BOOKINGS
          baseBookings.forEach(b => bookingMap.set(String(b.id), b))
          
          // 2. Overlay server bookings if returned from backend
          if (Array.isArray(serverBookings) && serverBookings.length > 0) {
            serverBookings.forEach((sb: any) => {
              const id = String(sb.id)
              const existing = bookingMap.get(id)
              const normalized: BookingRecord = {
                id,
                type: (sb.type || existing?.type || 'hotel').toLowerCase() as any,
                itemName: sb.referenceName || sb.itemName || existing?.itemName || 'Reservation',
                referenceName: sb.referenceName || existing?.referenceName,
                city: sb.city || existing?.city,
                location: sb.location || existing?.location,
                date: sb.bookingDate || sb.checkInDate || sb.date || existing?.date || new Date().toISOString().split('T')[0],
                checkInDate: sb.checkInDate || existing?.checkInDate,
                checkOutDate: sb.checkOutDate || existing?.checkOutDate,
                totalPrice: sb.amount || sb.totalPrice || existing?.totalPrice || 0,
                amount: sb.amount || existing?.amount,
                status: (sb.status ? sb.status.toLowerCase() : existing?.status || 'upcoming') as any,
                guests: sb.guests || existing?.guests || 1,
                eTicketCode: sb.eTicketCode || existing?.eTicketCode,
              }
              bookingMap.set(id, normalized)
            })
          }
          
          set({ myBookings: Array.from(bookingMap.values()), isLoadingBookings: false })
        } catch {
          if ((get().myBookings || []).length === 0) {
            set({ myBookings: DEFAULT_LIFETIME_BOOKINGS, isLoadingBookings: false })
          } else {
            set({ isLoadingBookings: false })
          }
        }
      },
      
      addBooking: (booking: BookingRecord) => {
        set((state) => ({
          myBookings: [booking, ...state.myBookings.filter(b => String(b.id) !== String(booking.id))]
        }))
      },

      cancelBooking: async (id: string) => {
        set((state) => ({
          myBookings: state.myBookings.map(b => String(b.id) === String(id) ? { ...b, status: 'cancelled' } : b)
        }))
      },

      deleteBooking: (id: string) => {
        set((state) => ({
          myBookings: state.myBookings.filter(b => String(b.id) !== String(id))
        }))
      }
    }),
    {
      name: 'expedition-booking-storage',
      partialize: (state) => ({ myBookings: state.myBookings }),
    }
  )
)

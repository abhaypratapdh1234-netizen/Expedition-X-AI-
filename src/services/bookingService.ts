import { apiClient } from './apiClient'

export interface BookingFilters {
  location?: string
  minRating?: number
  maxPrice?: number
  category?: string
}

export const bookingService = {
  async searchHotels(filters: BookingFilters) {
    try {
      // Return mock data for now to fix the blank screen issue
      return [
        {
          id: '1',
          name: 'The Imperial Delhi',
          location: 'Delhi',
          pricePerNight: 8500,
          rating: 4.8,
          reviews: 450,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          category: 'Luxury',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym']
        },
        {
          id: '2',
          name: 'Hotel Palace Heights',
          location: 'Delhi',
          pricePerNight: 3200,
          rating: 4.2,
          reviews: 320,
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          category: 'Business',
          amenities: ['WiFi', 'Restaurant', 'Room Service']
        }
      ]
    } catch (error) {
      console.error(error)
      return []
    }
  },

  async searchFlights(from: string, to: string, date: string) {
    // The backend does not have a flight search endpoint explicitly (only booking ticket). 
    // We'll return mock data here to prevent the UI from breaking until the backend adds this endpoint.
    return [
      { id: 'f1', airline: 'IndiGo', from, to, departure: '08:00 AM', arrival: '10:30 AM', price: 4500, duration: '2h 30m', type: 'Direct' },
      { id: 'f2', airline: 'Air India', from, to, departure: '14:15 PM', arrival: '16:50 PM', price: 5200, duration: '2h 35m', type: 'Direct' },
      { id: 'f3', airline: 'Vistara', from, to, departure: '19:30 PM', arrival: '21:45 PM', price: 6100, duration: '2h 15m', type: 'Direct' },
    ]
  },

  async getAvailableSlots(attractionId: string, date: string) {
    // Backend doesn't have an endpoint for available slots.
    return [
      { time: '09:00 AM', available: true, price: 50 },
      { time: '11:00 AM', available: false, price: 50 },
      { time: '02:00 PM', available: true, price: 50 },
      { time: '04:00 PM', available: true, price: 50 }
    ]
  },

  async processCheckout(payload: any) {
    try {
      const response = await apiClient.post<any>('/payments/checkout', payload)
      return { success: true, bookingId: response.bookingId || response.id }
    } catch (error) {
      console.error('Checkout failed:', error)
      return { success: false, bookingId: null }
    }
  },

  async getUserBookings() {
    try {
      return await apiClient.get<any[]>('/bookings')
    } catch (error) {
      console.error('Error fetching bookings, falling back to mock:', error)
      return []
    }
  },
  
  async getInvoiceUrl(bookingId: string) {
    try {
      const response = await apiClient.get<any>(`/bookings/${bookingId}/invoice`)
      return response.url || `https://expeditionx.example.com/invoices/${bookingId}.pdf`
    } catch (error) {
      console.error('Error fetching invoice url:', error)
      return `https://expeditionx.example.com/invoices/${bookingId}.pdf`
    }
  }
}

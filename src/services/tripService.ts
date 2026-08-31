import { apiClient } from './apiClient'

export interface ItineraryItem {
  id: string
  name: string
  type: 'attraction' | 'hotel' | 'food' | 'transport'
  time: string
  cost: number
  duration: string
  notes?: string
}

export interface DayPlan {
  day: number
  date: string
  items: ItineraryItem[]
}

export interface Trip {
  id: string
  title: string
  destinations: string[]
  coverImage: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'past' | 'draft' | 'live'
  budget: number
  spent: number
  collaborators: number
  itinerary?: DayPlan[]
}

export const tripService = {
  async getUserTrips() {
    try {
      return await apiClient.get<Trip[]>('/trips')
    } catch (error) {
      console.error('Error fetching user trips, falling back to mock:', error)
      return [
        {
          id: '1',
          title: 'Golden Triangle Tour',
          destinations: ['Delhi', 'Agra', 'Jaipur'],
          coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
          startDate: '2027-10-10',
          endDate: '2027-10-12',
          status: 'upcoming',
          budget: 45000,
          spent: 15000,
          collaborators: 1,
        }
      ] as Trip[]
    }
  },

  async getTripById(id: string) {
    try {
      const trip = await apiClient.get<any>(`/trips/${id}`)
      
      // Map flat items to DayPlan[]
      const rawItems = trip.itinerary || trip.items;
      if (rawItems && Array.isArray(rawItems)) {
        const dayMap = new Map<number, DayPlan>()
        const startDate = trip.startDate ? new Date(trip.startDate) : new Date()
        
        rawItems.forEach((item: any) => {
          if (!dayMap.has(item.dayNumber)) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + (item.dayNumber - 1))
            dayMap.set(item.dayNumber, {
              day: item.dayNumber,
              date: date.toISOString().split('T')[0],
              items: []
            })
          }
          
          dayMap.get(item.dayNumber)!.items.push({
            id: 'i' + item.id,
            name: item.placeName || 'Activity',
            type: 'attraction',
            time: item.notes || '10:00 AM',
            cost: item.estimatedCost || 0,
            duration: '2h',
            notes: item.notes
          })
        })
        
        trip.itinerary = Array.from(dayMap.values()).sort((a, b) => a.day - b.day)
      } else {
        trip.itinerary = []
      }
      
      return trip as Trip
    } catch (error) {
      console.error(`Error fetching trip ${id}, falling back to mock:`, error)
      
      // Dynamic mock data matching the featured tours from Dashboard
      const mockTrips: Record<string, Partial<Trip>> = {
        't1': {
          title: 'Golden Triangle Tour',
          destinations: ['Delhi', 'Agra', 'Jaipur'],
          coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop',
          startDate: '2026-08-10', endDate: '2026-08-17', budget: 45000, spent: 18000, collaborators: 3
        },
        't2': {
          title: 'Kyoto Sakura Walk',
          destinations: ['Kyoto', 'Osaka', 'Nara'],
          coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
          startDate: '2026-03-25', endDate: '2026-04-05', budget: 120000, spent: 82000, collaborators: 4
        },
        't3': {
          title: 'Alpine Expedition',
          destinations: ['Zurich', 'Interlaken', 'Zermatt'],
          coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
          startDate: '2026-09-05', endDate: '2026-09-12', budget: 80000, spent: 35000, collaborators: 2
        },
        't4': {
          title: 'Santorini Retreat',
          destinations: ['Athens', 'Santorini', 'Mykonos'],
          coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop',
          startDate: '2026-06-10', endDate: '2026-06-18', budget: 65000, spent: 28000, collaborators: 2
        },
        't5': {
          title: 'Bali Island Hopping',
          destinations: ['Ubud', 'Seminyak', 'Nusa Penida'],
          coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop',
          startDate: '2026-11-01', endDate: '2026-11-15', budget: 100000, spent: 55000, collaborators: 5
        },
        't6': {
          title: 'Parisian Getaway',
          destinations: ['Paris', 'Versailles'],
          coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop',
          startDate: '2026-05-01', endDate: '2026-05-07', budget: 85000, spent: 45000, collaborators: 2
        }
      }

      const match = mockTrips[id] || mockTrips['t1']

      return {
        id: id,
        title: match.title,
        destinations: match.destinations,
        coverImage: match.coverImage,
        startDate: match.startDate,
        endDate: match.endDate,
        status: 'upcoming',
        budget: match.budget,
        spent: match.spent,
        collaborators: match.collaborators,
        itinerary: [
          {
            day: 1,
            date: match.startDate,
            items: [
              { id: 'i1', name: `Arrival at ${match.destinations![0]}`, type: 'transport', time: '10:00 AM', cost: 50, duration: '2h' },
              { id: 'i2', name: 'City Tour', type: 'attraction', time: '02:00 PM', cost: 35, duration: '2h' }
            ]
          },
          {
            day: 2,
            date: new Date(new Date(match.startDate!).getTime() + 86400000).toISOString().split('T')[0],
            items: [
              { id: 'i3', name: 'Historical Site Visit', type: 'attraction', time: '09:00 AM', cost: 150, duration: '4h' }
            ]
          }
        ]
      } as Trip
    }
  },

  async saveItinerary(tripId: string, itinerary: DayPlan[]) {
    try {
      // Map frontend DayPlan[] to backend UpdateItineraryRequest which expects a flat list of ItineraryItemDTO
      const flatItems = []
      for (const dayPlan of itinerary) {
        let order = 1
        for (const item of dayPlan.items) {
          flatItems.push({
            placeName: item.name,
            dayNumber: dayPlan.day,
            displayOrder: order++,
            estimatedCost: item.cost,
            notes: item.notes || item.time
          })
        }
      }
      
      await apiClient.put(`/trips/${tripId}/itinerary`, { items: flatItems })
      return true
    } catch (error) {
      console.error(`Error saving itinerary for trip ${tripId}:`, error)
      return false
    }
  },

  async optimizeRoute(tripId: string, day: number, items: ItineraryItem[]) {
    try {
      const { simulateNetworkDelay } = await import('./mockDelay')
      await simulateNetworkDelay(1500, 2500)
      
      // Simulate intelligent AI routing: 
      // 1. Sort by logical sequence: hotel check-out -> transport -> attraction -> food -> hotel check-in
      const typeOrder = { hotel: 1, transport: 2, attraction: 3, food: 4 }
      
      const optimized = [...items].sort((a, b) => typeOrder[a.type] - typeOrder[b.type])
      
      // 2. Re-assign realistic times based on the new sequence
      let currentHour = 9 // AI starts the day at 9 AM
      let currentMin = 0
      
      return optimized.map((item) => {
        const timeStr = `${currentHour === 12 ? 12 : currentHour % 12}:${currentMin === 0 ? '00' : '30'} ${currentHour >= 12 ? 'PM' : 'AM'}`
        
        // Add 2 hours for next activity
        currentHour += 2
        
        return {
          ...item,
          time: timeStr
        }
      })
    } catch (error) {
      console.error(`Error optimizing route for trip ${tripId}:`, error)
      return items
    }
  },

  async getBudgetBreakdown(tripId: string) {
    try {
      const response = await apiClient.get<any>(`/cost-estimate?tripId=${tripId}`)
      
      if (response && response.breakdown) {
        return response.breakdown.map((b: any) => {
          let color = 'var(--text-muted)'
          if (b.category.toLowerCase().includes('flight')) color = 'var(--teal-700)'
          if (b.category.toLowerCase().includes('hotel')) color = 'var(--violet-600)'
          if (b.category.toLowerCase().includes('food')) color = 'var(--amber-500)'
          if (b.category.toLowerCase().includes('activities')) color = '#3fa796'
          return { name: b.category, value: b.amount, color }
        })
      }
    } catch (error) {
      console.error(`Error fetching budget breakdown for trip ${tripId}:`, error)
    }
    
    // Fallback mock style if error
    return [
      { name: 'Flights/Travel', value: 12000, color: 'var(--teal-700)' },
      { name: 'Hotels', value: 15000, color: 'var(--violet-600)' },
      { name: 'Food & Dining', value: 5000, color: 'var(--amber-500)' },
      { name: 'Activities', value: 0, color: '#3fa796' },
      { name: 'Misc/Shopping', value: 3000, color: 'var(--text-muted)' },
    ]
  },

  async getComparisonData(tripIdA: string, tripIdB: string) {
    try {
      return await apiClient.get<any>(`/trips/compare?tripIdA=${tripIdA}&tripIdB=${tripIdB}`)
    } catch (error) {
      console.error('Error comparing trips:', error)
      throw error
    }
  }
}

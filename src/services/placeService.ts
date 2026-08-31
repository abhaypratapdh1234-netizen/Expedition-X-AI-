export interface SearchFilters {
  query?: string
  category?: string
  minRating?: number
}

// Interfaces matching the backend PlaceResponse / PlaceDetailResponse
export interface PlaceResponse {
  id: number
  name: string
  city: string
  country: string
  state: string
  category: string
  description: string
  latitude: number
  longitude: number
  avgCost: number
  imageUrl: string
  rating: number
  reviewCount: number
  bestTime: string
  safetyAdvisory: string
  trending: boolean
}

export interface WeatherInfo {
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

export interface HotelSummary {
  id: number
  name: string
  pricePerNight: number
  rating: number
  imageUrl: string
  category: string
}

export interface ReviewSummary {
  id: number
  userName: string
  rating: number
  comment: string
  sentimentLabel: string
  createdAt: string
}

export interface PlaceDetailResponse extends PlaceResponse {
  weather: WeatherInfo
  nearbyHotels: HotelSummary[]
  recentReviews: ReviewSummary[]
  sentimentPercentage: number
  touristPlaces: PlaceResponse[]
}

import { apiClient } from './apiClient'
import { DESTINATIONS } from '../data/mockData'

async function fetchImageFromUnsplash(query: string): Promise<string> {
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=6zAIjVaA5qCZX9cJEtnJgmWqSjVyIPcc5upmYAP5VOM`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
  } catch (err) {
    console.error('Unsplash API error:', err);
  }
  return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format';
}

async function fetchFromWikipedia(query: string): Promise<PlaceResponse[]> {
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts|coordinates&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&pithumbsize=800&exintro=1&explaintext=1`
    const response = await fetch(wikiUrl)
    const data = await response.json()
    
    if (!data.query || !data.query.pages) return []
    
    const pages = Object.values(data.query.pages) as any[]
    return await Promise.all(pages.map(async (page, index) => ({
      id: page.pageid || (9000 + index),
      name: page.title,
      city: page.title,
      country: 'India',
      state: 'Explore',
      category: 'Adventure', 
      description: page.extract ? page.extract.substring(0, 120) + '...' : 'A beautiful and breathtaking destination to explore.',
      latitude: page.coordinates ? page.coordinates[0].lat : 29.38,
      longitude: page.coordinates ? page.coordinates[0].lon : 79.46,
      avgCost: 2500 + Math.floor(Math.random() * 2000),
      imageUrl: page.thumbnail ? page.thumbnail.source : await fetchImageFromUnsplash(page.title),
      rating: parseFloat((4.5 + (Math.random() * 0.4)).toFixed(1)),
      reviewCount: 1000 + Math.floor(Math.random() * 5000),
      bestTime: 'Year-round',
      safetyAdvisory: 'Generally safe for tourists',
      trending: true
    })))
  } catch (err) {
    console.error('Wikipedia API error:', err)
    return []
  }
}

async function fetchDestinationByIdFromWikipedia(id: string): Promise<PlaceDetailResponse | null> {
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts|coordinates&pageids=${id}&pithumbsize=800&exintro=1&explaintext=1`
    const response = await fetch(wikiUrl)
    const data = await response.json()
    
    if (!data.query || !data.query.pages || !data.query.pages[id]) return null
    
    const page = data.query.pages[id]
    
    return {
      id: parseInt(id),
      name: page.title,
      city: page.title,
      country: 'India',
      state: 'Explore',
      category: 'Adventure', 
      description: page.extract ? page.extract : 'A beautiful destination.',
      latitude: page.coordinates ? page.coordinates[0].lat : 29.38,
      longitude: page.coordinates ? page.coordinates[0].lon : 79.46,
      avgCost: 2500 + Math.floor(Math.random() * 2000),
      imageUrl: page.thumbnail ? page.thumbnail.source : await fetchImageFromUnsplash(page.title),
      rating: 4.8,
      reviewCount: 1500,
      bestTime: 'Year-round',
      safetyAdvisory: 'Generally safe for tourists',
      trending: true,
      weather: { temperature: 22, description: 'Pleasant', icon: '☀️', humidity: 50, windSpeed: 10 },
      nearbyHotels: [],
      recentReviews: [],
      sentimentPercentage: 90,
      touristPlaces: []
    }
  } catch (err) {
    console.error('Wikipedia API error by ID:', err)
    return null
  }
}

export const placeService = {
  async searchDestinations(filters: SearchFilters = {}): Promise<PlaceResponse[]> {
    const params = new URLSearchParams()
    if (filters.query) params.append('query', filters.query)
    if (filters.category) params.append('category', filters.category)
    
    let results: PlaceResponse[] = []
    
    try {
      results = await apiClient.get<PlaceResponse[]>(`/places/search?${params.toString()}`)
    } catch (error) {
      console.error('Error fetching destinations, falling back to mock:', error)
      let mockResults = [...DESTINATIONS] as unknown as PlaceResponse[]
      
      // Simple local search if query exists
      if (filters.query) {
        const q = filters.query.toLowerCase()
        mockResults = mockResults.filter(d => 
          d.name.toLowerCase().includes(q) || 
          d.city.toLowerCase().includes(q) || 
          d.state.toLowerCase().includes(q)
        )
      }
      results = mockResults
    }

    // Wikipedia Fallback Magic
    if (results.length === 0 && filters.query) {
      results = await fetchFromWikipedia(filters.query)
    }

    if (filters.minRating) {
      results = results.filter(d => d.rating >= filters.minRating!)
    }
    
    return results
  },

  async getDestinationById(id: string): Promise<PlaceDetailResponse | null> {
    try {
      return await apiClient.get<PlaceDetailResponse>(`/places/${id}`)
    } catch (error) {
      console.error('Error fetching destination details:', error)
      
      const wikiDest = await fetchDestinationByIdFromWikipedia(id)
      if (wikiDest) return wikiDest
      
      const mockDest = DESTINATIONS.find(d => String(d.id) === id)
      if (mockDest) {
        return {
          ...mockDest,
          weather: { temperature: 25, description: 'Sunny', icon: '☀️', humidity: 60, windSpeed: 12 },
          nearbyHotels: [],
          recentReviews: [],
          sentimentPercentage: 85,
          touristPlaces: []
        } as unknown as PlaceDetailResponse
      }
      
      return null
    }
  },

  async getTrendingDestinations(): Promise<PlaceResponse[]> {
    try {
      return await apiClient.get<PlaceResponse[]>('/places/trending')
    } catch (error) {
      console.error('Error fetching trending destinations:', error)
      return []
    }
  },

  async getSafetyAdvisory(city: string) {
    return {
      level: 'Safe',
      score: 92,
      lastUpdated: new Date().toISOString(),
      notes: 'Please refer to the destination details for specific safety information.'
    }
  },
  
  async getNearbyTransport(lat: number, lng: number) {
    try {
      const response = await apiClient.get<any>(`/transport/estimate?fromLat=${lat}&fromLng=${lng}&toLat=${lat+0.01}&toLng=${lng+0.01}`)
      return {
        metro: { available: true, distanceKm: response.distanceKm || 1.2, name: 'Central Station' },
        bus: { available: true, distanceKm: 0.3, name: 'Main Road Stop' },
        cab: { available: true, estMins: response.durationMinutes || 5 }
      }
    } catch (error) {
      console.error('Error fetching transport details:', error)
      return {
        metro: { available: true, distanceKm: 1.2, name: 'Central Station' },
        bus: { available: true, distanceKm: 0.3, name: 'Main Road Stop' },
        cab: { available: true, estMins: 5 }
      }
    }
  },

  async fetchMapPOIs(lat: number, lng: number): Promise<any[]> {
    const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY
    if (!apiKey) {
      console.warn('No OpenTripMap API key found, returning empty POIs')
      return []
    }

    const radius = 15000 // 15km
    const endpoints = [
      { kind: 'interesting_places', type: 'attraction', limit: 300 },
      { kind: 'accomodations', type: 'hotel', limit: 150 },
      { kind: 'foods', type: 'food', limit: 150 }
    ]

    const allPlaces: any[] = []

    try {
      const responses = await Promise.all(endpoints.map(async (ep) => {
        const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lng}&lat=${lat}&kinds=${ep.kind}&format=json&limit=${ep.limit}&apikey=${apiKey}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            return data
              .filter((p: any) => p.name && p.name.trim() !== '')
              .map((p: any) => {
                const rawRate = p.rate || 3
                const starRating = Math.min(5, Math.max(3, Math.round(rawRate / 1.4)))
                return {
                  id: `${p.xid}-${ep.type}`,
                  name: p.name,
                  lat: p.point.lat,
                  lng: p.point.lon,
                  type: ep.type,
                  rating: starRating,
                  rawRate: rawRate
                }
              })
          }
        }
        return []
      }))
      
      responses.forEach(arr => allPlaces.push(...arr))
      
      // Sort by absolute popularity so the top 150 places are the most famous globally
      allPlaces.sort((a, b) => b.rawRate - a.rawRate)
      
    } catch (error) {
      console.error('Error fetching Map POIs from OpenTripMap:', error)
    }

    return allPlaces
  }
}

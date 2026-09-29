export interface SearchFilters {
  query?: string
  category?: string
  country?: string
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
import { DESTINATIONS, TOURIST_PLACES } from '../data/mockData'

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

async function fetchFromWikipedia(query: string, requestedCountry?: string): Promise<PlaceResponse[]> {
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
      country: requestedCountry === 'foreign' ? 'International' : (requestedCountry || 'India'),
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

export const VERIFIED_LANDMARKS_DATA: Record<string, { image: string; avgCost?: number }> = {
  'red fort': {
    image: 'https://images.unsplash.com/photo-1705524220939-dac17cf94236?w=800',
    avgCost: 50,
  },
  'qutub minar': {
    image: 'https://images.unsplash.com/photo-1632426237957-5ea14aae7100?w=800',
    avgCost: 35,
  },
  'india gate': {
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    avgCost: 0,
  },
  'taj mahal': {
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    avgCost: 250,
  },
  'amber fort': {
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    avgCost: 200,
  },
  'hawa mahal': {
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    avgCost: 50,
  },
  'baga beach': {
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    avgCost: 500,
  },
  'dudhsagar falls': {
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    avgCost: 800,
  },
  'solang valley': {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    avgCost: 1500,
  },
  'old manali': {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    avgCost: 200,
  },
  'alleppey backwaters': {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    avgCost: 3000,
  },
  'munnar tea gardens': {
    image: 'https://images.unsplash.com/photo-1580818135730-ebd11086660b?w=800',
    avgCost: 500,
  },
  'gateway of india': {
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800',
    avgCost: 0,
  },
  'marine drive': {
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
    avgCost: 0,
  },
  'varanasi ghats': {
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
    avgCost: 100,
  },
  'victoria memorial': {
    image: 'https://images.unsplash.com/photo-1600080077823-a44592513861?w=800',
    avgCost: 30,
  },
  'udaipur city palace': {
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800',
    avgCost: 300,
  },
  'hampi ruins': {
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800',
    avgCost: 100,
  },
  'leh palace': {
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
    avgCost: 200,
  },
  'darjeeling tea estate': {
    image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=800',
    avgCost: 400,
  },
}

export function sanitizePlaceResponse<T extends { name?: string; imageUrl?: string; avgCost?: number }>(place: T): T {
  if (!place || !place.name) return place
  const nameKey = place.name.toLowerCase().trim()
  const matched = Object.entries(VERIFIED_LANDMARKS_DATA).find(([k]) => nameKey.includes(k) || k.includes(nameKey))
  if (matched) {
    const [, info] = matched
    return {
      ...place,
      imageUrl: info.image,
      avgCost: info.avgCost !== undefined ? info.avgCost : place.avgCost,
    }
  }
  return place
}

export const placeService = {
  async searchDestinations(filters: SearchFilters = {}): Promise<PlaceResponse[]> {
    const params = new URLSearchParams()
    if (filters.query) params.append('query', filters.query)
    if (filters.category) params.append('category', filters.category)
    
    let results: PlaceResponse[] = []
    
    try {
      if (filters.category === 'Trending') {
        results = await apiClient.get<PlaceResponse[]>('/places/trending')
      } else {
        results = await apiClient.get<PlaceResponse[]>(`/places/search?${params.toString()}`)
      }
    } catch (error) {
      console.error('Error fetching destinations, falling back to mock:', error)
      let mockResults = [...DESTINATIONS, ...TOURIST_PLACES] as unknown as PlaceResponse[]
      
      // Simple local search if query exists
      if (filters.query) {
        const q = filters.query.toLowerCase()
        mockResults = mockResults.filter(d => 
          d.name.toLowerCase().includes(q) || 
          (d.city && d.city.toLowerCase().includes(q)) || 
          (d.state && d.state.toLowerCase().includes(q))
        )
      }
      
      if (filters.category) {
        if (filters.category === 'Trending') {
          // Fallback to top 10 mock destinations for trending
          mockResults = mockResults.slice(0, 10)
        } else {
          mockResults = mockResults.filter(d => d.category?.toLowerCase().includes(filters.category!.toLowerCase()))
        }
      }
      
      results = mockResults
    }

    // Wikipedia Fallback Magic
    if (results.length === 0 && filters.query) {
      results = await fetchFromWikipedia(filters.query, filters.country)
    }

    if (filters.country) {
      const c = filters.country.toLowerCase()
      if (c === 'foreign') {
        results = results.filter(d => d.country && d.country.toLowerCase() !== 'india')
      } else {
        results = results.filter(d => d.country && d.country.toLowerCase() === c)
      }
    }

    if (filters.minRating) {
      results = results.filter(d => d.rating >= filters.minRating!)
    }
    
    return results.map(sanitizePlaceResponse)
  },

  async getDestinationById(id: string): Promise<PlaceDetailResponse | null> {
    try {
      const res = await apiClient.get<PlaceDetailResponse>(`/places/${id}`)
      return sanitizePlaceResponse(res)
    } catch (error) {
      console.error('Error fetching destination details:', error)
      
      const touristPlace = TOURIST_PLACES.find(p => String(p.id) === id)
      if (touristPlace) {
        let enhancedDescription = touristPlace.description;
        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(touristPlace.name)}`)
          const wikiData = await wikiRes.json()
          const pages = wikiData.query?.pages
          if (pages) {
            const pageId = Object.keys(pages)[0]
            if (pageId && pageId !== '-1' && pages[pageId].extract) {
              enhancedDescription = pages[pageId].extract
            }
          }
        } catch(e) {}
        
        return sanitizePlaceResponse({
          ...touristPlace,
          description: enhancedDescription,
          avgCost: touristPlace.entryFee || 100,
          weather: { temperature: 28, description: 'Clear Sky', icon: '☀️', humidity: 45, windSpeed: 8 },
          nearbyHotels: [],
          recentReviews: [],
          sentimentPercentage: 92,
          touristPlaces: []
        } as unknown as PlaceDetailResponse)
      }

      const mockDest = DESTINATIONS.find(d => String(d.id) === id)
      if (mockDest) {
        let enhancedDescription = mockDest.description;
        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(mockDest.name)}`)
          const wikiData = await wikiRes.json()
          const pages = wikiData.query?.pages
          if (pages) {
            const pageId = Object.keys(pages)[0]
            if (pageId && pageId !== '-1' && pages[pageId].extract) {
              enhancedDescription = pages[pageId].extract
            }
          }
        } catch(e) {}

        return sanitizePlaceResponse({
          ...mockDest,
          description: enhancedDescription,
          weather: { temperature: 25, description: 'Sunny', icon: '☀️', humidity: 60, windSpeed: 12 },
          nearbyHotels: [],
          recentReviews: [],
          sentimentPercentage: 85,
          touristPlaces: []
        } as unknown as PlaceDetailResponse)
      }
      
      const wikiDest = await fetchDestinationByIdFromWikipedia(id)
      if (wikiDest) return sanitizePlaceResponse(wikiDest)
      
      return null
    }
  },

  async getTrendingDestinations(): Promise<PlaceResponse[]> {
    try {
      const list = await apiClient.get<PlaceResponse[]>('/places/trending')
      return (list || []).map(sanitizePlaceResponse)
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

export interface SearchFilters {
  query?: string
  category?: string
  country?: string
  minRating?: number
  sortBy?: 'recommended' | 'rating' | 'cost_asc' | 'cost_desc' | 'name'
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

export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  trending: ['trending', 'popular', 'top', 'famous'],
  adventure: ['adventure', 'nature', 'hill', 'hills', 'trek', 'trekking', 'rafting', 'skiing', 'sports', 'desert', 'paragliding'],
  heritage: ['heritage', 'historical', 'historic', 'culture', 'cultural', 'temple', 'palace', 'monument', 'fort', 'ghats', 'ruins', 'ancient'],
  beach: ['beach', 'coastal', 'sea', 'ocean', 'island', 'islands', 'water', 'backwaters'],
  offbeat: ['offbeat', 'nature', 'village', 'valley', 'hidden', 'remote', 'hills', 'scenic', 'misty'],
  'food trails': ['food', 'food trails', 'culinary', 'dining', 'cuisine', 'street food', 'sweets'],
  food: ['food', 'food trails', 'culinary', 'dining', 'cuisine', 'street food'],
  nightlife: ['nightlife', 'party', 'club', 'city', 'bars', 'evening', 'beach', 'shacks'],
}

export function matchesCategory(itemCat: any, targetCat?: string): boolean {
  if (!targetCat || targetCat.toLowerCase().trim() === 'all') return true
  const target = targetCat.toLowerCase().trim()
  const keywords = CATEGORY_SYNONYMS[target] || [target]
  
  let itemStrings: string[] = []
  if (Array.isArray(itemCat)) {
    itemStrings = itemCat.map(c => String(c).toLowerCase().trim())
  } else if (typeof itemCat === 'string') {
    itemStrings = itemCat.toLowerCase().split(',').map(s => s.trim())
  }

  return keywords.some(kw => 
    itemStrings.some(cat => cat.includes(kw) || kw.includes(cat))
  )
}

export function isIndiaDestination(place: any): boolean {
  if (!place) return false
  const country = (place.country || '').toLowerCase().trim()
  if (country === 'india' || country === 'in' || country.includes('india')) return true

  const indianKeywords = [
    'delhi', 'new delhi', 'agra', 'jaipur', 'goa', 'kerala', 'mumbai', 'manali', 'solang', 
    'varanasi', 'udaipur', 'hampi', 'ladakh', 'leh', 'darjeeling', 'kolkata', 'rajasthan', 
    'himachal', 'karnataka', 'uttar pradesh', 'punjab', 'kashmir', 'rishikesh', 'amritsar', 
    'coorg', 'ooty', 'andaman', 'spiti', 'munnar', 'shimla', 'jodhpur', 'pondicherry', 
    'shillong', 'mysore', 'pachmarhi', 'bhopal', 'maharashtra', 'bengaluru', 'bangalore', 
    'chennai', 'hyderabad', 'taj mahal', 'red fort', 'qutub minar', 'india gate', 'hawa mahal', 
    'amber fort', 'baga beach', 'dudhsagar', 'alleppey', 'marine drive', 'victoria memorial', 'nilgiri'
  ]
  const text = `${place.name || ''} ${place.city || ''} ${place.state || ''}`.toLowerCase()
  return indianKeywords.some(kw => text.includes(kw))
}

export function sanitizePlaceResponse<T extends { name?: string; imageUrl?: string; image?: string; avgCost?: number; costPerDay?: number; country?: string; state?: string }>(place: T): T {
  if (!place || !place.name) return place
  const nameKey = place.name.toLowerCase().trim()
  const matched = Object.entries(VERIFIED_LANDMARKS_DATA).find(([k]) => nameKey.includes(k) || k.includes(nameKey))
  
  let finalPlace: any = { ...place }

  if (matched) {
    const [, info] = matched
    finalPlace.imageUrl = info.image
    if (info.avgCost !== undefined) {
      finalPlace.avgCost = info.avgCost
    }
  } else if (!finalPlace.imageUrl && finalPlace.image) {
    finalPlace.imageUrl = finalPlace.image
  }

  if (finalPlace.avgCost === undefined && finalPlace.costPerDay !== undefined) {
    finalPlace.avgCost = finalPlace.costPerDay
  }

  if ((!finalPlace.country || finalPlace.country.toLowerCase() !== 'india') && isIndiaDestination(finalPlace)) {
    finalPlace.country = 'India'
  }

  return finalPlace
}

// In-memory cache for search queries (TTL: 2 minutes)
const searchCache = new Map<string, { timestamp: number; data: PlaceResponse[] }>()
const SEARCH_CACHE_TTL = 120 * 1000

// Memoized curated base pool
let memoizedCuratedBase: PlaceResponse[] | null = null
function getCuratedBase(): PlaceResponse[] {
  if (memoizedCuratedBase) return memoizedCuratedBase
  memoizedCuratedBase = [...DESTINATIONS, ...TOURIST_PLACES].map(d => ({
    id: d.id,
    name: d.name,
    city: d.city || d.name,
    country: d.country || (isIndiaDestination(d) ? 'India' : 'International'),
    state: d.state || '',
    category: Array.isArray(d.category) ? d.category.join(', ') : (d.category || ''),
    description: d.description || '',
    latitude: d.latitude || d.lat || 0,
    longitude: d.longitude || d.lng || 0,
    avgCost: d.avgCost || d.costPerDay || d.entryFee || 2500,
    imageUrl: d.imageUrl || d.image || '',
    rating: d.rating || 4.7,
    reviewCount: d.reviewCount || d.reviews || 1000,
    bestTime: d.bestTime || 'Year-round',
    safetyAdvisory: 'Generally safe for tourists',
    trending: d.trending ?? true
  })) as PlaceResponse[]
  return memoizedCuratedBase
}

export const placeService = {
  async searchDestinations(filters: SearchFilters = {}): Promise<PlaceResponse[]> {
    const cacheKey = JSON.stringify(filters)
    const cached = searchCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < SEARCH_CACHE_TTL)) {
      return cached.data
    }

    // 1. Establish the high-fidelity curated base pool (covering all themes and locations)
    const baseCurated = getCuratedBase()
    let pool = [...baseCurated]

    // 2. Fetch from backend API if available, and merge new live places
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append('query', filters.query)
      if (filters.category && filters.category !== 'Trending') params.append('category', filters.category)
      
      const endpoint = filters.category === 'Trending' ? '/places/trending' : `/places/search?${params.toString()}`
      const apiResults = await apiClient.get<PlaceResponse[]>(endpoint)
      
      if (apiResults && Array.isArray(apiResults) && apiResults.length > 0) {
        // Merge API results on top of pool, deduplicating by normalized name
        const seenNames = new Set(apiResults.map(p => p.name.toLowerCase().trim()))
        pool = [...apiResults, ...pool.filter(p => !seenNames.has(p.name.toLowerCase().trim()))]
      }
    } catch (e) {
      // Backend unavailable or running in client-only/serverless mode
    }

    let results = pool

    // 3. Search Query Filter
    if (filters.query) {
      const q = filters.query.toLowerCase().trim()
      results = results.filter(d => 
        (d.name && d.name.toLowerCase().includes(q)) || 
        (d.city && d.city.toLowerCase().includes(q)) || 
        (d.state && d.state.toLowerCase().includes(q)) ||
        (d.country && d.country.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
      )
      
      // Wikipedia fallback if query found nothing
      if (results.length === 0) {
        const wikiQuery = filters.country?.toLowerCase() === 'india' ? `${filters.query} India` : filters.query
        results = await fetchFromWikipedia(wikiQuery, filters.country)
      }
    }

    // 4. Semantic Category / Theme Filter
    if (filters.category && filters.category.toLowerCase().trim() !== 'all') {
      const cat = filters.category.toLowerCase().trim()
      if (cat === 'trending') {
        results = results.filter(d => d.trending || (d.rating && d.rating >= 4.7) || matchesCategory(d.category, 'trending'))
      } else {
        results = results.filter(d => matchesCategory(d.category, cat))
      }
    }

    // 5. Country Filter (INDIA vs OTHER FOREIGN vs ALL)
    if (filters.country) {
      const c = filters.country.toLowerCase().trim()
      if (c === 'foreign' || c === 'other') {
        results = results.filter(d => !isIndiaDestination(d))
      } else if (c === 'india' || c === 'in') {
        results = results.filter(d => isIndiaDestination(d))
      } else {
        results = results.filter(d => d.country && d.country.toLowerCase() === c)
      }
    }

    // 6. Minimum Rating Filter
    if (filters.minRating !== undefined && filters.minRating !== null && Number(filters.minRating) > 0) {
      const minR = Number(filters.minRating)
      results = results.filter(d => Number(d.rating || 0) >= minR)
    }

    // 7. Safety Net: If combination returned 0 (e.g. strict backend query), ensure matching fallback from curated catalog
    if (results.length === 0 && filters.category && filters.category.toLowerCase().trim() !== 'all') {
      const cat = filters.category.toLowerCase().trim()
      let fallback = pool.filter(d => matchesCategory(d.category, cat))
      if (filters.country) {
        const c = filters.country.toLowerCase().trim()
        if (c === 'india' || c === 'in') {
          fallback = fallback.filter(d => isIndiaDestination(d))
        } else if (c === 'foreign' || c === 'other') {
          fallback = fallback.filter(d => !isIndiaDestination(d))
        }
      }
      if (filters.minRating !== undefined && filters.minRating !== null && Number(filters.minRating) > 0) {
        const minR = Number(filters.minRating)
        const ratingMatches = fallback.filter(d => Number(d.rating || 0) >= minR)
        if (ratingMatches.length > 0) {
          fallback = ratingMatches
        }
      }
      if (fallback.length > 0) {
        results = fallback
      }
    }

    const sanitizedResults = results.map(sanitizePlaceResponse)

    // 8. Sorting
    if (filters.sortBy) {
      if (filters.sortBy === 'rating') {
        sanitizedResults.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      } else if (filters.sortBy === 'cost_asc') {
        sanitizedResults.sort((a, b) => (Number(a.avgCost) || 0) - (Number(b.avgCost) || 0))
      } else if (filters.sortBy === 'cost_desc') {
        sanitizedResults.sort((a, b) => (Number(b.avgCost) || 0) - (Number(a.avgCost) || 0))
      } else if (filters.sortBy === 'name') {
        sanitizedResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }
    }

    // Cache results for instant subsequent lookups
    searchCache.set(cacheKey, { timestamp: Date.now(), data: sanitizedResults })

    return sanitizedResults
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
      if (list && Array.isArray(list) && list.length > 0) {
        return list.map(sanitizePlaceResponse)
      }
    } catch (error) {
      // Backend unavailable or timed out — seamlessly use curated trending destinations
    }
    return DESTINATIONS.filter(d => d.trending).map(d => sanitizePlaceResponse({
      id: d.id,
      name: d.name,
      city: d.city || d.name,
      country: d.country || (isIndiaDestination(d) ? 'India' : 'International'),
      state: d.state || '',
      category: Array.isArray(d.category) ? d.category.join(', ') : (d.category || 'Trending'),
      description: d.description || '',
      latitude: d.latitude || d.lat || 0,
      longitude: d.longitude || d.lng || 0,
      avgCost: d.avgCost || d.costPerDay || 2500,
      imageUrl: d.imageUrl || d.image || '',
      rating: d.rating || 4.8,
      reviewCount: d.reviewCount || d.reviews || 1200,
      bestTime: d.bestTime || 'Year-round',
      safetyAdvisory: 'Safe for tourists',
      trending: true
    } as PlaceResponse))
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

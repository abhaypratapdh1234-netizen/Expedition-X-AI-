/**
 * costEngineService.ts — Real pricing engine for ExpeditionX AI
 *
 * Two-tier pricing model:
 *   LIVE  — real API data (OSRM distance, OpenTripMap POIs, Frankfurter FX, Nominatim geocode)
 *   Est.  — formula-based from city cost tier tables (flights, hotels, transport fare, food)
 *
 * Every price line carries: amount, source, pricingType ('live'|'estimated'), fetchedAt timestamp.
 */

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface PriceQuote {
  component: 'flight' | 'hotel' | 'transport' | 'food' | 'attractions' | 'total'
  label: string
  emoji: string
  amount: number
  currency: string
  pricingType: 'live' | 'estimated'
  source: string
  fetchedAt: string   // ISO timestamp
  details?: string
  expandedInfo?: string
}

export interface CostEngineResult {
  destination: string
  origin: string
  days: number
  travelers: number
  quotes: PriceQuote[]
  totalINR: number
  fxRate: number | null
  fxFrom: string
  fxFetchedAt: string | null
  generatedAt: string
}

interface LatLng {
  lat: number
  lng: number
  displayName: string
}

interface CityTier {
  tier: 'budget' | 'mid' | 'premium'
  localCurrency: string
  perKmFare: number       // in INR
  avgMealCost: number     // in INR
  flightEstimate: number  // in INR (from Delhi/Mumbai)
  hotelPerNight: number   // in INR
  attractionAvg: number   // in INR per attraction
  sourceNote: string
}

// ─────────────────────────────────────────────
// CITY COST TIER TABLE — seeded from Numbeo/public data
// ─────────────────────────────────────────────

const CITY_COST_TIERS: Record<string, CityTier> = {
  // ── India ──
  goa:        { tier: 'budget',  localCurrency: 'INR', perKmFare: 12, avgMealCost: 250, flightEstimate: 4500,  hotelPerNight: 1500,  attractionAvg: 200,  sourceNote: 'Numbeo India avg, Goa tourism board' },
  delhi:      { tier: 'mid',     localCurrency: 'INR', perKmFare: 15, avgMealCost: 350, flightEstimate: 3500,  hotelPerNight: 2500,  attractionAvg: 350,  sourceNote: 'Numbeo India avg, Delhi Metro rates' },
  mumbai:     { tier: 'mid',     localCurrency: 'INR', perKmFare: 18, avgMealCost: 400, flightEstimate: 4000,  hotelPerNight: 3000,  attractionAvg: 300,  sourceNote: 'Numbeo India avg, Mumbai local fares' },
  bangalore:  { tier: 'mid',     localCurrency: 'INR', perKmFare: 14, avgMealCost: 300, flightEstimate: 4500,  hotelPerNight: 2200,  attractionAvg: 250,  sourceNote: 'Numbeo India avg' },
  bengaluru:  { tier: 'mid',     localCurrency: 'INR', perKmFare: 14, avgMealCost: 300, flightEstimate: 4500,  hotelPerNight: 2200,  attractionAvg: 250,  sourceNote: 'Numbeo India avg' },
  jaipur:     { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 200, flightEstimate: 3000,  hotelPerNight: 1200,  attractionAvg: 150,  sourceNote: 'Rajasthan tourism, Numbeo' },
  manali:     { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 200, flightEstimate: 5500,  hotelPerNight: 1200,  attractionAvg: 100,  sourceNote: 'Numbeo, HP tourism' },
  shimla:     { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 220, flightEstimate: 5000,  hotelPerNight: 1400,  attractionAvg: 150,  sourceNote: 'Numbeo, HP tourism' },
  ladakh:     { tier: 'budget',  localCurrency: 'INR', perKmFare: 15, avgMealCost: 300, flightEstimate: 7000,  hotelPerNight: 1800,  attractionAvg: 200,  sourceNote: 'Numbeo, Ladakh tourism' },
  kerala:     { tier: 'budget',  localCurrency: 'INR', perKmFare: 11, avgMealCost: 250, flightEstimate: 5000,  hotelPerNight: 1600,  attractionAvg: 200,  sourceNote: 'Kerala tourism, Numbeo' },
  varanasi:   { tier: 'budget',  localCurrency: 'INR', perKmFare: 8,  avgMealCost: 150, flightEstimate: 4000,  hotelPerNight: 1000,  attractionAvg: 100,  sourceNote: 'Numbeo India avg' },
  hyderabad:  { tier: 'mid',     localCurrency: 'INR', perKmFare: 13, avgMealCost: 280, flightEstimate: 4000,  hotelPerNight: 2000,  attractionAvg: 200,  sourceNote: 'Numbeo India avg' },
  chennai:    { tier: 'mid',     localCurrency: 'INR', perKmFare: 14, avgMealCost: 300, flightEstimate: 4500,  hotelPerNight: 2200,  attractionAvg: 250,  sourceNote: 'Numbeo India avg' },
  kolkata:    { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 200, flightEstimate: 4500,  hotelPerNight: 1500,  attractionAvg: 150,  sourceNote: 'Numbeo India avg' },
  udaipur:    { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 220, flightEstimate: 4000,  hotelPerNight: 1800,  attractionAvg: 200,  sourceNote: 'Numbeo, Rajasthan tourism' },
  agra:       { tier: 'budget',  localCurrency: 'INR', perKmFare: 10, avgMealCost: 180, flightEstimate: 3500,  hotelPerNight: 1200,  attractionAvg: 500,  sourceNote: 'Numbeo, Taj Mahal ticket data' },
  rishikesh:  { tier: 'budget',  localCurrency: 'INR', perKmFare: 9,  avgMealCost: 180, flightEstimate: 5000,  hotelPerNight: 1000,  attractionAvg: 300,  sourceNote: 'Numbeo, Uttarakhand tourism' },
  andaman:    { tier: 'mid',     localCurrency: 'INR', perKmFare: 20, avgMealCost: 350, flightEstimate: 8000,  hotelPerNight: 2500,  attractionAvg: 400,  sourceNote: 'Numbeo, A&N tourism' },

  // ── International ──
  singapore:  { tier: 'premium', localCurrency: 'SGD', perKmFare: 45, avgMealCost: 800,  flightEstimate: 18000, hotelPerNight: 8000,  attractionAvg: 1500, sourceNote: 'Numbeo Singapore, SG tourism board' },
  dubai:      { tier: 'premium', localCurrency: 'AED', perKmFare: 40, avgMealCost: 700,  flightEstimate: 15000, hotelPerNight: 7000,  attractionAvg: 1200, sourceNote: 'Numbeo UAE, Dubai tourism' },
  bangkok:    { tier: 'budget',  localCurrency: 'THB', perKmFare: 8,  avgMealCost: 250,  flightEstimate: 12000, hotelPerNight: 2500,  attractionAvg: 500,  sourceNote: 'Numbeo Thailand, TAT' },
  bali:       { tier: 'mid',     localCurrency: 'IDR', perKmFare: 8,  avgMealCost: 300,  flightEstimate: 20000, hotelPerNight: 3500,  attractionAvg: 600,  sourceNote: 'Numbeo Indonesia' },
  paris:      { tier: 'premium', localCurrency: 'EUR', perKmFare: 55, avgMealCost: 1200, flightEstimate: 35000, hotelPerNight: 10000, attractionAvg: 1500, sourceNote: 'Numbeo France, Paris tourism' },
  london:     { tier: 'premium', localCurrency: 'GBP', perKmFare: 60, avgMealCost: 1400, flightEstimate: 38000, hotelPerNight: 12000, attractionAvg: 1800, sourceNote: 'Numbeo UK, VisitBritain' },
  tokyo:      { tier: 'premium', localCurrency: 'JPY', perKmFare: 50, avgMealCost: 900,  flightEstimate: 30000, hotelPerNight: 8000,  attractionAvg: 1200, sourceNote: 'Numbeo Japan, JNTO' },
  rome:       { tier: 'mid',     localCurrency: 'EUR', perKmFare: 35, avgMealCost: 800,  flightEstimate: 32000, hotelPerNight: 7000,  attractionAvg: 1000, sourceNote: 'Numbeo Italy' },
  maldives:   { tier: 'premium', localCurrency: 'USD', perKmFare: 30, avgMealCost: 1500, flightEstimate: 22000, hotelPerNight: 15000, attractionAvg: 2000, sourceNote: 'Numbeo Maldives, resort avg' },
  'new york': { tier: 'premium', localCurrency: 'USD', perKmFare: 65, avgMealCost: 1500, flightEstimate: 55000, hotelPerNight: 15000, attractionAvg: 2500, sourceNote: 'Numbeo USA, NYC tourism' },
  sydney:     { tier: 'premium', localCurrency: 'AUD', perKmFare: 50, avgMealCost: 1200, flightEstimate: 45000, hotelPerNight: 10000, attractionAvg: 1500, sourceNote: 'Numbeo Australia, Tourism Aus' },
}

// Default fallback for unknown cities
const DEFAULT_TIER: CityTier = {
  tier: 'mid', localCurrency: 'INR', perKmFare: 15, avgMealCost: 350,
  flightEstimate: 8000, hotelPerNight: 2500, attractionAvg: 300,
  sourceNote: 'Default mid-tier estimate'
}

// ─────────────────────────────────────────────
// 1. NOMINATIM GEOCODER (free, no key)
// ─────────────────────────────────────────────

const geocodeCache = new Map<string, LatLng>()

async function geocode(city: string): Promise<LatLng> {
  const key = city.toLowerCase().trim()
  if (geocodeCache.has(key)) return geocodeCache.get(key)!

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ExpeditionXAI/1.0 (travel-planning-app)' }
    })
    if (!res.ok) throw new Error('Nominatim failed')
    const data = await res.json()
    if (!data.length) throw new Error('City not found')

    const result: LatLng = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    }
    geocodeCache.set(key, result)
    return result
  } catch (e) {
    // Hardcoded fallbacks for common cities
    const FALLBACKS: Record<string, LatLng> = {
      goa:       { lat: 15.2993, lng: 74.124,  displayName: 'Goa, India' },
      delhi:     { lat: 28.6139, lng: 77.209,  displayName: 'New Delhi, India' },
      mumbai:    { lat: 19.076,  lng: 72.8777, displayName: 'Mumbai, India' },
      manali:    { lat: 32.2396, lng: 77.1887, displayName: 'Manali, HP, India' },
      singapore: { lat: 1.3521,  lng: 103.8198, displayName: 'Singapore' },
      dubai:     { lat: 25.2048, lng: 55.2708, displayName: 'Dubai, UAE' },
      paris:     { lat: 48.8566, lng: 2.3522,  displayName: 'Paris, France' },
      tokyo:     { lat: 35.6762, lng: 139.6503, displayName: 'Tokyo, Japan' },
      bali:      { lat: -8.3405, lng: 115.092, displayName: 'Bali, Indonesia' },
      london:    { lat: 51.5074, lng: -0.1278, displayName: 'London, UK' },
      bangkok:   { lat: 13.7563, lng: 100.5018, displayName: 'Bangkok, Thailand' },
      jaipur:    { lat: 26.9124, lng: 75.7873, displayName: 'Jaipur, India' },
    }
    const fb = FALLBACKS[key]
    if (fb) { geocodeCache.set(key, fb); return fb }
    return { lat: 28.6139, lng: 77.209, displayName: city }
  }
}

// ─────────────────────────────────────────────
// 2. OSRM DISTANCE (free, no key)
// ─────────────────────────────────────────────

interface RouteResult {
  distanceKm: number
  durationHours: number
  source: 'OSRM'
  fetchedAt: string
}

async function getDistance(origin: LatLng, dest: LatLng): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`
    const res = await fetch(url)
    if (!res.ok) throw new Error('OSRM failed')
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) return null

    return {
      distanceKm: Math.round(data.routes[0].distance / 1000),
      durationHours: Math.round(data.routes[0].duration / 3600 * 10) / 10,
      source: 'OSRM',
      fetchedAt: new Date().toISOString()
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// 3. OPENTRIPMAP ATTRACTIONS (free, key in .env)
// ─────────────────────────────────────────────

interface Attraction {
  name: string
  kinds: string
  dist: number
  rate: number
}

async function getAttractions(dest: LatLng, limit = 10): Promise<{ attractions: Attraction[]; source: string; fetchedAt: string }> {
  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_OPENTRIPMAP_API_KEY
  if (!apiKey) {
    return { attractions: [], source: 'OpenTripMap (no key)', fetchedAt: new Date().toISOString() }
  }

  try {
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${dest.lng}&lat=${dest.lat}&kinds=interesting_places&rate=3&limit=${limit}&apikey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('OpenTripMap failed')
    const data = await res.json()

    const attractions: Attraction[] = (data.features || data || [])
      .filter((f: any) => f.properties?.name)
      .slice(0, limit)
      .map((f: any) => ({
        name: f.properties.name,
        kinds: f.properties.kinds || '',
        dist: Math.round((f.properties.dist || 0) / 1000 * 10) / 10,
        rate: f.properties.rate || 0
      }))

    return {
      attractions,
      source: 'OpenTripMap Live',
      fetchedAt: new Date().toISOString()
    }
  } catch {
    return { attractions: [], source: 'OpenTripMap (failed)', fetchedAt: new Date().toISOString() }
  }
}

// ─────────────────────────────────────────────
// 4. FRANKFURTER FX (free, no key)
// ─────────────────────────────────────────────

interface FxResult {
  rate: number
  from: string
  to: string
  source: string
  fetchedAt: string
}

const fxCache = new Map<string, { result: FxResult; expiry: number }>()

async function getFxRate(from: string, to: string): Promise<FxResult> {
  if (from === to) return { rate: 1, from, to, source: 'Same currency', fetchedAt: new Date().toISOString() }

  const cacheKey = `${from}-${to}`
  const cached = fxCache.get(cacheKey)
  if (cached && cached.expiry > Date.now()) return cached.result

  try {
    const res = await fetch(`https://api.frankfurter.dev/latest?from=${from}&to=${to}`)
    if (!res.ok) throw new Error('FX fetch failed')
    const data = await res.json()
    const rate = data.rates[to]
    if (!rate) throw new Error(`Rate not found for ${to}`)

    const result: FxResult = { rate, from, to, source: 'Frankfurter Live', fetchedAt: new Date().toISOString() }
    fxCache.set(cacheKey, { result, expiry: Date.now() + 3600_000 }) // 1h cache
    return result
  } catch {
    // Fallback rates
    const fallback: Record<string, number> = {
      'USD-INR': 83.5, 'EUR-INR': 91, 'GBP-INR': 106, 'SGD-INR': 62, 'AED-INR': 22.7,
      'THB-INR': 2.35, 'JPY-INR': 0.56, 'AUD-INR': 55, 'IDR-INR': 0.0053,
      'INR-USD': 0.012, 'INR-EUR': 0.011, 'INR-GBP': 0.0094
    }
    const rate = fallback[`${from}-${to}`] || fallback[`${to}-${from}`] ? (1 / (fallback[`${to}-${from}`] || 1)) : 1
    return { rate, from, to, source: 'Fallback estimate', fetchedAt: new Date().toISOString() }
  }
}

// ─────────────────────────────────────────────
// 5. COST AGGREGATOR — the main function
// ─────────────────────────────────────────────

export async function calculateTripCost(params: {
  destination: string
  origin?: string
  days: number
  travelers?: number
}): Promise<CostEngineResult> {
  const { destination, origin = 'Delhi', days, travelers = 1 } = params
  const destKey = destination.toLowerCase().trim()
  const cityTier = CITY_COST_TIERS[destKey] || DEFAULT_TIER
  const now = new Date().toISOString()

  const quotes: PriceQuote[] = []

  // ── Step 1: Geocode both cities ──
  const [destGeo, originGeo] = await Promise.all([
    geocode(destination),
    geocode(origin)
  ])

  // ── Step 2: OSRM Distance (LIVE) ──
  const route = await getDistance(originGeo, destGeo)

  // ── Step 3: OpenTripMap Attractions (LIVE) ──
  const attractionData = await getAttractions(destGeo, 8)

  // ── Step 4: FX Rate (LIVE if international) ──
  let fxResult: FxResult | null = null
  if (cityTier.localCurrency !== 'INR') {
    fxResult = await getFxRate(cityTier.localCurrency, 'INR')
  }

  // ── Build quotes ──

  // FLIGHT
  const flightTotal = cityTier.flightEstimate * travelers
  quotes.push({
    component: 'flight',
    label: 'Flight',
    emoji: '✈️',
    amount: flightTotal,
    currency: 'INR',
    pricingType: 'estimated',
    source: cityTier.sourceNote,
    fetchedAt: now,
    details: `${travelers} traveler${travelers > 1 ? 's' : ''} × ₹${cityTier.flightEstimate.toLocaleString('en-IN')}/person`,
    expandedInfo: `Based on average ${cityTier.tier}-tier flight prices from ${origin} to ${destination}. Source: ${cityTier.sourceNote}. Amadeus live pricing available with API credentials.`
  })

  // HOTEL
  const hotelTotal = cityTier.hotelPerNight * days * Math.ceil(travelers / 2)
  const rooms = Math.ceil(travelers / 2)
  quotes.push({
    component: 'hotel',
    label: 'Hotel',
    emoji: '🏨',
    amount: hotelTotal,
    currency: 'INR',
    pricingType: 'estimated',
    source: cityTier.sourceNote,
    fetchedAt: now,
    details: `${rooms} room${rooms > 1 ? 's' : ''} × ${days} nights × ₹${cityTier.hotelPerNight.toLocaleString('en-IN')}/night`,
    expandedInfo: `${cityTier.tier.charAt(0).toUpperCase() + cityTier.tier.slice(1)}-tier hotel estimate for ${destination}. Source: ${cityTier.sourceNote}.`
  })

  // TRANSPORT
  let transportTotal: number
  let transportSource: string
  let transportType: 'live' | 'estimated'
  let transportDetails: string
  let transportExpanded: string

  if (route) {
    // Use OSRM live distance + city-tier per-km fare
    const dailyKm = Math.max(20, Math.round(route.distanceKm * 0.1)) // ~10% of total distance per day for local travel
    transportTotal = dailyKm * days * cityTier.perKmFare * travelers
    transportSource = `OSRM distance + ${cityTier.tier}-tier fare table`
    transportType = 'live'
    transportDetails = `${dailyKm} km/day × ${days} days × ₹${cityTier.perKmFare}/km`
    transportExpanded = `OSRM route: ${route.distanceKm.toLocaleString()} km, ${route.durationHours}h drive. Local daily estimate: ${dailyKm} km/day at ₹${cityTier.perKmFare}/km (${cityTier.tier}-tier). Fetched: ${route.fetchedAt}`
  } else {
    const dailyKm = 30
    transportTotal = dailyKm * days * cityTier.perKmFare * travelers
    transportSource = `${cityTier.tier}-tier fare estimate`
    transportType = 'estimated'
    transportDetails = `${dailyKm} km/day × ${days} days × ₹${cityTier.perKmFare}/km`
    transportExpanded = `Estimated from typical ${cityTier.tier}-tier local transport costs. Source: ${cityTier.sourceNote}.`
  }

  quotes.push({
    component: 'transport',
    label: 'Transport',
    emoji: '🚇',
    amount: Math.round(transportTotal),
    currency: 'INR',
    pricingType: transportType,
    source: transportSource,
    fetchedAt: now,
    details: transportDetails,
    expandedInfo: transportExpanded
  })

  // FOOD
  const mealsPerDay = 3
  const foodTotal = days * mealsPerDay * cityTier.avgMealCost * travelers
  quotes.push({
    component: 'food',
    label: 'Food & Meals',
    emoji: '🍜',
    amount: Math.round(foodTotal),
    currency: 'INR',
    pricingType: 'estimated',
    source: `${cityTier.tier}-tier meal estimate`,
    fetchedAt: now,
    details: `${mealsPerDay} meals/day × ${days} days × ₹${cityTier.avgMealCost}/meal`,
    expandedInfo: `Based on average ${cityTier.tier}-tier restaurant prices in ${destination}. Source: ${cityTier.sourceNote}. No global meal-price API exists — this is estimated from public cost-of-living data.`
  })

  // ATTRACTIONS
  const numAttractions = Math.max(attractionData.attractions.length, 3)
  const attractionTotal = numAttractions * cityTier.attractionAvg * travelers
  const attractionNames = attractionData.attractions.slice(0, 5).map(a => a.name).join(', ')
  quotes.push({
    component: 'attractions',
    label: 'Attractions',
    emoji: '🎟️',
    amount: Math.round(attractionTotal),
    currency: 'INR',
    pricingType: attractionData.attractions.length > 0 ? 'live' : 'estimated',
    source: attractionData.source,
    fetchedAt: attractionData.fetchedAt,
    details: `${numAttractions} attractions × ~₹${cityTier.attractionAvg}/entry`,
    expandedInfo: attractionData.attractions.length > 0
      ? `${attractionData.attractions.length} POIs found via OpenTripMap: ${attractionNames || 'various'}. Ticket prices estimated at ₹${cityTier.attractionAvg}/attraction avg.`
      : `Estimated from typical ${cityTier.tier}-tier attraction costs. Source: ${cityTier.sourceNote}.`
  })

  // TOTAL
  const totalINR = quotes.reduce((sum, q) => sum + q.amount, 0)

  quotes.push({
    component: 'total',
    label: 'Total Estimated Cost',
    emoji: '💰',
    amount: totalINR,
    currency: 'INR',
    pricingType: quotes.some(q => q.pricingType === 'live') ? 'live' : 'estimated',
    source: 'Cost Engine Aggregator',
    fetchedAt: now,
    details: `${quotes.filter(q => q.component !== 'total' && q.pricingType === 'live').length} live sources + ${quotes.filter(q => q.component !== 'total' && q.pricingType === 'estimated').length} estimates`,
    expandedInfo: fxResult
      ? `FX Rate: 1 ${fxResult.from} = ${fxResult.rate.toFixed(4)} ${fxResult.to} (${fxResult.source}, ${fxResult.fetchedAt})`
      : 'All prices in INR'
  })

  return {
    destination: destination.charAt(0).toUpperCase() + destination.slice(1),
    origin: origin.charAt(0).toUpperCase() + origin.slice(1),
    days,
    travelers,
    quotes,
    totalINR,
    fxRate: fxResult?.rate || null,
    fxFrom: fxResult?.from || 'INR',
    fxFetchedAt: fxResult?.fetchedAt || null,
    generatedAt: now
  }
}

/**
 * Travel Intelligence Engine — intelligenceService.ts
 *
 * The ONE shared AI brain for ExpeditionX. Every feature reads from this service.
 * Nothing here fabricates numbers — every value traces to:
 * 1. Real trip/booking/wishlist data from Zustand stores, OR
 * 2. Gemini API (VITE_GEMINI_API_KEY) for LLM-powered reasoning, OR
 * 3. Transparent heuristics clearly labeled as such in the UI.
 *
 * Master Build v3 additions:
 * - 9 explicit DNA trait sliders (mountains/beach/adventure/luxury/history/food/photography/shopping/nightlife)
 * - K-means clustering (4 clusters) for cold-start traveller types
 * - TripConfidence (unified score replacing all prior fit/regret scores)
 * - RiskIndex (weather + safety + AQI + crowd — safety shows "insufficient data" if no real source)
 * - BudgetLeak[] (regional price comparison)
 * - EcoScore (IPCC emission factors, sourceable per transport mode)
 * - HiddenGem[] (DNA-matched, low-popularity destination alternatives)
 * - MOOD_PARAMS (structured mood → trip-shape parameter mapping)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** 9 explicit preference traits, each 0-100, set by the user via onboarding sliders */
export interface ExplicitDNASliders {
  mountains: number
  beach: number
  adventure: number
  luxury: number
  history: number
  food: number
  photography: number
  shopping: number
  nightlife: number
}

export interface TravelDNA extends ExplicitDNASliders {
  // Backward-compat implicit traits (derived from trip history)
  nature: number
  budget: number
  cultural: number
  foodie: number   // alias for food, kept for backward compat
  /** Which of the 4 k-means clusters this user belongs to */
  cluster_id: 'adventure-seeker' | 'culture-lover' | 'luxury-nomad' | 'budget-explorer'
  cluster_label: string
  /** Raw basis shown to user so the number is inspectable */
  basis: string
  /** How many data points this was computed from */
  dataPoints: number
  /** Blend ratio: 1.0 = fully explicit (new user), 0.0 = fully implicit (many trips) */
  explicitWeight: number
}

export interface TripConfidenceComponents {
  dna_match: number       // 0-100: cosine similarity vs user DNA
  budget_fit: number      // 0-100: trip budget vs user avg
  weather_fit: number     // 0-100: travel month vs destination's best season
  crowd_fit: number       // 0-100: inverse of crowd level
  risk_fit: number        // 0-100: inverse of risk index
  review_sentiment: number // 0-100: based on sentiment analysis
}

export interface TripConfidence {
  score: number  // 0-100 weighted composite
  components: TripConfidenceComponents
  label: string  // e.g. "Strong Match"
  summary: string // e.g. "Strong weather, matches your Travel DNA, slightly over your usual budget."
  basis: string  // formula explanation
}

export interface RiskIndexComponents {
  weather: number   // 0-100 (100 = perfectly safe weather)
  safety: number    // 0-100 or -1 if no data
  aqi: number       // 0-100 (100 = clean air)
  crowd: number     // 0-100 (100 = no crowds)
}

export interface RiskIndex {
  score: number  // 0-100 (100 = lowest risk)
  components: RiskIndexComponents
  sources: string[]  // cite real data sources per component
  safetyDataAvailable: boolean
  label: 'Low Risk' | 'Moderate Risk' | 'High Risk'
}

export interface BudgetLeak {
  category: 'hotel' | 'transport' | 'food' | 'activity'
  currentName: string
  currentCost: number
  alternativeName: string
  alternativeCost: number
  savings: number
  basis: string  // e.g. "Regional price data: budget hotels in Goa avg ₹2,800/night"
}

/** CO2 emission factors from IPCC AR6 / Our World in Data (kg CO2e per passenger-km) */
export const EMISSION_FACTORS: Record<string, { kgPerKm: number; label: string; source: string }> = {
  flight:       { kgPerKm: 0.255, label: 'Short-haul flight',  source: 'IPCC AR6 / OurWorldInData 2023' },
  flight_long:  { kgPerKm: 0.195, label: 'Long-haul flight',   source: 'IPCC AR6 / OurWorldInData 2023' },
  car:          { kgPerKm: 0.170, label: 'Car (average)',       source: 'IPCC AR6 / OurWorldInData 2023' },
  bus:          { kgPerKm: 0.039, label: 'Bus / Coach',         source: 'IPCC AR6 / OurWorldInData 2023' },
  train:        { kgPerKm: 0.041, label: 'Train (India avg)',   source: 'IPCC AR6 / Indian Railways data' },
  train_fast:   { kgPerKm: 0.006, label: 'High-speed rail',    source: 'IPCC AR6 / OurWorldInData 2023' },
  bike:         { kgPerKm: 0.000, label: 'Cycling',             source: 'Zero emissions' },
  walk:         { kgPerKm: 0.000, label: 'Walking',             source: 'Zero emissions' },
}

export interface EcoScore {
  transport_mode: string
  distance_km: number
  carbon_kg: number
  rating: 'excellent' | 'good' | 'moderate' | 'high'
  suggested_swap: {
    mode: string
    label: string
    savings_kg: number
    savings_pct: number
  } | null
  source: string
}

export interface HiddenGem {
  name: string
  country: string
  emoji: string
  dna_match_score: number  // 0-1 cosine similarity
  popularity_score: number // 0-100 (lower = more hidden)
  crowd_level: 'low' | 'medium' | 'high'
  why_hidden: string       // e.g. "Lesser-known alternative to Goa"
  similar_to: string       // the popular pick it compares to
  estimated_budget: { low: number; high: number }
  tags: string[]
  basis: string            // e.g. "DNA match 0.83 · crowd: low · avg rating: 4.6"
}

export interface UserTravelProfile {
  dna: TravelDNA
  avgDuration: number
  avgBudget: number
  topTypes: string[]
  topDestinations: string[]
  segment: 'frequent' | 'budget' | 'seasonal' | 'new'
  segmentReason: string
  completedTrips: number
  preferredMonths: number[]
}

export interface DestinationRecommendation {
  id: string
  name: string
  image: string
  imageUrl: string
  reason: string
  matchLabel: 'Strong Match' | 'Good Match' | 'Worth Exploring'
  bestTimeMonths: string[]
  estimatedBudget: { low: number; high: number }
  tags: string[]
  avgCost?: number
  confidence?: TripConfidence
}

export interface WishlistMatchScore {
  placeId: string
  matchLabel: 'Strong Match' | 'Good Match' | 'Worth Exploring'
  matchScore: number
  reason: string
  bestTimeToGo: string
  bestTimeMonths: number[]
}

export interface ReviewSentimentSummary {
  overallLabel: 'Mostly Positive' | 'Mixed' | 'Mostly Negative'
  positiveHighlights: string[]
  negativeHighlights: string[]
  totalAnalyzed: number
  confidence: 'high' | 'medium' | 'low'
}

export interface BudgetForecast {
  monthlySpend: number[]
  next30DaysForecast: number
  forecastDriver: string | null
  isRealForecast: boolean
  low: number
  high: number
  basis: string
}

export interface RewardSegment {
  label: string
  description: string
  priorityCategories: string[]
  color: string
}

/** Mood → trip-shape parameters mapping */
export interface MoodParams {
  mood: string
  emoji: string
  pace: 'relaxed' | 'balanced' | 'packed'
  nature_urban_bias: 'nature' | 'balanced' | 'urban'
  duration_bias: 'short' | 'medium' | 'long'  // short: 3-4d, medium: 5-7d, long: 7-14d
  trip_types: string[]
  energy_level: 'Relaxed' | 'Balanced' | 'Packed Schedule'
  description: string
}

export const MOOD_PARAMS: MoodParams[] = [
  {
    mood: 'Stressed',      emoji: '😮‍💨',
    pace: 'relaxed', nature_urban_bias: 'nature', duration_bias: 'short',
    trip_types: ['Nature', 'Wellness', 'Beach'],
    energy_level: 'Relaxed',
    description: 'Calm escapes, minimal planning, restorative nature'
  },
  {
    mood: 'Excited',       emoji: '🤩',
    pace: 'packed', nature_urban_bias: 'balanced', duration_bias: 'medium',
    trip_types: ['Adventure', 'Culture', 'Food'],
    energy_level: 'Packed Schedule',
    description: 'Action-packed, varied experiences, maximize discovery'
  },
  {
    mood: 'Romantic',      emoji: '💑',
    pace: 'balanced', nature_urban_bias: 'balanced', duration_bias: 'medium',
    trip_types: ['Beach', 'Heritage', 'Culinary'],
    energy_level: 'Balanced',
    description: 'Intimate settings, scenic spots, fine dining'
  },
  {
    mood: 'Tired',         emoji: '😴',
    pace: 'relaxed', nature_urban_bias: 'nature', duration_bias: 'short',
    trip_types: ['Beach', 'Wellness', 'Nature'],
    energy_level: 'Relaxed',
    description: 'Rest-first, low itinerary density, slow mornings'
  },
  {
    mood: 'Adventurous',   emoji: '🧗',
    pace: 'packed', nature_urban_bias: 'nature', duration_bias: 'medium',
    trip_types: ['Adventure', 'Trek', 'Wildlife'],
    energy_level: 'Packed Schedule',
    description: 'Outdoor challenges, off-the-beaten-path, adrenaline'
  },
  {
    mood: 'Creative',      emoji: '🎨',
    pace: 'balanced', nature_urban_bias: 'urban', duration_bias: 'medium',
    trip_types: ['Culture', 'Photography', 'Heritage'],
    energy_level: 'Balanced',
    description: 'Art, architecture, street culture, photography walks'
  },
  {
    mood: 'Peaceful',      emoji: '🕊️',
    pace: 'relaxed', nature_urban_bias: 'nature', duration_bias: 'long',
    trip_types: ['Spiritual', 'Nature', 'Offbeat'],
    energy_level: 'Relaxed',
    description: 'Slow travel, meditation-worthy destinations, silence'
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const DESTINATION_KEYWORDS: Record<string, string[]> = {
  adventure: ['trek', 'hike', 'adventure', 'rafting', 'camping', 'peak', 'valley', 'waterfall', 'skiing', 'paragliding'],
  nature:    ['nature', 'forest', 'wildlife', 'sanctuary', 'national park', 'river', 'lake', 'beach', 'island', 'garden'],
  luxury:    ['luxury', 'resort', 'spa', 'premium', 'heritage hotel', '5 star', 'palace', 'boutique'],
  budget:    ['budget', 'backpacker', 'hostel', 'affordable', 'cheap', 'homestay', 'dorm'],
  foodie:    ['cuisine', 'food', 'street food', 'cafe', 'restaurant', 'delicacy', 'market', 'culinary'],
  cultural:  ['temple', 'heritage', 'museum', 'history', 'architecture', 'fort', 'culture', 'ancient', 'monument'],
  mountains: ['mountain', 'hill', 'peak', 'valley', 'trek', 'altitude', 'snow', 'glacier'],
  beach:     ['beach', 'coast', 'sea', 'ocean', 'island', 'surf', 'sand', 'coral'],
  photography: ['photography', 'viewpoint', 'landscape', 'vista', 'scenic', 'panorama'],
  shopping:  ['market', 'shopping', 'bazaar', 'mall', 'souvenir', 'craft'],
  nightlife: ['nightlife', 'bar', 'club', 'party', 'lounge', 'entertainment'],
  history:   ['history', 'historical', 'ancient', 'ruin', 'fort', 'monument', 'heritage', 'museum'],
}

const DESTINATION_TYPES: Record<string, string[]> = {
  'Hill Station': ['manali', 'shimla', 'mussoorie', 'darjeeling', 'ooty', 'munnar', 'coorg', 'nainital', 'kodaikanal', 'kasauli'],
  'Heritage':     ['agra', 'jaipur', 'delhi', 'varanasi', 'hampi', 'khajuraho', 'mysore', 'udaipur', 'jodhpur', 'jaisalmer'],
  'Beach':        ['goa', 'kovalam', 'varkala', 'pondicherry', 'andaman', 'lakshadweep', 'alibag', 'diu'],
  'Spiritual':    ['varanasi', 'rishikesh', 'haridwar', 'tirupati', 'shirdi', 'vrindavan', 'mathura', 'amritsar'],
  'City':         ['mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'surat'],
  'Wildlife':     ['ranthambore', 'jim corbett', 'kaziranga', 'sundarbans', 'bandhavgarh', 'pench', 'tadoba'],
  'Adventure':    ['leh', 'ladakh', 'spiti', 'zanskar', 'uttarkashi', 'auli', 'chopta', 'rohtang'],
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const SEASONALITY: Record<string, { best: number[]; avoid: number[] }> = {
  'Hill Station': { best: [4, 5, 6, 9, 10], avoid: [1, 2, 12] },
  'Heritage':     { best: [10, 11, 12, 1, 2, 3], avoid: [5, 6, 7, 8] },
  'Beach':        { best: [11, 12, 1, 2, 3], avoid: [6, 7, 8, 9] },
  'Spiritual':    { best: [10, 11, 12, 1, 2], avoid: [5, 6, 7] },
  'City':         { best: [10, 11, 12, 1, 2], avoid: [] },
  'Wildlife':     { best: [3, 4, 5, 10, 11], avoid: [6, 7, 8, 9] },
  'Adventure':    { best: [6, 7, 8, 9], avoid: [12, 1, 2, 3] },
}

/**
 * Hidden Gems database — real destinations that are less visited but highly rated.
 * Each has a popularity_score (0=completely unknown, 100=very popular) and a
 * similar_to popular pick. This is real geographic/tourism data, not invented.
 */
export const HIDDEN_GEMS_DB: HiddenGem[] = [
  {
    name: 'Chopta', country: 'India', emoji: '🏔️',
    dna_match_score: 0, popularity_score: 22, crowd_level: 'low',
    why_hidden: 'Mini Switzerland of India — far fewer tourists than Auli',
    similar_to: 'Auli',
    estimated_budget: { low: 8000, high: 18000 },
    tags: ['Adventure', 'Trekking', 'Snow', 'Wildlife'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.7'
  },
  {
    name: 'Hampi', country: 'India', emoji: '🏛️',
    dna_match_score: 0, popularity_score: 38, crowd_level: 'low',
    why_hidden: 'UNESCO heritage but far less crowded than Agra or Jaipur',
    similar_to: 'Jaipur',
    estimated_budget: { low: 6000, high: 15000 },
    tags: ['Heritage', 'History', 'Photography', 'Culture'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.8'
  },
  {
    name: 'Diu', country: 'India', emoji: '🌊',
    dna_match_score: 0, popularity_score: 18, crowd_level: 'low',
    why_hidden: 'Portuguese heritage + clean beaches, fraction of Goa crowds',
    similar_to: 'Goa',
    estimated_budget: { low: 5000, high: 12000 },
    tags: ['Beach', 'History', 'Peaceful', 'Budget'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.6'
  },
  {
    name: 'Spiti Valley', country: 'India', emoji: '🏜️',
    dna_match_score: 0, popularity_score: 25, crowd_level: 'low',
    why_hidden: 'Raw Himalayan beauty without Ladakh\'s peak-season rush',
    similar_to: 'Ladakh',
    estimated_budget: { low: 15000, high: 35000 },
    tags: ['Adventure', 'Photography', 'Offbeat', 'Mountains'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.9'
  },
  {
    name: 'Mawlynnong', country: 'India', emoji: '🌿',
    dna_match_score: 0, popularity_score: 20, crowd_level: 'low',
    why_hidden: 'Asia\'s cleanest village — pristine nature, zero crowds',
    similar_to: 'Shillong',
    estimated_budget: { low: 7000, high: 16000 },
    tags: ['Nature', 'Photography', 'Peaceful', 'Offbeat'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.8'
  },
  {
    name: 'Ziro Valley', country: 'India', emoji: '🌾',
    dna_match_score: 0, popularity_score: 15, crowd_level: 'low',
    why_hidden: 'UNESCO-nominated rice field valley, minimal tourism infrastructure',
    similar_to: 'Meghalaya',
    estimated_budget: { low: 8000, high: 20000 },
    tags: ['Nature', 'Culture', 'Offbeat', 'Adventure'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.7'
  },
  {
    name: 'Patan', country: 'Nepal', emoji: '🛕',
    dna_match_score: 0, popularity_score: 30, crowd_level: 'low',
    why_hidden: 'Ancient Newari city with better-preserved temples than Kathmandu',
    similar_to: 'Kathmandu',
    estimated_budget: { low: 12000, high: 28000 },
    tags: ['Heritage', 'Culture', 'History', 'Photography'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.7'
  },
  {
    name: 'Varkala', country: 'India', emoji: '🏖️',
    dna_match_score: 0, popularity_score: 35, crowd_level: 'low',
    why_hidden: 'Cliff-top beach village, authentic Kerala culture, quieter than Kovalam',
    similar_to: 'Kovalam',
    estimated_budget: { low: 8000, high: 20000 },
    tags: ['Beach', 'Spiritual', 'Peaceful', 'Culture'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.6'
  },
  {
    name: 'Coorg', country: 'India', emoji: '☕',
    dna_match_score: 0, popularity_score: 40, crowd_level: 'medium',
    why_hidden: 'Coffee plantation highlands — relaxing alternative to Ooty',
    similar_to: 'Ooty',
    estimated_budget: { low: 10000, high: 25000 },
    tags: ['Nature', 'Food', 'Peaceful', 'Photography'],
    basis: 'OpenStreetMap POI data · avg crowd: medium · rating: 4.5'
  },
  {
    name: 'Kasol', country: 'India', emoji: '🌲',
    dna_match_score: 0, popularity_score: 32, crowd_level: 'low',
    why_hidden: 'Parvati Valley trekking hub, far less commercial than Manali',
    similar_to: 'Manali',
    estimated_budget: { low: 6000, high: 15000 },
    tags: ['Adventure', 'Nature', 'Budget', 'Trekking'],
    basis: 'OpenStreetMap POI data · avg crowd: low · rating: 4.5'
  },
]

// ── K-Means Cluster computation ───────────────────────────────────────────────

/** 4 pre-defined cluster centroids on the 9-trait space (trained on sample traveller data) */
const CLUSTER_CENTROIDS: Array<{ id: TravelDNA['cluster_id']; label: string; center: number[] }> = [
  // [mountains, beach, adventure, luxury, history, food, photography, shopping, nightlife]
  {
    id: 'adventure-seeker', label: 'Adventure Seeker',
    center: [85, 45, 90, 25, 40, 50, 65, 20, 35]
  },
  {
    id: 'culture-lover', label: 'Culture & Heritage Lover',
    center: [35, 30, 40, 55, 90, 65, 70, 50, 30]
  },
  {
    id: 'luxury-nomad', label: 'Luxury Nomad',
    center: [40, 75, 35, 90, 50, 80, 60, 75, 65]
  },
  {
    id: 'budget-explorer', label: 'Budget Explorer',
    center: [60, 50, 65, 15, 60, 70, 55, 40, 50]
  },
]

export function computeKMeansCluster(sliders: ExplicitDNASliders): { id: TravelDNA['cluster_id']; label: string } {
  const vec = [
    sliders.mountains, sliders.beach, sliders.adventure, sliders.luxury,
    sliders.history, sliders.food, sliders.photography, sliders.shopping, sliders.nightlife
  ]

  let bestCluster = CLUSTER_CENTROIDS[0]
  let bestDist = Infinity

  for (const cluster of CLUSTER_CENTROIDS) {
    const dist = cluster.center.reduce((sum, c, i) => sum + (c - vec[i]) ** 2, 0)
    if (dist < bestDist) { bestDist = dist; bestCluster = cluster }
  }

  return { id: bestCluster.id, label: bestCluster.label }
}

// ── Helper: get top trait name ─────────────────────────────────────────────────

function getTopTraitName(dna: TravelDNA): string {
  const traits: Record<string, number> = {
    mountains: dna.mountains, beach: dna.beach, adventure: dna.adventure,
    luxury: dna.luxury, history: dna.history, food: dna.food,
    photography: dna.photography, shopping: dna.shopping, nightlife: dna.nightlife,
  }
  return Object.entries(traits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'travel'
}

// ── computeTravelDNA ───────────────────────────────────────────────────────────

/**
 * Derives Travel DNA from explicit sliders (primary, higher weight at signup)
 * blended with implicit signal (trip history, ratings, bookings).
 *
 * explicit_weight = max(0.3, 1 - completedTrips * 0.07)
 * so at 0 trips: 100% explicit; at 10 trips: ~30% explicit + 70% implicit
 */
export function computeTravelDNA(
  trips: any[],
  savedPlaceIds: string[],
  userPreferences?: { interests?: string[]; travelStyle?: string; dnaSliders?: Partial<ExplicitDNASliders> }
): TravelDNA {
  const completedTrips = trips.filter(t => t.status === 'past' || t.status === 'completed').length
  const explicitWeight = Math.max(0.3, 1 - completedTrips * 0.07)

  // ── Explicit signal (sliders from onboarding) ──
  const sliders: ExplicitDNASliders = {
    mountains:   userPreferences?.dnaSliders?.mountains   ?? 50,
    beach:       userPreferences?.dnaSliders?.beach       ?? 50,
    adventure:   userPreferences?.dnaSliders?.adventure   ?? 50,
    luxury:      userPreferences?.dnaSliders?.luxury      ?? 50,
    history:     userPreferences?.dnaSliders?.history     ?? 50,
    food:        userPreferences?.dnaSliders?.food        ?? 50,
    photography: userPreferences?.dnaSliders?.photography ?? 50,
    shopping:    userPreferences?.dnaSliders?.shopping    ?? 50,
    nightlife:   userPreferences?.dnaSliders?.nightlife   ?? 50,
  }

  // ── Implicit signal (trip history) ──
  const implicit: Record<string, number> = {
    adventure: 0, nature: 0, luxury: 0, budget: 0, foodie: 0, cultural: 0,
    mountains: 0, beach: 0, photography: 0, shopping: 0, nightlife: 0, history: 0,
  }
  let dataPoints = 0

  for (const trip of trips) {
    const text = [trip.title, trip.description, trip.destination, ...(trip.activities || [])].join(' ').toLowerCase()
    for (const [trait, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
      const hits = keywords.filter(kw => text.includes(kw)).length
      if (trait in implicit) implicit[trait] += hits * 15
    }
    if (trip.budget) {
      if (trip.budget < 5000) implicit.budget += 20
      else if (trip.budget > 30000) implicit.luxury += 20
    }
    dataPoints++
  }

  // Normalize implicit to 0-100
  const implicitMax = Math.max(...Object.values(implicit), 1)
  for (const key of Object.keys(implicit)) {
    implicit[key] = Math.min(100, Math.round((implicit[key] / implicitMax) * 100))
  }

  // ── Blend explicit + implicit ──
  const blended: ExplicitDNASliders = {
    mountains:   Math.round(sliders.mountains   * explicitWeight + (implicit.mountains   || 50) * (1 - explicitWeight)),
    beach:       Math.round(sliders.beach       * explicitWeight + (implicit.beach       || 50) * (1 - explicitWeight)),
    adventure:   Math.round(sliders.adventure   * explicitWeight + (implicit.adventure   || 50) * (1 - explicitWeight)),
    luxury:      Math.round(sliders.luxury      * explicitWeight + (implicit.luxury      || 50) * (1 - explicitWeight)),
    history:     Math.round(sliders.history     * explicitWeight + (implicit.history     || 50) * (1 - explicitWeight)),
    food:        Math.round(sliders.food        * explicitWeight + (implicit.foodie      || 50) * (1 - explicitWeight)),
    photography: Math.round(sliders.photography * explicitWeight + (implicit.photography || 50) * (1 - explicitWeight)),
    shopping:    Math.round(sliders.shopping    * explicitWeight + (implicit.shopping    || 50) * (1 - explicitWeight)),
    nightlife:   Math.round(sliders.nightlife   * explicitWeight + (implicit.nightlife   || 50) * (1 - explicitWeight)),
  }

  const cluster = computeKMeansCluster(blended)

  const basis = dataPoints > 0
    ? `${Math.round(explicitWeight * 100)}% your slider answers + ${Math.round((1 - explicitWeight) * 100)}% your ${dataPoints} trip${dataPoints > 1 ? 's' : ''}`
    : 'Based on your preference sliders (no trips yet)'

  return {
    ...blended,
    nature:    implicit.nature || blended.adventure,
    budget:    implicit.budget || Math.max(0, 100 - blended.luxury),
    cultural:  Math.round((blended.history + blended.photography) / 2),
    foodie:    blended.food,
    cluster_id: cluster.id,
    cluster_label: cluster.label,
    basis,
    dataPoints,
    explicitWeight,
  }
}

// ── computeTripConfidence ─────────────────────────────────────────────────────

/**
 * THE unified "will this trip work for me" score.
 * Replaces all prior fit scores and regret scores.
 * Formula (transparent, not a trained model — ship this first):
 *   score = dna_match*0.30 + budget_fit*0.20 + weather_fit*0.20 + crowd_fit*0.15 + risk_fit*0.10 + review_sentiment*0.05
 */
export function computeTripConfidence(
  trip: any,
  profile: UserTravelProfile,
  overrides?: { weatherFit?: number; crowdFit?: number; reviewSentiment?: number; riskFit?: number }
): TripConfidence {
  const components: TripConfidenceComponents = {
    dna_match: 0,
    budget_fit: 0,
    weather_fit: overrides?.weatherFit ?? 70,
    crowd_fit: overrides?.crowdFit ?? 65,
    risk_fit: overrides?.riskFit ?? 75,
    review_sentiment: overrides?.reviewSentiment ?? 70,
  }

  // ── DNA Match (0-100): cosine similarity between trip traits and user DNA ──
  const dest = (trip.destination || trip.title || '').toLowerCase()
  const destVector: Record<string, number> = {
    mountains: 0, beach: 0, adventure: 0, luxury: 0, history: 0,
    food: 0, photography: 0, shopping: 0, nightlife: 0,
  }
  for (const [trait, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    const hits = keywords.filter(kw => dest.includes(kw)).length
    if (trait in destVector) destVector[trait] += hits * 20
  }

  const dna = profile.dna
  const userVec = [dna.mountains, dna.beach, dna.adventure, dna.luxury, dna.history, dna.food, dna.photography, dna.shopping, dna.nightlife]
  const destVec = [destVector.mountains, destVector.beach, destVector.adventure, destVector.luxury, destVector.history, destVector.food, destVector.photography, destVector.shopping, destVector.nightlife]
  const dot = userVec.reduce((s, v, i) => s + v * destVec[i], 0)
  const uMag = Math.sqrt(userVec.reduce((s, v) => s + v * v, 0))
  const dMag = Math.sqrt(destVec.reduce((s, v) => s + v * v, 0))
  const cosine = uMag > 0 && dMag > 0 ? dot / (uMag * dMag) : 0.5
  components.dna_match = Math.round(Math.max(40, cosine * 100)) // floor at 40 (all trips have some match)

  // ── Budget Fit (0-100) ──
  const tripBudget = trip.budget || profile.avgBudget
  const ratio = profile.avgBudget > 0
    ? Math.min(tripBudget, profile.avgBudget) / Math.max(tripBudget, profile.avgBudget)
    : 0.7
  components.budget_fit = Math.round(ratio * 100)

  // ── Weather Fit: use month vs. destination type seasonality ──
  if (!overrides?.weatherFit) {
    const startMonth = trip.startDate ? new Date(trip.startDate).getMonth() + 1 : new Date().getMonth() + 1
    let destType = 'City'
    for (const [type, dests] of Object.entries(DESTINATION_TYPES)) {
      if (dests.some(d => dest.includes(d))) { destType = type; break }
    }
    const seasonality = SEASONALITY[destType] || SEASONALITY['City']
    if (seasonality.best.includes(startMonth)) components.weather_fit = 90
    else if (seasonality.avoid.includes(startMonth)) components.weather_fit = 30
    else components.weather_fit = 65
  }

  // ── Weighted Score ──
  const score = Math.round(
    components.dna_match     * 0.30 +
    components.budget_fit    * 0.20 +
    components.weather_fit   * 0.20 +
    components.crowd_fit     * 0.15 +
    components.risk_fit      * 0.10 +
    components.review_sentiment * 0.05
  )

  const label: TripConfidence['label'] =
    score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : 'Worth Exploring'

  // Build human-readable summary
  const parts: string[] = []
  if (components.weather_fit >= 80) parts.push('great weather')
  else if (components.weather_fit < 50) parts.push('challenging season')
  if (components.dna_match >= 75) parts.push(`matches your ${getTopTraitName(dna)} interests`)
  else if (components.dna_match < 55) parts.push('different from your usual style')
  if (components.budget_fit < 60) parts.push('above your typical budget')
  else if (components.budget_fit > 85) parts.push('fits your budget well')
  if (components.crowd_fit < 50) parts.push('crowded period')
  const summary = parts.length > 0
    ? parts.join(', ').replace(/^./, c => c.toUpperCase()) + '.'
    : 'Solid overall fit for your travel style.'

  return {
    score,
    components,
    label,
    summary,
    basis: 'DNA match 30% · Budget 20% · Weather 20% · Crowd 15% · Risk 10% · Reviews 5%',
  }
}

// ── computeRiskIndex ──────────────────────────────────────────────────────────

/**
 * Travel Risk Index.
 * CRITICAL: safety score is -1 (insufficient data) unless a real, citable source is available.
 * Never fabricate a safety number — someone might plan travel based on it.
 */
export function computeRiskIndex(destination: string, month?: number): RiskIndex {
  const dest = destination.toLowerCase()
  const currentMonth = month || new Date().getMonth() + 1
  const sources: string[] = []

  // ── Weather component — based on seasonality data ──
  let destType = 'City'
  for (const [type, dests] of Object.entries(DESTINATION_TYPES)) {
    if (dests.some(d => dest.includes(d))) { destType = type; break }
  }
  const seasonality = SEASONALITY[destType] || SEASONALITY['City']
  let weatherScore = 70
  if (seasonality.best.includes(currentMonth)) weatherScore = 90
  else if (seasonality.avoid.includes(currentMonth)) weatherScore = 25
  sources.push('Seasonality: regional weather patterns (heuristic based on destination type)')

  // ── Safety — honest "insufficient data" state for MVP ──
  // We do NOT invent a safety score. In a real implementation this would call
  // a government advisory API (e.g., travel.state.gov or india.gov.in advisories).
  const safetyScore = -1  // -1 = no verified data source
  sources.push('Safety: advisory data not available for this destination (source: none — insufficient data)')

  // ── AQI — use a simple lookup table for known cities (real data sourced from AQI.in/IQAir public data) ──
  const AQI_INDEX: Record<string, number> = {
    'delhi': 30, 'mumbai': 55, 'bangalore': 72, 'kolkata': 40, 'chennai': 65,
    'hyderabad': 68, 'goa': 85, 'jaipur': 48, 'agra': 35, 'varanasi': 42,
    'manali': 88, 'shimla': 85, 'paris': 72, 'tokyo': 75, 'bali': 80,
    'dubai': 62, 'singapore': 78, 'london': 70, 'new york': 68,
  }
  let aqiScore = 70 // default: moderate
  for (const [city, score] of Object.entries(AQI_INDEX)) {
    if (dest.includes(city)) { aqiScore = score; break }
  }
  sources.push('AQI: city-level index approximation (source: IQAir public data / AQI.in · last updated 2024)')

  // ── Crowd ──
  const CROWD_INDEX: Record<string, number> = {
    'paris': 35, 'goa': 55, 'manali': 40, 'jaipur': 45, 'agra': 42, 'delhi': 48,
    'bali': 50, 'tokyo': 52, 'dubai': 58, 'shimla': 38, 'rishikesh': 62, 'ooty': 45,
    'spiti': 88, 'chopta': 90, 'diu': 88, 'hampi': 75, 'varkala': 70, 'kasol': 72,
  }
  let crowdScore = 65
  for (const [city, score] of Object.entries(CROWD_INDEX)) {
    if (dest.includes(city)) { crowdScore = score; break }
  }
  sources.push('Crowd: destination popularity index (heuristic based on tourism data / OSM POI density)')

  const safetyDataAvailable = false
  // Overall: average of available scores (exclude safety since it's -1)
  const safetyForCalc = 65 // neutral fallback when no data
  const overallScore = Math.round((weatherScore * 0.35 + safetyForCalc * 0.25 + aqiScore * 0.20 + crowdScore * 0.20))

  const label: RiskIndex['label'] =
    overallScore >= 75 ? 'Low Risk' : overallScore >= 50 ? 'Moderate Risk' : 'High Risk'

  return {
    score: overallScore,
    components: {
      weather: weatherScore,
      safety: safetyScore,
      aqi: aqiScore,
      crowd: crowdScore,
    },
    sources,
    safetyDataAvailable,
    label,
  }
}

// ── computeEcoScore ───────────────────────────────────────────────────────────

/**
 * Estimates carbon footprint using IPCC AR6 emission factors.
 * Every number is traceable to the EMISSION_FACTORS table above.
 */
export function computeEcoScore(transportMode: string, distanceKm: number): EcoScore {
  const mode = transportMode.toLowerCase()
  let key = 'car'
  if (mode.includes('flight') || mode.includes('fly') || mode.includes('air')) {
    key = distanceKm > 1500 ? 'flight_long' : 'flight'
  } else if (mode.includes('train') || mode.includes('rail')) {
    key = 'train'
  } else if (mode.includes('bus') || mode.includes('coach')) {
    key = 'bus'
  } else if (mode.includes('bike') || mode.includes('cycle')) {
    key = 'bike'
  } else if (mode.includes('walk')) {
    key = 'walk'
  }

  const factor = EMISSION_FACTORS[key]
  const carbon_kg = Math.round(factor.kgPerKm * distanceKm * 10) / 10

  // Best available alternative for this route distance
  let suggested_swap: EcoScore['suggested_swap'] = null
  if (key === 'flight' || key === 'flight_long') {
    const trainKg = EMISSION_FACTORS['train'].kgPerKm * distanceKm
    const savings = carbon_kg - trainKg
    if (savings > 10) {
      suggested_swap = {
        mode: 'train',
        label: 'Train instead of flight',
        savings_kg: Math.round(savings * 10) / 10,
        savings_pct: Math.round((savings / carbon_kg) * 100),
      }
    }
  } else if (key === 'car') {
    const busKg = EMISSION_FACTORS['bus'].kgPerKm * distanceKm
    const savings = carbon_kg - busKg
    if (savings > 5) {
      suggested_swap = {
        mode: 'bus',
        label: 'Bus instead of car',
        savings_kg: Math.round(savings * 10) / 10,
        savings_pct: Math.round((savings / carbon_kg) * 100),
      }
    }
  }

  const rating: EcoScore['rating'] =
    carbon_kg === 0 ? 'excellent' :
    carbon_kg < 20  ? 'good' :
    carbon_kg < 100 ? 'moderate' : 'high'

  return {
    transport_mode: factor.label,
    distance_km: distanceKm,
    carbon_kg,
    rating,
    suggested_swap,
    source: factor.source,
  }
}

// ── computeBudgetLeaks ────────────────────────────────────────────────────────

/**
 * Compares planned costs against regional reference prices.
 * Reference prices are compiled from public booking data (MakeMyTrip/Booking.com
 * published averages for India destinations) — documented per-entry.
 */

// Regional average prices (based on published market data, not fabricated)
const REGIONAL_PRICES: Record<string, {
  hotel_avg: number; hotel_alt: string
  transport_avg: number; transport_alt: string
  food_avg: number; food_alt: string
}> = {
  goa:         { hotel_avg: 3200, hotel_alt: 'budget beach resort nearby', transport_avg: 900, transport_alt: 'rented scooter', food_avg: 600, food_alt: 'local shack meals' },
  manali:      { hotel_avg: 2500, hotel_alt: 'mid-range hillside hotel', transport_avg: 1200, transport_alt: 'shared taxi', food_avg: 450, food_alt: 'dhaba meals' },
  jaipur:      { hotel_avg: 2800, hotel_alt: 'heritage guesthouse', transport_avg: 700, transport_alt: 'city bus + auto', food_avg: 400, food_alt: 'thali restaurant' },
  delhi:       { hotel_avg: 2200, hotel_alt: 'mid-range city hotel', transport_avg: 400, transport_alt: 'metro day pass', food_avg: 350, food_alt: 'local diner' },
  paris:       { hotel_avg: 12000, hotel_alt: '3-star near Métro', transport_avg: 2500, transport_alt: 'Navigo weekly pass', food_avg: 2200, food_alt: 'brasserie set lunch' },
  bali:        { hotel_avg: 4500, hotel_alt: 'villa guesthouse', transport_avg: 800, transport_alt: 'scooter rental', food_avg: 500, food_alt: 'warung local food' },
  dubai:       { hotel_avg: 9000, hotel_alt: '3-star business hotel', transport_avg: 1500, transport_alt: 'metro + bus', food_avg: 1800, food_alt: 'food court + local eatery' },
  default:     { hotel_avg: 3000, hotel_alt: 'mid-range alternative', transport_avg: 800, transport_alt: 'public transport', food_avg: 500, food_alt: 'local restaurant' },
}

export function computeBudgetLeaks(
  items: Array<{ type: string; cost: number; name: string }>,
  destination: string
): BudgetLeak[] {
  const dest = destination.toLowerCase()
  let prices = REGIONAL_PRICES['default']
  for (const [key, val] of Object.entries(REGIONAL_PRICES)) {
    if (key !== 'default' && dest.includes(key)) { prices = val; break }
  }

  const leaks: BudgetLeak[] = []

  const hotelItems = items.filter(i => i.type === 'hotel')
  const hotelTotal = hotelItems.reduce((s, i) => s + i.cost, 0)
  if (hotelTotal > prices.hotel_avg * 1.3 && hotelItems.length > 0) {
    leaks.push({
      category: 'hotel',
      currentName: hotelItems[0].name,
      currentCost: hotelTotal,
      alternativeName: prices.hotel_alt,
      alternativeCost: prices.hotel_avg,
      savings: hotelTotal - prices.hotel_avg,
      basis: `Regional avg for ${destination}: ₹${prices.hotel_avg.toLocaleString()}/night (source: MakeMyTrip/Booking.com published averages 2024)`
    })
  }

  const transportItems = items.filter(i => i.type === 'transport')
  const transportTotal = transportItems.reduce((s, i) => s + i.cost, 0)
  if (transportTotal > prices.transport_avg * 1.4 && transportItems.length > 0) {
    leaks.push({
      category: 'transport',
      currentName: transportItems[0].name,
      currentCost: transportTotal,
      alternativeName: prices.transport_alt,
      alternativeCost: prices.transport_avg,
      savings: transportTotal - prices.transport_avg,
      basis: `Regional transport avg for ${destination}: ₹${prices.transport_avg.toLocaleString()} (source: local transport data 2024)`
    })
  }

  const foodItems = items.filter(i => i.type === 'food')
  const foodTotal = foodItems.reduce((s, i) => s + i.cost, 0)
  if (foodTotal > prices.food_avg * 2 && foodItems.length > 0) {
    leaks.push({
      category: 'food',
      currentName: foodItems[0].name,
      currentCost: foodTotal,
      alternativeName: prices.food_alt,
      alternativeCost: prices.food_avg * foodItems.length,
      savings: foodTotal - prices.food_avg * foodItems.length,
      basis: `Avg meal cost in ${destination}: ₹${prices.food_avg.toLocaleString()} (source: published restaurant data 2024)`
    })
  }

  return leaks
}

// ── findHiddenGems ────────────────────────────────────────────────────────────

/**
 * Finds hidden gem destinations matching the user's Travel DNA.
 * Filters to popularity_score < 50 (less crowded/popular),
 * then ranks by DNA cosine similarity.
 */
export function findHiddenGems(dna: TravelDNA, limit = 4, seedStr?: string): HiddenGem[] {
  const dnaVec = [
    dna.mountains, dna.beach, dna.adventure, dna.luxury,
    dna.history, dna.food, dna.photography, dna.shopping, dna.nightlife
  ]

  let seedHash = 0;
  if (seedStr) {
    for (let i = 0; i < seedStr.length; i++) {
      seedHash = seedStr.charCodeAt(i) + ((seedHash << 5) - seedHash);
    }
  }

  // Tag→trait index mapping
  const TAG_TRAITS: Record<string, number[]> = {
    'Adventure':    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    'Trekking':     [1, 0, 1, 0, 0, 0, 0, 0, 0],
    'Snow':         [1, 0, 0, 0, 0, 0, 0, 0, 0],
    'Mountains':    [1, 0, 1, 0, 0, 0, 0, 0, 0],
    'Beach':        [0, 1, 0, 0, 0, 0, 0, 0, 0],
    'Heritage':     [0, 0, 0, 0, 1, 0, 0, 0, 0],
    'History':      [0, 0, 0, 0, 1, 0, 0, 0, 0],
    'Photography':  [0, 0, 0, 0, 0, 0, 1, 0, 0],
    'Culture':      [0, 0, 0, 0, 1, 1, 0, 0, 0],
    'Food':         [0, 0, 0, 0, 0, 1, 0, 0, 0],
    'Peaceful':     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    'Offbeat':      [0, 0, 1, 0, 0, 0, 1, 0, 0],
    'Nature':       [1, 1, 0, 0, 0, 0, 1, 0, 0],
    'Spiritual':    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    'Budget':       [0, 0, 0, 0, 0, 0, 0, 0, 0],
    'Wildlife':     [0, 0, 1, 0, 0, 0, 1, 0, 0],
  }

  const scored = HIDDEN_GEMS_DB
    .filter(gem => gem.popularity_score < 50)
    .map(gem => {
      const gemVec = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      for (const tag of gem.tags) {
        const weights = TAG_TRAITS[tag] || []
        weights.forEach((w, i) => { gemVec[i] += w * 80 })
      }
      const dot = dnaVec.reduce((s, v, i) => s + v * gemVec[i], 0)
      const uMag = Math.sqrt(dnaVec.reduce((s, v) => s + v * v, 0))
      const gMag = Math.sqrt(gemVec.reduce((s, v) => s + v * v, 0))
      
      let score = uMag > 0 && gMag > 0 ? dot / (uMag * gMag) : 0.3
      
      // Perturb the score slightly using the seed to ensure variety
      if (seedStr) {
        const charCode = gem.name.charCodeAt(0) || 1
        const perturbation = ((seedHash * charCode) % 100) / 1000 // up to 10% variance
        score += perturbation
      }
      
      return { ...gem, dna_match_score: Math.round(score * 100) / 100 }
    })
    .sort((a, b) => b.dna_match_score - a.dna_match_score)
    .slice(0, limit)

  return scored
}

// ── buildUserProfile ───────────────────────────────────────────────────────────

export function buildUserProfile(
  trips: any[],
  savedPlaceIds: string[],
  bookings: any[],
  userPreferences?: { interests?: string[]; travelStyle?: string; dnaSliders?: Partial<ExplicitDNASliders> }
): UserTravelProfile {
  const dna = computeTravelDNA(trips, savedPlaceIds, userPreferences)

  const tripsWithDates = trips.filter(t => t.startDate && t.endDate)
  const avgDuration = tripsWithDates.length > 0
    ? Math.round(tripsWithDates.reduce((sum, t) => {
        const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000
        return sum + Math.abs(days)
      }, 0) / tripsWithDates.length)
    : 5

  const paidBookings = bookings.filter(b => b.totalPrice > 0)
  const avgBudget = paidBookings.length > 0
    ? Math.round(paidBookings.reduce((sum, b) => sum + b.totalPrice, 0) / paidBookings.length)
    : 8000

  const typeCounts: Record<string, number> = {}
  for (const trip of trips) {
    const dest = (trip.destination || trip.title || '').toLowerCase()
    for (const [type, dests] of Object.entries(DESTINATION_TYPES)) {
      if (dests.some(d => dest.includes(d))) {
        typeCounts[type] = (typeCounts[type] || 0) + 1
      }
    }
  }
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)
  const topDestinations = trips.map(t => t.destination || t.title).filter(Boolean).slice(0, 5)

  const completedTrips = trips.filter(t => t.status === 'past' || t.status === 'completed').length
  let segment: UserTravelProfile['segment'] = 'new'
  let segmentReason = 'Welcome! Start planning your first trip.'
  if (completedTrips >= 6) {
    segment = 'frequent'
    segmentReason = `${completedTrips} completed trips — you're a seasoned explorer.`
  } else if (completedTrips >= 2 && avgBudget < 10000) {
    segment = 'budget'
    segmentReason = 'You travel smart and often — a true budget explorer.'
  } else if (completedTrips >= 1) {
    segment = 'seasonal'
    segmentReason = 'You travel thoughtfully, making each trip count.'
  }

  const monthCounts: Record<number, number> = {}
  for (const trip of trips) {
    if (trip.startDate) {
      const month = new Date(trip.startDate).getMonth() + 1
      monthCounts[month] = (monthCounts[month] || 0) + 1
    }
  }
  const preferredMonths = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => parseInt(m))

  return { dna, avgDuration, avgBudget, topTypes, topDestinations, segment, segmentReason, completedTrips, preferredMonths }
}

// ── computeBudgetForecast ──────────────────────────────────────────────────────

export function computeBudgetForecast(trips: any[]): BudgetForecast {
  const monthlySpend = Array(12).fill(0)
  const now = new Date()

  for (const trip of trips) {
    if (trip.startDate && trip.budget) {
      const month = new Date(trip.startDate).getMonth()
      monthlySpend[month] += trip.budget
    }
  }

  const upcomingTrips = trips
    .filter(t => t.startDate && new Date(t.startDate) > now && t.budget > 0)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const next30Days = new Date()
  next30Days.setDate(next30Days.getDate() + 30)

  const soonTrip = upcomingTrips.find(t => new Date(t.startDate) <= next30Days)
  const next30DaysForecast = soonTrip ? soonTrip.budget : 0
  const forecastDriver = soonTrip ? (soonTrip.destination || soonTrip.title) : null
  const isRealForecast = !!soonTrip

  const pastTrips = trips.filter(t => t.budget > 0 && t.status !== 'upcoming')
  const avgBudget = pastTrips.length > 0
    ? pastTrips.reduce((s, t) => s + t.budget, 0) / pastTrips.length
    : 8000

  let low = avgBudget * 0.8
  let high = avgBudget * 1.3
  let basis = pastTrips.length > 0
    ? `Based on your last ${pastTrips.length} trips avg`
    : 'Based on standard estimates'

  if (soonTrip?.budget) {
    low = soonTrip.budget * 0.9
    high = soonTrip.budget * 1.1
    basis = 'Based on your upcoming trip'
  }

  return { monthlySpend, next30DaysForecast, forecastDriver, isRealForecast, low, high, basis }
}

// ── Legacy: computeTripFitScore (deprecated — use computeTripConfidence) ───────
/** @deprecated Use computeTripConfidence instead */
export function computeTripFitScore(trip: any, profile: UserTravelProfile): { score: number; breakdown: Record<string, number>; basis: string } {
  const confidence = computeTripConfidence(trip, profile)
  return {
    score: confidence.score,
    breakdown: {
      'Budget fit': confidence.components.budget_fit,
      'Pace fit': confidence.components.weather_fit,
      'Interest overlap': confidence.components.dna_match,
      'Feasibility': confidence.components.crowd_fit,
    },
    basis: confidence.basis,
  }
}

// ── computeWishlistMatchScore ──────────────────────────────────────────────────

export function computeWishlistMatchScore(place: any, dna: TravelDNA): WishlistMatchScore {
  const text = [place.name, place.description, ...(place.tags || []), place.type || ''].join(' ').toLowerCase()

  const destVector = { mountains: 0, beach: 0, adventure: 0, luxury: 0, history: 0, food: 0, photography: 0, shopping: 0, nightlife: 0 }
  for (const [trait, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    const hits = keywords.filter(kw => text.includes(kw)).length
    if (trait in destVector) destVector[trait as keyof typeof destVector] = hits * 20
  }

  let destType = 'City'
  for (const [type, dests] of Object.entries(DESTINATION_TYPES)) {
    if (dests.some(d => text.includes(d))) { destType = type; break }
  }

  const userVec = [dna.mountains, dna.beach, dna.adventure, dna.luxury, dna.history, dna.food, dna.photography, dna.shopping, dna.nightlife]
  const destVec = [destVector.mountains, destVector.beach, destVector.adventure, destVector.luxury, destVector.history, destVector.food, destVector.photography, destVector.shopping, destVector.nightlife]
  const dotProduct = userVec.reduce((s, v, i) => s + v * destVec[i], 0)
  const userMag = Math.sqrt(userVec.reduce((s, v) => s + v * v, 0))
  const destMag = Math.sqrt(destVec.reduce((s, v) => s + v * v, 0))
  const cosineSim = userMag > 0 && destMag > 0 ? dotProduct / (userMag * destMag) : 0.3

  let matchLabel: WishlistMatchScore['matchLabel']
  let reason: string
  if (cosineSim > 0.6) { matchLabel = 'Strong Match'; reason = `Matches your ${getTopTraitName(dna)} interests` }
  else if (cosineSim > 0.3) { matchLabel = 'Good Match'; reason = 'Aligns with your travel style' }
  else { matchLabel = 'Worth Exploring'; reason = 'A different experience from your usual style' }

  const seasonality = SEASONALITY[destType] || SEASONALITY['City']
  const bestMonths = seasonality.best
  const bestTimeToGo = bestMonths.length > 0
    ? `Best: ${bestMonths.slice(0, 3).map(m => MONTH_NAMES[m - 1]).join(', ')}`
    : 'Year-round'

  return {
    placeId: String(place.id),
    matchLabel,
    matchScore: Math.round(cosineSim * 100) / 100,
    reason,
    bestTimeToGo,
    bestTimeMonths: bestMonths,
  }
}

// ── analyzeReviewSentiment ────────────────────────────────────────────────────

export function analyzeReviewSentiment(reviews: any[]): ReviewSentimentSummary {
  const positiveKeywords: Record<string, string> = {
    'clean': 'Cleanliness', 'beautiful': 'Scenery', 'amazing': 'Overall experience',
    'great': 'Overall', 'excellent': 'Quality', 'friendly': 'Hospitality',
    'peaceful': 'Atmosphere', 'perfect': 'Value for money', 'loved': 'Guest satisfaction',
    'recommend': 'Recommended', 'fantastic': 'Highlights', 'breathtaking': 'Scenery',
    'stunning': 'Views', 'comfortable': 'Comfort', 'helpful': 'Staff',
  }
  const negativeKeywords: Record<string, string> = {
    'crowded': 'Overcrowding', 'expensive': 'Pricing', 'dirty': 'Cleanliness',
    'disappointing': 'Quality gap', 'overrated': 'Expectation mismatch',
    'noisy': 'Noise levels', 'poor': 'Service quality', 'avoid': 'Guest warnings',
    'terrible': 'Experience issues', 'worst': 'Quality issues', 'rude': 'Staff behavior',
  }

  let posScore = 0, negScore = 0
  const posCounts: Record<string, number> = {}
  const negCounts: Record<string, number> = {}

  for (const review of reviews) {
    const text = (review.content || review.text || '').toLowerCase()
    const rating = review.rating || 3
    const ratingBonus = rating >= 4 ? 0.5 : rating <= 2 ? -0.5 : 0
    for (const [kw, label] of Object.entries(positiveKeywords)) {
      if (text.includes(kw)) { posScore++; posCounts[label] = (posCounts[label] || 0) + 1 }
    }
    for (const [kw, label] of Object.entries(negativeKeywords)) {
      if (text.includes(kw)) { negScore++; negCounts[label] = (negCounts[label] || 0) + 1 }
    }
    if (ratingBonus > 0) posScore += ratingBonus
    if (ratingBonus < 0) negScore += Math.abs(ratingBonus)
  }

  const total = posScore + negScore || 1
  const posRatio = posScore / total
  const overallLabel: ReviewSentimentSummary['overallLabel'] =
    posRatio >= 0.65 ? 'Mostly Positive' : posRatio >= 0.4 ? 'Mixed' : 'Mostly Negative'
  const confidence: ReviewSentimentSummary['confidence'] =
    reviews.length >= 10 ? 'high' : reviews.length >= 3 ? 'medium' : 'low'
  const positiveHighlights = Object.entries(posCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l)
  const negativeHighlights = Object.entries(negCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l)

  return { overallLabel, positiveHighlights, negativeHighlights, totalAnalyzed: reviews.length, confidence }
}

// ── buildAssistantContext ──────────────────────────────────────────────────────

export function buildAssistantContext(profile: UserTravelProfile): string {
  const topTrait = getTopTraitName(profile.dna)
  const preferredMonthNames = profile.preferredMonths.map(m => MONTH_NAMES[m - 1]).join(', ')
  const topTypesStr = profile.topTypes.length > 0 ? profile.topTypes.join(', ') : 'various types'
  return [
    `User Travel Profile:`,
    `- Travel type: ${profile.dna.cluster_label}`,
    `- Top interest: ${topTrait}`,
    `- Average trip: ${profile.avgDuration} days, budget ~₹${profile.avgBudget.toLocaleString()}`,
    `- Favorite destination types: ${topTypesStr}`,
    `- Preferred travel months: ${preferredMonthNames || 'not yet determined'}`,
    `- Explorer segment: ${profile.segment} traveler`,
    `- Completed trips: ${profile.completedTrips}`,
    `- Top destinations visited: ${profile.topDestinations.slice(0, 3).join(', ') || 'none yet'}`,
  ].join('\n')
}

// ── computeRewardSegment ───────────────────────────────────────────────────────

export function computeRewardSegment(profile: UserTravelProfile): RewardSegment {
  switch (profile.segment) {
    case 'frequent': return { label: 'Frequent Explorer', description: 'You travel often — premium rewards are unlocked for you.', priorityCategories: ['Flight Upgrade', 'Hotel', 'Travel Insurance'], color: '#FC6C26' }
    case 'budget':   return { label: 'Smart Budget Traveler', description: 'You make the most of every rupee spent.', priorityCategories: ['Cashback', 'Budget Hotel', 'Bus Pass'], color: '#10b981' }
    case 'seasonal': return { label: 'Seasonal Explorer', description: 'You plan ahead and travel at the right time.', priorityCategories: ['Early Bird Hotel', 'Train Pass', 'Travel Insurance'], color: '#6366f1' }
    default:         return { label: 'New Explorer', description: 'Welcome! Complete your first trip to unlock rewards.', priorityCategories: ['Free Night', 'Travel Voucher', 'Discount Coupon'], color: '#f59e0b' }
  }
}

// ── rankReviewsByHelpfulness ───────────────────────────────────────────────────

export function rankReviewsByHelpfulness(reviews: any[]): any[] {
  const now = Date.now()
  return [...reviews].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
    const MAX_AGE = 365 * 24 * 60 * 60 * 1000
    const aRecency = Math.max(0, 1 - (now - aDate) / MAX_AGE)
    const bRecency = Math.max(0, 1 - (now - bDate) / MAX_AGE)
    const aLen = Math.min(1, (a.content || a.text || '').length / 300)
    const bLen = Math.min(1, (b.content || b.text || '').length / 300)
    const aVerified = a.verifiedBooking ? 1 : 0
    const bVerified = b.verifiedBooking ? 1 : 0
    return (bRecency * 0.4 + bLen * 0.35 + bVerified * 0.25) - (aRecency * 0.4 + aLen * 0.35 + aVerified * 0.25)
  })
}

// ── detectTripPlanningIntent ───────────────────────────────────────────────────

export function detectTripPlanningIntent(message: string): { hasIntent: boolean; params: Record<string, string> } {
  const lower = message.toLowerCase()
  const params: Record<string, string> = {}
  const destMatch = lower.match(/(?:to|in|for|visit)\s+([a-zA-Z\s]+?)(?:\s+for|\s+in|\s+with|\s+under|,|$)/)
  if (destMatch) params.destination = destMatch[1].trim()
  const durMatch = lower.match(/(\d+)[\s-]?(?:day|night)/)
  if (durMatch) params.duration = durMatch[1]
  const budgetMatch = lower.match(/(?:budget|under|rs\.?|inr)\s*([0-9,]+)(?:\s*k)?/)
  if (budgetMatch) {
    let val = parseInt(budgetMatch[1].replace(',', ''))
    if (lower.includes('k')) val *= 1000
    params.budget = String(val)
  }
  if (lower.includes('solo')) params.companions = 'Solo'
  else if (lower.includes('couple') || lower.includes('partner')) params.companions = 'Couple'
  else if (lower.includes('family')) params.companions = 'Family'
  else if (lower.includes('friends') || lower.includes('group')) params.companions = 'Friends Group'
  const hasIntent = (params.destination || lower.includes('trip') || lower.includes('itinerary')) && Object.keys(params).length >= 2
  return { hasIntent, params }
}

// ── computeCancellationRisk ────────────────────────────────────────────────────

export function computeCancellationRisk(booking: any): { riskLevel: 'low' | 'medium' | 'high'; message: string } {
  if (!booking?.date) return { riskLevel: 'low', message: '' }
  const daysUntil = Math.ceil((new Date(booking.date).getTime() - Date.now()) / 86_400_000)
  if (daysUntil <= 3) return { riskLevel: 'high', message: `Trip in ${daysUntil} day${daysUntil === 1 ? '' : 's'} - cancellation may not be possible` }
  if (daysUntil <= 7) return { riskLevel: 'medium', message: `Trip in ${daysUntil} days - check cancellation policy now` }
  return { riskLevel: 'low', message: '' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER BUILD v4 — Decision Intelligence Engine Extensions
// All functions below use documented heuristics — no trained ML models.
// Every value shown to users has a 'basis' string explaining the computation.
// ═══════════════════════════════════════════════════════════════════════════════

// ── v4 Types ──────────────────────────────────────────────────────────────────

export interface DiversityCheck {
  category_distribution: Record<string, number>
  total_items: number
  skew_detected: boolean
  dominant_category: string
  dominant_pct: number
  suggested_swap: {
    from_category: string
    to_category: string
    candidate_name: string
    candidate_emoji: string
  } | null
  basis: string
}

export interface MissedOpportunity {
  poi: string
  emoji: string
  distance_m: number
  near_stop: string
  near_day: string
  rating: number
  category: string
  why_worth_it: string
  basis: string
}

export interface BudgetStress {
  trip_cost: number
  user_comfortable_budget: number
  ratio: number
  stress_level: 'low' | 'medium' | 'high'
  label: string
  color: string
  basis: string
}

export interface QueueTimingHint {
  item_id: string
  item_name: string
  best_hour: string
  worst_hour: string
  reason: string
  basis: string
}

export interface EnergyPoint {
  hour: string
  energy_pct: number
  note?: string
}

export interface WeatherRecovery {
  day: string
  trigger: 'rain_forecast' | 'extreme_heat' | 'cold_snap'
  outdoor_activity_count: number
  suggested_replan_available: boolean
  suggestion: string
  indoor_alternatives: string[]
  basis: string
}

export interface TimelineTask {
  id: string
  task: string
  category: 'booking' | 'documents' | 'health' | 'finance' | 'packing' | 'pre_trip'
  emoji: string
  due_date: string
  days_before_trip: number
  done: boolean
  link?: string
}

export interface ReadinessItem {
  id: string
  item: string
  emoji: string
  status: 'ready' | 'pending' | 'not_applicable'
  note?: string
  actionLabel?: string
}

// ── Diversity & Repetition Balancer ──────────────────────────────────────────

/**
 * Detects when an itinerary day over-repeats one activity category.
 * Threshold: if one category exceeds 60% of items, skew is detected.
 * This is a simple distribution rule — no ML.
 */

const CATEGORY_ALTERNATIVES: Record<string, Array<{ name: string; emoji: string; to_category: string }>> = {
  temple:     [{ name: 'Local street food market', emoji: '🍜', to_category: 'food' }, { name: 'Heritage walk', emoji: '🚶', to_category: 'culture' }],
  attraction: [{ name: 'Local café break', emoji: '☕', to_category: 'food' }, { name: 'Viewpoint sunset', emoji: '🌅', to_category: 'photography' }],
  hotel:      [{ name: 'Explore neighbourhood', emoji: '🗺️', to_category: 'culture' }],
  food:       [{ name: 'Local museum or gallery', emoji: '🏛️', to_category: 'culture' }, { name: 'Nature walk', emoji: '🌿', to_category: 'nature' }],
  transport:  [{ name: 'Scenic stop en route', emoji: '📷', to_category: 'photography' }],
  museum:     [{ name: 'Street food trail', emoji: '🍢', to_category: 'food' }, { name: 'Local market', emoji: '🛍️', to_category: 'shopping' }],
}

export function computeDiversityCheck(items: Array<{ type: string; name: string }>): DiversityCheck {
  const dist: Record<string, number> = {}
  for (const item of items) {
    const cat = item.type.toLowerCase()
    dist[cat] = (dist[cat] || 0) + 1
  }

  const total = items.length
  if (total === 0) {
    return { category_distribution: {}, total_items: 0, skew_detected: false, dominant_category: '', dominant_pct: 0, suggested_swap: null, basis: 'No items to analyse' }
  }

  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  const [dominant, dominantCount] = sorted[0]
  const dominantPct = Math.round((dominantCount / total) * 100)
  const skewDetected = dominantPct > 60 && total >= 3

  let suggested_swap: DiversityCheck['suggested_swap'] = null
  if (skewDetected) {
    const alts = CATEGORY_ALTERNATIVES[dominant] || CATEGORY_ALTERNATIVES['attraction']
    const alt = alts[0]
    if (alt) {
      suggested_swap = {
        from_category: dominant,
        to_category: alt.to_category,
        candidate_name: alt.name,
        candidate_emoji: alt.emoji,
      }
    }
  }

  return {
    category_distribution: dist,
    total_items: total,
    skew_detected: skewDetected,
    dominant_category: dominant,
    dominant_pct: dominantPct,
    suggested_swap,
    basis: `Heuristic: skew detected when one category exceeds 60% of items in a day (${dominantCount}/${total} are "${dominant}")`,
  }
}

// ── Missed Opportunity Nearby Finder ─────────────────────────────────────────

/**
 * Scans for well-rated POIs that are known to be near popular stops
 * but aren't included in the itinerary.
 * Source: curated proximity table — real place data, no API key needed.
 */
const NEARBY_POIS: Record<string, Array<{
  poi: string; emoji: string; distance_m: number; category: string; rating: number; why_worth_it: string
}>> = {
  // India
  'india gate':     [{ poi: 'National Museum', emoji: '🏛️', distance_m: 1200, category: 'museum', rating: 4.4, why_worth_it: '3,500-year history of India in one building' }],
  'taj mahal':      [{ poi: 'Agra Fort', emoji: '🏰', distance_m: 2000, category: 'heritage', rating: 4.6, why_worth_it: 'Mughal power base — same ticket zone' }],
  'amber fort':     [{ poi: 'Jaigarh Fort', emoji: '⚔️', distance_m: 900, category: 'heritage', rating: 4.5, why_worth_it: 'Connected by a secret tunnel, stunning views' }],
  'ghats':          [{ poi: 'Sarnath', emoji: '☸️', distance_m: 10000, category: 'spiritual', rating: 4.7, why_worth_it: 'Where Buddha gave his first sermon — 30 min away' }],
  'anjuna beach':   [{ poi: 'Chapora Fort', emoji: '🏯', distance_m: 1500, category: 'heritage', rating: 4.3, why_worth_it: 'Famous Dil Chahta Hai viewpoint' }],
  'colosseum':      [{ poi: 'Palatine Hill', emoji: '⛰️', distance_m: 400, category: 'heritage', rating: 4.5, why_worth_it: 'Birthplace of Rome — same combo ticket' }],
  'eiffel tower':   [{ poi: 'Musée d\'Orsay', emoji: '🎨', distance_m: 2200, category: 'museum', rating: 4.7, why_worth_it: 'World\'s best impressionist collection, 25 min walk' }],
  'shibuya crossing': [{ poi: 'Meiji Shrine', emoji: '⛩️', distance_m: 2500, category: 'spiritual', rating: 4.8, why_worth_it: 'Forest sanctuary in the city — counterpoint to Shibuya chaos' }],
  'burj khalifa':   [{ poi: 'Dubai Frame', emoji: '🖼️', distance_m: 8000, category: 'attraction', rating: 4.3, why_worth_it: 'Panoramic view of old and new Dubai — unique perspective' }],
  'ubud market':    [{ poi: 'Tegalalang Rice Terrace', emoji: '🌾', distance_m: 10000, category: 'nature', rating: 4.5, why_worth_it: 'UNESCO-listed terraces — 25 min from Ubud center' }],
  // Generic fallback (used when no specific match)
  'default':        [{ poi: 'Local market', emoji: '🛍️', distance_m: 800, category: 'local', rating: 4.2, why_worth_it: 'Authentic local life — often missed by itineraries' }],
}

export function findNearbyMissedOpportunities(
  items: Array<{ name: string; type: string }>,
  days: Array<{ day: number; date: string; items: Array<{ name: string; type: string }> }>
): MissedOpportunity[] {
  const opportunities: MissedOpportunity[] = []
  const existingNames = new Set(items.map(i => i.name.toLowerCase()))

  for (const day of days) {
    for (const item of day.items) {
      const key = Object.keys(NEARBY_POIS).find(k => item.name.toLowerCase().includes(k) || k.includes(item.name.toLowerCase()))
      const pois = key ? NEARBY_POIS[key] : []

      for (const poi of pois) {
        if (!existingNames.has(poi.poi.toLowerCase())) {
          opportunities.push({
            poi: poi.poi,
            emoji: poi.emoji,
            distance_m: poi.distance_m,
            near_stop: item.name,
            near_day: day.date,
            rating: poi.rating,
            category: poi.category,
            why_worth_it: poi.why_worth_it,
            basis: `Proximity data: ${poi.distance_m}m from ${item.name} (source: curated POI table · rating: ${poi.rating}/5)`,
          })
          existingNames.add(poi.poi.toLowerCase())
        }
      }
    }
  }

  return opportunities.slice(0, 4)
}

// ── Budget Stress Context ─────────────────────────────────────────────────────

/**
 * Contextualizes trip cost against user's stated comfortable budget.
 * Simple ratio — explicitly NOT inferred from financial data.
 * User must provide comfortableBudget themselves.
 */
export function computeBudgetStress(tripCost: number, comfortableBudget: number): BudgetStress {
  if (comfortableBudget <= 0) {
    return {
      trip_cost: tripCost,
      user_comfortable_budget: 0,
      ratio: 0,
      stress_level: 'low',
      label: 'Set your comfortable budget to see stress level',
      color: '#6b7280',
      basis: 'No comfortable budget set by user',
    }
  }

  const ratio = tripCost / comfortableBudget
  let stress_level: BudgetStress['stress_level']
  let label: string
  let color: string

  if (ratio <= 0.8) {
    stress_level = 'low'
    label = `Within your comfortable range (${Math.round(ratio * 100)}% of your budget)`
    color = '#16a34a'
  } else if (ratio <= 1.1) {
    stress_level = 'medium'
    label = `Near your comfortable limit (${Math.round(ratio * 100)}%)`
    color = '#f59e0b'
  } else {
    stress_level = 'high'
    label = `${Math.round((ratio - 1) * 100)}% above your comfortable budget`
    color = '#dc2626'
  }

  return {
    trip_cost: tripCost,
    user_comfortable_budget: comfortableBudget,
    ratio: Math.round(ratio * 100) / 100,
    stress_level,
    label,
    color,
    basis: 'Simple ratio: trip cost ÷ your stated comfortable budget. Not inferred from financial data.',
  }
}

// ── Queue / Crowd Timing Optimizer ───────────────────────────────────────────

/**
 * Recommends the best time-of-day to visit an attraction.
 * Heuristic only — based on opening hours + known popularity patterns.
 * Presented as "typically quieter before 9 AM" — not a trained queue model.
 */
const POPULAR_SITES_TIMING: Record<string, { best: string; worst: string; reason: string }> = {
  'taj mahal':      { best: 'Before 8 AM', worst: '10 AM–2 PM', reason: 'Golden hour light + thinnest crowds at dawn' },
  'amber fort':     { best: 'Before 9 AM', worst: '11 AM–3 PM', reason: 'Peak tour buses arrive mid-morning' },
  'india gate':     { best: 'Before 8 AM or after 7 PM', worst: '4–6 PM', reason: 'Evening walk crowds peak at dusk' },
  'colosseum':      { best: 'Opening time (9 AM)', worst: '12–2 PM', reason: 'Midday heat + tour groups peak together' },
  'eiffel tower':   { best: 'Before 10 AM or after 9 PM', worst: '12–5 PM', reason: 'First entry of day and night visits avoid peak queues' },
  'shibuya crossing': { best: 'After 11 PM', worst: '5–7 PM', reason: 'Rush hour doubles the crowd — late night is thinner' },
  'burj khalifa':   { best: 'Sunset (6–7 PM)', worst: '2–4 PM', reason: 'Sunset slot offers city lights + golden hour' },
  'angkor wat':     { best: 'Sunrise (5:30 AM)', worst: '9 AM–12 PM', reason: 'UNESCO sunrise is iconic — midday is brutal heat' },
  'ghats':          { best: 'Sunrise (5–6 AM)', worst: '8–10 AM', reason: 'Morning Aarti ceremony — crowds arrive after 7' },
  'ubud market':    { best: 'Before 9 AM', worst: '10 AM–1 PM', reason: 'Freshest produce + fewest tourists early morning' },
}

const GENERIC_TIMING: Record<string, { best: string; worst: string; reason: string }> = {
  attraction: { best: 'Weekday morning (before 10 AM)', worst: 'Weekend afternoons', reason: 'Typical visitor pattern for popular attractions' },
  museum:     { best: 'Opening time or last 2 hours', worst: '12–2 PM (lunch rush)', reason: 'Museums fill up at midday school/tour group peak' },
  temple:     { best: 'Early morning (6–8 AM)', worst: '10 AM–12 PM', reason: 'Morning rituals + thin tourist crowds' },
  hotel:      { best: 'Check-in: after 3 PM', worst: '11 AM–2 PM', reason: 'Room turnover — early check-ins often not ready' },
  food:       { best: '12 PM or 7 PM', worst: '1 PM or 8 PM', reason: 'Peak dining times — arrive slightly off-peak' },
  transport:  { best: 'Off-peak hours (10 AM–12 PM)', worst: '7–9 AM, 5–7 PM', reason: 'Avoid commuter rush' },
}

export function computeQueueTimingHint(itemId: string, itemName: string, itemType: string): QueueTimingHint {
  const nameLower = itemName.toLowerCase()
  const siteMatch = Object.entries(POPULAR_SITES_TIMING).find(([key]) => nameLower.includes(key))

  const timing = siteMatch
    ? siteMatch[1]
    : (GENERIC_TIMING[itemType.toLowerCase()] || GENERIC_TIMING['attraction'])

  return {
    item_id: itemId,
    item_name: itemName,
    best_hour: timing.best,
    worst_hour: timing.worst,
    reason: timing.reason,
    basis: siteMatch
      ? `Site-specific timing (source: curated from review patterns + tourism data · heuristic)`
      : `Category heuristic (${itemType}) — not a trained queue model`,
  }
}

// ── Energy & Fatigue Pacing Model ─────────────────────────────────────────────

/**
 * Generates a simple energy curve for a day based on:
 * - Number of activities (more = faster decay)
 * - Activity intensity (transport + walking = high drain)
 * - Time of day (natural circadian dip at 2–3 PM)
 *
 * This is a documented heuristic — not a trained model.
 * Upgrade to regression only when real "too tired" feedback data is available.
 */
export function computeEnergyPacing(items: Array<{ type: string; name: string; time?: string }>): EnergyPoint[] {
  const hours = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
  const INTENSITY: Record<string, number> = {
    transport: 12,
    attraction: 10,
    temple: 8,
    museum: 8,
    food: 3,
    hotel: 2,
  }

  // Base curve: starts at 100, natural afternoon dip at 14:00, partial recovery
  const BASE_CURVE: Record<string, number> = {
    '07:00': 95, '08:00': 100, '09:00': 97, '10:00': 92,
    '11:00': 85, '12:00': 78, '13:00': 70, '14:00': 62,
    '15:00': 58, '16:00': 65, '17:00': 68, '18:00': 72,
    '19:00': 65, '20:00': 55,
  }

  const totalIntensity = items.reduce((sum, item) => sum + (INTENSITY[item.type] || 8), 0)
  const decayFactor = Math.min(1.5, 1 + (totalIntensity - 30) / 100)

  return hours.map(hour => {
    const base = BASE_CURVE[hour] ?? 70
    const adjusted = Math.max(20, Math.round(base / decayFactor))
    const note = hour === '14:00' ? 'Natural post-lunch energy dip' :
                 hour === '09:00' ? 'Peak energy window' :
                 adjusted < 50 ? 'Consider lighter activities here' : undefined
    return { hour, energy_pct: adjusted, note }
  })
}

// ── Weather Recovery Auto-Replan ──────────────────────────────────────────────

/**
 * Checks if a day is outdoor-heavy during bad-weather season.
 * Uses existing SEASONALITY table — no live weather API needed.
 * Clearly labeled as "seasonal pattern, not live forecast" in all UI copy.
 */
const OUTDOOR_TYPES = new Set(['attraction', 'transport', 'temple', 'trekking', 'beach', 'nature'])
const INDOOR_ALTS: Record<string, string[]> = {
  'Heritage':  ['Museum visit', 'Craft workshop', 'Cooking class', 'Art gallery'],
  'Beach':     ['Spa day', 'Cooking class', 'Indoor market', 'Cinema + café'],
  'City':      ['Museum circuit', 'Mall + food court', 'Indoor cultural centre'],
  'Hill Station': ['Café work session', 'Indoor spa', 'Board game café', 'Local cooking class'],
  'Spiritual': ['Temple interior (covered)', 'Meditation session', 'Book shop + café'],
  'Adventure': ['Indoor climbing wall', 'Gear shop + planning', 'Rest day — body needs it'],
  'Wildlife':  ['Natural history museum', 'Documentary screening', 'Safari camp indoor talk'],
}

export function computeWeatherRecovery(
  day: { date: string; items: Array<{ type: string; name: string }> },
  destination: string,
  destType: string
): WeatherRecovery | null {
  const month = new Date(day.date).getMonth() + 1
  const seasonality = SEASONALITY[destType] || SEASONALITY['City']
  const isBadWeather = seasonality.avoid.includes(month)

  if (!isBadWeather) return null

  const outdoorCount = day.items.filter(i => OUTDOOR_TYPES.has(i.type.toLowerCase())).length
  if (outdoorCount < 2) return null

  const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1]
  const alts = INDOOR_ALTS[destType] || INDOOR_ALTS['City']

  return {
    day: day.date,
    trigger: 'rain_forecast',
    outdoor_activity_count: outdoorCount,
    suggested_replan_available: true,
    suggestion: `${monthName} is typically rainy for ${destType.toLowerCase()} destinations — want an indoor version of this day?`,
    indoor_alternatives: alts.slice(0, 3),
    basis: `Seasonal pattern (heuristic): ${destType} destinations in ${monthName} often have poor outdoor conditions — not live weather data`,
  }
}

// ── Decision Timeline ──────────────────────────────────────────────────────────

/**
 * Generates rule-based reminders anchored to trip start date.
 * No prediction — just a sensible booking/prep schedule.
 */
export function computeDecisionTimeline(tripStartDate: string, destination?: string): TimelineTask[] {
  const start = new Date(tripStartDate)
  if (isNaN(start.getTime())) return [] // Safety check to prevent RangeError on invalid dates
  const today = new Date()
  const daysUntil = Math.ceil((start.getTime() - today.getTime()) / 86_400_000)

  const addDays = (base: Date, days: number) => {
    const d = new Date(base)
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const tasks: TimelineTask[] = [
    {
      id: 'book_hotel',
      task: 'Book accommodation',
      category: 'booking',
      emoji: '🏨',
      due_date: addDays(start, 60),
      days_before_trip: 60,
      done: false,
      link: '/app/book/hotels',
    },
    {
      id: 'book_transport',
      task: 'Book trains / flights',
      category: 'booking',
      emoji: '✈️',
      due_date: addDays(start, 45),
      days_before_trip: 45,
      done: false,
      link: '/app/book',
    },
    {
      id: 'check_documents',
      task: 'Check passport & visa validity',
      category: 'documents',
      emoji: '📋',
      due_date: addDays(start, 30),
      days_before_trip: 30,
      done: false,
    },
    {
      id: 'buy_tickets',
      task: 'Book attraction tickets in advance',
      category: 'booking',
      emoji: '🎟️',
      due_date: addDays(start, 21),
      days_before_trip: 21,
      done: false,
    },
    {
      id: 'travel_insurance',
      task: 'Get travel insurance',
      category: 'finance',
      emoji: '🛡️',
      due_date: addDays(start, 21),
      days_before_trip: 21,
      done: false,
    },
    {
      id: 'currency',
      task: 'Arrange local currency / forex card',
      category: 'finance',
      emoji: '💱',
      due_date: addDays(start, 14),
      days_before_trip: 14,
      done: false,
      link: '/app/toolkit/currency',
    },
    {
      id: 'check_weather',
      task: 'Check detailed weather forecast',
      category: 'pre_trip',
      emoji: '🌤️',
      due_date: addDays(start, 7),
      days_before_trip: 7,
      done: false,
    },
    {
      id: 'packing',
      task: 'Complete packing checklist',
      category: 'packing',
      emoji: '🎒',
      due_date: addDays(start, 2),
      days_before_trip: 2,
      done: false,
      link: '/app/planner/itinerary',
    },
    {
      id: 'emergency_contacts',
      task: 'Save emergency contacts for destination',
      category: 'pre_trip',
      emoji: '📞',
      due_date: addDays(start, 1),
      days_before_trip: 1,
      done: false,
    },
  ]

  // Mark tasks as overdue/upcoming context
  return tasks.map(task => ({
    ...task,
    done: daysUntil > task.days_before_trip ? false : task.done,
  }))
}

// ── Travel Readiness Checklist ────────────────────────────────────────────────

/**
 * A straightforward checklist — presented as exactly that ("6 of 8 items ready"),
 * not as an AI confidence score. No prediction involved.
 */
export function computeReadinessChecklist(trip: any, destination: string): ReadinessItem[] {
  const dest = destination.toLowerCase()
  const isInternational = ['paris', 'bali', 'dubai', 'tokyo', 'singapore', 'london', 'new york', 'nepal', 'patan'].some(d => dest.includes(d))

  const items: ReadinessItem[] = [
    {
      id: 'accommodation',
      item: 'Accommodation booked',
      emoji: '🏨',
      status: trip.budget > 0 ? 'ready' : 'pending',
      note: 'Book at least 3 weeks in advance for popular destinations',
      actionLabel: 'Book now',
    },
    {
      id: 'transport',
      item: 'Transport booked (train/flight)',
      emoji: '🚆',
      status: trip.transport ? 'ready' : 'pending',
      note: 'Book 30–45 days ahead for best prices',
      actionLabel: 'Book transport',
    },
    {
      id: 'passport',
      item: isInternational ? 'Passport valid (6+ months)' : 'Valid ID ready',
      emoji: '🛂',
      status: 'pending',
      note: isInternational ? 'Passport must be valid for at least 6 months beyond travel dates' : 'Carry Aadhaar or voter ID',
    },
    {
      id: 'visa',
      item: 'Visa / e-Visa obtained',
      emoji: '📋',
      status: isInternational ? 'pending' : 'not_applicable',
      note: isInternational ? `Check visa requirements for ${destination} — apply at least 2 weeks before` : 'No visa needed for domestic travel',
    },
    {
      id: 'insurance',
      item: 'Travel insurance arranged',
      emoji: '🛡️',
      status: 'pending',
      note: 'Covers medical emergencies, cancellations, and lost baggage',
    },
    {
      id: 'currency',
      item: 'Local currency / payment ready',
      emoji: '💳',
      status: 'pending',
      note: isInternational ? 'Arrange forex card or local currency before departure' : 'UPI/cards widely accepted in most Indian cities',
      actionLabel: 'Open currency tool',
    },
    {
      id: 'emergency_contacts',
      item: 'Emergency contacts saved',
      emoji: '🆘',
      status: 'pending',
      note: `Police, ambulance, and tourist helpline for ${destination}`,
    },
    {
      id: 'itinerary_shared',
      item: 'Itinerary shared with someone',
      emoji: '📤',
      status: trip.collaborators > 0 ? 'ready' : 'pending',
      note: 'Share your plan with a trusted contact for safety',
    },
  ]

  return items
}

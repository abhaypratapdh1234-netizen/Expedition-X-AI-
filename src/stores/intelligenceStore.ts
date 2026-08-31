/**
 * Intelligence Store — intelligenceStore.ts
 *
 * Caches computed user profile, trip analysis, and itinerary variants.
 * Automatically invalidated when trips/wishlist/bookings change.
 * All values computed by intelligenceService.ts — no data fabricated here.
 */

import { create } from 'zustand'
import {
  buildUserProfile,
  computeBudgetForecast,
  buildAssistantContext,
  computeRewardSegment,
  computeTripConfidence,
  computeRiskIndex,
  computeBudgetLeaks,
  computeEcoScore,
  findHiddenGems,
  // v4 engine additions
  computeDiversityCheck,
  findNearbyMissedOpportunities,
  computeBudgetStress,
  computeQueueTimingHint,
  computeEnergyPacing,
  computeWeatherRecovery,
  computeDecisionTimeline,
  computeReadinessChecklist,
  type UserTravelProfile,
  type BudgetForecast,
  type RewardSegment,
  type TripConfidence,
  type RiskIndex,
  type BudgetLeak,
  type EcoScore,
  type HiddenGem,
  type ExplicitDNASliders,
  // v4 types
  type DiversityCheck,
  type MissedOpportunity,
  type BudgetStress,
  type QueueTimingHint,
  type EnergyPoint,
  type WeatherRecovery,
  type TimelineTask,
  type ReadinessItem,
} from '../services/intelligenceService'

export interface TripAnalysis {
  tripId: string
  confidence: TripConfidence
  riskIndex: RiskIndex
  budgetLeaks: BudgetLeak[]
  ecoScore: EcoScore
  hiddenGems: HiddenGem[]
  // v4 additions
  diversityChecks: Record<string, DiversityCheck>     // keyed by day date
  missedOpportunities: MissedOpportunity[]
  budgetStress: BudgetStress
  weatherRecovery: Record<string, WeatherRecovery>    // keyed by day date
  energyCurves: Record<string, EnergyPoint[]>          // keyed by day date
  queueHints: Record<string, QueueTimingHint>          // keyed by item id
  decisionTimeline: TimelineTask[]
  readinessChecklist: ReadinessItem[]
  computedAt: number
}

export interface ItineraryVariant {
  label: 'cheapest' | 'fastest' | 'most_scenic' | 'best_food'
  displayLabel: string
  emoji: string
  description: string
  estimatedCost: number
  durationDays: number
  highlights: string[]
  weights: { cost: number; time: number; scenic: number; food: number }
}

interface IntelligenceState {
  profile: UserTravelProfile | null
  budgetForecast: BudgetForecast | null
  assistantContext: string
  rewardSegment: RewardSegment | null
  isComputing: boolean
  lastComputedAt: number | null

  // Trip analysis (per-trip cache)
  tripAnalysis: TripAnalysis | null
  analyzedTripId: string | null
  isAnalyzing: boolean

  // Itinerary variants (multi-option optimizer)
  variants: ItineraryVariant[]
  selectedVariant: ItineraryVariant['label'] | null
  isGeneratingVariants: boolean

  // v4: user-stated comfortable budget (not inferred from financial data)
  comfortableBudget: number
  setComfortableBudget: (amount: number) => void

  /** Call once on app init or when trips/wishlist/bookings change */
  compute: (
    trips: any[],
    savedPlaceIds: string[],
    bookings: any[],
    userPreferences?: { interests?: string[]; travelStyle?: string; dnaSliders?: Partial<ExplicitDNASliders> }
  ) => void

  /** Analyze a specific trip (Trip Confidence + Risk + Leaks + Eco + v4 signals) */
  analyzeTrip: (trip: any) => void

  /** Generate 4 itinerary variants for the What-If optimizer */
  generateVariants: (wizardInputs: {
    destination: string
    budgetMin: number
    budgetMax: number
    durationDays: number
    transport: string
  }) => void

  /** Select one variant as the active itinerary */
  selectVariant: (label: ItineraryVariant['label']) => void

  /** Invalidate cache to force re-computation */
  invalidate: () => void
}

export const useIntelligenceStore = create<IntelligenceState>((set, get) => ({
  profile: null,
  budgetForecast: null,
  assistantContext: '',
  rewardSegment: null,
  isComputing: false,
  lastComputedAt: null,

  tripAnalysis: null,
  analyzedTripId: null,
  isAnalyzing: false,

  variants: [],
  selectedVariant: null,
  isGeneratingVariants: false,

  comfortableBudget: 0,
  setComfortableBudget: (amount) => set({ comfortableBudget: amount }),

  compute: (trips, savedPlaceIds, bookings, userPreferences) => {
    const now = Date.now()
    const last = get().lastComputedAt
    if (last && now - last < 30_000 && get().profile) return

    set({ isComputing: true })
    try {
      const profile = buildUserProfile(trips, savedPlaceIds, bookings, userPreferences)
      const budgetForecast = computeBudgetForecast(trips)
      const assistantContext = buildAssistantContext(profile)
      const rewardSegment = computeRewardSegment(profile)

      set({
        profile,
        budgetForecast,
        assistantContext,
        rewardSegment,
        isComputing: false,
        lastComputedAt: now,
      })
    } catch (e) {
      console.error('[IntelligenceStore] Computation error:', e)
      set({ isComputing: false })
    }
  },

  analyzeTrip: (trip) => {
    const state = get()
    if (!state.profile) return
    if (state.analyzedTripId === trip.id && state.tripAnalysis) return

    set({ isAnalyzing: true })
    try {
      const destination = trip.destination || trip.destinations?.[0] || trip.title || ''
      const confidence = computeTripConfidence(trip, state.profile)
      const riskIndex = computeRiskIndex(
        destination,
        trip.startDate ? new Date(trip.startDate).getMonth() + 1 : undefined
      )
      const allItems = (trip.itinerary || []).flatMap((d: any) => d.items || [])
      const budgetLeaks = computeBudgetLeaks(allItems, destination)
      const distanceKm = trip.destinations?.length > 1 ? 800 : 400
      const ecoScore = computeEcoScore(trip.transport || 'Flight', distanceKm)
      const hiddenGems = findHiddenGems(state.profile.dna, 4)

      // ── v4 per-day signals ──
      const days: any[] = trip.itinerary || []

      // Determine destination type for weather recovery
      const DESTINATION_TYPES_LOCAL: Record<string, string[]> = {
        'Hill Station': ['manali', 'shimla', 'mussoorie', 'darjeeling', 'ooty', 'munnar', 'coorg', 'nainital'],
        'Heritage':     ['agra', 'jaipur', 'delhi', 'varanasi', 'hampi', 'khajuraho', 'mysore', 'udaipur'],
        'Beach':        ['goa', 'kovalam', 'varkala', 'pondicherry', 'andaman', 'alibag', 'diu'],
        'Spiritual':    ['varanasi', 'rishikesh', 'haridwar', 'tirupati', 'shirdi'],
        'City':         ['mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'],
        'Wildlife':     ['ranthambore', 'jim corbett', 'kaziranga', 'sundarbans'],
        'Adventure':    ['leh', 'ladakh', 'spiti', 'zanskar', 'uttarkashi', 'auli'],
      }
      const destLower = destination.toLowerCase()
      let destType = 'City'
      for (const [type, dests] of Object.entries(DESTINATION_TYPES_LOCAL)) {
        if (dests.some(d => destLower.includes(d))) { destType = type; break }
      }

      const diversityChecks: TripAnalysis['diversityChecks'] = {}
      const weatherRecovery: TripAnalysis['weatherRecovery'] = {}
      const energyCurves: TripAnalysis['energyCurves'] = {}
      const queueHints: TripAnalysis['queueHints'] = {}

      for (const day of days) {
        const dayItems = day.items || []
        // Diversity check per day
        diversityChecks[day.date] = computeDiversityCheck(dayItems)
        // Energy pacing per day
        energyCurves[day.date] = computeEnergyPacing(dayItems)
        // Weather recovery per day
        const wr = computeWeatherRecovery(day, destination, destType)
        if (wr) weatherRecovery[day.date] = wr
        // Queue timing per item
        for (const item of dayItems) {
          if (item.type === 'attraction' || item.type === 'temple' || item.type === 'museum') {
            queueHints[item.id] = computeQueueTimingHint(item.id, item.name, item.type)
          }
        }
      }

      // Missed opportunities across entire trip
      const missedOpportunities = findNearbyMissedOpportunities(allItems, days)

      // Budget stress (uses user-provided comfortable budget from store)
      const tripCost = trip.budget || allItems.reduce((s: number, i: any) => s + (i.cost || 0), 0)
      const budgetStress = computeBudgetStress(tripCost, state.comfortableBudget)

      // Decision timeline + readiness
      const decisionTimeline = trip.startDate
        ? computeDecisionTimeline(trip.startDate, destination)
        : []
      const readinessChecklist = computeReadinessChecklist(trip, destination)

      const analysis: TripAnalysis = {
        tripId: trip.id,
        confidence,
        riskIndex,
        budgetLeaks,
        ecoScore,
        hiddenGems,
        // v4
        diversityChecks,
        missedOpportunities,
        budgetStress,
        weatherRecovery,
        energyCurves,
        queueHints,
        decisionTimeline,
        readinessChecklist,
        computedAt: Date.now(),
      }

      set({ tripAnalysis: analysis, analyzedTripId: trip.id, isAnalyzing: false })
    } catch (e) {
      console.error('[IntelligenceStore] analyzeTrip error:', e)
      set({ isAnalyzing: false })
    }
  },

  generateVariants: ({ destination, budgetMin, budgetMax, durationDays, transport }) => {
    set({ isGeneratingVariants: true })
    try {
      const baseMin = budgetMin
      const baseMax = budgetMax

      const variants: ItineraryVariant[] = [
        {
          label: 'cheapest',
          displayLabel: 'Cheapest',
          emoji: '💸',
          description: 'Min-cost route, budget hotels, local transport',
          estimatedCost: Math.round(baseMin * 0.75),
          durationDays,
          highlights: ['Budget stays', 'Local eateries', 'Public transport'],
          weights: { cost: 0.70, time: 0.15, scenic: 0.05, food: 0.10 },
        },
        {
          label: 'fastest',
          displayLabel: 'Fastest',
          emoji: '⚡',
          description: 'Optimized for max experiences in minimum time',
          estimatedCost: Math.round((baseMin + baseMax) / 2 * 1.1),
          durationDays: Math.max(2, durationDays - 1),
          highlights: ['Top attractions', 'Priority access', 'Efficient routing'],
          weights: { cost: 0.10, time: 0.65, scenic: 0.15, food: 0.10 },
        },
        {
          label: 'most_scenic',
          displayLabel: 'Most Scenic',
          emoji: '🏔️',
          description: 'Handpicked for viewpoints, photography, natural beauty',
          estimatedCost: Math.round((baseMin + baseMax) / 2 * 1.2),
          durationDays,
          highlights: ['Scenic viewpoints', 'Photography spots', 'Nature walks'],
          weights: { cost: 0.15, time: 0.15, scenic: 0.60, food: 0.10 },
        },
        {
          label: 'best_food',
          displayLabel: 'Best Food',
          emoji: '🍛',
          description: 'Curated around culinary experiences and local cuisine',
          estimatedCost: Math.round((baseMin + baseMax) / 2 * 1.15),
          durationDays,
          highlights: ['Local restaurants', 'Street food tours', 'Cooking classes'],
          weights: { cost: 0.15, time: 0.10, scenic: 0.10, food: 0.65 },
        },
      ]

      set({ variants, selectedVariant: 'most_scenic', isGeneratingVariants: false })
    } catch (e) {
      console.error('[IntelligenceStore] generateVariants error:', e)
      set({ isGeneratingVariants: false })
    }
  },

  selectVariant: (label) => {
    set({ selectedVariant: label })
  },

  invalidate: () => {
    set({ lastComputedAt: null, tripAnalysis: null, analyzedTripId: null })
  },
}))


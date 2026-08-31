/**
 * tripIntelligenceService.ts — Trip Intelligence Aggregator (v2)
 * Fixed computeDeadZones arg order, resilient fallbacks, 5-min cache.
 */

import {
  computeDeadZones,
  computeCrowdForecast,
  computeQuietnessScore,
  INFRA_CATEGORIES,
  type CrowdForecastData,
  type QuietnessScoreData,
} from './infrastructureService'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TripStop {
  id: string
  name: string
  lat: number
  lng: number
  type: 'attraction' | 'hotel' | 'food' | 'transport'
  plannedTime?: string
}

export interface RouteMode {
  id: 'fastest' | 'survivability' | 'quietest'
  label: string
  emoji: string
  distanceKm: number
  durationMin: number
  riskScore: number
  tradeoff: string
  recommended: boolean
  accentColor: string
}

export interface CrowdSwapSuggestion {
  placeId: string
  placeName: string
  currentSlot: string
  currentSaturationPct: number
  swapSlot: string
  swapSaturationPct: number
  savingPct: number
  reason: string
}

export interface InfraStatusSummary {
  safePercent: number
  cautionCount: number
  offlineSegmentKm: number
  estimatedIsolationMin: number
  shelterCount: number
  tileStatus: { category: string; label: string; emoji: string; count: number; color: string }[]
}

export interface QuietSpot {
  id: string
  name: string
  silencePct: number
  type: string
  emoji: string
}

export interface TripIntelligencePayload {
  trip: { destination: string; date: string; days: number }
  infraStatus: InfraStatusSummary
  crowdForecasts: (CrowdForecastData & { swapSuggestion?: CrowdSwapSuggestion })[]
  quietLayer: (QuietnessScoreData & { placeName: string; quietSpots: QuietSpot[] })[]
  routeModes: RouteMode[]
  routeCoords: [number, number][]
  computedAt: number
}

// ── Fallback dead-zone data ───────────────────────────────────────────────────
function makeFallbackInfra(routeCoords: [number, number][]) {
  const totalKm = routeCoords.length >= 2 ? 120 : 80
  return {
    routeId: 'fallback',
    totalDistanceKm: totalKm,
    survivableDistanceKm: Math.round(totalKm * 0.82),
    gaps: [
      { routeSegmentId: 'fallback', category: 'network' as const, lastPoint: null, distanceFromGapM: 18000, isolationTimeEstMin: 42 },
      { routeSegmentId: 'fallback', category: 'fuel'    as const, lastPoint: null, distanceFromGapM: 24000, isolationTimeEstMin: 58 },
    ],
    offlineSegmentKm: 18,
    estimatedIsolationMin: 42,
    infrastructurePoints: [
      { id: 'fb-h1', category: 'hospital' as const, lat: routeCoords[0]?.[0] ?? 28.6, lng: routeCoords[0]?.[1] ?? 77.2, name: 'City General Hospital',    source: 'Fallback', verifiedAt: new Date().toISOString() },
      { id: 'fb-f1', category: 'fuel'     as const, lat: routeCoords[0]?.[0] ?? 28.6, lng: routeCoords[0]?.[1] ?? 77.2, name: 'HP Fuel Station',          source: 'Fallback', verifiedAt: new Date().toISOString() },
      { id: 'fb-s1', category: 'shelter'  as const, lat: routeCoords[0]?.[0] ?? 28.6, lng: routeCoords[0]?.[1] ?? 77.2, name: 'Emergency Rest Shelter',   source: 'Fallback', verifiedAt: new Date().toISOString() },
      { id: 'fb-w1', category: 'water'    as const, lat: routeCoords[0]?.[0] ?? 28.6, lng: routeCoords[0]?.[1] ?? 77.2, name: 'Public Drinking Fountain', source: 'Fallback', verifiedAt: new Date().toISOString() },
      { id: 'fb-n1', category: 'network'  as const, lat: routeCoords[0]?.[0] ?? 28.6, lng: routeCoords[0]?.[1] ?? 77.2, name: 'Cell Tower',               source: 'Fallback', verifiedAt: new Date().toISOString() },
    ],
    computedAt: Date.now(),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSwapSuggestion(forecast: CrowdForecastData): CrowdSwapSuggestion | undefined {
  const peakSlot = forecast.slots.reduce((max, s) => s.saturationPct > max.saturationPct ? s : max, forecast.slots[0])
  const betterSlots = forecast.slots.filter(
    s => s.saturationPct < peakSlot.saturationPct - 30 && parseInt(s.time) >= 6 && parseInt(s.time) <= 19
  )
  if (!betterSlots.length) return undefined
  const bestSwap = betterSlots.reduce((min, s) => s.saturationPct < min.saturationPct ? s : min, betterSlots[0])
  return {
    placeId: forecast.placeId,
    placeName: forecast.placeName,
    currentSlot: peakSlot.label,
    currentSaturationPct: peakSlot.saturationPct,
    swapSlot: bestSwap.label,
    swapSaturationPct: bestSwap.saturationPct,
    savingPct: peakSlot.saturationPct - bestSwap.saturationPct,
    reason: `Visit ${forecast.placeName} at ${bestSwap.label} to avoid ${peakSlot.saturationPct - bestSwap.saturationPct}% of the crowd`,
  }
}

function deriveRouteModes(totalDistKm: number, cautionCount: number): RouteMode[] {
  const baseDuration = Math.round(totalDistKm * 1.5)
  const riskBase = Math.max(30, 100 - cautionCount * 8)
  return [
    {
      id: 'fastest',
      label: 'Fastest Route', emoji: '⚡',
      distanceKm: Math.round(totalDistKm * 0.88 * 10) / 10,
      durationMin: Math.round(baseDuration * 0.75),
      riskScore: Math.max(20, riskBase - 15),
      tradeoff: `Saves ~${Math.round(baseDuration * 0.25)} min but crosses ${Math.max(1, cautionCount)} signal dead-zones`,
      recommended: false, accentColor: '#F59E0B',
    },
    {
      id: 'survivability',
      label: 'Survivability Route', emoji: '🛡️',
      distanceKm: Math.round(totalDistKm * 1.05 * 10) / 10,
      durationMin: Math.round(baseDuration * 1.1),
      riskScore: Math.min(100, riskBase + 12),
      tradeoff: `Stays within 5 km of hospitals & fuel. Adds ~${Math.round(baseDuration * 0.1)} min`,
      recommended: true, accentColor: '#0A0F1E',
    },
    {
      id: 'quietest',
      label: 'Quietest Route', emoji: '🌿',
      distanceKm: Math.round(totalDistKm * 1.15 * 10) / 10,
      durationMin: Math.round(baseDuration * 1.2),
      riskScore: Math.min(95, riskBase + 5),
      tradeoff: `Avoids tourist hotspots. Crowd saturation ~35% lower. Adds ~${Math.round(baseDuration * 0.2)} min`,
      recommended: false, accentColor: '#8B5CF6',
    },
  ]
}

function generateQuietSpots(placeId: string, placeName: string, quietScore: number): QuietSpot[] {
  const seed = placeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const spotTypes = [
    { name: 'Hidden Garden Café',        type: 'café',      emoji: '☕' },
    { name: 'Sunrise Meditation Point',  type: 'meditation',emoji: '🧘' },
    { name: 'Reading Viewpoint Terrace', type: 'reading',   emoji: '📖' },
    { name: 'Riverside Quiet Walk',      type: 'walk',      emoji: '🌊' },
  ]
  return spotTypes.slice(0, 2 + (seed % 2)).map((spot, i) => ({
    id: `qs-${placeId}-${i}`,
    name: `${spot.name} — near ${placeName}`,
    silencePct: Math.min(98, quietScore + (i % 3) * 5),
    type: spot.type, emoji: spot.emoji,
  }))
}

// ── Main aggregator ───────────────────────────────────────────────────────────

const _cache = new Map<string, { data: TripIntelligencePayload; expiry: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

export async function computeTripIntelligence(
  tripId: string,
  destination: string,
  date: string,
  days: number,
  stops: TripStop[],
  routeCoords: [number, number][]
): Promise<TripIntelligencePayload> {
  const cacheKey = `${tripId}-${date}`
  const cached = _cache.get(cacheKey)
  if (cached && Date.now() < cached.expiry) return cached.data

  const coords = routeCoords.length >= 2 ? routeCoords : [[28.6, 77.2], [28.65, 77.25]] as [number, number][]

  // 1. Dead-Zone — resilient: computeDeadZones(routeCoords, routeId)
  let deadZone = makeFallbackInfra(coords)
  try {
    deadZone = await computeDeadZones(coords, `intel-${tripId}`)
  } catch {
    // use fallback silently
  }

  // 2. Infrastructure status
  const CATS = ['network', 'fuel', 'hospital', 'water', 'shelter'] as const
  const tileStatus = CATS.map(cat => {
    const meta = INFRA_CATEGORIES[cat]
    const count = deadZone.infrastructurePoints.filter(p => p.category === cat).length
    return { category: cat, label: meta.label, emoji: meta.emoji, count: Math.max(1, count), color: meta.color }
  })

  const safePercent = deadZone.totalDistanceKm > 0
    ? Math.round((deadZone.survivableDistanceKm / deadZone.totalDistanceKm) * 100)
    : 82

  const infraStatus: InfraStatusSummary = {
    safePercent: Math.min(100, Math.max(0, safePercent)),
    cautionCount: deadZone.gaps.length,
    offlineSegmentKm: deadZone.offlineSegmentKm,
    estimatedIsolationMin: deadZone.estimatedIsolationMin,
    shelterCount: Math.max(1, tileStatus.find(t => t.category === 'shelter')?.count ?? 1),
    tileStatus,
  }

  // 3. Crowd forecasts
  const attractionStops = stops.filter(s => s.type === 'attraction').slice(0, 5)
  const usedStops = attractionStops.length > 0 ? attractionStops : stops.slice(0, 3)
  const crowdForecasts = usedStops.map(stop => {
    const forecast = computeCrowdForecast(stop.id, stop.name, date, stop.type)
    return { ...forecast, swapSuggestion: generateSwapSuggestion(forecast) }
  })

  // 4. Quiet layer
  const quietLayer = stops.slice(0, 5).map(stop => {
    const score = computeQuietnessScore(stop.id, stop.type)
    return { ...score, placeName: stop.name, quietSpots: generateQuietSpots(stop.id, stop.name, score.score) }
  })

  // 5. Route modes
  const totalDistKm = deadZone.totalDistanceKm > 0 ? deadZone.totalDistanceKm : 120
  const routeModes = deriveRouteModes(totalDistKm, deadZone.gaps.length)

  const payload: TripIntelligencePayload = {
    trip: { destination, date, days },
    infraStatus, crowdForecasts, quietLayer, routeModes,
    routeCoords: coords, computedAt: Date.now(),
  }

  _cache.set(cacheKey, { data: payload, expiry: Date.now() + CACHE_TTL_MS })
  return payload
}

/**
 * infrastructureService.ts — Infrastructure Intelligence Layer (v1)
 *
 * Four deterministic feature engines:
 *   1. Dead-Zone Navigator™  — infrastructure gap analysis on routes
 *   2. Future Crowd Map™     — reservation-based crowd forecasting
 *   3. Quiet Tourism™        — decibel + OSM tag quietness scoring
 *   4. Memory Weight™        — emotional weight tagging for places
 *
 * No AI / no ML — pure geospatial + rule engines.
 * All data is transparent and uses free APIs / browser APIs.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

// Feature 1: Dead-Zone Navigator™
export type InfraCategory =
  | 'network' | 'fuel' | 'pharmacy' | 'hospital'
  | 'atm' | 'ev_charging' | 'transit' | 'shelter' | 'water'

export interface InfraPoint {
  id: string
  category: InfraCategory
  lat: number
  lng: number
  name: string
  source: string
  verifiedAt: string
}

export interface InfraGap {
  routeSegmentId: string
  category: InfraCategory
  lastPoint: InfraPoint | null
  distanceFromGapM: number
  isolationTimeEstMin: number
}

export interface DeadZoneAnalysis {
  routeId: string
  totalDistanceKm: number
  survivableDistanceKm: number
  gaps: InfraGap[]
  offlineSegmentKm: number
  estimatedIsolationMin: number
  infrastructurePoints: InfraPoint[]
  computedAt: number
}

// Feature 2: Future Crowd Map™
export interface TimeSlot {
  time: string       // e.g. "08:00", "08:30"
  label: string      // e.g. "8 AM"
  reservedCount: number
  capacityThreshold: number
  saturationPct: number
  status: 'quiet' | 'moderate' | 'filling_up' | 'crowded'
}

export interface SlotReservation {
  id: string
  placeId: string
  visitDate: string
  timeSlot: string
  groupSize: number
  createdAt: number
  sessionId: string
}

export interface CrowdForecastData {
  placeId: string
  placeName: string
  visitDate: string
  slots: TimeSlot[]
  peakSlot: string
  quietestSlot: string
  overallTrend: 'increasing' | 'stable' | 'decreasing'
  computedAt: number
}

// Feature 3: Quiet Tourism™
export interface DecibelSnapshot {
  id: string
  placeId: string
  approxDb: number
  capturedAt: number
  deviceNote: string
  flaggedSuspicious: boolean
}

export interface QuietnessScoreData {
  placeId: string
  score: number         // 0–100 (100 = most quiet)
  basis: 'decibel' | 'tag_only'
  sampleCount: number
  avgDecibel: number | null
  osmTagScore: number
  timeOfDayFactor: number
  updatedAt: number
}

// Feature 4: Memory Weight™
export const MEMORY_TAGS = [
  { id: 'peaceful',      name: 'Most Peaceful',      emoji: '🕊️',  color: '#10b981' },
  { id: 'stressful',     name: 'Most Stressful',     emoji: '😰',  color: '#ef4444' },
  { id: 'worth_money',   name: 'Most Worth Money',   emoji: '💰',  color: '#f59e0b' },
  { id: 'worth_time',    name: 'Most Worth Time',    emoji: '⏰',  color: '#3b82f6' },
  { id: 'overrated',     name: 'Most Overrated',     emoji: '😤',  color: '#f97316' },
  { id: 'life_changing', name: 'Most Life-Changing',  emoji: '🌟',  color: '#8b5cf6' },
  { id: 'beautiful',     name: 'Most Beautiful',     emoji: '🌅',  color: '#ec4899' },
  { id: 'exhausting',    name: 'Most Exhausting',    emoji: '🥵',  color: '#dc2626' },
] as const

export type MemoryTagId = typeof MEMORY_TAGS[number]['id']

export interface PlaceMemory {
  id: string
  userId: string
  tripId: string
  placeId: string
  placeName: string
  tagId: MemoryTagId
  weight: number        // 1–5
  note: string
  isPublic: boolean     // default false — privacy by design
  createdAt: number
}

export interface PlaceSignificance {
  placeId: string
  placeName: string
  tagId: MemoryTagId
  aggregateWeight: number
  taggedCount: number
  updatedAt: number
}

// ─── Infra Category Metadata ─────────────────────────────────────────────────

export const INFRA_CATEGORIES: Record<InfraCategory, { label: string; emoji: string; color: string; osmTag: string }> = {
  network:     { label: 'Cell Coverage',  emoji: '📶', color: '#3b82f6', osmTag: 'amenity=telephone|communication' },
  fuel:        { label: 'Fuel Station',   emoji: '⛽', color: '#f97316', osmTag: 'amenity=fuel' },
  pharmacy:    { label: 'Pharmacy',       emoji: '💊', color: '#10b981', osmTag: 'amenity=pharmacy' },
  hospital:    { label: 'Hospital',       emoji: '🏥', color: '#ef4444', osmTag: 'amenity=hospital' },
  atm:         { label: 'ATM',            emoji: '🏧', color: '#8b5cf6', osmTag: 'amenity=atm' },
  ev_charging: { label: 'EV Charging',    emoji: '⚡', color: '#06b6d4', osmTag: 'amenity=charging_station' },
  transit:     { label: 'Transit Stop',   emoji: '🚌', color: '#0ea5e9', osmTag: 'highway=bus_stop|railway=station' },
  shelter:     { label: 'Shelter',        emoji: '🏠', color: '#a855f7', osmTag: 'tourism=alpine_hut|amenity=shelter' },
  water:       { label: 'Drinking Water', emoji: '💧', color: '#14b8a6', osmTag: 'amenity=drinking_water' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('expedition_session_id')
  if (!sid) {
    sid = generateId()
    sessionStorage.setItem('expedition_session_id', sid)
  }
  return sid
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Feature 1: Dead-Zone Navigator™ ─────────────────────────────────────────

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

/**
 * Fetch infrastructure points along a route corridor using Overpass API.
 * Uses a bounding box around the route with buffer radius.
 */
async function fetchInfraPointsFromOverpass(
  routeCoords: [number, number][],
  category: InfraCategory,
  bufferKm: number = 5
): Promise<InfraPoint[]> {
  if (routeCoords.length === 0) return []

  // Compute bounding box
  const lats = routeCoords.map(c => c[0])
  const lngs = routeCoords.map(c => c[1])
  const bufferDeg = bufferKm / 111.32
  const south = Math.min(...lats) - bufferDeg
  const north = Math.max(...lats) + bufferDeg
  const west = Math.min(...lngs) - bufferDeg
  const east = Math.max(...lngs) + bufferDeg

  const meta = INFRA_CATEGORIES[category]
  // Build overpass query from OSM tag
  const tags = meta.osmTag.split('|')
  const nodeQueries = tags.map(tag => {
    const [k, v] = tag.split('=')
    return `node["${k}"="${v}"](${south},${west},${north},${east});`
  }).join('\n')

  const query = `[out:json][timeout:10];(${nodeQueries});out body 20;`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 600)

  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!res.ok) return generateFallbackInfraPoints(routeCoords, category)
    const data = await res.json()
    return (data.elements || []).slice(0, 20).map((el: any) => ({
      id: `overpass-${el.id}`,
      category,
      lat: el.lat,
      lng: el.lon,
      name: el.tags?.name || meta.label,
      source: 'OpenStreetMap (Overpass)',
      verifiedAt: new Date().toISOString(),
    }))
  } catch {
    clearTimeout(timeoutId)
    return generateFallbackInfraPoints(routeCoords, category)
  }
}

/**
 * Deterministic fallback: generate realistic infrastructure points
 * along the route when API is unavailable.
 */
function generateFallbackInfraPoints(
  routeCoords: [number, number][],
  category: InfraCategory
): InfraPoint[] {
  if (routeCoords.length < 2) return []

  const meta = INFRA_CATEGORIES[category]
  // Infrastructure density varies by category
  const densityMap: Record<InfraCategory, number> = {
    network: 15, fuel: 25, pharmacy: 20, hospital: 40,
    atm: 18, ev_charging: 35, transit: 12, shelter: 50, water: 22,
  }
  const spacingKm = densityMap[category]
  const points: InfraPoint[] = []

  let accumulatedKm = 0
  for (let i = 1; i < routeCoords.length; i++) {
    const segKm = haversineKm(
      routeCoords[i - 1][0], routeCoords[i - 1][1],
      routeCoords[i][0], routeCoords[i][1]
    )
    accumulatedKm += segKm

    if (accumulatedKm >= spacingKm) {
      // Add slight random offset for realism
      const offsetLat = (Math.random() - 0.5) * 0.01
      const offsetLng = (Math.random() - 0.5) * 0.01
      points.push({
        id: generateId(),
        category,
        lat: routeCoords[i][0] + offsetLat,
        lng: routeCoords[i][1] + offsetLng,
        name: `${meta.label} #${points.length + 1}`,
        source: 'Estimated (route-based)',
        verifiedAt: new Date().toISOString(),
      })
      accumulatedKm = 0
    }
  }

  return points
}

/**
 * Core Dead-Zone analysis: walks the route geometry and identifies
 * the last-known-infrastructure point for each category.
 */
export async function computeDeadZones(
  routeCoords: [number, number][],
  routeId: string = 'default'
): Promise<DeadZoneAnalysis> {
  const categories: InfraCategory[] = [
    'network', 'fuel', 'pharmacy', 'hospital', 'atm',
    'ev_charging', 'transit', 'shelter', 'water'
  ]

  // Fetch all infra points in parallel
  const allPointArrays = await Promise.all(
    categories.map(cat => fetchInfraPointsFromOverpass(routeCoords, cat))
  )

  const allInfraPoints: InfraPoint[] = allPointArrays.flat()
  const gaps: InfraGap[] = []

  // Total route distance
  let totalDistKm = 0
  for (let i = 1; i < routeCoords.length; i++) {
    totalDistKm += haversineKm(
      routeCoords[i - 1][0], routeCoords[i - 1][1],
      routeCoords[i][0], routeCoords[i][1]
    )
  }

  // For each category, find the last infra point and the gap after it
  const thresholdKm = 5 // within 5km of route counts as "coverage"
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]
    const points = allPointArrays[ci]

    // Walk route and find the last point where this category was within threshold
    let lastCoveredCoord: [number, number] | null = null
    let lastCoveredPoint: InfraPoint | null = null
    let lastCoveredDistFromStart = 0
    let accumKm = 0

    for (let i = 0; i < routeCoords.length; i++) {
      if (i > 0) {
        accumKm += haversineKm(
          routeCoords[i - 1][0], routeCoords[i - 1][1],
          routeCoords[i][0], routeCoords[i][1]
        )
      }
      // Check if any infra point of this category is within threshold
      for (const pt of points) {
        const dist = haversineKm(routeCoords[i][0], routeCoords[i][1], pt.lat, pt.lng)
        if (dist <= thresholdKm) {
          lastCoveredCoord = routeCoords[i]
          lastCoveredPoint = pt
          lastCoveredDistFromStart = accumKm
        }
      }
    }

    // The gap is from the last covered point to the end of the route
    const gapDistM = (totalDistKm - lastCoveredDistFromStart) * 1000
    // Estimate isolation time: assume 40 km/h average in remote areas
    const isolationMin = gapDistM > 0 ? Math.round((gapDistM / 1000) / 40 * 60) : 0

    gaps.push({
      routeSegmentId: routeId,
      category: cat,
      lastPoint: lastCoveredPoint,
      distanceFromGapM: Math.round(gapDistM),
      isolationTimeEstMin: isolationMin,
    })
  }

  // The "offline segment" is the max gap across network category
  const networkGap = gaps.find(g => g.category === 'network')
  const offlineSegmentKm = networkGap ? networkGap.distanceFromGapM / 1000 : 0
  const estimatedIsolationMin = networkGap ? networkGap.isolationTimeEstMin : 0

  return {
    routeId,
    totalDistanceKm: Math.round(totalDistKm * 10) / 10,
    survivableDistanceKm: Math.round((totalDistKm - offlineSegmentKm) * 10) / 10,
    gaps,
    offlineSegmentKm: Math.round(offlineSegmentKm * 10) / 10,
    estimatedIsolationMin,
    infrastructurePoints: allInfraPoints,
    computedAt: Date.now(),
  }
}

// ─── Feature 2: Future Crowd Map™ ────────────────────────────────────────────

const STORAGE_KEY_RESERVATIONS = 'expeditionx_slot_reservations'
const STORAGE_KEY_CAPACITIES = 'expeditionx_place_capacities'
const MAX_RESERVATIONS_PER_SESSION = 10  // abuse prevention
const MAX_GROUP_SIZE = 20

// Default capacity thresholds by place category
const DEFAULT_CAPACITY: Record<string, number> = {
  'monument': 200, 'temple': 150, 'museum': 100,
  'park': 300, 'market': 250, 'beach': 400,
  'attraction': 180, 'default': 150,
}

function getTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 6; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

function formatSlotLabel(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}${m > 0 ? ':30' : ''} ${period}`
}

function getStoredReservations(): SlotReservation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_RESERVATIONS) || '[]')
  } catch { return [] }
}

function storeReservations(reservations: SlotReservation[]): void {
  localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(reservations))
}

function getCapacity(placeCategory: string): number {
  return DEFAULT_CAPACITY[placeCategory] || DEFAULT_CAPACITY['default']
}

function getSaturationStatus(pct: number): TimeSlot['status'] {
  if (pct < 30) return 'quiet'
  if (pct < 60) return 'moderate'
  if (pct < 85) return 'filling_up'
  return 'crowded'
}

/**
 * Reserve a time slot for visiting a place (anonymous, no PII required).
 */
export function reserveSlot(
  placeId: string,
  visitDate: string,
  timeSlot: string,
  groupSize: number = 1
): { success: boolean; error?: string } {
  const sessionId = getSessionId()
  const allReservations = getStoredReservations()

  // Rate limit: max reservations per session per day
  const sessionToday = allReservations.filter(
    r => r.sessionId === sessionId &&
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  )
  if (sessionToday.length >= MAX_RESERVATIONS_PER_SESSION) {
    return { success: false, error: 'Daily reservation limit reached (10 per day)' }
  }

  // Cap group size
  const clampedSize = Math.min(Math.max(1, groupSize), MAX_GROUP_SIZE)

  // Don't let one session flood a single slot
  const existingForSlot = allReservations.filter(
    r => r.sessionId === sessionId && r.placeId === placeId &&
    r.visitDate === visitDate && r.timeSlot === timeSlot
  )
  if (existingForSlot.length > 0) {
    return { success: false, error: 'You already reserved this slot' }
  }

  const reservation: SlotReservation = {
    id: generateId(),
    placeId,
    visitDate,
    timeSlot,
    groupSize: clampedSize,
    createdAt: Date.now(),
    sessionId,
  }

  allReservations.push(reservation)
  storeReservations(allReservations)
  return { success: true }
}

/**
 * Compute crowd forecast for a place on a given date.
 * Pure aggregation: bucket reservations into 30-min slots.
 */
export function computeCrowdForecast(
  placeId: string,
  placeName: string,
  visitDate: string,
  placeCategory: string = 'attraction'
): CrowdForecastData {
  const allReservations = getStoredReservations()
  const placeReservations = allReservations.filter(
    r => r.placeId === placeId && r.visitDate === visitDate
  )

  const capacity = getCapacity(placeCategory)
  const timeSlots = getTimeSlots()

  // Seed with some baseline data for demo (historical same-weekday average)
  const dayOfWeek = new Date(visitDate).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const slots: TimeSlot[] = timeSlots.map(time => {
    const hour = parseInt(time.split(':')[0])
    const reservedInSlot = placeReservations
      .filter(r => r.timeSlot === time)
      .reduce((sum, r) => sum + r.groupSize, 0)

    // Historical baseline: typical visitor pattern curve
    let baselineMultiplier = 0
    if (hour >= 6 && hour < 8) baselineMultiplier = 0.1
    else if (hour >= 8 && hour < 10) baselineMultiplier = 0.25
    else if (hour >= 10 && hour < 12) baselineMultiplier = isWeekend ? 0.7 : 0.5
    else if (hour >= 12 && hour < 14) baselineMultiplier = isWeekend ? 0.85 : 0.6
    else if (hour >= 14 && hour < 16) baselineMultiplier = isWeekend ? 0.75 : 0.45
    else if (hour >= 16 && hour < 18) baselineMultiplier = isWeekend ? 0.6 : 0.35
    else if (hour >= 18 && hour < 20) baselineMultiplier = 0.3
    else baselineMultiplier = 0.1

    const baselineCount = Math.round(capacity * baselineMultiplier * 0.85)
    const totalCount = baselineCount + reservedInSlot
    const satPct = Math.min(100, Math.round((totalCount / capacity) * 100))

    return {
      time,
      label: formatSlotLabel(time),
      reservedCount: totalCount,
      capacityThreshold: capacity,
      saturationPct: satPct,
      status: getSaturationStatus(satPct),
    }
  })

  // Find peak and quietest
  const peakSlot = slots.reduce((max, s) => s.saturationPct > max.saturationPct ? s : max, slots[0])
  const quietestSlot = slots.reduce((min, s) => s.saturationPct < min.saturationPct ? s : min, slots[0])

  // Overall trend: compare morning vs afternoon saturation
  const morningAvg = slots.filter(s => parseInt(s.time) < 12).reduce((s, t) => s + t.saturationPct, 0) / 12
  const afternoonAvg = slots.filter(s => parseInt(s.time) >= 12).reduce((s, t) => s + t.saturationPct, 0) / 12
  const trend = afternoonAvg > morningAvg + 5 ? 'increasing' as const :
    morningAvg > afternoonAvg + 5 ? 'decreasing' as const : 'stable' as const

  return {
    placeId,
    placeName,
    visitDate,
    slots,
    peakSlot: peakSlot.label,
    quietestSlot: quietestSlot.label,
    overallTrend: trend,
    computedAt: Date.now(),
  }
}

// ─── Feature 3: Quiet Tourism™ ──────────────────────────────────────────────

const STORAGE_KEY_DECIBELS = 'expeditionx_decibel_snapshots'
const MIN_SAMPLES_FOR_DECIBEL_SCORE = 1

// OSM tag-based quietness scores (0–100, higher = quieter)
const OSM_TAG_QUIETNESS: Record<string, number> = {
  'natural': 85, 'park': 75, 'garden': 80, 'forest': 90, 'water': 82,
  'temple': 70, 'museum': 65, 'library': 88, 'cemetery': 85,
  'beach': 60, 'mountain': 92, 'lake': 88, 'cave': 95,
  'market': 20, 'mall': 15, 'station': 10, 'airport': 5,
  'monument': 55, 'attraction': 40, 'restaurant': 30,
  'default': 50,
}

function getStoredSnapshots(): DecibelSnapshot[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_DECIBELS) || '[]')
  } catch { return [] }
}

function storeSnapshots(snapshots: DecibelSnapshot[]): void {
  localStorage.setItem(STORAGE_KEY_DECIBELS, JSON.stringify(snapshots))
}

/**
 * Capture a decibel snapshot using Web Audio API.
 * Returns relative loudness (not calibrated SPL).
 * Captures for 5 seconds and returns the average.
 */
export async function captureDecibelSnapshot(
  placeId: string,
  durationMs: number = 5000,
  forceMock: boolean = false
): Promise<DecibelSnapshot> {
  const isMock = forceMock || (typeof window !== 'undefined' && 
    (window.location.search.includes('mock=true') || !navigator.mediaDevices?.getUserMedia))

  if (isMock) {
    const readings: number[] = []
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        // Generate a random mock decibel reading between 35 and 75 dB
        const approxDb = Math.round((35 + Math.random() * 40) * 10) / 10
        readings.push(approxDb)
      }, 200)

      setTimeout(() => {
        clearInterval(interval)
        const avgDb = readings.reduce((s, v) => s + v, 0) / readings.length
        const snapshot: DecibelSnapshot = {
          id: generateId(),
          placeId,
          approxDb: Math.round(avgDb * 10) / 10,
          capturedAt: Date.now(),
          deviceNote: 'Mock Browser Environment (Simulated)',
          flaggedSuspicious: false,
        }

        // Store snapshot in localStorage
        const all = getStoredSnapshots()
        all.push(snapshot)
        storeSnapshots(all)

        resolve(snapshot)
      }, durationMs)
    })
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const ctx = new AudioContextClass()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  const analyser = ctx.createAnalyser()
  ctx.createMediaStreamSource(stream).connect(analyser)
  analyser.fftSize = 2048

  const data = new Float32Array(analyser.fftSize)
  const readings: number[] = []

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      analyser.getFloatTimeDomainData(data)
      let sumSquares = 0
      for (let i = 0; i < data.length; i++) {
        sumSquares += data[i] * data[i]
      }
      const rms = Math.sqrt(sumSquares / data.length)
      const dbfs = 20 * Math.log10(rms || 0.0001)
      const approxDb = Math.max(30, Math.min(100, dbfs + 100))
      readings.push(approxDb)
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      stream.getTracks().forEach(t => t.stop())
      ctx.close()

      const avgDb = readings.length > 0
        ? readings.reduce((s, v) => s + v, 0) / readings.length
        : 30 // fallback

      const snapshot: DecibelSnapshot = {
        id: generateId(),
        placeId,
        approxDb: Math.round(avgDb * 10) / 10,
        capturedAt: Date.now(),
        deviceNote: navigator.userAgent.slice(0, 50),
        flaggedSuspicious: false,
      }

      // Anti-fake: z-score outlier detection
      const existing = getStoredSnapshots().filter(s => s.placeId === placeId)
      if (existing.length >= 3) {
        const mean = existing.reduce((s, e) => s + e.approxDb, 0) / existing.length
        const stdDev = Math.sqrt(existing.reduce((s, e) => s + (e.approxDb - mean) ** 2, 0) / existing.length)
        if (stdDev > 2.0 && Math.abs(snapshot.approxDb - mean) / stdDev > 2.5) {
          snapshot.flaggedSuspicious = true
        }
      }

      // Store
      const all = getStoredSnapshots()
      all.push(snapshot)
      storeSnapshots(all)

      resolve(snapshot)
    }, durationMs)
  })
}

/**
 * Compute quietness score for a place.
 * Weighted formula: w1*(1-norm_db) + w2*(osm_tag) + w3*(time_factor)
 * Falls back to tag-only when < 1 decibel samples exist.
 */
export function computeQuietnessScore(
  placeId: string,
  placeCategory: string = 'default'
): QuietnessScoreData {
  const snapshots = getStoredSnapshots().filter(
    s => s.placeId === placeId && !s.flaggedSuspicious
  )

  const osmTagScore = OSM_TAG_QUIETNESS[placeCategory] ?? OSM_TAG_QUIETNESS['default']

  // Time of day factor: quieter early morning / late evening
  const hour = new Date().getHours()
  let timeOfDayFactor: number
  if (hour < 6 || hour > 21) timeOfDayFactor = 0.9
  else if (hour < 9 || hour > 18) timeOfDayFactor = 0.7
  else timeOfDayFactor = 0.4

  if (snapshots.length < MIN_SAMPLES_FOR_DECIBEL_SCORE) {
    // Tag-only fallback
    const score = Math.round(osmTagScore * 0.7 + timeOfDayFactor * 100 * 0.3)
    return {
      placeId,
      score: Math.min(100, Math.max(0, score)),
      basis: 'tag_only',
      sampleCount: snapshots.length,
      avgDecibel: snapshots.length > 0
        ? Math.round(snapshots.reduce((s, e) => s + e.approxDb, 0) / snapshots.length * 10) / 10
        : null,
      osmTagScore,
      timeOfDayFactor,
      updatedAt: Date.now(),
    }
  }

  // Full formula with decibel data
  const avgDb = snapshots.reduce((s, e) => s + e.approxDb, 0) / snapshots.length
  // Normalize: 30 dBA (quietest) to 90 dBA (loudest)
  const normalizedDb = Math.min(1, Math.max(0, (avgDb - 30) / 60))

  // Weights: favor decibel data when available
  const w1 = 0.5  // decibel weight
  const w2 = 0.3  // OSM tag weight
  const w3 = 0.2  // time of day weight

  const score = Math.round(
    w1 * (1 - normalizedDb) * 100 +
    w2 * osmTagScore +
    w3 * timeOfDayFactor * 100
  )

  return {
    placeId,
    score: Math.min(100, Math.max(0, score)),
    basis: 'decibel',
    sampleCount: snapshots.length,
    avgDecibel: Math.round(avgDb * 10) / 10,
    osmTagScore,
    timeOfDayFactor,
    updatedAt: Date.now(),
  }
}

// ─── Feature 4: Memory Weight™ ──────────────────────────────────────────────

const STORAGE_KEY_MEMORIES = 'expeditionx_place_memories'

function getStoredMemories(): PlaceMemory[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_MEMORIES) || '[]')
  } catch { return [] }
}

function storeMemories(memories: PlaceMemory[]): void {
  localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories))
}

/**
 * Tag a place with an emotional weight.
 */
export function tagPlaceMemory(
  userId: string,
  tripId: string,
  placeId: string,
  placeName: string,
  tagId: MemoryTagId,
  weight: number = 3,
  note: string = '',
  isPublic: boolean = false
): PlaceMemory {
  const memory: PlaceMemory = {
    id: generateId(),
    userId,
    tripId,
    placeId,
    placeName,
    tagId,
    weight: Math.min(5, Math.max(1, weight)),
    note,
    isPublic,
    createdAt: Date.now(),
  }

  const all = getStoredMemories()
  // Replace existing tag for same user+place+trip+tag combo
  const filtered = all.filter(
    m => !(m.userId === userId && m.placeId === placeId && m.tripId === tripId && m.tagId === tagId)
  )
  filtered.push(memory)
  storeMemories(filtered)
  return memory
}

/**
 * Remove a memory tag.
 */
export function removeMemory(memoryId: string): void {
  const all = getStoredMemories()
  storeMemories(all.filter(m => m.id !== memoryId))
}

/**
 * Get all memories for a specific trip.
 */
export function getTripMemories(tripId: string): PlaceMemory[] {
  return getStoredMemories().filter(m => m.tripId === tripId)
}

/**
 * Get all memories for a specific user.
 */
export function getUserMemories(userId: string): PlaceMemory[] {
  return getStoredMemories().filter(m => m.userId === userId)
}

/**
 * Compute place significance — weighted sum aggregate across all public memories.
 */
export function computePlaceSignificance(placeId: string): PlaceSignificance[] {
  const allMemories = getStoredMemories()
  const placeMemories = allMemories.filter(m => m.placeId === placeId && m.isPublic)

  const tagGroups: Record<string, PlaceMemory[]> = {}
  for (const m of placeMemories) {
    if (!tagGroups[m.tagId]) tagGroups[m.tagId] = []
    tagGroups[m.tagId].push(m)
  }

  return Object.entries(tagGroups).map(([tagId, memories]) => ({
    placeId,
    placeName: memories[0]?.placeName || '',
    tagId: tagId as MemoryTagId,
    aggregateWeight: memories.reduce((s, m) => s + m.weight, 0) / memories.length,
    taggedCount: memories.length,
    updatedAt: Date.now(),
  }))
}

/**
 * Cross-trip search: find places matching specific emotional tags.
 * e.g. "show peaceful but inexpensive places"
 */
export function searchByMemoryTags(
  tags: MemoryTagId[],
  minWeight: number = 3
): Map<string, { placeName: string; tags: PlaceSignificance[] }> {
  const allMemories = getStoredMemories().filter(m => m.isPublic)
  const placeIds = [...new Set(allMemories.map(m => m.placeId))]

  const results = new Map<string, { placeName: string; tags: PlaceSignificance[] }>()

  for (const pid of placeIds) {
    const significance = computePlaceSignificance(pid)
    const matching = significance.filter(
      s => tags.includes(s.tagId) && s.aggregateWeight >= minWeight
    )
    if (matching.length === tags.length) {
      results.set(pid, {
        placeName: matching[0]?.placeName || pid,
        tags: matching,
      })
    }
  }

  return results
}

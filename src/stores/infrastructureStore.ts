/**
 * infrastructureStore.ts — Zustand store for Infrastructure Intelligence Layer
 *
 * Manages state for all 4 features:
 *   1. Dead-Zone Navigator™  — route mode toggle + gap analysis cache
 *   2. Future Crowd Map™     — crowd forecast + slot reservations
 *   3. Quiet Tourism™        — decibel snapshots + quietness scores
 *   4. Memory Weight™        — emotional memory tags + significance
 */

import { create } from 'zustand'
import {
  computeDeadZones,
  computeCrowdForecast,
  reserveSlot,
  captureDecibelSnapshot,
  computeQuietnessScore,
  tagPlaceMemory,
  removeMemory,
  getTripMemories,
  getUserMemories,
  computePlaceSignificance,
  searchByMemoryTags,
  type DeadZoneAnalysis,
  type CrowdForecastData,
  type DecibelSnapshot,
  type QuietnessScoreData,
  type PlaceMemory,
  type PlaceSignificance,
  type MemoryTagId,
} from '../services/infrastructureService'

interface InfrastructureState {
  // ─── Feature 1: Dead-Zone Navigator™ ───
  routeMode: 'shortest' | 'survivable'
  deadZoneAnalysis: DeadZoneAnalysis | null
  isAnalyzingDeadZones: boolean
  setRouteMode: (mode: 'shortest' | 'survivable') => void
  analyzeRoute: (routeCoords: [number, number][], routeId?: string) => Promise<void>

  // ─── Feature 2: Future Crowd Map™ ───
  crowdForecast: CrowdForecastData | null
  isLoadingCrowd: boolean
  reservationError: string | null
  fetchCrowdForecast: (placeId: string, placeName: string, visitDate: string, category?: string) => void
  makeReservation: (placeId: string, visitDate: string, timeSlot: string, groupSize?: number) => { success: boolean; error?: string }

  // ─── Feature 3: Quiet Tourism™ ───
  quietnessScore: QuietnessScoreData | null
  isRecording: boolean
  lastSnapshot: DecibelSnapshot | null
  recordingProgress: number  // 0-100
  fetchQuietnessScore: (placeId: string, category?: string) => void
  recordSnapshot: (placeId: string) => Promise<void>

  // ─── Feature 4: Memory Weight™ ───
  tripMemories: PlaceMemory[]
  userMemories: PlaceMemory[]
  placeSignificance: PlaceSignificance[]
  memorySearchResults: Map<string, { placeName: string; tags: PlaceSignificance[] }> | null
  loadTripMemories: (tripId: string) => void
  loadUserMemories: (userId: string) => void
  addMemory: (
    userId: string, tripId: string, placeId: string, placeName: string,
    tagId: MemoryTagId, weight?: number, note?: string, isPublic?: boolean
  ) => PlaceMemory
  deleteMemory: (memoryId: string, tripId: string) => void
  loadPlaceSignificance: (placeId: string) => void
  searchMemories: (tags: MemoryTagId[], minWeight?: number) => void
}

export const useInfrastructureStore = create<InfrastructureState>((set, get) => ({
  // ─── Feature 1: Dead-Zone Navigator™ ───
  routeMode: 'shortest',
  deadZoneAnalysis: null,
  isAnalyzingDeadZones: false,

  setRouteMode: (mode) => {
    set({ routeMode: mode })
  },

  analyzeRoute: async (routeCoords, routeId = 'default') => {
    set({ isAnalyzingDeadZones: true })
    try {
      const analysis = await computeDeadZones(routeCoords, routeId)
      set({ deadZoneAnalysis: analysis, isAnalyzingDeadZones: false })
    } catch (e) {
      console.error('[InfrastructureStore] Dead-zone analysis failed:', e)
      set({ isAnalyzingDeadZones: false })
    }
  },

  // ─── Feature 2: Future Crowd Map™ ───
  crowdForecast: null,
  isLoadingCrowd: false,
  reservationError: null,

  fetchCrowdForecast: (placeId, placeName, visitDate, category) => {
    set({ isLoadingCrowd: true })
    try {
      const forecast = computeCrowdForecast(placeId, placeName, visitDate, category)
      set({ crowdForecast: forecast, isLoadingCrowd: false })
    } catch (e) {
      console.error('[InfrastructureStore] Crowd forecast failed:', e)
      set({ isLoadingCrowd: false })
    }
  },

  makeReservation: (placeId, visitDate, timeSlot, groupSize) => {
    const result = reserveSlot(placeId, visitDate, timeSlot, groupSize)
    if (!result.success) {
      set({ reservationError: result.error || 'Reservation failed' })
    } else {
      set({ reservationError: null })
      // Refresh forecast
      const state = get()
      if (state.crowdForecast) {
        const forecast = computeCrowdForecast(
          placeId,
          state.crowdForecast.placeName,
          visitDate,
          'attraction'
        )
        set({ crowdForecast: forecast })
      }
    }
    return result
  },

  // ─── Feature 3: Quiet Tourism™ ───
  quietnessScore: null,
  isRecording: false,
  lastSnapshot: null,
  recordingProgress: 0,

  fetchQuietnessScore: (placeId, category) => {
    const score = computeQuietnessScore(placeId, category)
    set({ quietnessScore: score })
  },

  recordSnapshot: async (placeId) => {
    set({ isRecording: true, recordingProgress: 0 })

    // Progress animation
    const progressInterval = setInterval(() => {
      set(state => ({
        recordingProgress: Math.min(95, state.recordingProgress + 2)
      }))
    }, 100)

    try {
      const snapshot = await captureDecibelSnapshot(placeId)
      clearInterval(progressInterval)
      set({ recordingProgress: 100 })

      // Refresh quietness score
      const score = computeQuietnessScore(placeId)
      set({
        lastSnapshot: snapshot,
        quietnessScore: score,
        isRecording: false,
        recordingProgress: 0,
      })
    } catch (e) {
      clearInterval(progressInterval)
      console.error('[InfrastructureStore] Recording failed:', e)
      set({ isRecording: false, recordingProgress: 0 })
      throw e // Re-throw so component can handle mic errors in UI
    }
  },

  // ─── Feature 4: Memory Weight™ ───
  tripMemories: [],
  userMemories: [],
  placeSignificance: [],
  memorySearchResults: null,

  loadTripMemories: (tripId) => {
    set({ tripMemories: getTripMemories(tripId) })
  },

  loadUserMemories: (userId) => {
    set({ userMemories: getUserMemories(userId) })
  },

  addMemory: (userId, tripId, placeId, placeName, tagId, weight, note, isPublic) => {
    const memory = tagPlaceMemory(userId, tripId, placeId, placeName, tagId, weight, note, isPublic)
    // Refresh trip memories
    set({ tripMemories: getTripMemories(tripId) })
    return memory
  },

  deleteMemory: (memoryId, tripId) => {
    removeMemory(memoryId)
    set({ tripMemories: getTripMemories(tripId) })
  },

  loadPlaceSignificance: (placeId) => {
    set({ placeSignificance: computePlaceSignificance(placeId) })
  },

  searchMemories: (tags, minWeight) => {
    const results = searchByMemoryTags(tags, minWeight)
    set({ memorySearchResults: results })
  },
}))

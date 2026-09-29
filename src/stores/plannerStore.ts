/**
 * plannerStore.ts — Zustand store for the Trip Planner 6-step workspace
 * Manages current step, trip session, and all 15 feature states.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DestinationMatch,
  RouteSegment,
  ScamWarning,
  Challenge,
  PackingList,
  TimeCapsule,
  GroupMember,
} from '../services/plannerFeatures'

export type PlannerStep = 1 | 2 | 3 | 4 | 5 | 6

export const STEP_META: Record<PlannerStep, { label: string; emoji: string; description: string }> = {
  1: { label: 'Destination', emoji: '🌍', description: 'Find your perfect destination' },
  2: { label: 'Route', emoji: '🗺️', description: 'Plan your route and energy' },
  3: { label: 'Safety & Timing', emoji: '🛡️', description: 'Weather, scams, emergency plans' },
  4: { label: 'Places', emoji: '📍', description: 'Discover hidden gems and food' },
  5: { label: 'Pack & Budget', emoji: '🎒', description: 'What to pack and how much' },
  6: { label: 'Review', emoji: '✅', description: 'Finalize and download offline pack' },
}

export interface TripSession {
  id: string
  destination: string
  startDate: string
  endDate: string
  durationDays: number
  vibes: string[]
  budgetPerDay: number
  party: string
  waypoints: string[]
  // Optional: selected flight info merged from flightStore
  selectedFlightIata?: string
  selectedFlightLabel?: string
}

interface PlannerState {
  // ── Navigation ──
  currentStep: PlannerStep
  completedSteps: Set<PlannerStep>
  setStep: (step: PlannerStep) => void
  completeStep: (step: PlannerStep) => void

  // ── Trip Session ──
  session: TripSession | null
  setSession: (s: Partial<TripSession>) => void
  resetSession: () => void

  // ── Feature 7: Selected Destination ──
  selectedDestination: DestinationMatch | null
  setSelectedDestination: (d: DestinationMatch | null) => void

  // ── Feature 2: Route Risk ──
  routeSegments: RouteSegment[]
  setRouteSegments: (segs: RouteSegment[]) => void

  // ── Feature 8: Energy Budget ──
  energyBudget: number
  setEnergyBudget: (n: number) => void

  // ── Feature 5: Scam warnings (local store) ──
  scamWarnings: ScamWarning[]
  setScamWarnings: (w: ScamWarning[]) => void
  addScamWarning: (w: ScamWarning) => void

  // ── Feature 6: Weather ──
  weatherLoaded: boolean
  setWeatherLoaded: (b: boolean) => void

  // ── Feature 12: Packing list ──
  packingList: PackingList | null
  setPackingList: (p: PackingList | null) => void
  togglePackingItem: (itemId: string) => void

  // ── Feature 9: Offline pack ──
  offlinePackReady: boolean
  offlinePackProgress: number
  setOfflinePackProgress: (n: number) => void

  // ── Feature 10: Time capsule ──
  timeCapsule: TimeCapsule | null
  setTimeCapsule: (c: TimeCapsule | null) => void

  // ── Feature 14: Challenges ──
  challenges: Challenge[]
  setChallenges: (c: Challenge[]) => void

  // ── Feature 13: Group members ──
  groupMembers: GroupMember[]
  setGroupMembers: (m: GroupMember[]) => void

  // ── Active filters (Step 4) ──
  placeFilters: {
    hiddenGems: boolean
    quietSpots: boolean
    foodSafety: boolean
    crowdDensity: boolean
  }
  toggleFilter: (filter: keyof PlannerState['placeFilters']) => void

  // ── Active map layer ──
  mapLayer: 'standard' | 'satellite' | 'terrain'
  setMapLayer: (l: PlannerState['mapLayer']) => void
}

const DEFAULT_SESSION: TripSession = {
  id: `trip-${Date.now()}`,
  destination: '',
  startDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
  durationDays: 5,
  vibes: [],
  budgetPerDay: 3000,
  party: 'Solo',
  waypoints: [],
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentStep: 1,
      completedSteps: new Set(),
      setStep: (step) => set({ currentStep: step }),
      completeStep: (step) => set(s => ({ completedSteps: new Set([...s.completedSteps, step]) })),

      // Session
      session: null,
      setSession: (partial) => set(s => ({
        session: { ...(s.session ?? DEFAULT_SESSION), ...partial }
      })),
      resetSession: () => set({ session: null, currentStep: 1, completedSteps: new Set() }),

      // Features
      selectedDestination: null,
      setSelectedDestination: (d) => set({ selectedDestination: d }),

      routeSegments: [],
      setRouteSegments: (segs) => set({ routeSegments: segs }),

      energyBudget: 70,
      setEnergyBudget: (n) => set({ energyBudget: n }),

      scamWarnings: [],
      setScamWarnings: (w) => set({ scamWarnings: w }),
      addScamWarning: (w) => set(s => ({ scamWarnings: [w, ...s.scamWarnings] })),

      weatherLoaded: false,
      setWeatherLoaded: (b) => set({ weatherLoaded: b }),

      packingList: null,
      setPackingList: (p) => set({ packingList: p }),
      togglePackingItem: (itemId) => set(s => {
        if (!s.packingList) return {}
        const items = s.packingList.items.map(i =>
          i.id === itemId ? { ...i, checked: !i.checked } : i
        )
        const totalVolume = items.filter(i => !i.checked).reduce((sum, i) => sum + i.volumeLitres, 0)
        const fillPercent = Math.min(100, Math.round((totalVolume / s.packingList.bagCapacityLitres) * 100))
        return { packingList: { ...s.packingList, items, fillPercent } }
      }),

      offlinePackReady: false,
      offlinePackProgress: 0,
      setOfflinePackProgress: (n) => set({ offlinePackProgress: n, offlinePackReady: n >= 100 }),

      timeCapsule: null,
      setTimeCapsule: (c) => set({ timeCapsule: c }),

      challenges: [],
      setChallenges: (c) => set({ challenges: c }),

      groupMembers: [],
      setGroupMembers: (m) => set({ groupMembers: m }),

      placeFilters: {
        hiddenGems: false,
        quietSpots: false,
        foodSafety: false,
        crowdDensity: false,
      },
      toggleFilter: (filter) => set(s => ({
        placeFilters: { ...s.placeFilters, [filter]: !s.placeFilters[filter] }
      })),

      mapLayer: 'standard',
      setMapLayer: (l) => set({ mapLayer: l }),
    }),
    {
      name: 'expedition-planner-state',
      partialize: (state) => ({
        currentStep: state.currentStep,
        session: state.session,
        selectedDestination: state.selectedDestination,
        energyBudget: state.energyBudget,
        packingList: state.packingList,
        timeCapsule: state.timeCapsule,
        challenges: state.challenges,
        placeFilters: state.placeFilters,
      }),
    }
  )
)

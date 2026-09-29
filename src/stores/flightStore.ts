/**
 * flightStore.ts — Zustand store for Flight Search feature
 * Persists: search results, last search params, selected flight
 * Used by: FlightSearch, FlightDetails, TripPlannerWorkspace
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlightData } from '../services/flightService'

export interface SelectedFlight {
  airline: { name: string; iata: string } | null
  flightNumber: string
  flightIata: string
  departure: { airport: string; iata: string; scheduled: string } | null
  arrival: { airport: string; iata: string; scheduled: string } | null
  status: string
  flightDate: string | null
  aircraft: { registration: string; iata: string } | null
  // derived
  durationMinutes: number | null
  selectedAt: string // ISO timestamp
}

export interface FlightSearchParams {
  departure: string
  arrival: string
  flightDate?: string
}

interface FlightState {
  // Search results cache
  searchResults: FlightData[]
  searchParams: FlightSearchParams
  hasSearched: boolean

  // Selected flight (for trip planner integration)
  selectedFlight: SelectedFlight | null

  // Actions
  setSearchResults: (results: FlightData[], params: FlightSearchParams) => void
  clearSearch: () => void
  selectFlight: (flight: FlightData) => void
  clearSelectedFlight: () => void
}

function calcDurationMinutes(dep?: string | null, arr?: string | null): number | null {
  if (!dep || !arr) return null
  try {
    const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000
    return diff > 0 ? Math.round(diff) : null
  } catch {
    return null
  }
}

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchResults: [],
      searchParams: { departure: 'DEL', arrival: 'BOM' },
      hasSearched: false,
      selectedFlight: null,

      setSearchResults: (results, params) =>
        set({ searchResults: results, searchParams: params, hasSearched: true }),

      clearSearch: () =>
        set({ searchResults: [], hasSearched: false }),

      selectFlight: (flight) => {
        const dur = calcDurationMinutes(
          flight.departure?.scheduled,
          flight.arrival?.scheduled
        )
        const selected: SelectedFlight = {
          airline: flight.airline
            ? { name: flight.airline.name || '', iata: flight.airline.iata || '' }
            : null,
          flightNumber: flight.flight?.number || '',
          flightIata: flight.flight?.iata || '',
          departure: flight.departure
            ? {
                airport: flight.departure.airport || '',
                iata: flight.departure.iata || '',
                scheduled: flight.departure.scheduled || '',
              }
            : null,
          arrival: flight.arrival
            ? {
                airport: flight.arrival.airport || '',
                iata: flight.arrival.iata || '',
                scheduled: flight.arrival.scheduled || '',
              }
            : null,
          status: flight.status || 'unknown',
          flightDate: flight.flightDate || null,
          aircraft: flight.aircraft
            ? {
                registration: flight.aircraft.registration || '',
                iata: flight.aircraft.iata || '',
              }
            : null,
          durationMinutes: dur,
          selectedAt: new Date().toISOString(),
        }
        set({ selectedFlight: selected })
      },

      clearSelectedFlight: () => set({ selectedFlight: null }),
    }),
    {
      name: 'expedition-flight-storage',
      partialize: (state) => ({
        searchResults: state.searchResults,
        searchParams: state.searchParams,
        hasSearched: state.hasSearched,
        selectedFlight: state.selectedFlight,
      }),
    }
  )
)

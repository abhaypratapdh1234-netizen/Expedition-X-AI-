// wizardStore.ts — Zustand store for the Trip Setup Wizard
// Persists to localStorage so browser refreshes don't lose progress.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExplicitDNASliders } from '../services/intelligenceService'

export interface WizardState {
  // Step tracking
  currentStep: number

  // Step 0 — Mood (optional entry point)
  mood: string | null
  entryMode: 'destination' | 'mood'

  // Step 1 — Destination
  destination: string

  // Step 2 — Party & Trip Type
  party: string
  tripTypes: string[]

  // Step 3 — Budget & Logistics
  budgetMin: number
  budgetMax: number
  accommodation: string
  transport: string
  food: string

  // Step 4 — Preferences
  wakeUpTime: string
  walkingPreference: string
  energyLevel: string
  dietary: string[]
  accessibility: string[]
  languages: string[]
  activityDuration: string

  // Wizard meta
  isComplete: boolean
  startDate: string
  durationDays: number

  // DNA sliders (from onboarding, fed into the engine)
  dnaSliders: Partial<ExplicitDNASliders>

  // Selected variant label (from variant picker step)
  selectedVariantLabel: 'cheapest' | 'fastest' | 'most_scenic' | 'best_food' | null

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setMood: (mood: string | null) => void
  setEntryMode: (mode: 'destination' | 'mood') => void
  setDestination: (d: string) => void
  setParty: (p: string) => void
  setTripTypes: (types: string[]) => void
  setBudget: (min: number, max: number) => void
  setAccommodation: (a: string) => void
  setTransport: (t: string) => void
  setFood: (f: string) => void
  setWakeUpTime: (t: string) => void
  setWalkingPreference: (p: string) => void
  setEnergyLevel: (e: string) => void
  setDietary: (d: string[]) => void
  setAccessibility: (a: string[]) => void
  setLanguages: (l: string[]) => void
  setActivityDuration: (d: string) => void
  setStartDate: (d: string) => void
  setDurationDays: (n: number) => void
  setDnaSliders: (sliders: Partial<ExplicitDNASliders>) => void
  setSelectedVariantLabel: (label: 'cheapest' | 'fastest' | 'most_scenic' | 'best_food') => void
  complete: () => void
  reset: () => void
}

const DEFAULT_STATE = {
  currentStep: 1,
  mood: null,
  entryMode: 'destination' as const,
  destination: '',
  party: '',
  tripTypes: [] as string[],
  budgetMin: 25000,
  budgetMax: 100000,
  accommodation: 'Mid',
  transport: 'Flight',
  food: 'Mixed',
  wakeUpTime: '7 AM',
  walkingPreference: 'Normal',
  energyLevel: 'Balanced',
  dietary: [] as string[],
  accessibility: [] as string[],
  languages: ['English'] as string[],
  activityDuration: '2 hr',
  isComplete: false,
  startDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  durationDays: 3,
  dnaSliders: {} as Partial<ExplicitDNASliders>,
  selectedVariantLabel: null as ('cheapest' | 'fastest' | 'most_scenic' | 'best_food' | null),
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set({ currentStep: Math.min(get().currentStep + 1, 6) }),
      prevStep: () => set({ currentStep: Math.max(get().currentStep - 1, 1) }),

      setMood: (mood) => set({ mood }),
      setEntryMode: (entryMode) => set({ entryMode }),
      setDestination: (destination) => set({ destination }),
      setParty: (party) => set({ party }),
      setTripTypes: (tripTypes) => set({ tripTypes }),
      setBudget: (budgetMin, budgetMax) => set({ budgetMin, budgetMax }),
      setAccommodation: (accommodation) => set({ accommodation }),
      setTransport: (transport) => set({ transport }),
      setFood: (food) => set({ food }),
      setWakeUpTime: (wakeUpTime) => set({ wakeUpTime }),
      setWalkingPreference: (walkingPreference) => set({ walkingPreference }),
      setEnergyLevel: (energyLevel) => set({ energyLevel }),
      setDietary: (dietary) => set({ dietary }),
      setAccessibility: (accessibility) => set({ accessibility }),
      setLanguages: (languages) => set({ languages }),
      setActivityDuration: (activityDuration) => set({ activityDuration }),
      setStartDate: (startDate) => set({ startDate }),
      setDurationDays: (durationDays) => set({ durationDays }),
      setDnaSliders: (dnaSliders) => set({ dnaSliders }),
      setSelectedVariantLabel: (selectedVariantLabel) => set({ selectedVariantLabel }),
      complete: () => set({ isComplete: true, currentStep: 6 }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'expedition-wizard-state',
      partialize: (state) => ({
        currentStep: state.currentStep,
        mood: state.mood,
        entryMode: state.entryMode,
        destination: state.destination,
        party: state.party,
        tripTypes: state.tripTypes,
        budgetMin: state.budgetMin,
        budgetMax: state.budgetMax,
        accommodation: state.accommodation,
        transport: state.transport,
        food: state.food,
        wakeUpTime: state.wakeUpTime,
        walkingPreference: state.walkingPreference,
        energyLevel: state.energyLevel,
        dietary: state.dietary,
        accessibility: state.accessibility,
        languages: state.languages,
        activityDuration: state.activityDuration,
        isComplete: state.isComplete,
        startDate: state.startDate,
        durationDays: state.durationDays,
        dnaSliders: state.dnaSliders,
        selectedVariantLabel: state.selectedVariantLabel,
      }),
    }
  )
)

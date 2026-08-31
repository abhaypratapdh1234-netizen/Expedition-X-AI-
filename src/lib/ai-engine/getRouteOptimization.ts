// getRouteOptimization.ts — Pure fn: returns route optimization stats per day
import type { DayPlan } from '../../services/tripService'

export interface RouteOptimizationResult {
  originalKm: number
  optimizedKm: number
  savedMinutes: number
  savedRs: number
}

// Seeded deterministic
function seeded(seed: number): number {
  const x = Math.sin(seed + 42) * 10000
  return x - Math.floor(x)
}

export function getRouteOptimization(day: DayPlan): RouteOptimizationResult {
  const seed = day.day + day.items.length
  const originalKm = Math.round(12 + seeded(seed) * 15)
  const savedKm = Math.round(3 + seeded(seed + 1) * 8)
  const optimizedKm = Math.max(originalKm - savedKm, 5)
  const savedMinutes = Math.round(savedKm * 3.2)
  const savedRs = Math.round(savedMinutes * 4.5)

  return { originalKm, optimizedKm, savedMinutes, savedRs }
}

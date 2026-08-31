// getAISuggestion.ts — Pure fn: day items → per-day AI suggestion banner
import type { DayPlan } from '../../services/tripService'

export interface AISuggestion {
  message: string
  savedMinutes: number
  actionLabel: string
}

const SUGGESTION_TEMPLATES = [
  (name: string, mins: number) => ({ message: `You're spending too much time at ${name}. Moving it after lunch saves you ${mins} minutes and beats the afternoon crowd peak.`, savedMinutes: mins, actionLabel: `Save ${mins} min` }),
  (name: string, mins: number) => ({ message: `Swapping ${name} with the next stop reduces your total walking distance by 2.3 km.`, savedMinutes: mins, actionLabel: `Reroute (+${mins} min)` }),
  (name: string, mins: number) => ({ message: `${name} opens 30 minutes later than your current arrival — start with breakfast first and arrive perfectly on time.`, savedMinutes: mins, actionLabel: `Shift ${mins} min` }),
  (name: string, mins: number) => ({ message: `Consider skipping ${name} today — AI predicts 78% capacity at your scheduled time. Visit tomorrow morning at 7 AM instead.`, savedMinutes: mins, actionLabel: `Reschedule` }),
  (name: string, mins: number) => ({ message: `${name} has a hidden entrance that cuts queue time by ${mins} min — locals use the south gate.`, savedMinutes: mins, actionLabel: `Save ${mins} min` }),
]

export function getAISuggestion(day: DayPlan): AISuggestion | null {
  if (day.items.length < 2) return null

  const seed = day.day + day.items.length
  const templateIdx = seed % SUGGESTION_TEMPLATES.length
  const targetItem = day.items[seed % day.items.length]
  const savedMins = 18 + (seed * 7) % 45

  return SUGGESTION_TEMPLATES[templateIdx](targetItem.name, savedMins)
}

export function getWaypointAIData(itemId: string, dayIdx: number) {
  const seed = itemId.length + dayIdx
  const crowdPercent = 20 + (seed * 13) % 65
  const crowdLevel: 'low' | 'medium' | 'high' = crowdPercent < 40 ? 'low' : crowdPercent < 65 ? 'medium' : 'high'
  const temp = 18 + (seed * 3) % 18
  const rainChance = (seed * 7) % 35
  const rating = 3 + ((seed * 2) % 3) // 3,4,5

  const aiReasons = [
    'Low crowd — morning lighting is ideal, saves 25 minutes',
    'Peak hours avoided — beat 80% of daily visitors',
    'Golden hour timing optimized for photography',
    'Weekday visit cuts queue time by 35%',
    'Nearby hidden entrance saves 20 min queue',
    'Best light conditions for this attraction at this time',
    'Combined with next stop reduces walking by 1.8 km',
    'Opening time slot — freshest experience of the day',
  ]

  return {
    crowdPercent,
    crowdLevel,
    temp,
    rainChance,
    rating: Math.min(5, rating),
    aiReason: aiReasons[seed % aiReasons.length],
  }
}

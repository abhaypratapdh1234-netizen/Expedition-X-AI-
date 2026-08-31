// index.ts — Public barrel for ai-engine module
export { generateItinerary } from './generateItinerary'
export type { WizardInputs } from './generateItinerary'

export { getRouteOptimization } from './getRouteOptimization'
export type { RouteOptimizationResult } from './getRouteOptimization'

export { getPackingList } from './getPackingList'
export type { PackingItem } from './getPackingList'

export { getFoodRecommendations } from './getFoodRecommendations'
export type { FoodCard } from './getFoodRecommendations'

export { getSafetyInfo, getEmergencyContacts } from './getSafetyInfo'
export type { SafetyInfo } from './getSafetyInfo'

export { getAISuggestion, getWaypointAIData } from './getAISuggestion'
export type { AISuggestion } from './getAISuggestion'

export { getDestinationStat } from './destinationData'
export type { DestinationStat } from './destinationData'

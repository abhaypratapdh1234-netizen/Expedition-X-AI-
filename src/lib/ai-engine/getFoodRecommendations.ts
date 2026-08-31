// getFoodRecommendations.ts — Pure fn: destination + prefs → food cards
import { getFoodCards } from './destinationData'
import type { FoodCard } from './destinationData'

export type { FoodCard }

export function getFoodRecommendations(destination: string, dietary: string[] = []): FoodCard[] {
  const cards = getFoodCards(destination)
  const safeDietary = dietary || []
  if (!safeDietary.length || safeDietary.includes('No Preference')) return cards

  // Filter to show vegetarian/vegan options first if requested
  const isVeg = safeDietary.includes('Vegetarian') || safeDietary.includes('Vegan')
  const isHalal = safeDietary.includes('Halal')
  const isJain = safeDietary.includes('Jain')

  return cards.filter(card => {
    if (isVeg && card.tags.some(t => t.toLowerCase().includes('vegetarian') || t.toLowerCase().includes('vegan'))) return true
    if (isHalal && card.tags.some(t => t.toLowerCase().includes('halal'))) return true
    if (isJain) return card.tags.some(t => t.toLowerCase().includes('vegetarian'))
    return true
  }).sort((a, b) => {
    // Bump matching dietary options to top
    const aMatch = isVeg && a.tags.some(t => t.toLowerCase().includes('vegetarian')) ? 1 : 0
    const bMatch = isVeg && b.tags.some(t => t.toLowerCase().includes('vegetarian')) ? 1 : 0
    return bMatch - aMatch
  })
}

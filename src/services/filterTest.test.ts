import { describe, it, expect } from 'vitest'
import { placeService } from './placeService'

describe('Comprehensive Explore Page Filters Verification', () => {
  it('All 7 theme filters return rich sets of destinations', async () => {
    const themes = ['Trending', 'Adventure', 'Heritage', 'Beach', 'Offbeat', 'Food Trails', 'Nightlife']
    for (const theme of themes) {
      const results = await placeService.searchDestinations({ category: theme })
      expect(results.length).toBeGreaterThan(0)
    }
  })

  it('Minimum rating filter accurately and progressively filters destinations', async () => {
    const all = await placeService.searchDestinations({})
    const rating3 = await placeService.searchDestinations({ minRating: 3 })
    const rating4 = await placeService.searchDestinations({ minRating: 4 })
    const rating45 = await placeService.searchDestinations({ minRating: 4.5 })

    expect(all.length).toBeGreaterThan(0)
    expect(rating3.length).toBeGreaterThan(0)
    expect(rating4.length).toBeGreaterThan(0)
    expect(rating45.length).toBeGreaterThan(0)

    // Verify rating accuracy
    for (const p of rating4) {
      expect(Number(p.rating)).toBeGreaterThanOrEqual(4.0)
    }
    for (const p of rating45) {
      expect(Number(p.rating)).toBeGreaterThanOrEqual(4.5)
    }

    // Verify strict filtering: 4.5+ has fewer or equal destinations than 4+
    expect(rating45.length).toBeLessThan(rating4.length)
    expect(rating4.length).toBeLessThan(rating3.length)
  })

  it('India destinations exist and work accurately for ALL 7 themes', async () => {
    const themes = ['Trending', 'Adventure', 'Heritage', 'Beach', 'Offbeat', 'Food Trails', 'Nightlife']
    for (const theme of themes) {
      const results = await placeService.searchDestinations({ country: 'India', category: theme })
      expect(results.length).toBeGreaterThan(0)
      for (const p of results) {
        expect(p.country.toLowerCase()).toBe('india')
      }
    }
  })

  it('Other Foreign destinations exist and work accurately for themes', async () => {
    const foreignThemes = ['Heritage', 'Beach', 'Nightlife', 'Adventure']
    for (const theme of foreignThemes) {
      const results = await placeService.searchDestinations({ country: 'foreign', category: theme })
      expect(results.length).toBeGreaterThan(0)
      for (const p of results) {
        expect(p.country.toLowerCase()).not.toBe('india')
      }
    }
  })

  it('Cross-filter combination: India + Heritage + 4.5+ Rating', async () => {
    const results = await placeService.searchDestinations({ country: 'India', category: 'Heritage', minRating: 4.5 })
    expect(results.length).toBeGreaterThan(0)
    for (const p of results) {
      expect(p.country.toLowerCase()).toBe('india')
      expect(Number(p.rating)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('Cross-filter combination: India + Beach + 4+ Rating', async () => {
    const results = await placeService.searchDestinations({ country: 'India', category: 'Beach', minRating: 4.0 })
    expect(results.length).toBeGreaterThan(0)
    for (const p of results) {
      expect(p.country.toLowerCase()).toBe('india')
      expect(Number(p.rating)).toBeGreaterThanOrEqual(4.0)
    }
  })

  it('Sorting works accurately for rating and price', async () => {
    const byRating = await placeService.searchDestinations({ sortBy: 'rating' })
    expect(byRating.length).toBeGreaterThan(1)
    for (let i = 0; i < byRating.length - 1; i++) {
      expect(Number(byRating[i].rating)).toBeGreaterThanOrEqual(Number(byRating[i + 1].rating))
    }

    const byCostAsc = await placeService.searchDestinations({ sortBy: 'cost_asc' })
    expect(byCostAsc.length).toBeGreaterThan(1)
    for (let i = 0; i < byCostAsc.length - 1; i++) {
      expect(Number(byCostAsc[i].avgCost)).toBeLessThanOrEqual(Number(byCostAsc[i + 1].avgCost))
    }
  })

  it('Search queries match places by name, city, state, or keywords', async () => {
    const tajResults = await placeService.searchDestinations({ query: 'Taj' })
    expect(tajResults.length).toBeGreaterThan(0)
    expect(tajResults.some(p => p.name.includes('Taj'))).toBe(true)

    const goaResults = await placeService.searchDestinations({ query: 'Goa' })
    expect(goaResults.length).toBeGreaterThan(0)
  })
})

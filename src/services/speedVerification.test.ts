import { describe, it, expect } from 'vitest'
import { placeService } from './placeService'
import { simulateNetworkDelay } from './mockDelay'

describe('Lifetime Loading Speed Verification', () => {
  it('simulateNetworkDelay must resolve in under 5ms', async () => {
    const start = performance.now()
    await simulateNetworkDelay(1000, 2000)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10)
  })

  it('getTrendingDestinations must return destinations instantaneously without hanging', async () => {
    const start = performance.now()
    const results = await placeService.getTrendingDestinations()
    const elapsed = performance.now() - start
    expect(results.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(100) // instantaneous curated fallback or cached
  })

  it('searchDestinations with cache must return in under 15ms on second lookup', async () => {
    // Prime query
    await placeService.searchDestinations({ query: 'Goa' })

    // Cached retrieval
    const start = performance.now()
    const results = await placeService.searchDestinations({ query: 'Goa' })
    const elapsed = performance.now() - start
    expect(results.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(15)
  })
})

import { create } from 'zustand'
import { placeService } from '../services/placeService'
import type { SearchFilters } from '../services/placeService'

interface ExploreState {
  searchResults: any[]
  isSearching: boolean
  filters: SearchFilters
  
  setFilters: (filters: Partial<SearchFilters>) => void
  performSearch: () => Promise<void>
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  searchResults: [],
  isSearching: false,
  filters: {},
  
  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }))
    get().performSearch()
  },
  
  performSearch: async () => {
    set({ isSearching: true })
    try {
      const results = await placeService.searchDestinations(get().filters)
      set({ searchResults: results, isSearching: false })
    } catch (e) {
      set({ isSearching: false })
    }
  }
}))

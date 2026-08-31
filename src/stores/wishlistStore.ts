import { create } from 'zustand'
import { socialService } from '../services/socialService'

interface WishlistState {
  savedPlaceIds: string[]
  isLoading: boolean
  
  fetchWishlist: () => Promise<void>
  toggleSaved: (placeId: string) => Promise<boolean>
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  savedPlaceIds: [],
  isLoading: false,
  
  fetchWishlist: async () => {
    set({ isLoading: true })
    try {
      const list = await socialService.getWishlist()
      set({ savedPlaceIds: list, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
    }
  },
  
  toggleSaved: async (placeId: string) => {
    // Optimistic
    const current = get().savedPlaceIds
    const isSaved = current.includes(placeId)
    set({ 
      savedPlaceIds: isSaved 
        ? current.filter(id => id !== placeId) 
        : [...current, placeId] 
    })
    
    // Real call
    const result = await socialService.toggleWishlist(placeId)
    return result
  }
}))

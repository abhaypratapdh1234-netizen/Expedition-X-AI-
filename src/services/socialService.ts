import { apiClient } from './apiClient'

export const socialService = {
  // --- Collab / Presence ---
  async getActiveCollaborators(tripId: string) {
    try {
      return await apiClient.get<any[]>(`/trips/${tripId}/collaborators`)
    } catch (e) {
      console.error(e)
      return []
    }
  },
  
  // --- Expense Splitting ---
  async getGroupExpenses(tripId: string) {
    try {
      return await apiClient.get<any[]>(`/trips/${tripId}/cost-split`)
    } catch (e) {
      console.error(e)
      return []
    }
  },
  
  async settleExpense(expenseId: string, tripId: string, userId: number) {
    try {
      await apiClient.post(`/trips/${tripId}/cost-split/settle?userId=${userId}`, {})
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },

  // --- Wishlist ---
  async getWishlist() {
    try {
      const wishlist = await apiClient.get<any[]>('/wishlist')
      return wishlist.map(w => w.placeId.toString())
    } catch (e) {
      console.error('Error fetching wishlist, falling back to mock:', e)
      const stored = localStorage.getItem('mock_wishlist')
      if (stored) return JSON.parse(stored)
      
      const defaultWishlist = ['1', '3']
      localStorage.setItem('mock_wishlist', JSON.stringify(defaultWishlist))
      return defaultWishlist
    }
  },
  
  async toggleWishlist(placeId: string) {
    try {
      let current: string[] = []
      try {
        const response = await apiClient.get<any[]>('/wishlist')
        current = response.map(w => w.placeId.toString())
      } catch (e) {
        current = JSON.parse(localStorage.getItem('mock_wishlist') || '["1", "3"]')
      }

      const isSaved = current.includes(placeId)
      const newWishlist = isSaved ? current.filter(id => id !== placeId) : [...current, placeId]
      
      try {
        if (isSaved) {
          await apiClient.delete(`/wishlist?placeId=${placeId}`)
        } else {
          await apiClient.post('/wishlist', { placeId: parseInt(placeId) })
        }
      } catch (e) {
        // Fallback to local storage
        localStorage.setItem('mock_wishlist', JSON.stringify(newWishlist))
      }
      return !isSaved
    } catch (e) {
      console.error(e)
      return false
    }
  },

  // --- Reviews ---
  async submitReview(placeId: string, rating: number, text: string) {
    return {
      success: true,
      sentimentScored: text.length > 20
    }
  },
  
  async upvoteReview(reviewId: string) {
    try {
      await apiClient.post(`/reviews/${reviewId}/upvote`, {})
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },

  // --- Memories ---
  async getTripMemories(tripId: string) {
    try {
      return await apiClient.get<any[]>(`/trips/${tripId}/memories`)
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

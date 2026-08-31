import { apiClient } from './apiClient'

export interface DashboardSummary {
  totalTrips: number
  citiesVisited: number
  totalSpent: number
  explorerLevel: number
  xp: number
  trendingPlaces: any[]
  recommendations: any[]
  continuePlanning: any | null
}

export const dashboardService = {
  async getDashboardStats() {
    try {
      return await apiClient.get<DashboardSummary>('/dashboard/summary')
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

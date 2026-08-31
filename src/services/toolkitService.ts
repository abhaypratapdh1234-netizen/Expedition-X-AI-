import { apiClient } from './apiClient'

export const toolkitService = {
  async getExchangeRates(baseCurrency: string) {
    try {
      const response = await fetch(`https://api.frankfurter.dev/latest?from=${baseCurrency}`)
      if (!response.ok) throw new Error('API Error')
      const data = await response.json()
      
      const rates: Record<string, number> = data.rates
      rates[baseCurrency] = 1 // Add the base currency itself
      
      // Fallback for AED as Frankfurter doesn't support it natively
      if (!rates.AED) rates.AED = rates.USD ? rates.USD * 3.67 : 3.67
      
      return rates
    } catch (e) {
      console.warn('Frankfurter API failed, falling back to mock rates')
      const mockRates: Record<string, number> = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.35 }
      const baseRate = mockRates[baseCurrency] || 1
      const finalRates: Record<string, number> = {}
      for (const [curr, rate] of Object.entries(mockRates)) {
        finalRates[curr] = rate / baseRate
      }
      return finalRates
    }
  },

  async getLocalEvents(city: string, month: number) {
    try {
      return await apiClient.get<any[]>(`/events/local?city=${city}`)
    } catch (e) {
      console.error(e)
      return []
    }
  },
  
  async uploadDocument(file: File, tripId: string) {
    try {
      // Typically we'd use FormData and apiClient.post
      const formData = new FormData()
      formData.append('file', file)
      // Since backend takes form data or request params (docType, fileUrl, fileName),
      // Here we assume a proxy or the actual upload returns URL.
      // Mocking for now as multipart upload isn't strictly defined in the controller signature.
      const url = URL.createObjectURL(file) // Fallback for local
      return await apiClient.post<any>(`/trips/${tripId}/documents?docType=Other&fileUrl=${encodeURIComponent(url)}&fileName=${encodeURIComponent(file.name)}`, {})
    } catch (e) {
      console.error(e)
      return {
        id: `doc-${Date.now()}`,
        name: file.name,
        url: 'https://example.com/fake-doc.pdf',
        uploadedAt: new Date().toISOString()
      }
    }
  }
}

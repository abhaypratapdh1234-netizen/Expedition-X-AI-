import { apiClient } from './apiClient'

export const aiService = {
  async getCostConfidence(params: { totalEstimate: number }) {
    // Advanced ML cost variance estimation (mocked for demo)
    const base = params.totalEstimate
    return {
      low: Math.round(base * 0.85),
      high: Math.round(base * 1.2),
      mostLikely: base,
      confidenceScore: 0.94
    }
  },

  async getRecommendations(userId: string) {
    try {
      return await apiClient.get<any[]>('/recommendations')
    } catch (e) {
      console.error(e)
      return []
    }
  },

  async getSentimentScore(text: string) {
    const lower = text.toLowerCase()
    if (lower.includes('great') || lower.includes('amazing') || lower.includes('good')) return { score: 92, label: 'Positive' }
    if (lower.includes('bad') || lower.includes('worst') || lower.includes('crowded')) return { score: 35, label: 'Negative' }
    return { score: 70, label: 'Neutral' }
  },

  async generatePackingList(destId: string, month: number, duration: number) {
    try {
      // Backend expects tripId for packing list, but UI passes destId for generic generation.
      // If destId is numeric, we assume it's a tripId. Otherwise fallback.
      const numId = parseInt(destId)
      if (!isNaN(numId)) {
        return await apiClient.get<any[]>(`/trips/${numId}/packing-checklist`)
      }
    } catch (error) {}
    
    const isWinter = month >= 10 || month <= 2
    const items = [
      { id: 'p1', label: 'T-Shirts (x' + Math.ceil(duration / 2) + ')', checked: false },
      { id: 'p2', label: 'Jeans/Trousers (x2)', checked: false },
      { id: 'p3', label: 'Undergarments (x' + duration + ')', checked: false },
      { id: 'p4', label: 'Toiletries Kit', checked: false },
      { id: 'p5', label: 'Power Bank', checked: false }
    ]
    if (isWinter) items.push({ id: 'p6', label: 'Heavy Jacket', checked: false })
    else items.push({ id: 'p6', label: 'Sunscreen & Sunglasses', checked: false })
    return items
  },

  async getWeatherSuggestions(destId: string) {
    try {
      // UI uses 'city name' or 'destId'. Assuming destId is city string here.
      const response = await apiClient.get<any>(`/weather?city=${destId}`)
      if (response && response.monthlyClimate) {
        return {
          bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'], // Fallback 
          warning: response.weatherDesc,
          monthlyData: response.monthlyClimate.map((c: any) => ({
            month: c.month,
            temp: c.avgTemp,
            icon: '⛅'
          }))
        }
      }
    } catch (e) {
      console.warn('Weather API failed')
    }
    
    return {
      bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      warning: 'Summers (May-Jun) can be extremely hot. Carry hydration salts.',
      monthlyData: [
        { month: 'Jan', temp: 14, icon: '⛅' },
        { month: 'Apr', temp: 32, icon: '☀️' },
        { month: 'Jul', temp: 34, icon: '🌧️' },
        { month: 'Oct', temp: 24, icon: '⛅' },
      ]
    }
  },

  async processChatQuery(query: string) {
    try {
      const response = await apiClient.post<any>('/chatbot/query', { message: query })
      
      return {
        intent: response.intent,
        response: response.reply,
        cardType: response.payload ? 'place_card' : null,
        cardData: response.payload ? (Array.isArray(response.payload) ? response.payload[0] : response.payload) : null
      }
    } catch (e) {
      console.error('Chatbot error, falling back to mock:', e);
      const lowerQuery = query.toLowerCase();
      let reply = "I can help you with that! ExpeditionX AI is here to make your travel planning seamless. What specific details would you like to know?";
      
      if (lowerQuery.includes('delhi')) {
        reply = "A 3-day itinerary for Delhi is a great idea! Day 1: Explore Old Delhi (Red Fort, Jama Masjid, Chandni Chowk). Day 2: Discover New Delhi (India Gate, Qutub Minar, Humayun's Tomb). Day 3: Shop at Connaught Place and Dilli Haat. Would you like me to recommend some hotels for this trip?";
      } else if (lowerQuery.includes('mumbai') || lowerQuery.includes('street food')) {
        reply = "Mumbai is famous for its incredible street food! You must try Vada Pav at Ashok Vada Pav (Dadar), Pav Bhaji at Sardar Pav Bhaji (Tardeo), and the street stalls at Juhu Beach. Want me to add these to your wishlist?";
      } else if (lowerQuery.includes('manali') || lowerQuery.includes('weather')) {
        reply = "In December, Manali transforms into a winter wonderland! Temperatures range from -5°C to 5°C. Expect snowfall, especially in Solang Valley and Rohtang Pass. It's perfect for winter sports. Should I generate a winter packing checklist for you?";
      } else if (lowerQuery.includes('goa') || lowerQuery.includes('budget')) {
        reply = "A budget trip to Goa under ₹10,000 is totally doable! Stay in lively hostels in North Goa (like Anjuna or Vagator), rent a scooter for cheap local transport, and eat at local shacks. I can find some budget-friendly stays for you right now if you'd like!";
      }

      return { intent: 'mock', response: reply }
    }
  },
  
  async generateSurpriseTrip() {
    try {
      const recommendations = await this.getRecommendations('1')
      if (recommendations && recommendations.length > 0) {
        return recommendations[Math.floor(Math.random() * recommendations.length)]
      }
    } catch (e) {}
    
    return null
  }
}

import { simulateNetworkDelay } from './mockDelay'

export const authService = {
  async login(credentials: { email: string; password: string }) {
    // Simulate realistic network latency (800ms - 1500ms) for that premium feel
    await simulateNetworkDelay(800, 1500)

    // Simulate backend validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Please enter both email and password.')
    }
    // Strict password validation for lifetime fix
    const savedPassword = localStorage.getItem(`expedition_pass_${credentials.email}`)
    
    if (savedPassword) {
      if (credentials.password !== savedPassword) {
        throw new Error('Invalid email or password.')
      }
    } else {
      // Legacy fallback for accounts created before strict validation
      if (credentials.password.length < 6) {
        throw new Error('Invalid credentials. Please try again.')
      }
    }

    const savedAvatar = localStorage.getItem(`expedition_avatar_${credentials.email}`)
    const savedName = localStorage.getItem(`expedition_name_${credentials.email}`)

    return {
      userId: 1,
      name: savedName || credentials.email.split('@')[0],
      email: credentials.email,
      role: 'user',
      accessToken: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      onboardingCompleted: true,
      avatarUrl: savedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
    }
  },

  async signup(data: { name: string; email: string; password: string }) {
    await simulateNetworkDelay(800, 1500)
    
    if (!data.email || !data.password || !data.name) {
      throw new Error('Please fill in all required fields.')
    }

    const savedAvatar = localStorage.getItem(`expedition_avatar_${data.email}`)
    localStorage.setItem(`expedition_name_${data.email}`, data.name)
    localStorage.setItem(`expedition_pass_${data.email}`, data.password)

    return {
      userId: Math.floor(Math.random() * 1000) + 1,
      name: data.name,
      email: data.email,
      role: 'user',
      accessToken: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      onboardingCompleted: false,
      avatarUrl: savedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
    }
  },

  async logout() {
    await simulateNetworkDelay(400, 800)
    return { success: true }
  }
}


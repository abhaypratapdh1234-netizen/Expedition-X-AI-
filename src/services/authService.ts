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
  },

  async googleAuth(customData?: { email?: string; name?: string; avatarUrl?: string }) {
    await simulateNetworkDelay(500, 900)
    
    const email = customData?.email?.trim() || 'abhaypratap@gmail.com'
    const name = customData?.name?.trim() || (email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    const avatar = customData?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4`

    // Lifetime persistence in localStorage
    localStorage.setItem(`expedition_name_${email}`, name)
    localStorage.setItem(`expedition_avatar_${email}`, avatar)
    localStorage.setItem(`expedition_provider_${email}`, 'google')

    return {
      userId: Math.floor(Math.random() * 9000) + 1000,
      name,
      email,
      role: 'user' as const,
      accessToken: `google_oauth_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      refreshToken: `google_oauth_refresh_${Date.now()}`,
      onboardingCompleted: true,
      avatarUrl: avatar,
      provider: 'google'
    }
  }
}


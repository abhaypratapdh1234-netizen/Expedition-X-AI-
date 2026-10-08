const BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/v1' 
    : '/api/v1')

class ApiError extends Error {
  status: number
  data: any
  constructor(message: string, status: number, data: any) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

// In-memory quick cache for GET requests (TTL: 60 seconds)
const apiGetCache = new Map<string, { timestamp: number; data: any }>()
const CACHE_TTL_MS = 60 * 1000

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const url = `${BASE_URL}${endpoint}`

  // Return cached GET response if fresh (under 60s)
  if (method === 'GET' && !options.body) {
    const cached = apiGetCache.get(url)
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data as T
    }
  }
  
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let token = null
  try {
    const authData = localStorage.getItem('expeditionx-auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      token = parsed.state?.token
    }
  } catch (e) {}

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Fast timeout: 2500ms max so backend latency never locks up the UI
  let signal = options.signal
  if (!signal && typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    try {
      signal = AbortSignal.timeout(2500)
    } catch (_) {}
  }

  const config: RequestInit = {
    ...options,
    headers,
    signal,
  }

  try {
    const response = await fetch(url, config)
    
    // Check if the response is empty (e.g. 204 No Content)
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    
    if (!response.ok) {
      throw new ApiError(data.message || 'API Error', response.status, data)
    }

    if (method === 'GET') {
      apiGetCache.set(url, { timestamp: Date.now(), data })
    }
    
    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new Error(error instanceof Error ? error.message : 'Network error')
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  clearCache: () => apiGetCache.clear(),
}

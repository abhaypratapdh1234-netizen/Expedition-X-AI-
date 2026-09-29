const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
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

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)
    
    // Check if the response is empty (e.g. 204 No Content)
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    
    if (!response.ok) {
      throw new ApiError(data.message || 'API Error', response.status, data)
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
}

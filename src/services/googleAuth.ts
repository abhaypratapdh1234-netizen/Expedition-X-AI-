/**
 * Official Google Identity Services (GSI) Helper
 * Supports real Google OAuth 2.0 / One Tap / Credential decoding
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon'
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
              width?: number | string
              locale?: string
            }
          ) => void
          prompt: (notification?: (notification: any) => void) => void
          cancel: () => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: any }) => void
            prompt?: string
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void
          }
        }
      }
    }
  }
}

export interface GoogleUserProfile {
  email: string
  name: string
  avatarUrl: string
  googleId: string
  verified: boolean
}

/**
 * Safely decodes Google's signed ID Token (JWT) on the client side
 */
export function decodeGoogleJwt(token: string): GoogleUserProfile | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)

    return {
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      avatarUrl: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.email)}`,
      googleId: payload.sub,
      verified: Boolean(payload.email_verified)
    }
  } catch (err) {
    console.error('Failed to decode Google JWT token:', err)
    return null
  }
}

/**
 * Retrieves the Google Client ID from environment variables or localStorage override
 */
export function getGoogleClientId(): string {
  const envKey = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (envKey && envKey.trim().length > 10 && !envKey.includes('your_google_client_id')) {
    return envKey.trim()
  }
  const localOverride = localStorage.getItem('expeditionx_google_client_id')
  if (localOverride && localOverride.trim().length > 10) {
    return localOverride.trim()
  }
  return ''
}

/**
 * Saves a Google Client ID override into localStorage so it can be tested instantly
 */
export function setGoogleClientIdOverride(clientId: string) {
  if (clientId.trim()) {
    localStorage.setItem('expeditionx_google_client_id', clientId.trim())
  } else {
    localStorage.removeItem('expeditionx_google_client_id')
  }
}

/**
 * Waits for the Google GSI script to load on window.google
 */
export async function waitForGoogleScript(timeoutMs = 3000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (window.google?.accounts?.id || window.google?.accounts?.oauth2) {
      return true
    }
    await new Promise(r => setTimeout(r, 100))
  }
  return Boolean(window.google?.accounts?.id || window.google?.accounts?.oauth2)
}

/**
 * Checks if a Google Client ID is configured and valid
 */
export function isGoogleClientIdConfigured(): boolean {
  const id = getGoogleClientId()
  return Boolean(
    id &&
    id.trim().length > 10 &&
    !id.includes('your_google_client_id') &&
    !id.includes('PASTE_YOUR_GOOGLE_CLIENT_ID_HERE')
  )
}

/**
 * Starts official Google OAuth 2.0 Popup Flow using Google Identity Services (GSI)
 */
export async function triggerGoogleOAuth(
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => Promise<void> | void,
  onError: (errorMsg: string) => void
): Promise<void> {
  const isReady = await waitForGoogleScript()
  if (!isReady || !window.google?.accounts?.oauth2) {
    onError('Google Identity Services script is still loading. Please check your internet connection or try again.')
    return
  }

  return new Promise((resolve) => {
    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            const err = String(tokenResponse.error)
            const errDesc = (tokenResponse as any).error_description || ''
            if (err.includes('popup_closed') || err === 'popup_closed_by_user') {
              onError('Google sign-in window was closed.')
            } else if (err.includes('access_denied')) {
              onError('Access was cancelled. Please grant permissions to sign in.')
            } else if (err.includes('redirect_uri_mismatch')) {
              onError('Google OAuth redirect_uri_mismatch: http://localhost:5173 must be added as Authorized redirect URI in Google Cloud Console.')
            } else {
              onError(`Google Sign-In error: ${errDesc || err}`)
            }
            resolve()
            return
          }
          if (tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              })
              if (!res.ok) {
                throw new Error('Failed to retrieve user profile from Google.')
              }
              const data = await res.json()
              const profile: GoogleUserProfile = {
                email: data.email,
                name: data.name || data.given_name || data.email?.split('@')[0],
                avatarUrl: data.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.email)}`,
                googleId: data.sub,
                verified: Boolean(data.email_verified)
              }
              await onSuccess(profile)
            } catch (err: any) {
              onError(err?.message || 'Failed to retrieve profile from Google.')
            }
          }
          resolve()
        }
      })
      tokenClient.requestAccessToken({ prompt: 'select_account' })
    } catch (err: any) {
      onError(err?.message || 'Could not launch Google authentication window.')
      resolve()
    }
  })
}

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Compass } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useAuthStore } from '../../stores/authStore'
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal'
import { getGoogleClientId, isGoogleClientIdConfigured, triggerGoogleOAuth, decodeGoogleJwt, waitForGoogleScript } from '../../services/googleAuth'

const getFeatureName = (path: string): string | null => {
  if (path.includes('/explore')) return 'Destination Guides'
  if (path.includes('/planner')) return 'Trip Planner'
  if (path.includes('/book/hotels') || path.includes('/hotels')) return 'Hotel Booking'
  if (path.includes('/assistant')) return 'AI Assistant'
  if (path.includes('/toolkit')) return 'Travel Toolkit'
  if (path.includes('/rewards')) return 'Rewards Program'
  if (path.includes('/flights')) return 'Flight Search'
  if (path.includes('/trips')) return 'My Trips'
  if (path.includes('/bookings')) return 'My Bookings'
  if (path.includes('/wishlist')) return 'Wishlist'
  return null
}

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken, isAuthenticated, user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/app/dashboard'
  const featureName = getFeatureName(returnTo)

  useEffect(() => {
    if (isAuthenticated && user && user.id !== 'guest_explorer') {
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate, returnTo])

  useEffect(() => {
    const activeClientId = getGoogleClientId()
    if (!isGoogleClientIdConfigured()) return

    let isMounted = true
    waitForGoogleScript().then((ready) => {
      if (!isMounted || !ready || !window.google?.accounts?.id) return
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: async (res: { credential: string }) => {
            if (res.credential) {
              const profile = decodeGoogleJwt(res.credential)
              if (profile) {
                await handleGoogleSuccess({
                  name: profile.name,
                  email: profile.email,
                  avatarUrl: profile.avatarUrl
                })
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        })
        window.google.accounts.id.prompt()
      } catch (err) {
        console.warn('Google One Tap init notice:', err)
      }
    })

    return () => {
      isMounted = false
      try {
        window.google?.accounts?.id?.cancel()
      } catch {
        // Safe ignore
      }
    }
  }, [])

  const handleGoogleSuccess = async (account: { name: string; email: string; avatarUrl: string }) => {
    try {
      setGoogleLoading(true)
      const { authService } = await import('../../services/authService')
      const response = await authService.googleAuth({
        name: account.name,
        email: account.email,
        avatarUrl: account.avatarUrl
      })

      localStorage.setItem('expeditionx_token', response.accessToken)
      setToken(response.accessToken)
      
      setUser({
        id: response.userId.toString(),
        name: response.name,
        email: response.email,
        role: response.role,
        explorerLevel: 3, 
        xp: 1250,
        avatar: response.avatarUrl
      })

      setIsGoogleModalOpen(false)
      navigate(returnTo)
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleClick = async () => {
    setError('')
    const activeClientId = getGoogleClientId()

    if (!isGoogleClientIdConfigured()) {
      setIsGoogleModalOpen(true)
      return
    }

    setGoogleLoading(true)
    try {
      await triggerGoogleOAuth(
        activeClientId,
        async (profile) => {
          await handleGoogleSuccess({
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl
          })
        },
        (errorMsg) => {
          setError(errorMsg)
          setGoogleLoading(false)
        }
      )
    } catch (err: any) {
      console.warn('OAuth direct launch exception, falling back to modal:', err)
      setGoogleLoading(false)
      setIsGoogleModalOpen(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { authService } = await import('../../services/authService')
      const response = await authService.login({ email, password })

      localStorage.setItem('expeditionx_token', response.accessToken)
      setToken(response.accessToken)
      
      setUser({
        id: response.userId.toString(),
        name: response.name,
        email: response.email,
        role: response.role as 'user' | 'admin',
        explorerLevel: 3, 
        xp: 1250,
        ...(response.avatarUrl ? { avatar: response.avatarUrl } : {})
      })
      navigate(returnTo)
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      
      {/* ── BREATHTAKING BACKGROUND ── */}
      {/* Absolute Image Background with gentle Ken Burns and overlay */}
      <motion.img 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
        alt="Travel Landscape"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.15] mix-blend-multiply z-0 pointer-events-none"
      />
      
      {/* Beautiful Floating Gradient Blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 z-0 pointer-events-none" style={{ background: '#FC6C26' }} />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 z-0 pointer-events-none" style={{ background: '#EFEAFB' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full mix-blend-overlay filter blur-[120px] opacity-40 z-0 pointer-events-none bg-[var(--bg-card)]" />

      {/* ── CENTERED LOGIN CARD ── */}
      <div className="w-full max-w-[480px] p-4 relative z-10">
        <div className="relative group w-full rounded-[40px]">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-[var(--bg-card)]/70 backdrop-blur-ultra rounded-[40px] shadow-ultra border border-white/80 p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Subtle top inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] shadow-lg shadow-[#FC6C26]/30 group-hover:scale-105 transition-transform">
                <Compass size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-[var(--text-primary)] font-display drop-shadow-sm">ExpeditionX</span>
            </Link>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="text-center">
            
            <motion.div variants={itemVariant} className="mb-10">
              {featureName && (
                <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FC6C26]/10 border border-[#FC6C26]/20 text-[#FC6C26] text-xs font-bold shadow-sm">
                  <span>Sign in required to access <strong>{featureName}</strong></span>
                </div>
              )}
              <h2 className="text-4xl font-display font-black tracking-tighter text-[var(--text-primary)] mb-3 drop-shadow-sm">Welcome back</h2>
              <p className="text-[var(--text-secondary)] text-base font-medium tracking-normal">
                New to ExpeditionX?{' '}
                <Link to={`/signup${returnTo !== '/app/dashboard' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} 
                  className="text-[#FC6C26] hover:text-[#E5591A] transition-colors font-bold relative group">
                  Create an account
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-[#FC6C26] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"/>
                </Link>
              </p>
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={itemVariant} className="mb-8">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card)] border border-[#E5E7EB] hover:border-[#FC6C26]/40 transition-all duration-300 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer disabled:opacity-70"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#FC6C26] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm font-extrabold text-[var(--text-primary)]">
                  {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                </span>
              </button>
            </motion.div>

            <motion.div variants={itemVariant} className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#E5E7EB]" />
              <span className="text-[13px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-extrabold">Or continue with</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#E5E7EB]" />
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-5 text-left">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-red-100 text-red-600 text-sm flex items-start gap-3">
                      <span className="mt-0.5 font-bold">!</span>
                      <p className="font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariant}>
                <label className="text-[13px] font-extrabold text-[var(--text-primary)] mb-2 block ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anantambani@gmail.com"
                    required
                    className="w-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[#E5E7EB] rounded-[20px] px-5 py-4 text-base outline-none text-[var(--text-primary)] placeholder-[#9CA3AF] transition-all focus:bg-[var(--bg-card)] focus:border-[#FC6C26] focus:ring-4 focus:ring-[#FC6C26]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-medium"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariant}>
                <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                  <label className="text-[13px] font-extrabold text-[var(--text-primary)] block">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#FC6C26] hover:text-[#E5591A] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[#E5E7EB] rounded-[20px] px-5 py-4 text-base outline-none text-[var(--text-primary)] placeholder-[#9CA3AF] transition-all focus:bg-[var(--bg-card)] focus:border-[#FC6C26] focus:ring-4 focus:ring-[#FC6C26]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] pr-12 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#1B2A4A] transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariant} className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-[20px] bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] hover:from-[#E5591A] hover:to-[#E5591A] text-white font-bold text-base flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 shadow-[0_15px_30px_rgba(252, 108, 38,0.3)]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to ExpeditionX</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.p variants={itemVariant} className="text-xs text-center mt-8 text-[var(--text-muted)] font-medium">
              By signing in, you agree to our{' '}
              <a href="#" className="text-[var(--text-primary)] font-extrabold hover:underline">Terms</a> and{' '}
              <a href="#" className="text-[var(--text-primary)] font-extrabold hover:underline">Privacy Policy</a>
            </motion.p>
          </motion.div>
        </motion.div>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        mode="login"
      />
    </div>
  )
}

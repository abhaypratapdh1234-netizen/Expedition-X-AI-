import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react'
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

const INTERESTS = ['Adventure', 'Culture', 'Food', 'Nightlife', 'Nature', 'Offbeat', 'Heritage', 'Beach', 'Spiritual', 'Wildlife']
type Step = 1 | 2 | 3

export function SignupPage() {
  const navigate = useNavigate()
  const { setUser, setToken, isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/app/onboarding'
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
        explorerLevel: 1,
        xp: 150,
        preferences: { interests: ['Adventure', 'Nature', 'Culture'], budgetRange: [5000, 20000], travelStyle: 'Solo' },
        avatar: response.avatarUrl
      })

      setIsGoogleModalOpen(false)
      navigate(returnTo)
    } catch (err: any) {
      setError(err?.message || 'Google sign up failed. Please try again.')
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

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    otp: '',
    interests: [] as string[],
  })

  const handleInterest = (interest: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }))
  }

  const handleNext = async () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError('Please fill in all fields')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        setError('Please enter a valid email')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setLoading(true)
      try {
        const { authService } = await import('../../services/authService')
        const response = await authService.signup({
          name: form.name,
          email: form.email,
          password: form.password
        })

        localStorage.setItem('expeditionx_token', response.accessToken)
        setToken(response.accessToken)
        setUser({
          id: response.userId.toString(),
          name: response.name,
          email: response.email,
          role: response.role as 'user' | 'admin',
          explorerLevel: 1,
          xp: 0,
          preferences: { interests: form.interests, budgetRange: [5000, 20000], travelStyle: 'Solo' },
          ...(response.avatarUrl ? { avatar: response.avatarUrl } : {})
        })
        navigate(returnTo)
      } catch (err: any) {
        console.error('Signup error:', err)
        setError(err.message || 'Failed to sign up')
        if (err.message?.toLowerCase().includes('email') || err.message?.toLowerCase().includes('validation')) {
          setStep(1)
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const STEPS = ['Account', 'Verify', 'Interests']

  const stepVariants = {
    initial: { opacity: 0, x: 30, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, type: 'spring' as const, damping: 25 } },
    exit: { opacity: 0, x: -30, filter: 'blur(4px)', transition: { duration: 0.3 } }
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
        className="absolute inset-0 w-full h-full object-cover opacity-[0.15] mix-blend-multiply z-0 pointer-events-none scale-x-[-1]"
      />
      
      {/* Beautiful Floating Gradient Blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 z-0 pointer-events-none" style={{ background: '#FC6C26' }} />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 z-0 pointer-events-none" style={{ background: '#EFEAFB' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full mix-blend-overlay filter blur-[120px] opacity-40 z-0 pointer-events-none bg-[var(--bg-card)]" />

      {/* ── CENTERED SIGNUP CARD ── */}
      <div className="w-full max-w-[500px] p-4 relative z-10">
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
            
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-10">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col gap-2 relative">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: i + 1 <= step ? '#FC6C26' : '#FFFFFF',
                        borderColor: i + 1 <= step ? '#FC6C26' : '#E5E7EB',
                        color: i + 1 <= step ? '#fff' : '#6b7280'
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-500 z-10 shadow-sm"
                    >
                      {i + 1 < step ? <Check size={14} /> : i + 1}
                    </motion.div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-[#E5E7EB] rounded-full overflow-hidden relative">
                      <motion.div 
                        className="absolute inset-0 bg-[#FC6C26] origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i + 1 < step ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                    {featureName && (
                      <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FC6C26]/10 border border-[#FC6C26]/20 text-[#FC6C26] text-xs font-bold shadow-sm">
                        <span>Sign up required to access <strong>{featureName}</strong></span>
                      </div>
                    )}
                    <h2 className="text-4xl font-display font-black tracking-tighter text-[var(--text-primary)] mb-3 drop-shadow-sm">Create your account</h2>
                    <p className="text-[var(--text-secondary)] text-base font-medium mb-6 tracking-normal">
                      Already have one?{' '}
                      <Link to={`/login${returnTo !== '/app/onboarding' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} 
                        className="text-[#FC6C26] hover:text-[#E5591A] transition-colors font-bold relative group">
                        Log in
                        <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-[#FC6C26] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"/>
                      </Link>
                    </p>

                    {/* Google Auth Button */}
                    <div className="mb-6">
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
                          {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#E5E7EB]" />
                      <span className="text-[12px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-extrabold">Or continue with email</span>
                      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#E5E7EB]" />
                    </div>

                    <div className="space-y-4 text-left">
                      {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Anant Ambani' },
                        { label: 'Email Address', key: 'email', type: 'email', placeholder: 'anantambani@gmail.com' },
                        { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-[13px] font-extrabold text-[var(--text-primary)] mb-2 block ml-1">{f.label}</label>
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={(form as any)[f.key]}
                            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="w-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[#E5E7EB] rounded-[20px] px-5 py-4 text-base outline-none text-[var(--text-primary)] placeholder-[#9CA3AF] transition-all focus:bg-[var(--bg-card)] focus:border-[#FC6C26] focus:ring-4 focus:ring-[#FC6C26]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center pt-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FFF1E6] to-white border border-white rounded-[28px] shadow-[0_15px_30px_rgba(252, 108, 38,0.1)] flex items-center justify-center mb-8">
                      <span className="text-5xl">📧</span>
                    </div>
                    <h2 className="text-4xl font-display font-black tracking-tighter text-[var(--text-primary)] mb-4 drop-shadow-sm">Verify your email</h2>
                    <p className="text-[var(--text-secondary)] text-base mb-10 leading-relaxed font-medium tracking-normal">
                      We sent a 6-digit code to <br/><strong className="text-[#1B2A4A]">{form.email}</strong>
                    </p>

                    <div className="flex gap-2 sm:gap-3 justify-center mb-8">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          className="w-10 h-12 sm:w-14 sm:h-16 text-center text-2xl font-display font-bold rounded-2xl border border-[#E5E7EB] bg-[var(--bg-card)]/50 backdrop-blur-sm text-[#1B2A4A] outline-none focus:bg-[var(--bg-card)] focus:border-[#FC6C26] focus:ring-4 focus:ring-[#FC6C26]/10 shadow-sm transition-all"
                        />
                      ))}
                    </div>
                    <p className="text-[13px] text-[var(--text-muted)] mb-3 font-medium">Didn't get it? <button className="text-[#FC6C26] font-bold hover:text-[#E5591A]">Resend</button></p>
                    <p className="text-[13px] text-[#FC6C26]/80 font-medium">(Demo: skip OTP and click Next)</p>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                    <h2 className="text-4xl font-display font-black tracking-tighter text-[var(--text-primary)] mb-3 drop-shadow-sm">What do you love?</h2>
                    <p className="text-[var(--text-secondary)] text-base mb-8 font-medium tracking-normal">Pick your travel interests so we can personalize your feed.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {INTERESTS.map(interest => {
                        const isSelected = form.interests.includes(interest);
                        return (
                          <motion.button
                            key={interest}
                            onClick={() => handleInterest(interest)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-5 py-3 rounded-[16px] text-sm font-extrabold transition-all duration-300 ${
                              isSelected 
                                ? 'bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white shadow-[0_10px_25px_rgba(252, 108, 38,0.3)] border-transparent' 
                                : 'bg-[var(--bg-card)]/50 text-[var(--text-muted)] border border-[#E5E7EB] hover:bg-[var(--bg-card)] hover:border-[#FC6C26] hover:text-[#FC6C26] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                            }`}
                            style={{ borderWidth: isSelected ? 0 : 1 }}
                          >
                            {interest}
                          </motion.button>
                        )
                      })}
                    </div>
                    <p className="text-[13px] mt-8 text-[var(--text-muted)] uppercase tracking-widest font-bold">{form.interests.length} selected · You can change these later</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-red-100 text-red-600 text-sm text-center font-bold">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[var(--border-subtle)]/50">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => (s - 1) as Step)}
                  className="px-6 py-4 rounded-[20px] text-[15px] font-extrabold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={loading}
                className="relative flex-1 h-14 rounded-[20px] bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white font-bold text-base overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 shadow-[0_15px_30px_rgba(252, 108, 38,0.3)]"
              >
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing...</span></>
                  ) : step === 3 ? (
                    <><Check size={18} /><span>Complete Setup</span></>
                  ) : (
                    <><span>Next Step</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>
            </div>

          </motion.div>
        </motion.div>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        mode="signup"
      />
    </div>
  )
}

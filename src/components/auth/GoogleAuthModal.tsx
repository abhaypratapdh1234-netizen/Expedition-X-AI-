import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, KeyRound, ExternalLink, Sparkles, Check, ArrowRight } from 'lucide-react'
import {
  getGoogleClientId,
  setGoogleClientIdOverride,
  waitForGoogleScript,
  decodeGoogleJwt,
  type GoogleUserProfile
} from '../../services/googleAuth'

interface GoogleAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (account: { name: string; email: string; avatarUrl: string }) => Promise<void> | void
  mode?: 'login' | 'signup'
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'login'
}) => {
  const [clientId, setClientId] = useState(getGoogleClientId())
  const [inputKey, setInputKey] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const [copiedOrigin, setCopiedOrigin] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://expedition-x-ai.vercel.app'

  const handleCopyOrigin = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentOrigin)
      setCopiedOrigin(true)
      setTimeout(() => setCopiedOrigin(false), 2000)
    }
  }

  const isConfigured = Boolean(
    clientId &&
    clientId.trim().length > 10 &&
    !clientId.includes('your_google_client_id') &&
    !clientId.includes('PASTE_YOUR_GOOGLE_CLIENT_ID_HERE')
  )

  // Check script and initialize if client ID is configured
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    waitForGoogleScript().then((ready) => {
      if (!isMounted) return
      setIsScriptReady(ready)

      const activeClientId = getGoogleClientId()
      setClientId(activeClientId)

      const validId = activeClientId &&
        activeClientId.trim().length > 10 &&
        !activeClientId.includes('your_google_client_id') &&
        !activeClientId.includes('PASTE_YOUR_GOOGLE_CLIENT_ID_HERE')

      if (ready && validId && window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (res: { credential: string }) => {
              if (res.credential) {
                const profile = decodeGoogleJwt(res.credential)
                if (profile) {
                  setIsSubmitting(true)
                  await onSuccess({
                    name: profile.name,
                    email: profile.email,
                    avatarUrl: profile.avatarUrl
                  })
                }
              }
            }
          })

          googleBtnRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            text: mode === 'signup' ? 'signup_with' : 'continue_with',
            shape: 'pill',
            width: 320
          })

          // Also trigger Google One Tap
          window.google.accounts.id.prompt()
        } catch (err: any) {
          console.warn('Google GSI init notice:', err)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [isOpen, clientId, mode])

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) {
      setError('Please paste a valid Google OAuth Client ID.')
      return
    }
    if (!inputKey.includes('.apps.googleusercontent.com')) {
      setError('Google Client IDs usually end with ".apps.googleusercontent.com"')
      return
    }

    setGoogleClientIdOverride(inputKey.trim())
    setClientId(inputKey.trim())
    setError('')
  }

  const handleDemoSignIn = async (demoName: string, demoEmail: string) => {
    setIsSubmitting(true)
    setError('')
    try {
      await onSuccess({
        name: demoName,
        email: demoEmail,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoEmail)}&backgroundColor=b6e3f4`
      })
    } catch (err: any) {
      setError(err?.message || 'Sign in failed')
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-[460px] bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 font-sans"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Top Bar with Google Branding */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <span className="text-sm font-semibold text-slate-600 tracking-tight">Google Identity Services</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Header */}
            <div className="px-6 py-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct authentication via official <span className="font-semibold text-slate-800">Google OAuth 2.0</span>
              </p>
            </div>

            {error && (
              <div className="mx-6 my-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* CASE 1: Google Client ID is configured -> Show official Google Button */}
            {isConfigured ? (
              <div className="p-6 text-center space-y-4">
                <div className="flex justify-center" ref={googleBtnRef}>
                  {/* Google official iframe rendered here */}
                  <div className="py-4 text-xs text-slate-400">Loading Google OAuth button...</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Using Client ID: {clientId.slice(0, 16)}...</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleClientIdOverride('')
                      setClientId('')
                    }}
                    className="text-[#4285F4] hover:underline font-medium"
                  >
                    Change Key
                  </button>
                </div>
              </div>
            ) : (
              /* CASE 2: No Google Client ID -> Clear instructions + Instant Setup */
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <KeyRound size={16} className="text-amber-600" />
                    <span>Real Google OAuth requires a Google Client ID</span>
                  </div>
                  <p className="text-amber-800">
                    Google requires developers to register an application in the <strong>Google Cloud Console</strong> to verify your domain (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">{currentOrigin}</code>). It is <strong>100% Free</strong>.
                  </p>
                </div>

                {/* Step-by-step instructions */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    How to get your free Google Client ID:
                  </span>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <li>
                      Visit{' '}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4285F4] font-semibold underline inline-flex items-center gap-1"
                      >
                        Google Cloud Console <ExternalLink size={12} />
                      </a>
                    </li>
                    <li>
                      Click <strong>Create Credentials &gt; OAuth client ID</strong> &gt; Select <strong>Web application</strong>.
                    </li>
                    <li>
                      Under <strong>Authorized JavaScript origins</strong>, add your origin: <br />
                      <span className="inline-flex items-center gap-2 mt-1">
                        <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                          {currentOrigin}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyOrigin}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#4285F4] text-white font-bold hover:bg-[#3367D6] transition-colors shrink-0"
                        >
                          {copiedOrigin ? '✓ Copied' : 'Copy'}
                        </button>
                      </span>
                    </li>
                    <li>Copy your <strong>Client ID</strong> and paste it below or in <code className="bg-white px-1 py-0.5 rounded border font-mono">.env</code>.</li>
                  </ol>
                </div>

                {/* Instant Paste Form */}
                <form onSubmit={handleSaveClientId} className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Paste Client ID here (instant activation):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </form>

                {/* Or Instant Test as Abhay Pratap */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Or test immediately:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('Abhay Pratap', 'abhaypratap@gmail.com')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left cursor-pointer group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        AP
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Sign in as Abhay Pratap</span>
                        <span className="text-[11px] text-slate-500">abhaypratap@gmail.com</span>
                      </div>
                    </div>
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>
                Protected by Google Identity Services Protocol • OAuth 2.0 & OpenID Connect.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

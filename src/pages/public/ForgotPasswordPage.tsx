import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Check, Mail, Lock, Key } from 'lucide-react'
import axios from 'axios'
import { useThemeStore } from '../../stores/themeStore'

const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000'

export function ForgotPasswordPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!email.includes('@')) {
        alert("Please enter a valid email address.")
        setLoading(false)
        return
      }
      
      const response = await axios.post(`${FLASK_API_URL}/api/auth/forgot-password`, { email })
      if (response.data.success) {
        setStep('otp')
      } else {
        alert(response.data.error || "Failed to send OTP email.")
      }
    } catch (err) {
      console.error(err)
      alert("Network error. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/login" className="flex items-center gap-1 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Key size={32} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className={`text-3xl font-extrabold mb-3 text-center tracking-tight ${isDark ? 'text-[var(--text-primary)]' : 'text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Forgot Password?
                </h2>
                <p className={`text-sm mb-8 text-center font-medium leading-relaxed px-2 ${isDark ? 'text-[var(--text-secondary)]' : 'text-slate-500'}`}>
                  No worries, we'll send you reset instructions.
                </p>
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[var(--text-muted)]' : 'text-slate-700'}`}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all duration-300 bg-[var(--bg-card)] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 shadow-sm font-medium ${isDark ? 'text-[var(--text-primary)] border-[var(--border-subtle)]' : 'text-slate-900 border-slate-200'}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}>
                    {loading ? <><div className="spinner w-4 h-4" /> Sending...</> : <><Send size={16} /> Send Reset Code</>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Mail size={32} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className={`text-3xl font-extrabold mb-3 text-center tracking-tight ${isDark ? 'text-[var(--text-primary)]' : 'text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Check your email
                </h2>
                <p className={`text-sm mb-8 text-center font-medium leading-relaxed px-4 ${isDark ? 'text-[var(--text-secondary)]' : 'text-slate-500'}`}>
                  We've sent a secure 6-digit code to<br />
                  <strong className={`tracking-wide ${isDark ? 'text-[var(--text-primary)]' : 'text-slate-800'}`}>{email}</strong>
                </p>
                
                <div className="flex gap-3 justify-center mb-10">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input key={i} type="text" maxLength={1} id={`otp-${i}`}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                          document.getElementById(`otp-${i-1}`)?.focus()
                        }
                      }}
                      className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none otp-input-box focus:border-orange-600 focus:ring-4 focus:ring-orange-500/30 shadow-inner transition-all duration-300 ${isDark ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]' : 'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-300'}`}
                    />
                  ))}
                </div>
                
                <button onClick={async () => {
                  try {
                    setLoading(true)
                    const otpBoxes = Array.from(document.querySelectorAll('.otp-input-box')) as HTMLInputElement[]
                    const otpCode = otpBoxes.map(b => b.value).join('')
                    
                    if (otpCode.length !== 6) {
                      alert("Please enter a full 6-digit OTP.")
                      return
                    }

                    const response = await axios.post(`${FLASK_API_URL}/api/auth/verify-otp`, { email, otp: otpCode })
                    if (response.data.success) {
                      setStep('reset')
                    } else {
                      alert(response.data.error || "Invalid OTP.")
                    }
                  } catch(e) {
                    alert("Network error! Try again.")
                  } finally {
                    setLoading(false)
                  }
                }}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}>
                  {loading ? 'Verifying Code...' : 'Verify OTP'}
                </button>
                
                <p className="text-center mt-6 text-xs text-slate-400 font-medium">
                  Didn't receive the email? <button onClick={() => setStep('email')} className="text-orange-600 font-bold hover:underline">Click to resend</button>
                </p>
              </motion.div>
            )}

            {step === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Lock size={32} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className={`text-3xl font-extrabold mb-3 text-center tracking-tight ${isDark ? 'text-[var(--text-primary)]' : 'text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  New Password
                </h2>
                <p className={`text-sm mb-8 text-center font-medium leading-relaxed px-2 ${isDark ? 'text-[var(--text-secondary)]' : 'text-slate-500'}`}>
                  Create a strong, new password for your account.
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                     setLoading(true)
                     const newPassword = (document.getElementById('new-password') as HTMLInputElement).value
                     
                     const response = await axios.post(`${FLASK_API_URL}/api/auth/reset-password`, { email, newPassword })
                     if (response.data.success) {
                       localStorage.setItem(`expedition_pass_${email}`, newPassword)
                       setStep('done')
                     } else {
                       alert(response.data.error || "Failed to reset password.")
                     }
                  } catch (err) {
                     alert("Failed to reset password.")
                  } finally {
                     setLoading(false)
                  }
                }} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[var(--text-muted)]' : 'text-slate-700'}`}>New Password</label>
                    <input id="new-password" type="password" placeholder="••••••••" required
                      className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all duration-300 bg-[var(--bg-card)] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 shadow-sm font-medium ${isDark ? 'text-[var(--text-primary)] border-[var(--border-subtle)]' : 'text-slate-900 border-slate-200'}`} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20"
                  style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}>
                  <Check size={44} className="text-white" strokeWidth={3} />
                </motion.div>
                <h2 className={`text-3xl font-extrabold mb-3 tracking-tight ${isDark ? 'text-[var(--text-primary)]' : 'text-slate-900'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Password Reset!
                </h2>
                <p className={`text-sm mb-10 font-medium leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-slate-500'}`}>
                  Your password has been securely updated.<br/>You can now log in with your new password.
                </p>
                <Link to="/login"
                  className="block w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}>
                  Back to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

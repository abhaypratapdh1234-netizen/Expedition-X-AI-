import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useWizardStore } from '../../stores/wizardStore'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { springSnappy, springSoft, easeReveal, durations } from '../../motion/tokens'
import type { ExplicitDNASliders } from '../../services/intelligenceService'

const TRAVEL_STYLES = [
  { id: 'solo', emoji: '🧳', label: 'Solo Explorer', desc: 'Freedom to roam at your own pace' },
  { id: 'couple', emoji: '💑', label: 'Romantic Duo', desc: 'Shared memories for two' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', desc: 'Fun for all ages' },
  { id: 'group', emoji: '👥', label: 'Squad', desc: 'Adventures with friends' },
]

const DNA_SLIDERS: Array<{ key: keyof ExplicitDNASliders; emoji: string; label: string; low: string; high: string }> = [
  { key: 'mountains',   emoji: '🏔️', label: 'Mountains',   low: 'Beach lover',    high: 'Peak bagger'     },
  { key: 'beach',       emoji: '🌊', label: 'Beach',        low: 'Landlocked',     high: 'Beach bum'       },
  { key: 'adventure',   emoji: '🧗', label: 'Adventure',    low: 'Easy-going',     high: 'Adrenaline'      },
  { key: 'luxury',      emoji: '✨', label: 'Luxury',        low: 'Budget-smart',   high: 'Premium always'  },
  { key: 'history',     emoji: '🏛️', label: 'History',      low: 'Present moment', high: 'History buff'    },
  { key: 'food',        emoji: '🍛', label: 'Food',          low: 'Fuel only',      high: 'Foodie at heart' },
  { key: 'photography', emoji: '📷', label: 'Photography',  low: 'Just memories',  high: 'Lens always out' },
  { key: 'shopping',    emoji: '🛍️', label: 'Shopping',     low: 'Pack light',     high: 'Shop everywhere' },
  { key: 'nightlife',   emoji: '🌙', label: 'Nightlife',    low: 'Early bedtime',  high: 'Night owl'       },
]

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { setOnboarded, setUser, user } = useAuthStore()
  const { setDnaSliders } = useWizardStore()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [budget, setBudget] = useState(15000)
  const [travelStyle, setTravelStyle] = useState('')
  const [sliders, setSliders] = useState<Record<keyof ExplicitDNASliders, number>>({
    mountains: 50, beach: 50, adventure: 50, luxury: 50,
    history: 50, food: 50, photography: 50, shopping: 50, nightlife: 50,
  })
  const prefersReduced = useReducedMotion()

  const steps = ['Your DNA', 'Budget', 'Travel Style', 'All Set!']

  const goNext = () => { setDirection(1); setStep(s => s + 1) }
  const goBack = () => { setDirection(-1); setStep(s => s - 1) }

  const handleSliderChange = (key: keyof ExplicitDNASliders, value: number) => {
    setSliders(prev => ({ ...prev, [key]: value }))
  }

  const handleFinish = () => {
    const dnaSliders = sliders as ExplicitDNASliders
    setDnaSliders(dnaSliders)
    if (user) {
      setUser({
        ...user,
        preferences: {
          interests: Object.entries(sliders).filter(([, v]) => v >= 65).map(([k]) => k),
          budgetRange: [5000, budget],
          travelStyle,
          dnaSliders,
        }
      })
    }
    setOnboarded()
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50" style={{ background: '#FC6C26' }} />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50" style={{ background: '#EFEAFB' }} />

      <div className="w-full max-w-3xl relative z-10 bg-[var(--bg-card)]/80 backdrop-blur-xl p-10 md:p-16 rounded-[40px] shadow-2xl border border-white/40">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  background: i < step ? '#FC6C26' : i === step ? '#1B2A4A' : '#f3f4f6',
                  color: i <= step ? 'white' : '#6b7280',
                  scale: i === step ? 1.15 : 1,
                  boxShadow: i === step ? '0 10px 20px rgba(27,42,74,0.2)' : 'none',
                }}
                transition={springSoft}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{ border: `2px solid ${i <= step ? (i === step ? '#1B2A4A' : '#FC6C26') : 'var(--bg-card)'}` }}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  animate={{ background: i < step ? '#FC6C26' : '#e5e7eb' }}
                  transition={{ duration: durations.base }}
                  className="w-10 h-[2px]"
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 0: Travel DNA Sliders ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * -60 }}
              transition={{ ease: easeReveal, duration: durations.base }}
            >
              <div className="text-center mb-8">
                <h1 className="font-display font-bold text-4xl mb-3 text-[#1B2A4A]">
                  Set Your Travel DNA
                </h1>
                <p className="text-[var(--text-secondary)] text-[17px] font-extrabold max-w-lg mx-auto">
                  These 9 sliders define your perfect trip. Drag each to match your real preferences — no right answers!
                </p>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                {DNA_SLIDERS.map(({ key, emoji, label, low, high }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px]">{emoji}</span>
                        <span className="text-[14px] font-extrabold text-[#1B2A4A]">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#9ca3af]">{low}</span>
                        <span
                          className="text-[15px] font-extrabold min-w-[36px] text-right rounded-lg px-2 py-0.5"
                          style={{ color: '#FC6C26', background: '#FFF5EE' }}
                        >
                          {sliders[key]}
                        </span>
                        <span className="text-[12px] font-bold text-[#9ca3af]">{high}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range" min="0" max="100" step="5"
                        value={sliders[key]}
                        onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          accentColor: '#FC6C26',
                          background: `linear-gradient(to right, #FC6C26 ${sliders[key]}%, #E5E7EB ${sliders[key]}%)`
                        }}
                        aria-label={`${label} preference slider`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center mt-4 text-[13px] font-bold text-[#9ca3af]">
                💡 These update automatically as you travel — your DNA evolves with every trip
              </p>
            </motion.div>
          )}

          {/* ── Step 1: Budget ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * -60 }}
              transition={{ ease: easeReveal, duration: durations.base }}
            >
              <div className="text-center mb-10">
                <h1 className="font-display font-bold text-5xl mb-4 text-[#1B2A4A]">
                  What's your typical budget?
                </h1>
                <p className="text-[var(--text-secondary)] text-[19px] font-extrabold max-w-lg mx-auto">
                  Per trip. We'll find premium options in your preferred range.
                </p>
              </div>

              <div className="p-10 rounded-[32px] text-center max-w-lg mx-auto bg-[var(--bg-card)] border border-[#F3F4F6] shadow-xl">
                <div className="text-6xl font-bold mb-2 font-display text-[#FC6C26]">
                  ₹{budget.toLocaleString()}
                </div>
                <p className="text-[15px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mb-10">per trip</p>
                <input
                  type="range" min="3000" max="200000" step="1000" value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#FC6C26' }}
                />
                <div className="flex justify-between text-[13px] mt-3 font-extrabold text-[var(--text-muted)]">
                  <span>₹3,000</span><span>₹2,00,000+</span>
                </div>
                <div className="flex gap-3 mt-8 flex-wrap justify-center">
                  {[5000, 15000, 30000, 60000, 100000].map(b => (
                    <button key={b} onClick={() => setBudget(b)}
                      className="px-5 py-2.5 rounded-[16px] text-sm font-bold border transition-all duration-300"
                      style={{
                        background: budget === b ? '#1B2A4A' : 'var(--bg-card)',
                        color: budget === b ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${budget === b ? '#1B2A4A' : 'var(--bg-card)'}`,
                        boxShadow: budget === b ? '0 8px 20px rgba(27,42,74,0.2)' : 'none',
                      }}>
                      ₹{b >= 1000 ? (b / 1000) + 'K' : b}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Travel Style ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: direction * -60 }}
              transition={{ ease: easeReveal, duration: durations.base }}
            >
              <div className="text-center mb-10">
                <h1 className="font-display font-bold text-5xl mb-4 text-[#1B2A4A]">
                  Who do you travel with?
                </h1>
                <p className="text-[var(--text-secondary)] text-[19px] font-extrabold max-w-lg mx-auto">
                  This helps us tailor recommendations and unlock group features.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
                {TRAVEL_STYLES.map(style => (
                  <motion.button
                    key={style.id}
                    onClick={() => setTravelStyle(style.id)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-8 rounded-[32px] text-left transition-all duration-300 bg-[var(--bg-card)]"
                    style={{
                      border: `2px solid ${travelStyle === style.id ? '#FC6C26' : 'transparent'}`,
                      boxShadow: travelStyle === style.id ? '0 15px 35px rgba(252, 108, 38,0.15)' : '0 10px 30px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="text-5xl mb-5 bg-[#FFF1E6] w-20 h-20 rounded-2xl flex items-center justify-center">
                      {style.emoji}
                    </div>
                    <p className="font-bold text-xl mb-1 text-[#1B2A4A]">{style.label}</p>
                    <p className="text-[15px] text-[var(--text-muted)] font-extrabold leading-relaxed">{style.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: All Set ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ease: easeReveal, duration: durations.base }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springSnappy, delay: 0.15 }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-[#FC6C26] to-[#FC6C26] rounded-[28px] flex items-center justify-center shadow-[0_15px_35px_rgba(252,108,38,0.3)] mb-8"
              >
                <Sparkles size={40} className="text-white" />
              </motion.div>

              <h1 className="font-display font-bold text-5xl mb-4 text-[#1B2A4A]">
                Your Travel DNA is set!
              </h1>
              <p className="text-[19px] text-[var(--text-secondary)] font-extrabold mb-10 max-w-md mx-auto">
                ExpeditionX AI is now personalized to your exact preferences. Every recommendation will match your unique travel style.
              </p>

              {/* DNA preview — top 3 traits */}
              <motion.div
                className="p-8 rounded-[32px] mb-10 text-left max-w-sm mx-auto bg-[var(--bg-card)] shadow-xl border border-[#F3F4F6]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, ease: easeReveal, duration: durations.base }}
              >
                <p className="text-[12px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mb-4">Your Top Traits</p>
                {Object.entries(sliders)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([key, value], i) => {
                    const def = DNA_SLIDERS.find(d => d.key === key)
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08, ease: easeReveal, duration: durations.fast }}
                        className="mb-3 last:mb-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-extrabold text-[#1B2A4A] flex items-center gap-1.5">
                            {def?.emoji} {def?.label}
                          </span>
                          <span className="text-[13px] font-bold text-[#FC6C26]">{value}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ delay: 0.45 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #FC6C26, #ff8c4a)' }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[15px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider text-[12px]">Budget</span>
                  <span className="text-[15px] font-bold text-[#1B2A4A]">₹{budget.toLocaleString()} per trip</span>
                </div>
              </motion.div>

              <motion.button
                onClick={handleFinish}
                whileHover={prefersReduced ? { opacity: 0.85 } : { scale: 1.05 }}
                whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, ease: easeReveal, duration: durations.base }}
                className="px-12 py-5 rounded-[24px] text-white font-bold text-lg flex items-center gap-3 mx-auto shadow-[0_15px_30px_rgba(252,108,38,0.3)] transition-all"
                style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)' }}
              >
                Start Exploring <ArrowRight size={22} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--border-subtle)]">
            <motion.button
              onClick={() => step > 0 ? goBack() : null}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
              whileHover={{ opacity: 0.85, x: -2 }}
              transition={{ duration: durations.micro }}
              className="px-8 py-3.5 rounded-[20px] text-[15px] font-bold border transition-all"
              style={{ border: '2px solid #e5e7eb', color: 'var(--text-muted)', opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
            >
              Back
            </motion.button>
            <motion.button
              onClick={goNext}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
              whileHover={prefersReduced ? { opacity: 0.85 } : { scale: 1.05 }}
              transition={{ duration: durations.micro }}
              className="px-10 py-3.5 rounded-[20px] text-white text-[15px] font-bold flex items-center gap-2 shadow-[0_10px_25px_rgba(27,42,74,0.25)] transition-all"
              style={{ background: '#1B2A4A' }}
            >
              {step === 2 ? 'Finish' : 'Next Step'} <ArrowRight size={18} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Users, Gift, Copy, Check, Share2 } from 'lucide-react'
import { springSnappy, springSoft, easeReveal, easeExit, durations, stagger } from '../../../motion/tokens'

// ─── Confetti Particle ─────────────────────────────────────────────────────────
// ~30 particles, 1.2s lifespan — ONLY place in the entire app where confetti is used
interface ConfettiProps { onDone: () => void }

const COLORS = ['#3ed9be', '#f2994a', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#60a5fa']

function Confetti({ onDone }: ConfettiProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    setTimeout(onDone, 100)
    return null
  }

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 600,
    y: -(Math.random() * 400 + 100),
    rotate: (Math.random() - 0.5) * 720,
    color: COLORS[i % COLORS.length],
    size: Math.random() * 6 + 5,
    shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'rect',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.4 }}
          transition={{ duration: 1.2, ease: easeExit, delay: Math.random() * 0.15 }}
          onAnimationComplete={p.id === 0 ? onDone : undefined}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.5 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? 3 : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

// ─── ReferralPage ──────────────────────────────────────────────────────────────

export function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const referralCode = 'PRIYA-2026-EXPED'

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(referralCode)
    setCopied(true)
    setShowConfetti(true) // 🎉 The ONE place confetti fires in the app
    setTimeout(() => setCopied(false), 2000)
  }, [referralCode])

  const REFERRED = [
    { name: 'Rahul K.', joined: 'Aug 10', status: 'Active', bonus: '+₹200' },
    { name: 'Meera S.', joined: 'Jul 28', status: 'Active', bonus: '+₹200' },
    { name: 'Amit T.', joined: 'Jul 15', status: 'Pending', bonus: '—' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-2xl mx-auto relative">
      {/* Confetti — only fires here (Feedback) */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti onDone={() => setShowConfetti(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: easeReveal, duration: durations.base }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Refer & Earn</h1>
        <p style={{ color: 'var(--text-muted)' }}>Invite friends and earn ₹200 for each successful referral.</p>
      </motion.div>

      {/* Hero Card (Entrance) */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, ...springSoft }}
        className="p-6 rounded-2xl mb-6 text-center"
        style={{ background: 'linear-gradient(135deg, var(--teal-900), var(--violet-700))', boxShadow: 'var(--shadow-teal)' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...springSnappy, delay: 0.2 }}
          className="text-5xl mb-3"
        >
          🎁
        </motion.div>
        <h2 className="text-2xl font-bold text-white font-display mb-1">Give ₹200, Get ₹200</h2>
        <p className="text-white/70 text-sm mb-6">
          Your friend gets ₹200 off their first booking. You earn ₹200 when they complete a booking.
        </p>

        <div className="flex gap-2 max-w-sm mx-auto">
          <div
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-mono text-sm font-bold"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            {referralCode}
          </div>
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            transition={springSnappy}
            className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-1.5"
            style={{ background: copied ? 'var(--success)' : 'rgba(255, 255, 255, 0.25)' }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={springSnappy}>
                  <Check size={14} />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={springSnappy}>
                  <Copy size={14} />
                </motion.div>
              )}
            </AnimatePresence>
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ opacity: 0.85 }}
          transition={{ duration: durations.micro }}
          className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Share2 size={14} /> Share via WhatsApp
        </motion.button>
      </motion.div>

      {/* Stats — stagger entrance (Entrance) */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: 'Total Referrals', value: '3' },
          { label: 'Successful', value: '2' },
          { label: 'Earned', value: '₹400' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            variants={stagger.item}
            className="p-4 rounded-xl text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="text-2xl font-bold font-display" style={{ color: 'var(--teal-700)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Referred Users */}
      <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>My Referrals</h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {REFERRED.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, ease: easeReveal, duration: durations.fast }}
            className="flex items-center px-4 py-3"
            style={{
              background: 'var(--bg-card)',
              borderBottom: i < REFERRED.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
              style={{ background: 'var(--teal-700)' }}
            >
              {r.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Joined {r.joined}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold" style={{ color: r.status === 'Active' ? 'var(--success)' : 'var(--warning)' }}>
                {r.status}
              </span>
              <p className="text-sm font-bold" style={{ color: 'var(--teal-700)' }}>{r.bonus}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

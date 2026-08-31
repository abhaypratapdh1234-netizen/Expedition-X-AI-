import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Lock, Unlock, Calendar, ChevronRight } from 'lucide-react'
import type { TimeCapsule } from '../../services/plannerFeatures'

interface TimeCapsuleCardProps {
  capsule: TimeCapsule | null
  onSeal: (unlockAt: Date, note: string) => void
}

export function TimeCapsuleCard({ capsule, onSeal }: TimeCapsuleCardProps) {
  const [unlockDate, setUnlockDate] = useState('')
  const [note, setNote] = useState('')

  if (!capsule) {
    // Sealing UI
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Lock size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-[15px] font-black text-[var(--text-primary)]">Create Time Capsule</p>
            <p className="text-[12px] text-[var(--text-muted)]">Seal your trip memories to unlock later</p>
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a note to your future self about this trip..."
          className="w-full h-24 text-[13px] text-[var(--text-primary)] bg-gray-50 border border-[var(--border-subtle)] rounded-xl p-3 resize-none outline-none focus:border-[#FC6C26] transition-colors placeholder:text-[#9ca3af]"
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Calendar size={14} className="text-[var(--text-muted)]" />
            <label className="text-[12px] text-[var(--text-muted)] font-black">Unlock on:</label>
          </div>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            min={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
            className="text-[13px] text-[var(--text-primary)] bg-gray-50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 outline-none focus:border-[#FC6C26] transition-colors"
          />
        </div>

        <button
          onClick={() => {
            if (!unlockDate || !note.trim()) return
            onSeal(new Date(unlockDate), note)
          }}
          disabled={!unlockDate || !note.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black text-[14px] shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔒 Seal Time Capsule
        </button>
      </div>
    )
  }

  // Sealed / Unlocked state
  const now = Date.now()
  const isLocked = capsule.isLocked && now < capsule.unlockAt
  const daysLeft = Math.max(0, Math.ceil((capsule.unlockAt - now) / 86400000))
  const unlockDate2 = new Date(capsule.unlockAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${
      isLocked
        ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={isLocked ? {} : { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ delay: 0.3 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            isLocked ? 'bg-purple-100 border border-purple-200' : 'bg-amber-100 border border-amber-200'
          }`}
        >
          {isLocked ? '🔒' : '🎊'}
        </motion.div>
        <div>
          <p className="text-[15px] font-black text-[var(--text-primary)]">{capsule.title}</p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {isLocked ? `Unlocks on ${unlockDate2}` : `Unlocked! Created ${new Date(capsule.createdAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* Countdown */}
      {isLocked && (
        <div className="text-center py-3">
          <div className="text-[32px] font-black text-purple-600">{daysLeft}</div>
          <div className="text-[11px] text-purple-400 font-black uppercase tracking-widest">days until unlock</div>
        </div>
      )}

      {/* Unlocked content */}
      <AnimatePresence>
        {!isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-[#FC6C26]">Trip Memories Unsealed</p>
            {capsule.snapshots.map((snap, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-xl border border-amber-100">
                <span className="text-[12px] text-[var(--text-muted)] font-bold">{snap.label}</span>
                <span className="text-[13px] font-black text-[var(--text-primary)]">{snap.value}</span>
              </div>
            ))}
            <button className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FC6C26] text-white text-[13px] font-black hover:opacity-90 transition-opacity shadow-md">
              Share Trip Recap <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

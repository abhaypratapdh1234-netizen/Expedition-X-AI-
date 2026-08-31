import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react'
import type { ScamWarning } from '../../services/plannerFeatures'

const TYPE_ICONS: Record<ScamWarning['type'], string> = {
  overcharging: '💸',
  fake_tickets: '🎭',
  distraction_theft: '🎯',
  taxi_scam: '🚕',
  fake_guide: '🧭',
  other: '⚠️',
}

interface ScamCardProps {
  warning: ScamWarning
  onVote?: (id: string, direction: 'up' | 'down') => void
}

export function ScamCard({ warning, onVote }: ScamCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [votes, setVotes] = useState({ up: warning.votesUp, down: warning.votesDown })

  const handleVote = (dir: 'up' | 'down') => {
    if (voted) return
    setVoted(dir)
    setVotes(v => ({ ...v, [dir]: v[dir] + 1 }))
    onVote?.(warning.id, dir)
  }

  const decayDays = Math.round((Date.now() - warning.reportedAt) / 86400000)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] rounded-xl border border-amber-100 shadow-sm overflow-hidden"
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-lg">
          {TYPE_ICONS[warning.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FC6C26] block">
                {warning.category}
              </span>
              <p className="text-[13px] font-black text-[var(--text-primary)] mt-0.5">
                📍 {warning.location}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-[#9ca3af]">{decayDays}d ago</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={14} className="text-[var(--text-muted)]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-amber-50 pt-3 space-y-3">
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{warning.description}</p>

              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
                  TF-IDF Classifier
                </span>
                <div className="h-1.5 rounded-full bg-gray-100 flex-1">
                  <div
                    className="h-full rounded-full bg-[#FC6C26]"
                    style={{ width: `${Math.round(warning.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-[var(--text-muted)]">
                  {Math.round(warning.confidence * 100)}% confidence
                </span>
              </div>

              {/* Vote buttons */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#9ca3af]">Was this helpful?</span>
                <button
                  onClick={() => handleVote('up')}
                  disabled={!!voted}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-black transition-all ${
                    voted === 'up'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'hover:bg-green-50 text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }`}
                >
                  <ThumbsUp size={11} /> {votes.up}
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={!!voted}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-black transition-all ${
                    voted === 'down'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'hover:bg-red-50 text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }`}
                >
                  <ThumbsDown size={11} /> {votes.down}
                </button>
              </div>

              <p className="text-[10px] text-[#9ca3af]">{warning.dataSource}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

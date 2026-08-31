import { motion } from 'framer-motion'
import { Zap, AlertTriangle, TrendingUp } from 'lucide-react'
import type { EnergyDay } from '../../services/plannerFeatures'

interface EnergyBarProps {
  day: EnergyDay
  compact?: boolean
}

export function EnergyBar({ day, compact = false }: EnergyBarProps) {
  const fillPct = Math.min(100, Math.round((day.totalExertion / day.budget) * 100))
  const barColor =
    day.status === 'over_limit'
      ? '#ef4444'
      : day.status === 'near_limit'
        ? '#f59e0b'
        : '#22c55e'

  return (
    <div className={`space-y-${compact ? '1.5' : '3'}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#FC6C26]" />
            <span className="text-[13px] font-black text-[var(--text-primary)]">Energy Budget</span>
          </div>
          <span className={`text-[12px] font-black px-2 py-0.5 rounded-full ${
            day.status === 'over_limit'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : day.status === 'near_limit'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {day.totalExertion}/{day.budget} pts
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, fillPct)}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
            boxShadow: `0 2px 8px ${barColor}50`,
          }}
        />
        {/* Budget marker at 100% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#1B2A4A]/30"
          style={{ left: '100%', transform: 'translateX(-1px)' }}
        />
      </div>

      {/* Compact label */}
      {compact && (
        <p className="text-[11px] font-black" style={{ color: barColor }}>
          {day.totalExertion}/{day.budget} energy pts
        </p>
      )}

      {/* Warning messages */}
      {!compact && day.status === 'over_limit' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
        >
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-[12px] text-red-700 font-black">
            Day exceeds energy budget by {day.totalExertion - day.budget} pts — consider removing an activity
          </p>
        </motion.div>
      )}

      {!compact && day.status === 'near_limit' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200"
        >
          <TrendingUp size={14} className="text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700 font-black">
            Near energy limit — day is packed. Rest period recommended.
          </p>
        </motion.div>
      )}

      {/* Activity breakdown */}
      {!compact && day.activities.length > 0 && (
        <div className="space-y-1">
          {day.activities.map(act => (
            <div key={act.id} className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.max(8, (act.exertionScore / day.budget) * 100)}%`,
                  background: barColor,
                  opacity: 0.6,
                }}
              />
              <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                {act.name} · {act.exertionScore} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

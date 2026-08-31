/**
 * ScoreCard.tsx — Shared score display component
 *
 * Used identically for Trip Confidence, Risk Index, and Eco Score.
 * One component, three use cases — consistent visual language throughout the app.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

interface ComponentRow {
  name: string
  value: number | string   // number = rendered as bar; string = rendered as text
  note?: string
  isUnavailable?: boolean  // shows "Insufficient data" state instead of number
}

interface ScoreCardProps {
  score: number | string
  label: string
  sublabel?: string
  color: string          // hex color for the score ring/accent
  components?: ComponentRow[]
  expandable?: boolean
  isLoading?: boolean
  badge?: string         // e.g. "Low Risk" / "Strong Match"
  badgeColor?: string
  basis?: string         // formula explanation shown in expanded view
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function ScoreRing({ score, color, size }: { score: number; color: string; size: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 80 : size === 'md' ? 60 : 44
  const stroke = size === 'lg' ? 6 : size === 'md' ? 5 : 4
  const r = (dim - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circ
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 16 : 12

  return (
    <div style={{ width: dim, height: dim }} className="relative shrink-0">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
        <motion.circle
          cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  )
}

function ComponentBar({ row, color }: { row: ComponentRow; color: string }) {
  if (row.isUnavailable) {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] font-bold text-[var(--text-secondary)] flex-1">{row.name}</span>
        <span className="text-[11px] font-extrabold text-[#9ca3af] bg-gray-50 px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
          Insufficient data
        </span>
      </div>
    )
  }

  if (typeof row.value === 'string') {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] font-bold text-[var(--text-secondary)] flex-1">{row.name}</span>
        <span className="text-[13px] font-extrabold" style={{ color }}>{row.value}</span>
      </div>
    )
  }

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-bold text-[var(--text-secondary)]">{row.name}</span>
        <div className="flex items-center gap-1">
          {row.note && (
            <span className="text-[11px] text-[#9ca3af] font-bold">{row.note}</span>
          )}
          <span className="text-[12px] font-extrabold" style={{ color }}>{row.value}</span>
        </div>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, row.value as number))}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

export function ScoreCard({
  score,
  label,
  sublabel,
  color,
  components,
  expandable = true,
  isLoading = false,
  badge,
  badgeColor,
  basis,
  size = 'md',
  className = '',
}: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false)
  const numericScore = typeof score === 'number' ? score : parseInt(String(score)) || 0

  if (isLoading) {
    return (
      <div className={`bg-[var(--bg-card)] rounded-[20px] p-4 border border-[var(--border-subtle)] shadow-sm ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-subtle)] shadow-sm overflow-hidden ${className}`}>
      <div
        className={`flex items-center gap-3 p-4 ${expandable && components?.length ? 'cursor-pointer hover:bg-gray-50/50 transition-colors' : ''}`}
        onClick={() => expandable && components?.length && setExpanded(e => !e)}
        role={expandable && components?.length ? 'button' : undefined}
        aria-expanded={expandable && components?.length ? expanded : undefined}
        tabIndex={expandable && components?.length ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && expandable && components?.length && setExpanded(p => !p)}
      >
        {/* Score ring */}
        <ScoreRing score={numericScore} color={color} size={size} />

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-[var(--text-primary)] antialiased">{label}</p>
            {badge && (
              <span
                className="text-[11px] font-extrabold px-2 py-0.5 rounded-full border"
                style={{
                  color: badgeColor || color,
                  background: `${badgeColor || color}12`,
                  borderColor: `${badgeColor || color}30`,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {sublabel && (
            <p className="text-[12px] font-semibold text-[var(--text-secondary)] mt-0.5 leading-snug antialiased">{sublabel}</p>
          )}
        </div>

        {/* Expand toggle */}
        {expandable && components?.length > 0 && (
          <div className="shrink-0 text-[#9ca3af]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {expanded && components && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-0.5">
              {components.map((row, i) => (
                <ComponentBar key={i} row={row} color={color} />
              ))}
              {basis && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-1.5">
                  <Info size={12} className="text-[#9ca3af] shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-[#9ca3af] leading-relaxed">{basis}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

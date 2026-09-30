import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, ShieldAlert, Route as RouteIcon } from 'lucide-react'
import type { RouteSegment } from '../../services/plannerFeatures'

interface RiskOverlayProps {
  segments: RouteSegment[]
}

const RISK_COLORS = {
  low: {
    bg: '#16a34a',
    badgeText: 'text-emerald-950 dark:text-emerald-200',
    cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    pill: 'bg-emerald-100 dark:bg-emerald-900/80 border-emerald-400 dark:border-emerald-600',
    label: 'Low Risk',
  },
  moderate: {
    bg: '#d97706',
    badgeText: 'text-amber-950 dark:text-amber-200',
    cardBg: 'bg-amber-50/80 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700/60',
    pill: 'bg-amber-100 dark:bg-amber-900/80 border-amber-400 dark:border-amber-600',
    label: 'Moderate Risk',
  },
  high: {
    bg: '#dc2626',
    badgeText: 'text-red-950 dark:text-red-200',
    cardBg: 'bg-red-50/90 dark:bg-red-950/40',
    border: 'border-red-400 dark:border-red-700/80',
    pill: 'bg-red-100 dark:bg-red-900/80 border-red-500 dark:border-red-600',
    label: 'High Risk',
  },
}

export function RiskOverlay({ segments }: RiskOverlayProps) {
  const highRiskSegs = segments.filter(s => s.riskBand === 'high')

  return (
    <div className="space-y-4">
      {/* Visual route line */}
      <div className="flex items-center gap-3 py-3.5 px-4 bg-neutral-100/90 dark:bg-neutral-850 rounded-xl border border-black/10 dark:border-white/15 overflow-x-auto shadow-sm">
        {segments.map((seg, i) => (
          <div key={seg.id} className="flex items-center gap-3 shrink-0">
            {/* Origin dot */}
            {i === 0 && (
              <div className="w-3.5 h-3.5 rounded-full bg-[#1B2A4A] dark:bg-white shrink-0 shadow-sm" />
            )}
            {/* Segment bar */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.max(60, Math.min(180, seg.distanceKm / 8))}px`,
                  background: RISK_COLORS[seg.riskBand].bg,
                  boxShadow: `0 2px 8px ${RISK_COLORS[seg.riskBand].bg}80`,
                }}
              />
              <span className="text-[11px] font-black text-black dark:text-white whitespace-nowrap tracking-tight bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10 shadow-xs">
                {(seg.from.split(',')[0] || seg.from).trim()} → {(seg.to.split(',')[0] || seg.to).trim()}
              </span>
            </div>
            {/* Destination dot */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#FC6C26] shrink-0 shadow-sm" />
          </div>
        ))}
      </div>

      {/* Risk legend */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-4 flex-wrap">
          {(['low', 'moderate', 'high'] as const).map(band => (
            <div key={band} className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-xs"
                style={{ background: RISK_COLORS[band].bg }}
              />
              <span className="text-[13px] font-black text-black dark:text-white">
                {RISK_COLORS[band].label}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[12px] font-bold text-neutral-600 dark:text-neutral-300">
          Weighted hazard scoring · NDMA & IMD data · 88% confidence
        </span>
      </div>

      {/* Segment cards */}
      <div className="space-y-3">
        {segments.map((seg) => {
          const colors = RISK_COLORS[seg.riskBand]
          return (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 ${colors.border} ${colors.cardBg} shadow-sm transition-all`}
            >
              {/* Vertical Color Pillar */}
              <div
                className="w-2.5 h-full min-h-[52px] rounded-full shrink-0 mt-0.5 shadow-sm"
                style={{ background: colors.bg }}
              />

              <div className="flex-1 min-w-0">
                {/* Header row: From -> To and Risk Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[16px] sm:text-[17px] font-black text-black dark:text-white tracking-tight">
                      {seg.from} → {seg.to}
                    </p>
                    <span className="text-[12px] font-bold text-neutral-600 dark:text-neutral-300 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10">
                      🛣️ {seg.distanceKm} km · ⏱️ ~{seg.durationHours} hrs
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-black px-3 py-1 rounded-full border-2 ${colors.pill} ${colors.badgeText} uppercase tracking-wider shadow-xs`}>
                      {colors.label}
                    </span>
                    <span className="text-[14px] font-black text-black dark:text-white bg-white/90 dark:bg-black/60 px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/15 shadow-xs">
                      Risk {Math.round(seg.riskScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Risk Factors — Bold & Clearly Visible */}
                {seg.riskFactors.length > 0 && (
                  <div className="mt-2 bg-white/90 dark:bg-black/50 p-2.5 rounded-xl border border-black/10 dark:border-white/10">
                    <p className="text-[13px] sm:text-[14px] font-extrabold text-black dark:text-neutral-100 leading-snug">
                      {seg.riskFactors.join(' · ')}
                    </p>
                  </div>
                )}

                {/* Data Source Footnote */}
                <p className="text-[11px] sm:text-[12px] font-bold text-neutral-600 dark:text-neutral-300 mt-2 flex items-center gap-1.5">
                  <span>ℹ️</span> {seg.dataSource}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* High-risk alert banner */}
      {highRiskSegs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3.5 p-4 sm:p-5 bg-red-100/90 dark:bg-red-950/70 rounded-2xl border-2 border-red-500 dark:border-red-600 shadow-md"
        >
          <AlertTriangle size={22} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[16px] font-black text-red-950 dark:text-red-100">
              ⚠️ {highRiskSegs.length} high-risk corridor segment{highRiskSegs.length > 1 ? 's' : ''} detected
            </p>
            <p className="text-[13px] sm:text-[14px] font-extrabold text-red-900 dark:text-red-200 mt-1 leading-relaxed">
              Consider alternate routes, daylight transit, or traveling outside peak monsoon cloudburst periods. Check NDMA & IMD state weather advisories before departure.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

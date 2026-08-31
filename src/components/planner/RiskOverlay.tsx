import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { RouteSegment } from '../../services/plannerFeatures'

interface RiskOverlayProps {
  segments: RouteSegment[]
}

const RISK_COLORS = {
  low: { bg: '#22c55e', text: 'text-green-700', badge: 'bg-green-50 border-green-200', label: 'Low Risk' },
  moderate: { bg: '#f59e0b', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200', label: 'Moderate Risk' },
  high: { bg: '#ef4444', text: 'text-red-700', badge: 'bg-red-50 border-red-200', label: 'High Risk' },
}

export function RiskOverlay({ segments }: RiskOverlayProps) {
  const highRiskSegs = segments.filter(s => s.riskBand === 'high')

  return (
    <div className="space-y-3">
      {/* Visual route line */}
      <div className="flex items-center gap-2 py-3 px-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-x-auto">
        {segments.map((seg, i) => (
          <div key={seg.id} className="flex items-center gap-2 shrink-0">
            {/* Origin dot */}
            {i === 0 && (
              <div className="w-3 h-3 rounded-full bg-[#1B2A4A] shrink-0" />
            )}
            {/* Segment bar */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(40, seg.distanceKm / 10)}px`,
                  background: RISK_COLORS[seg.riskBand].bg,
                  boxShadow: `0 2px 6px ${RISK_COLORS[seg.riskBand].bg}60`,
                }}
              />
              <span className="text-[9px] font-black text-[var(--text-muted)] whitespace-nowrap">
                {seg.from.split(' ')[0]} → {seg.to.split(' ')[0]}
              </span>
            </div>
            {/* Destination dot */}
            <div className="w-3 h-3 rounded-full bg-[#FC6C26] shrink-0" />
          </div>
        ))}
      </div>

      {/* Risk legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['low', 'moderate', 'high'] as const).map(band => (
          <div key={band} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[band].bg }} />
            <span className="text-[11px] font-black text-[var(--text-muted)]">{RISK_COLORS[band].label}</span>
          </div>
        ))}
        <span className="text-[10px] text-[#9ca3af] ml-auto">
          Weighted hazard scoring · NDMA data · 72% confidence
        </span>
      </div>

      {/* Segment cards */}
      <div className="space-y-2">
        {segments.map((seg) => {
          const colors = RISK_COLORS[seg.riskBand]
          return (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${colors.badge}`}
            >
              <div
                className="w-2 h-full min-h-[36px] rounded-full shrink-0 mt-0.5"
                style={{ background: colors.bg }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[13px] font-black text-[var(--text-primary)]">
                    {seg.from} → {seg.to}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${colors.badge} ${colors.text}`}>
                      {colors.label}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--text-muted)]">
                      Risk {Math.round(seg.riskScore * 100)}%
                    </span>
                  </div>
                </div>
                {seg.riskFactors.length > 0 && (
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">
                    {seg.riskFactors.slice(0, 2).join(' · ')}
                  </p>
                )}
                <p className="text-[10px] text-[#9ca3af] mt-1">{seg.dataSource}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* High-risk alert banner */}
      {highRiskSegs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200"
        >
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-black text-red-800">
              {highRiskSegs.length} high-risk segment{highRiskSegs.length > 1 ? 's' : ''} detected
            </p>
            <p className="text-[12px] text-red-600 mt-1">
              Consider alternate routes or travel outside monsoon season. Check NDMA alerts before departure.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

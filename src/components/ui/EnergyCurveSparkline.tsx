// EnergyCurveSparkline.tsx — Small energy pacing sparkline for a day
// Displays a 60px tall SVG curve labeled as a heuristic estimate.
// Not a dominant chart — a supporting signal only.
import type { EnergyPoint } from "../../services/intelligenceService"

interface EnergyCurveSparklineProps {
  data: EnergyPoint[]
  height?: number
  className?: string
}

export function EnergyCurveSparkline({ data, height = 36, className = "" }: EnergyCurveSparklineProps) {
  if (!data || data.length === 0) return null

  const width = 120
  const padding = 4
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((p, i) => ({
    x: padding + (i / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - (p.energy_pct / 100) * chartHeight,
    energy: p.energy_pct,
    hour: p.hour,
  }))

  // Build SVG path
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = points[i - 1]
    const cpX = (prev.x + pt.x) / 2
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`
  }, "")

  // Fill path (closed)
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  const minEnergy = Math.min(...data.map(p => p.energy_pct))
  const dotColor = minEnergy < 50 ? "#f59e0b" : "#16a34a"
  const lineColor = minEnergy < 50 ? "#f59e0b" : "#16a34a"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
        <defs>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <path d={fillD} fill="url(#energyGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current energy dot (last point) */}
        <circle cx={points[0].x} cy={points[0].y} r="2.5" fill={dotColor} />
      </svg>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: lineColor }}>
          Energy curve
        </p>
        <p className="text-[10px] font-bold text-[#9ca3af]">
          Peak {data[1]?.energy_pct ?? 100}% → low {minEnergy}%
        </p>
        <p className="text-[9px] font-bold text-[#c4c4c4] italic">heuristic estimate</p>
      </div>
    </div>
  )
}

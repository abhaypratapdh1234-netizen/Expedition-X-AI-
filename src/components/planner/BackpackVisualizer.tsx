import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface BackpackVisualizerProps {
  fillPercent: number          // 0–100
  totalVolumeLitres: number
  bagCapacityLitres: number
  totalWeightKg: number
}

export function BackpackVisualizer({
  fillPercent,
  totalVolumeLitres,
  bagCapacityLitres,
  totalWeightKg,
}: BackpackVisualizerProps) {
  const clampedFill = Math.min(100, Math.max(0, fillPercent))
  const fillColor =
    clampedFill > 90 ? '#ef4444' : clampedFill > 70 ? '#f59e0b' : '#22c55e'
  const remaining = Math.max(0, bagCapacityLitres - totalVolumeLitres)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Backpack */}
      <div className="relative">
        <svg width={120} height={150} viewBox="0 0 120 150" fill="none">
          {/* Bag body */}
          <rect x={10} y={30} width={100} height={105} rx={18} fill="#f3f4f6" stroke="#e5e7eb" strokeWidth={2} />

          {/* Fill level (animated) */}
          <defs>
            <clipPath id="bag-clip">
              <rect x={10} y={30} width={100} height={105} rx={18} />
            </clipPath>
          </defs>
          <motion.rect
            x={10}
            y={30 + 105 * (1 - clampedFill / 100)}
            width={100}
            height={105 * (clampedFill / 100)}
            rx={0}
            fill={fillColor}
            fillOpacity={0.2}
            clipPath="url(#bag-clip)"
            initial={{ y: 135, height: 0 }}
            animate={{
              y: 30 + 105 * (1 - clampedFill / 100),
              height: 105 * (clampedFill / 100),
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.rect
            x={10}
            y={30 + 105 * (1 - clampedFill / 100)}
            width={100}
            height={3}
            fill={fillColor}
            clipPath="url(#bag-clip)"
            initial={{ y: 133 }}
            animate={{ y: 30 + 105 * (1 - clampedFill / 100) }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Top flap */}
          <path
            d="M 22 30 Q 60 5 98 30"
            stroke="#e5e7eb"
            strokeWidth={2}
            fill="#f3f4f6"
          />

          {/* Straps */}
          <line x1={35} y1={30} x2={35} y2={15} stroke="#d1d5db" strokeWidth={4} strokeLinecap="round" />
          <line x1={85} y1={30} x2={85} y2={15} stroke="#d1d5db" strokeWidth={4} strokeLinecap="round" />

          {/* Front pocket */}
          <rect x={25} y={95} width={70} height={35} rx={10} fill="none" stroke="#e5e7eb" strokeWidth={1.5} />

          {/* Zipper line */}
          <path d="M 30 95 L 90 95" stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 3" />

          {/* Percentage text */}
          <text x={60} y={75} textAnchor="middle" fill={fillColor} fontSize={18} fontWeight={800} fontFamily="'Plus Jakarta Sans', sans-serif">
            {clampedFill}%
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full text-center">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-3">
          <p className="text-[18px] font-black" style={{ color: fillColor }}>
            {remaining.toFixed(1)}L
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Remaining</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-3">
          <p className="text-[18px] font-black text-[var(--text-primary)]">
            {bagCapacityLitres}L
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Bag Size</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-3">
          <p className="text-[18px] font-black text-[var(--text-primary)]">
            {totalWeightKg.toFixed(1)}kg
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Weight</p>
        </div>
      </div>

      {/* Capacity warning */}
      {clampedFill > 90 && (
        <p className="text-[12px] text-red-600 font-black text-center px-4 py-2 bg-red-50 rounded-xl border border-red-200 w-full">
          ⚠️ Bag near capacity — consider a larger bag or remove non-essentials
        </p>
      )}
    </div>
  )
}

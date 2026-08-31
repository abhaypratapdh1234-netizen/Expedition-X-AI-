import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Thermometer, Wind, Zap, ArrowRight } from 'lucide-react'
import type { DayForecast } from '../../services/openMeteoApi'
import { CONDITION_ICONS, computePlanB } from '../../services/openMeteoApi'

interface WeatherBackupCardProps {
  forecast: DayForecast
  destination: string
}

export function WeatherBackupCard({ forecast, destination }: WeatherBackupCardProps) {
  const planB = computePlanB(forecast, destination)
  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'Low Risk' },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'Moderate' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'High Risk' },
  }[forecast.risk]

  return (
    <div className="space-y-3">
      {/* Main forecast card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Condition */}
          <div className="flex items-center gap-3">
            <div className="text-4xl leading-none">{CONDITION_ICONS[forecast.condition]}</div>
            <div>
              <p className="text-[22px] font-black text-[var(--text-primary)]">
                {forecast.tempMax}° <span className="text-[16px] text-[var(--text-muted)]">/ {forecast.tempMin}°C</span>
              </p>
              <p className="text-[13px] text-[var(--text-muted)] capitalize mt-0.5">
                {forecast.condition.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Risk badge */}
          <div className={`px-3 py-1.5 rounded-full border text-[11px] font-black ${riskColors.bg} ${riskColors.border} ${riskColors.text}`}>
            {riskColors.badge}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <CloudRain size={13} className="text-[var(--text-muted)]" />
            <span className="text-[12px] text-[var(--text-muted)] font-black">{forecast.precipSum}mm rain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={13} className="text-[var(--text-muted)]" />
            <span className="text-[12px] text-[var(--text-muted)] font-black">{forecast.windspeedMax}km/h wind</span>
          </div>
        </div>

        <p className="text-[10px] text-[#9ca3af] mt-2">
          Source: Open-Meteo (open-meteo.com) — free, no API key · {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Plan B card — auto-appears on rain/heat/wind threshold */}
      <AnimatePresence>
        {planB && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF4D6] rounded-2xl border border-[#FC6C26]/20 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FC6C26]/10 flex items-center justify-center">
                <Zap size={14} className="text-[#FC6C26]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#FC6C26]">Plan B Activated</p>
                <p className="text-[12px] text-[var(--text-muted)] font-bold">{planB.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {planB.alternatives.map((alt) => (
                <div
                  key={alt.label}
                  className="flex items-center gap-2 p-2.5 bg-[var(--bg-card)] rounded-xl border border-orange-100 hover:border-[#FC6C26]/30 transition-colors cursor-pointer"
                >
                  <span className="text-lg">{alt.emoji}</span>
                  <div>
                    <p className="text-[12px] font-black text-[var(--text-primary)] leading-tight">{alt.label}</p>
                    <p className="text-[10px] text-[#9ca3af] leading-tight mt-0.5 line-clamp-2">{alt.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#FC6C26] font-black cursor-pointer hover:opacity-80">
              <span>Add alternatives to itinerary</span>
              <ArrowRight size={12} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

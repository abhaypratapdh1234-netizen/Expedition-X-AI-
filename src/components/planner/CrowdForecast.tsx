/**
 * CrowdForecast.tsx — Future Crowd Map™
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, TrendingUp, TrendingDown, Minus,
  CalendarDays, CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import {
  computeCrowdForecast,
  reserveSlot,
  type CrowdForecastData,
  type TimeSlot,
} from '../../services/infrastructureService'
import { useThemeStore } from '../../stores/themeStore'

interface CrowdForecastProps {
  placeId: string
  placeName: string
  placeCategory?: string
}

const STATUS_META: Record<TimeSlot['status'], { bg: string; color: string; label: string }> = {
  quiet:      { bg: 'rgba(16,185,129,0.10)', color: '#10b981', label: 'Quiet' },
  moderate:   { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', label: 'Moderate' },
  filling_up: { bg: 'rgba(249,115,22,0.10)', color: '#f97316', label: 'Filling Up' },
  crowded:    { bg: 'rgba(239,68,68,0.10)',  color: '#ef4444', label: 'Crowded' },
}

const TREND_ICON: Record<string, React.ReactNode> = {
  increasing: <TrendingUp size={13} />,
  decreasing: <TrendingDown size={13} />,
  stable:     <Minus size={13} />,
}

function todayPlus1(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function CrowdForecast({ placeId, placeName, placeCategory = 'attraction' }: CrowdForecastProps) {
  const [selectedDate, setSelectedDate] = useState(todayPlus1)
  const [forecast, setForecast] = useState<CrowdForecastData | null>(null)
  const [showReserve, setShowReserve] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [groupSize, setGroupSize] = useState(1)
  const [reserveSuccess, setReserveSuccess] = useState(false)
  const [reserveError, setReserveError] = useState<string | null>(null)
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    try {
      const data = computeCrowdForecast(placeId, placeName, selectedDate, placeCategory)
      setForecast(data)
    } catch (e) {
      console.error('[CrowdForecast] compute error:', e)
    }
  }, [placeId, placeName, selectedDate, placeCategory])

  const keySlots = useMemo(() => {
    if (!forecast) return []
    return forecast.slots.filter(s => {
      const h = parseInt(s.time.split(':')[0])
      return s.time.endsWith(':00') && h >= 8 && h <= 18 && h % 2 === 0
    })
  }, [forecast])

  const { linePath, areaPath } = useMemo(() => {
    if (!forecast || forecast.slots.length === 0) return { linePath: '', areaPath: '' }
    const W = 260, H = 44
    const pts = forecast.slots
    const step = W / (pts.length - 1)
    const coords = pts.map((s, i) => ({
      x: i * step,
      y: H - (s.saturationPct / 100) * H,
    }))
    const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L ${W} ${H} L 0 ${H} Z`
    return { linePath: line, areaPath: area }
  }, [forecast])

  const handleSlotChipClick = (slot: string) => {
    setSelectedSlot(slot)
    setShowReserve(true)
    setReserveError(null)
    setReserveSuccess(false)
  }

  const handleReserve = () => {
    if (!selectedSlot) {
      setReserveError('Please select a time slot chip first.')
      return
    }
    const result = reserveSlot(placeId, selectedDate, selectedSlot, groupSize)
    if (result.success) {
      setReserveSuccess(true)
      const fresh = computeCrowdForecast(placeId, placeName, selectedDate, placeCategory)
      setForecast(fresh)
      setTimeout(() => {
        setReserveSuccess(false)
        setShowReserve(false)
        setSelectedSlot(null)
        setGroupSize(1)
      }, 2200)
    } else {
      setReserveError(result.error || 'Reservation failed')
    }
  }

  const scoreTrend = forecast?.overallTrend ?? 'stable'

  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      background: isDark ? '#111111' : 'var(--bg-card)',
      border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
      boxShadow: '0 4px 24px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.14))',
            border: '1px solid rgba(99,102,241,0.22)',
          }}>
            <Users size={19} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p style={{
              fontSize: 15, fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0,
              letterSpacing: '-0.35px', lineHeight: 1.2,
            }}>Future Crowd Map™</p>
            <p style={{ fontSize: 12, color: isDark ? '#94a3b8' : 'var(--text-secondary)', fontWeight: 500, margin: '2px 0 0' }}>Reservation-based prediction</p>
          </div>
        </div>
        {forecast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20,
            background: scoreTrend === 'increasing' ? (isDark ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.1)') : scoreTrend === 'decreasing' ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : 'var(--bg-secondary)',
            border: `1px solid ${scoreTrend === 'increasing' ? 'rgba(249,115,22,0.3)' : scoreTrend === 'decreasing' ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
            color: scoreTrend === 'increasing' ? '#fb923c' : scoreTrend === 'decreasing' ? '#34d399' : 'var(--text-secondary)',
            fontSize: 11, fontWeight: 800,
          }}>
            {TREND_ICON[scoreTrend]}
            <span style={{ textTransform: 'capitalize' }}>{scoreTrend}</span>
          </div>
        )}
      </div>

      {/* ── Date Picker ── */}
      <div style={{ padding: '14px 20px 10px' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: isDark ? '#ffffff' : 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Select Date</label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setSelectedDate(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 11, fontSize: 14, fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            background: isDark ? '#0A0A0A' : 'var(--bg-secondary)',
            color: isDark ? '#ffffff' : 'var(--text-primary)',
            border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-default)',
            outline: 'none', boxSizing: 'border-box',
            letterSpacing: '-0.2px',
          }}
        />
      </div>

      {/* ── Sparkline ── */}
      {forecast && linePath && (
        <div style={{ padding: '4px 20px 8px' }}>
          <svg viewBox={`0 0 260 52`} style={{ width: '100%', height: 52 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`crowd-grad-${placeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#crowd-grad-${placeId})`} />
            <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['6 AM', '10 AM', '2 PM', '6 PM', '8 PM'].map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#94a3b8' : 'var(--text-secondary)', letterSpacing: '0.1px' }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Time Slot Chips ── */}
      {forecast && (
        <div style={{ padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {keySlots.map(slot => {
            const meta = STATUS_META[slot.status]
            return (
              <motion.button
                key={slot.time}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleSlotChipClick(slot.time)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: 20,
                  border: isDark ? `1.5px solid ${meta.color}40` : `1.5px solid ${meta.color}28`,
                  cursor: 'pointer',
                  background: isDark ? `${meta.color}15` : meta.bg,
                  color: meta.color,
                  fontSize: 12, fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  letterSpacing: '-0.1px',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, display: 'inline-block', flexShrink: 0 }} />
                {slot.label}: {meta.label}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* ── Peak / Quietest Row ── */}
      {forecast && (
        <div style={{ padding: '4px 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            padding: '12px 14px', borderRadius: 14, textAlign: 'center',
            background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)',
            border: isDark ? '1.5px solid rgba(239,68,68,0.30)' : '1.5px solid rgba(239,68,68,0.15)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#fca5a5' : '#ef4444', margin: 0, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Peak time</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: isDark ? '#ef4444' : '#dc2626', margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", letterSpacing: '-0.5px' }}>{forecast.peakSlot}</p>
          </div>
          <div style={{
            padding: '12px 14px', borderRadius: 14, textAlign: 'center',
            background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.07)',
            border: isDark ? '1.5px solid rgba(16,185,129,0.30)' : '1.5px solid rgba(16,185,129,0.15)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#a7f3d0' : '#10b981', margin: 0, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Quietest</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: isDark ? '#10b981' : '#059669', margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", letterSpacing: '-0.5px' }}>{forecast.quietestSlot}</p>
          </div>
        </div>
      )}

      {/* ── Reserve Slot ── */}
      <div style={{ padding: '0 20px 20px' }}>
        <AnimatePresence mode="wait">
          {showReserve ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Selected Slot Display */}
                {selectedSlot && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                    background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)',
                  }}>
                    <Clock size={15} style={{ color: '#6366f1' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                      {keySlots.find(s => s.time === selectedSlot)?.label || selectedSlot}
                    </span>
                  </div>
                )}

                {/* Group Size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>Group Size:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setGroupSize(g => Math.max(1, g - 1))}
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-default)',
                        cursor: 'pointer',
                        background: isDark ? '#0A0A0A' : 'var(--bg-secondary)',
                        color: isDark ? '#ffffff' : 'var(--text-primary)',
                        fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >−</motion.button>
                    <span style={{ fontSize: 16, fontWeight: 900, color: isDark ? '#ffffff' : 'var(--text-primary)', minWidth: 24, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{groupSize}</span>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setGroupSize(g => Math.min(20, g + 1))}
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-default)',
                        cursor: 'pointer',
                        background: isDark ? '#0A0A0A' : 'var(--bg-secondary)',
                        color: isDark ? '#ffffff' : 'var(--text-primary)',
                        fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >+</motion.button>
                  </div>
                </div>

                {/* Error */}
                {reserveError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={13} /> {reserveError}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 9 }}>
                  <motion.button
                    whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReserve}
                    disabled={reserveSuccess}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
                      color: '#fff', fontSize: 13, fontWeight: 800,
                      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      background: reserveSuccess ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      boxShadow: reserveSuccess ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(99,102,241,0.3)',
                      transition: 'all 0.25s', letterSpacing: '-0.2px',
                    }}
                  >
                    {reserveSuccess
                      ? <><CheckCircle size={15} /> Reserved!</>
                      : <><CalendarDays size={14} /> Reserve My Slot</>}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { setShowReserve(false); setSelectedSlot(null); setReserveError(null) }}
                    style={{
                      padding: '12px 15px', borderRadius: 13,
                      border: isDark ? '1.5px solid #333333' : '1.5px solid var(--border-default)',
                      cursor: 'pointer',
                      background: isDark ? '#222222' : 'var(--bg-secondary)',
                      color: isDark ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 700
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
                <p style={{ fontSize: 11, textAlign: 'center', color: isDark ? '#94a3b8' : 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  Anonymous · No payment · Intent signal only
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02, filter: 'brightness(1.04)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowReserve(true)
                if (!selectedSlot && keySlots.length > 0) {
                  setSelectedSlot(keySlots[0].time)
                }
              }}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14,
                border: isDark ? 'none' : '1.5px solid rgba(99,102,241,0.25)',
                cursor: 'pointer', fontSize: 13, fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                color: isDark ? '#ffffff' : '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: isDark ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.07)',
                boxShadow: isDark ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                letterSpacing: '-0.15px',
              }}
            >
              <CalendarDays size={15} />
              Reserve My Slot
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * QuietScore.tsx — Quiet Tourism™ Premium Edition
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VolumeX, Mic, MicOff, Info, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import {
  computeQuietnessScore,
  captureDecibelSnapshot,
  type QuietnessScoreData,
  type DecibelSnapshot,
} from '../../services/infrastructureService'
import { useThemeStore } from '../../stores/themeStore'

interface QuietScoreProps {
  placeId: string
  placeCategory?: string
}

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"

function scoreColor(s: number) {
  if (s >= 80) return '#111111'
  if (s >= 60) return '#333333'
  if (s >= 40) return '#d97706'
  if (s >= 20) return '#ea580c'
  return '#dc2626'
}
function scoreBg(s: number, isDark: boolean) {
  if (s >= 80) return { bg: isDark ? '#111111' : '#f3f4f6', border: isDark ? '#333333' : '#d1d5db', text: isDark ? '#ffffff' : '#000000' }
  if (s >= 60) return { bg: isDark ? '#1a1a1a' : '#e5e7eb', border: isDark ? '#444444' : '#9ca3af', text: isDark ? '#e5e7eb' : '#111111' }
  if (s >= 40) return { bg: isDark ? '#78350f' : '#fef3c7', border: isDark ? '#b45309' : '#fcd34d', text: isDark ? '#fbbf24' : '#92400e' }
  if (s >= 20) return { bg: isDark ? '#7c2d12' : '#ffedd5', border: isDark ? '#9a3412' : '#fed7aa', text: isDark ? '#fdba74' : '#9a3412' }
  return { bg: isDark ? '#7f1d1d' : '#fee2e2', border: isDark ? '#991b1b' : '#fca5a5', text: isDark ? '#f87171' : '#991b1b' }
}
function scoreLabel(s: number) {
  if (s >= 80) return 'Very Quiet'
  if (s >= 60) return 'Quiet'
  if (s >= 40) return 'Moderate'
  if (s >= 20) return 'Noisy'
  return 'Very Noisy'
}
function scoreEmoji(s: number) {
  if (s >= 80) return '🤫'
  if (s >= 60) return '🌿'
  if (s >= 40) return '🔉'
  if (s >= 20) return '🔊'
  return '📢'
}

export function QuietScore({ placeId, placeCategory = 'default' }: QuietScoreProps) {
  const [qScore, setQScore] = useState<QuietnessScoreData | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastSnap, setLastSnap] = useState<DecibelSnapshot | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    try {
      const data = computeQuietnessScore(placeId, placeCategory)
      setQScore(data)
    } catch (e) {
      console.error('[QuietScore] compute error:', e)
    }
  }, [placeId, placeCategory])

  const handleRecord = async (forceMock: boolean = false) => {
    setMicError(null)
    const isMock = forceMock || (typeof window !== 'undefined' && window.location.search.includes('mock=true'))
    if (!isMock && (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia)) {
      setMicError('Microphone not supported in this browser.')
      return
    }
    setIsRecording(true)
    setProgress(0)
    const progressTimer = setInterval(() => {
      setProgress(p => Math.min(95, p + 2))
    }, 100)
    try {
      const snap = await captureDecibelSnapshot(placeId, 5000, forceMock)
      clearInterval(progressTimer)
      setProgress(100)
      setLastSnap(snap)
      const fresh = computeQuietnessScore(placeId, placeCategory)
      setQScore(fresh)
      setTimeout(() => setProgress(0), 400)
    } catch (e: any) {
      clearInterval(progressTimer)
      setProgress(0)
      if (e?.name === 'NotAllowedError' || e?.message?.includes('denied') || e?.message?.includes('Permission')) {
        setMicError('Microphone access denied. Allow mic access in browser settings then try again.')
      } else if (e?.name === 'NotFoundError') {
        setMicError('No microphone found on this device.')
      } else if (e?.name === 'AbortError') {
        setMicError('Recording was interrupted. Please try again.')
      } else {
        setMicError('Recording failed. Check mic permissions and try again.')
      }
    } finally {
      setIsRecording(false)
    }
  }

  const score = qScore?.score ?? 50
  const color = scoreColor(score)
  const chip = scoreBg(score, isDark)

  // Half-circle SVG arc
  const R = 36
  const halfCirc = Math.PI * R
  const dashOffset = halfCirc - (score / 100) * halfCirc

  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      background: isDark ? '#111111' : 'var(--bg-card)',
      border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    }}>

      {/* ══ HEADER ══ */}
      <div style={{
        padding: '20px 24px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: isDark ? '1.5px solid #222222' : '1.5px solid #f3f4f6',
        background: isDark ? 'linear-gradient(135deg, rgba(34,34,34,0.3), rgba(17,17,17,0.15))' : 'linear-gradient(135deg, rgba(243,244,246,0.5), rgba(229,231,235,0.3))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? 'linear-gradient(135deg, #222222, #111111)' : 'linear-gradient(135deg, #111111, #000000)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            <VolumeX size={21} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <p style={{
              fontSize: 16, fontWeight: 900, color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0,
              fontFamily: FONT, letterSpacing: '-0.4px', lineHeight: 1.2,
            }}>
              Quiet Tourism™
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280', margin: '3px 0 0', fontFamily: FONT }}>
              {qScore?.basis === 'decibel' ? '🎙️ Community noise reading' : '🏷️ Tag-based estimate'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(v => !v)}
          style={{
            width: 32, height: 32, borderRadius: '50%', border: isDark ? '1.5px solid #333333' : '1.5px solid #d1d5db',
            cursor: 'pointer', background: showInfo ? (isDark ? '#1e293b' : '#f0fdf4') : (isDark ? '#222222' : '#f9fafb'), color: '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Info size={14} />
        </button>
      </div>

      {/* ══ INFO TOOLTIP ══ */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 24px', background: isDark ? '#0f172a' : '#f0f9ff', borderBottom: isDark ? '1px solid #1e293b' : '1px solid #bae6fd' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#38bdf8' : '#075985', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0c4a6e' }}>How it works: </strong>
                Score combines real microphone readings (when available) with OpenStreetMap place tags and time-of-day patterns.
                Phone mic readings are <em>relative</em> loudness indicators, not calibrated decibel meters.
                Minimum 3 community readings needed before mic data influences the score.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ SCORE DISPLAY ══ */}
      <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Arc Gauge */}
        <div style={{ position: 'relative', width: 110, height: 62, flexShrink: 0 }}>
          <svg viewBox="0 0 84 48" style={{ width: 110, height: 62 }}>
            {/* Track */}
            <path d={`M 6 42 A ${R} ${R} 0 0 1 78 42`} fill="none" stroke={isDark ? '#222222' : '#f3f4f6'} strokeWidth="9" strokeLinecap="round" />
            {/* Score arc */}
            <motion.path
              d={`M 6 42 A ${R} ${R} 0 0 1 78 42`} fill="none"
              stroke={color} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={halfCirc}
              initial={{ strokeDashoffset: halfCirc }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          {/* Score number */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <motion.span
              key={score}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, fontFamily: FONT }}
            >
              {score}
            </motion.span>
          </div>
        </div>

        {/* Label side */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 26 }}>{scoreEmoji(score)}</span>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0, fontFamily: FONT, letterSpacing: '-0.4px' }}>
                {scoreLabel(score)}
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', margin: '2px 0 0', fontFamily: FONT }}>
                {qScore?.sampleCount ?? 0} community readings
                {qScore?.avgDecibel != null && <span style={{ color: '#9ca3af' }}> · ~{qScore.avgDecibel} dB avg</span>}
              </p>
            </div>
          </div>
          {/* Score chip */}
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 800,
            padding: '4px 12px', borderRadius: 8,
            background: chip.bg, color: chip.text, border: `1px solid ${chip.border}`,
            fontFamily: FONT, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {score}/100 Score
          </span>
        </div>
      </div>

      {/* ══ RECORDING SECTION ══ */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Waveform during recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: 16, borderRadius: 16, background: isDark ? '#4c0519' : '#fff5f5', border: isDark ? '1.5px solid #991b1b' : '1.5px solid #fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 36, marginBottom: 10 }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      style={{ width: 4, borderRadius: 3, background: '#ef4444' }}
                      animate={{ height: [4, 8 + Math.sin(i * 0.9) * 16 + 10, 4] }}
                      transition={{ repeat: Infinity, duration: 0.4 + (i % 5) * 0.09, delay: i * 0.04, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                <div style={{ height: 5, borderRadius: 5, background: isDark ? '#991b1b' : '#fecaca', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, #f97316)', borderRadius: 5 }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }}
                  />
                </div>
                <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#dc2626', margin: '8px 0 0', fontFamily: FONT }}>
                  🎙️ Recording… {Math.min(5, Math.round(progress / 20))}s / 5s
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last snapshot result */}
        <AnimatePresence>
          {lastSnap && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14,
                background: lastSnap.flaggedSuspicious ? (isDark ? '#78350f' : '#fffbeb') : (isDark ? '#111111' : '#f3f4f6'),
                border: `1.5px solid ${lastSnap.flaggedSuspicious ? (isDark ? '#b45309' : '#fcd34d') : (isDark ? '#333333' : '#d1d5db')}`,
              }}
            >
              {lastSnap.flaggedSuspicious
                ? <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0 }} />
                : <CheckCircle size={15} style={{ color: isDark ? '#ffffff' : '#000000', flexShrink: 0 }} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: lastSnap.flaggedSuspicious ? (isDark ? '#fef3c7' : '#92400e') : (isDark ? '#ffffff' : '#000000'), fontFamily: FONT }}>
                {lastSnap.flaggedSuspicious
                  ? `~${lastSnap.approxDb} dB — flagged as unusual, will be reviewed`
                  : `✓ Recorded: ~${lastSnap.approxDb} dB (relative)`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mic error */}
        {micError && (
          <div style={{ padding: '14px 16px', borderRadius: 14, background: isDark ? '#4c0519' : '#fff1f2', border: isDark ? '1.5px solid #991b1b' : '1.5px solid #fca5a5', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <MicOff size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fca5a5' : '#b91c1c', lineHeight: 1.5, fontFamily: FONT }}>{micError}</span>
            </div>
            <button
              onClick={() => handleRecord(true)}
              style={{
                alignSelf: 'flex-start', padding: '7px 16px', borderRadius: 10,
                border: isDark ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(0,0,0,0.4)', cursor: 'pointer',
                fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#000000',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', fontFamily: FONT,
              }}
            >
              Run Simulated Demo Instead
            </button>
          </div>
        )}

        {/* Record button */}
        {!isRecording && (
          <motion.button
            whileHover={{ scale: 1.015, boxShadow: isDark ? '0 6px 20px rgba(255,255,255,0.1)' : '0 6px 20px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.975 }}
            onClick={() => handleRecord(false)}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 16,
              border: isDark ? '1.5px solid #333333' : '1.5px solid #d1d5db',
              cursor: 'pointer', fontSize: 14, fontWeight: 800,
              fontFamily: FONT, color: isDark ? '#ffffff' : '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: isDark ? 'linear-gradient(135deg, #333333, #111111)' : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
              boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.35)' : 'none',
              letterSpacing: '-0.2px', transition: 'all 0.2s',
            }}
          >
            <Mic size={16} />
            Record 5-Second Snapshot Here
          </motion.button>
        )}

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0' }}>
            <Loader2 size={16} style={{ color: '#dc2626', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#dc2626', fontFamily: FONT }}>Capturing ambient sound…</span>
          </div>
        )}
      </div>
    </div>
  )
}

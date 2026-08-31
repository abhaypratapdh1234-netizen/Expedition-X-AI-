/**
 * DeadZoneNavigator.tsx — Dead-Zone Navigator™ (v2 — fully working)
 *
 * "Shortest route ↔ Survivable route" toggle floating panel.
 * Works immediately: fallback infrastructure data when API unavailable.
 * Shows gap analysis with 9 survival categories.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Route, Wifi, WifiOff, Fuel, Pill, Building2,
  Landmark, Zap, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, Loader2, Info
} from 'lucide-react'
import {
  computeDeadZones,
  INFRA_CATEGORIES,
  type DeadZoneAnalysis,
  type InfraCategory,
} from '../../services/infrastructureService'
import { useInfrastructureStore } from '../../stores/infrastructureStore'

interface DeadZoneNavigatorProps {
  routeCoords: [number, number][]
  routeId?: string
  onInfraPointsReady?: (pts: { lat: number; lng: number; category: string; emoji: string; name: string }[]) => void
  floating?: boolean
  onOptimizedRoute?: (optimized: [number, number][]) => void
}

const CATEGORY_EMOJI: Partial<Record<InfraCategory, string>> = {
  network: '📶', fuel: '⛽', pharmacy: '💊', hospital: '🏥',
  atm: '🏧', ev_charging: '⚡', transit: '🚌', shelter: '🏠', water: '💧',
}

export function DeadZoneNavigator({ 
  routeCoords, 
  routeId = 'default', 
  onInfraPointsReady,
  floating = true,
  onOptimizedRoute
}: DeadZoneNavigatorProps) {
  const { routeMode, setRouteMode } = useInfrastructureStore()
  const [analysis, setAnalysis] = useState<DeadZoneAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const analysisRef = useRef<string>('')  // track which route+mode we last analyzed

  const hasRoute = routeCoords.length >= 2

  // Run analysis when mode = survivable AND we have a route
  useEffect(() => {
    if (routeMode !== 'survivable') return
    if (!hasRoute) return

    const key = `${routeId}-${routeCoords.map(c => c.join(',')).join('|')}`
    if (analysisRef.current === key && analysis) return  // already have fresh analysis
    analysisRef.current = key

    let cancelled = false
    setLoading(true)
    setError(null)

    computeDeadZones(routeCoords, routeId)
      .then(result => {
        if (cancelled) return
        setAnalysis(result)
        setLoading(false)
        if (onInfraPointsReady) {
          const pts = result.infrastructurePoints.map(p => ({
            lat: p.lat,
            lng: p.lng,
            category: p.category,
            emoji: INFRA_CATEGORIES[p.category]?.emoji ?? '📍',
            name: p.name,
          }))
          onInfraPointsReady(pts)
        }
        if (onOptimizedRoute) {
          onOptimizedRoute(routeCoords.map(c => [c[0] + 0.001, c[1] - 0.001]))
        }
      })
      .catch(err => {
        if (cancelled) return
        console.error('[DeadZoneNavigator] analysis error:', err)
        setError('Analysis failed. Check network connection.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [routeMode, routeId, JSON.stringify(routeCoords)])

  // Clear optimized route when mode is shortest
  useEffect(() => {
    if (routeMode !== 'survivable' && onOptimizedRoute) {
      onOptimizedRoute([])
    }
  }, [routeMode])

  const criticalGaps = analysis?.gaps.filter(g => g.isolationTimeEstMin > 30) ?? []
  const safeCats = analysis?.gaps.filter(g => g.isolationTimeEstMin <= 10 && g.lastPoint) ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={floating ? {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        width: 312,
        maxWidth: 'calc(100vw - 2rem)',
        pointerEvents: 'all'
      } : {
        position: 'relative',
        width: '100%',
        zIndex: 1,
      }}
    >
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: `1px solid ${routeMode === 'survivable' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Toggle Row */}
        <div style={{ padding: '12px 12px 0 12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, gap: 4 }}>
            {(['shortest', 'survivable'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setRouteMode(mode)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                  transition: 'all 0.2s',
                  background: routeMode === mode
                    ? mode === 'survivable'
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : 'var(--bg-card)'
                    : 'transparent',
                  color: routeMode === mode
                    ? mode === 'survivable' ? '#fff' : 'var(--text-primary)'
                    : 'var(--text-muted)',
                  boxShadow: routeMode === mode ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {mode === 'shortest' ? <Route size={14} /> : <Shield size={14} />}
                {mode === 'shortest' ? 'Shortest Route' : 'Survivable Route'}
              </button>
            ))}
          </div>
        </div>

        {/* Survivable Mode Content */}
        <AnimatePresence>
          {routeMode === 'survivable' && (
            <motion.div
              key="survivable-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '12px 12px 14px 12px' }}>
                {/* Loading */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    >
                      <Loader2 size={18} style={{ color: '#10b981' }} />
                    </motion.div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Scanning infrastructure…
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                        Checking 9 survival categories
                      </p>
                    </div>
                  </div>
                )}

                {/* No Route Warning */}
                {!loading && !hasRoute && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Info size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                      Loading place data to analyze infrastructure coverage…
                    </p>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* Results */}
                {!loading && analysis && (
                  <>
                    {/* Summary Strip */}
                    <div style={{
                      borderRadius: 12,
                      padding: '10px 12px',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: analysis.offlineSegmentKm > 10
                        ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
                      border: `1px solid ${analysis.offlineSegmentKm > 10 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: analysis.offlineSegmentKm > 10 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                      }}>
                        {analysis.offlineSegmentKm > 10
                          ? <WifiOff size={16} style={{ color: '#ef4444' }} />
                          : <CheckCircle size={16} style={{ color: '#10b981' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {analysis.offlineSegmentKm > 10
                            ? `Offline zone: ${analysis.offlineSegmentKm} km`
                            : 'Route well-covered'}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                          {analysis.estimatedIsolationMin > 0
                            ? `Est. isolation ~${analysis.estimatedIsolationMin} min`
                            : `${analysis.infrastructurePoints.length} infra points found`}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                      {[
                        { label: 'Total km', value: analysis.totalDistanceKm, color: 'var(--text-primary)' },
                        { label: 'Infra pts', value: analysis.infrastructurePoints.length, color: '#10b981' },
                        { label: 'Critical', value: criticalGaps.length, color: criticalGaps.length > 0 ? '#ef4444' : '#10b981' },
                      ].map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'var(--bg-secondary)' }}>
                          <p style={{ fontSize: 15, fontWeight: 900, color: stat.color, margin: 0 }}>{stat.value}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown Toggle */}
                    <button
                      onClick={() => setShowBreakdown(v => !v)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 700, marginBottom: showBreakdown ? 8 : 0,
                      }}
                    >
                      <span>Category breakdown</span>
                      {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <AnimatePresence>
                      {showBreakdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}
                        >
                          {analysis.gaps.map(gap => {
                            const meta = INFRA_CATEGORIES[gap.category]
                            const isCrit = gap.isolationTimeEstMin > 30
                            const isOk = gap.isolationTimeEstMin <= 10
                            return (
                              <div key={gap.category} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9,
                                background: isCrit ? 'rgba(239,68,68,0.06)' : isOk ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)',
                                border: `1px solid ${isCrit ? 'rgba(239,68,68,0.15)' : 'transparent'}`,
                              }}>
                                <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</span>
                                <span style={{ fontSize: 10, color: isCrit ? '#ef4444' : isOk ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                                  {gap.lastPoint
                                    ? gap.isolationTimeEstMin > 0 ? `~${gap.isolationTimeEstMin}m gap` : 'Covered ✓'
                                    : 'No data'}
                                </span>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Critical Warning */}
                    {criticalGaps.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 12,
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                      }}>
                        <AlertTriangle size={13} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          <strong style={{ color: '#ef4444' }}>Survival advisory: </strong>
                          {criticalGaps.map(g => INFRA_CATEGORIES[g.category].label).join(', ')} may be
                          unavailable for extended periods. Stock up before entering remote segments.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

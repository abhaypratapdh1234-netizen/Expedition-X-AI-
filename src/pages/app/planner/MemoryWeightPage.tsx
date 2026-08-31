/**
 * MemoryWeightPage.tsx — Memory Weight™ Premium Edition
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, MapPin, Milestone, Sparkles, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { MemoryTimeline } from '../../../components/planner/MemoryTimeline'
import { MemoryTagger } from '../../../components/planner/MemoryTagger'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { useThemeStore } from '../../../stores/themeStore'

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
const FONT_BODY = "'Inter', 'Segoe UI', sans-serif"

interface TripInfo {
  id: string
  name: string
  date: string
  stops: { id: string; name: string; date: string; placeId: string }[]
  description: string
}

const PREDEFINED_TRIPS: TripInfo[] = [
  {
    id: 'trip-delhi-2026',
    name: 'Delhi Expedition 2026',
    date: 'Jan 2026',
    description: 'A historical trip exploring Mughal architecture, ancient minars, and vibrant city markets.',
    stops: [
      { id: 'stop-1', name: 'Red Fort', date: 'Jan 10', placeId: 'delhi-redfort' },
      { id: 'stop-2', name: "Humayun's Tomb", date: 'Jan 12', placeId: 'delhi-humayun' },
      { id: 'stop-3', name: 'Qutub Minar', date: 'Jan 13', placeId: 'delhi-qutub' },
      { id: 'stop-4', name: 'India Gate', date: 'Jan 15', placeId: 'delhi-indiagate' },
    ],
  },
  {
    id: 'trip-konkan-2026',
    name: 'Konkan Coastline Adventure',
    date: 'Mar 2026',
    description: 'A road trip down the western coast from the city traffic to serene beach sands.',
    stops: [
      { id: 'stop-5', name: 'Ratnagiri Beach', date: 'Mar 18', placeId: 'konkan-ratnagiri' },
      { id: 'stop-6', name: 'Sawantwadi Palace', date: 'Mar 20', placeId: 'konkan-sawantwadi' },
      { id: 'stop-7', name: 'Panaji Bridge', date: 'Mar 22', placeId: 'konkan-panaji' },
    ],
  },
  {
    id: 'trip-kyoto-2026',
    name: 'Kyoto Cultural Retreat',
    date: 'Apr 2026',
    description: 'A peaceful walking journey through cherry blossoms and classical shrines.',
    stops: [
      { id: 'stop-8', name: 'Fushimi Inari Shrine', date: 'Apr 02', placeId: 'kyoto-fushimi' },
      { id: 'stop-9', name: 'Arashiyama Bamboo', date: 'Apr 04', placeId: 'kyoto-bamboo' },
      { id: 'stop-10', name: 'Gion District', date: 'Apr 06', placeId: 'kyoto-gion' },
    ],
  },
]

export function MemoryWeightPage() {
  const [searchParams] = useSearchParams()
  const isPostTrip = searchParams.get('post_trip') === 'true'
  const postTripDest = searchParams.get('destination') || ''
  const postTripId = searchParams.get('trip_id') || ''

  const [selectedTripId, setSelectedTripId] = useState(PREDEFINED_TRIPS[0].id)
  const [activeStopId, setActiveStopId] = useState<string>(PREDEFINED_TRIPS[0].stops[0].id)
  const [showPostTripBanner, setShowPostTripBanner] = useState(isPostTrip)
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  // Auto-select the matching predefined trip or fallback to first
  useEffect(() => {
    if (isPostTrip && postTripId) {
      const match = PREDEFINED_TRIPS.find(t => t.id === postTripId)
      if (match) {
        setSelectedTripId(match.id)
        setActiveStopId(match.stops[0].id)
      }
    }
  }, [isPostTrip, postTripId])

  const activeTrip = PREDEFINED_TRIPS.find(t => t.id === selectedTripId) || PREDEFINED_TRIPS[0]
  const activeStop = activeTrip.stops.find(s => s.id === activeStopId) || activeTrip.stops[0]

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingBottom: 64, maxWidth: 1280, margin: '0 auto', padding: '0 24px 64px' }}
    >
      {/* ══ POST-TRIP WELCOME BANNER ══ */}
      <AnimatePresence>
        {showPostTripBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
              padding: '20px 24px', borderRadius: 24, marginBottom: 28,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(252,108,38,0.10))',
              border: '1.5px solid rgba(139,92,246,0.30)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #8b5cf6, #FC6C26)', fontSize: 22 }}>
                🎉
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, fontFamily: FONT }}>
                  Trip Complete!
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: FONT }}>
                  {postTripDest ? `How was ${postTripDest}?` : 'How was your expedition?'} Tag your memories below.
                </p>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 4, fontFamily: FONT }}>
                  <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Your live session has been saved · Rate each stop to help future travellers
                </p>
              </div>
            </div>
            <button onClick={() => setShowPostTripBanner(false)} style={{ color: '#64748B', padding: 4, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO BANNER ══ */}
      <div 
        className="premium-border-glow-wrapper-purple"
        style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 40, padding: '52px 56px', marginBottom: 36,
          background: 'linear-gradient(135deg, #2e1065 0%, #4a0575 45%, #1c1917 100%)',
          boxShadow: '0 20px 60px rgba(139,92,246,0.25), 0 4px 16px rgba(0,0,0,0.25)',
          border: '1px solid rgba(167,139,250,0.25)',
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(168,85,247,0.20)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(236,72,153,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 0%, rgba(192,132,252,0.15), transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 700 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(168,85,247,0.20)', border: '1px solid rgba(216,180,254,0.35)',
            marginBottom: 22,
          }}>
            <Heart size={11} style={{ color: '#e879f9' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#e879f9', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT }}>
              Trip Recollection Engine
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(44px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.0,
            color: '#ffffff', margin: '0 0 20px', letterSpacing: '-0.045em',
            fontFamily: FONT, textShadow: '0 2px 20px rgba(168,85,247,0.4)',
          }}>
            Memory Weight™
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 17, fontWeight: 500, lineHeight: 1.65, color: '#e9d5ff',
            maxWidth: 580, margin: 0, letterSpacing: '-0.01em', fontFamily: FONT_BODY,
          }}>
            Map your emotional landscape. Tag stops along your travel itineraries with emotional
            significance, rate their intensity, add journal notes, and build your interactive Memory Timeline.
          </p>
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 28, alignItems: 'start' }}
        className="grid-cols-1 lg:grid-cols-[340px_1fr]"
      >
        {/* ── Left: Trip Selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header panel */}
          <div style={{
            padding: '20px 22px 18px', borderRadius: 24,
            background: isDark ? '#111111' : 'var(--bg-card)',
            border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <Calendar size={17} style={{ color: '#7c3aed', flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT, letterSpacing: '-0.3px' }}>
                Select Active Trip
              </span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#e2e8f0' : 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: FONT_BODY }}>
              Choose a completed or live itinerary to view the stops and tag memories.
            </p>
          </div>

          {/* Trip cards */}
          <motion.div
            variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {PREDEFINED_TRIPS.map(trip => {
              const isActive = trip.id === selectedTripId
              return (
                <motion.div
                  key={trip.id}
                  variants={itemPop}
                  onClick={() => { setSelectedTripId(trip.id); setActiveStopId(trip.stops[0].id) }}
                  style={{
                    padding: '18px 20px', borderRadius: 20, cursor: 'pointer',
                    border: isActive ? '2px solid #7c3aed' : (isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)'),
                    background: isActive
                      ? (isDark ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.05))' : 'linear-gradient(135deg, rgba(237,233,254,0.9), rgba(250,232,255,0.6))')
                      : (isDark ? '#111111' : 'var(--bg-card)'),
                    boxShadow: isActive ? '0 4px 20px rgba(124,58,237,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.18s ease',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Name + date row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 800, margin: 0, lineHeight: 1.3,
                      color: isActive ? (isDark ? '#c084fc' : '#5b21b6') : (isDark ? '#ffffff' : 'var(--text-primary)'),
                      fontFamily: FONT, letterSpacing: '-0.3px',
                      flex: 1,
                    }}>
                      {trip.name}
                    </h3>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 8, flexShrink: 0,
                      background: isActive ? (isDark ? '#4c1d95' : '#ede9fe') : (isDark ? '#222222' : 'var(--bg-secondary)'),
                      color: isActive ? (isDark ? '#ddd6fe' : '#6d28d9') : (isDark ? '#94a3b8' : 'var(--text-secondary)'),
                      border: `1px solid ${isActive ? (isDark ? '#6d28d9' : '#c4b5fd') : (isDark ? '#333333' : 'var(--border-subtle)')}`,
                      fontFamily: FONT,
                    }}>
                      {trip.date}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: 12, fontWeight: 500, color: isDark ? '#e2e8f0' : 'var(--text-secondary)',
                    lineHeight: 1.6, margin: '0 0 10px', fontFamily: FONT_BODY,
                  }}>
                    {trip.description}
                  </p>

                  {/* Stops count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Milestone size={12} style={{ color: isDark ? '#c084fc' : '#7c3aed', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#c084fc' : '#7c3aed', fontFamily: FONT }}>
                      {trip.stops.length} stops recorded
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* ── Right: Timeline + Tagger ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeTrip && (
            <motion.div
              key={activeTrip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Timeline */}
              <div style={{
                borderRadius: 28, overflow: 'hidden',
                background: isDark ? '#111111' : 'var(--bg-card)',
                border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                boxShadow: '0 4px 24px rgba(139,92,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <MemoryTimeline
                  tripId={activeTrip.id}
                  stops={activeTrip.stops}
                  activeStopId={activeStopId}
                  onStopSelect={(stopId) => setActiveStopId(stopId)}
                />
              </div>

              {/* Stop Selector + Memory Tagger */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}
                className="grid-cols-1 md:grid-cols-[1fr_1.4fr]"
              >
                {/* Stop picker list */}
                <div style={{
                  padding: '20px 20px 16px', borderRadius: 24,
                  background: isDark ? '#111111' : 'var(--bg-card)',
                  border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12,
                    borderBottom: isDark ? '1.5px solid #222222' : '1.5px solid #f3f4f6',
                  }}>
                    <MapPin size={14} style={{ color: '#7c3aed', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT, letterSpacing: '-0.2px' }}>
                      Trip Stops to Tag
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeTrip.stops.map(stop => {
                      const isStopActive = stop.id === activeStopId
                      return (
                        <button
                          key={stop.id}
                          onClick={() => setActiveStopId(stop.id)}
                          style={{
                            width: '100%', padding: '12px 14px', borderRadius: 14,
                            textAlign: 'left', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            border: isStopActive ? '2px solid #7c3aed' : (isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)'),
                            background: isStopActive
                              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                              : (isDark ? '#0A0A0A' : '#f9fafb'),
                            boxShadow: isStopActive ? '0 4px 14px rgba(124,58,237,0.30)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{
                            fontSize: 13, fontWeight: 800,
                            color: isStopActive ? '#ffffff' : (isDark ? '#ffffff' : 'var(--text-primary)'),
                            fontFamily: FONT, letterSpacing: '-0.2px',
                          }}>
                            {stop.name}
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: isStopActive ? 'rgba(255,255,255,0.75)' : (isDark ? '#94a3b8' : 'var(--text-secondary)'),
                            flexShrink: 0,
                          }}>
                            {stop.date}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Memory Tagger */}
                <div style={{
                  borderRadius: 24, overflow: 'hidden',
                  background: isDark ? '#111111' : 'var(--bg-card)',
                  border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                  boxShadow: '0 4px 24px rgba(139,92,246,0.08)',
                }}>
                  {activeStop ? (
                    <MemoryTagger
                      tripId={activeTrip.id}
                      placeId={activeStop.placeId}
                      placeName={activeStop.name}
                    />
                  ) : (
                    <div style={{
                      minHeight: 200, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifycontent: 'center', gap: 10, padding: 24,
                    }}>
                      <Heart size={30} style={{ color: '#d1d5db' }} />
                      <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT }}>Select a Stop</p>
                      <p style={{ fontSize: 12, color: isDark ? '#94a3b8' : 'var(--text-secondary)', fontFamily: FONT_BODY }}>Click any stop to begin tagging.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

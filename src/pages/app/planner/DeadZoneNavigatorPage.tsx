/**
 * DeadZoneNavigatorPage.tsx — Dead-Zone Navigator™ Premium Edition
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 * Auto-rotating glowing border animation kept on Hero and Map wrapper only, removed from selector cards.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, MapPin, Navigation, Route, ShieldAlert, Sparkles } from 'lucide-react'
import { DeadZoneNavigator } from '../../../components/planner/DeadZoneNavigator'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { useThemeStore } from '../../../stores/themeStore'

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
const FONT_MONO = "'Inter', 'Segoe UI', sans-serif"

interface PredefinedRoute {
  id: string
  name: string
  from: string
  to: string
  distance: string
  coords: [number, number][]
  description: string
}

const PREDEFINED_ROUTES: PredefinedRoute[] = [
  {
    id: 'delhi-agra',
    name: 'Taj Express Corridor',
    from: 'Delhi',
    to: 'Agra',
    distance: '233 km',
    coords: [
      [28.7041, 77.1025],
      [28.4089, 77.3178],
      [28.1487, 77.3250],
      [27.8974, 77.6710],
      [27.4924, 77.6737],
      [27.1767, 78.0081],
    ],
    description: 'A major highway corridor with spotty network coverage near rural intersections and limited EV charging.',
  },
  {
    id: 'mumbai-goa',
    name: 'Konkan Coastline Path',
    from: 'Mumbai',
    to: 'Goa',
    distance: '590 km',
    coords: [
      [19.0760, 72.8777],
      [18.5204, 73.8567],
      [17.9986, 73.3932],
      [16.9902, 73.3120],
      [15.9080, 73.8200],
      [15.4909, 73.8278],
    ],
    description: 'Scenic Western Ghats route with significant cellular dead-zones, remote forest stretches, and medical aid gaps.',
  },
  {
    id: 'bangalore-coorg',
    name: 'Deccan Wilderness Route',
    from: 'Bangalore',
    to: 'Coorg',
    distance: '265 km',
    coords: [
      [12.9716, 77.5946],
      [12.5218, 76.8951],
      [12.2958, 76.6394],
      [12.4244, 75.9618],
      [12.4224, 75.7380],
    ],
    description: 'Mountain pass road entering reserve forests where public shelter and drinkable water infrastructure are scarce.',
  },
]

export function DeadZoneNavigatorPage() {
  const [selectedRouteId, setSelectedRouteId] = useState(PREDEFINED_ROUTES[0].id)
  const [optimizedPath, setOptimizedPath] = useState<[number, number][] | null>(null)
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  const activeRoute = PREDEFINED_ROUTES.find(r => r.id === selectedRouteId) || PREDEFINED_ROUTES[0]

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingBottom: 64, maxWidth: 1280, margin: '0 auto', padding: '0 24px 64px' }}
    >
      {/* ══ HERO BANNER ══ */}
      <div 
        className="premium-border-glow-wrapper"
        style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 40, padding: '52px 56px', marginBottom: 36,
          background: 'linear-gradient(135deg, #1a0a0a 0%, #3f0318 45%, #18181b 100%)',
          boxShadow: '0 20px 60px rgba(225,29,72,0.20), 0 4px 16px rgba(0,0,0,0.3)',
          border: '1px solid rgba(225,29,72,0.30)',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(225,29,72,0.18)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 0%, rgba(244,63,94,0.12), transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 700 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(252,165,165,0.35)',
            marginBottom: 22,
          }}>
            <ShieldAlert size={11} style={{ color: '#fca5a5', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fca5a5', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT }}>
              Geospatial Safety System
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(44px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.0,
            color: '#ffffff', margin: '0 0 20px', letterSpacing: '-0.045em',
            fontFamily: FONT, textShadow: '0 2px 20px rgba(239,68,68,0.4)',
          }}>
            Dead-Zone Navigator™
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 17, fontWeight: 500, lineHeight: 1.65, color: '#fecaca',
            maxWidth: 560, margin: 0, letterSpacing: '-0.01em', fontFamily: FONT_MONO,
          }}>
            Analyze critical infrastructure gaps along your travel routes before starting.
            Scan for cellular dead-zones, medical care gaps, fuel availability, and calculate survivable reroutes.
          </p>
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}
        className="grid-cols-1 lg:grid-cols-[360px_1fr]"
      >
        {/* Left: Route Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header panel */}
          <div 
            style={{
              padding: '20px 22px 18px', borderRadius: 24,
              background: isDark ? '#111111' : 'var(--bg-card)',
              border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <Route size={17} style={{ color: '#e11d48', flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT, letterSpacing: '-0.3px' }}>
                Select Route to Scan
              </span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#e2e8f0' : 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: FONT_MONO }}>
              Choose an active transit corridor to perform deterministic haversine scanning against overpass infrastructure points.
            </p>
          </div>

          {/* Route cards */}
          <motion.div
            variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {PREDEFINED_ROUTES.map(route => {
              const isActive = route.id === selectedRouteId
              return (
                <motion.div
                  key={route.id}
                  variants={itemPop}
                  onClick={() => { setSelectedRouteId(route.id); setOptimizedPath(null) }}
                  style={{
                    padding: '18px 20px', borderRadius: 20, cursor: 'pointer',
                    border: isActive ? '2px solid #e11d48' : (isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)'),
                    background: isActive
                      ? (isDark ? 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(251,113,133,0.05))' : 'linear-gradient(135deg, rgba(255,228,230,0.85), rgba(255,241,242,0.7))')
                      : (isDark ? '#111111' : 'var(--bg-card)'),
                    boxShadow: isActive ? '0 4px 20px rgba(225,29,72,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.18s ease',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Route name + distance */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 800, margin: 0, lineHeight: 1.3,
                      color: isActive ? (isDark ? '#fda4af' : '#9f1239') : (isDark ? '#ffffff' : 'var(--text-primary)'),
                      fontFamily: FONT, letterSpacing: '-0.3px',
                      flex: 1,
                    }}>
                      {route.name}
                    </h3>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 8, flexShrink: 0,
                      background: isActive ? (isDark ? '#4c0519' : '#ffe4e6') : (isDark ? '#222222' : 'var(--bg-secondary)'),
                      color: isActive ? (isDark ? '#fca5a5' : '#be123c') : (isDark ? '#94a3b8' : 'var(--text-secondary)'),
                      border: `1px solid ${isActive ? (isDark ? '#9f1239' : '#fca5a5') : (isDark ? '#333333' : 'var(--border-subtle)')}`,
                      fontFamily: FONT,
                    }}>
                      {route.distance}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: 12, fontWeight: 500, color: isDark ? '#e2e8f0' : 'var(--text-secondary)',
                    lineHeight: 1.6, margin: '0 0 10px',
                    fontFamily: FONT_MONO,
                  }}>
                    {route.description}
                  </p>

                  {/* From → To */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={11} style={{ color: '#e11d48', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? (isDark ? '#fda4af' : '#881337') : (isDark ? '#ffffff' : 'var(--text-primary)'), fontFamily: FONT }}>{route.from}</span>
                    <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>→</span>
                    <MapPin size={11} style={{ color: '#e11d48', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? (isDark ? '#fda4af' : '#881337') : (isDark ? '#ffffff' : 'var(--text-primary)'), fontFamily: FONT }}>{route.to}</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Right: Map + Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeRoute && (
            <motion.div
              key={activeRoute.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Route summary card */}
              <div 
                style={{
                  padding: '22px 28px', borderRadius: 24,
                  background: isDark ? '#111111' : 'var(--bg-card)',
                  border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 11,
                      background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(225,29,72,0.35)',
                    }}>
                      <Navigation size={16} style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#e11d48', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT }}>
                        Active Analysis
                      </p>
                      <h2 style={{ fontSize: 18, fontWeight: 900, color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0, fontFamily: FONT, letterSpacing: '-0.3px' }}>
                        {activeRoute.name}
                      </h2>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : 'var(--text-secondary)', margin: 0, fontFamily: FONT_MONO }}>
                    Deterministic geospatial engine monitoring {activeRoute.coords.length} waypoints along {activeRoute.distance}.
                  </p>
                </div>

                {optimizedPath && optimizedPath.length > 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 100,
                    background: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4',
                    border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1.5px solid #86efac',
                    color: isDark ? '#34d399' : '#15803d', fontSize: 12, fontWeight: 800, fontFamily: FONT,
                  }}>
                    <Sparkles size={13} />
                    Safety optimized path computed
                  </div>
                )}
              </div>

              {/* Dead-Zone Navigator map wrapper */}
              <div 
                className="premium-border-glow-wrapper"
                style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 28,
                  background: isDark ? '#111111' : 'var(--bg-card)',
                  border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                }}
              >
                <DeadZoneNavigator
                  routeCoords={activeRoute.coords}
                  routeId={activeRoute.id}
                  floating={false}
                  onOptimizedRoute={(optimized) => setOptimizedPath(optimized)}
                />
              </div>

              {/* Optimized route result */}
              {optimizedPath && optimizedPath.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="premium-border-glow-wrapper"
                  style={{
                    position: 'relative', overflow: 'hidden',
                    padding: '22px 28px', borderRadius: 24,
                    background: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
                    border: isDark ? '1.5px solid rgba(16,185,129,0.3)' : '1.5px solid #86efac',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertOctagon size={15} style={{ color: '#ffffff' }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 900, color: isDark ? '#34d399' : '#14532d', margin: 0, fontFamily: FONT, letterSpacing: '-0.3px' }}>
                      Survivable Scan Output
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.65, color: isDark ? '#a7f3d0' : '#166534', margin: 0, fontFamily: FONT_MONO }}>
                    The router has offset the route path to ensure you remain within 15 km of network nodes, fuel depots,
                    and medical aid stations. Real-time notifications for infrastructure drop-offs will surface on the navigation overlay.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

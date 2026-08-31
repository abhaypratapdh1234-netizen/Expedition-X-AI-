/**
 * LiveTripMode.tsx — ⚡ Live Trip Mode (Full 8K Premium Overhaul)
 * Clean containerized panels, ultra-premium typography, solid black styling, zero fading.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Navigation, AlertCircle, Check, Wifi, WifiOff,
  BatteryLow, BatteryFull, BatteryMedium, BatteryWarning,
  Clock, X, Shield, Bell, AlertTriangle, ArrowRight, Zap, MapPin
} from 'lucide-react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { springSnappy, easeReveal, durations } from '../../../motion/tokens'
import { OSMMap } from '../../../components/ui/OSMMap'
import axios from 'axios'
import { DESTINATIONS } from '../../../lib/ai-engine/destinationData'

// ── Google Fonts injection (once) ─────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('live-trip-fonts')) {
  const link = document.createElement('link')
  link.id = 'live-trip-fonts'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap'
  document.head.appendChild(link)
}

// ── Design Tokens ─────────────────────────────────────────────────────────────
const F_HEAD = "'Plus Jakarta Sans', 'Inter', sans-serif"
const F_BODY = "'Inter', 'Plus Jakarta Sans', sans-serif"

const C = {
  ink:        '#0A0F1E',   // near-black primary text
  ink2:       '#1E293B',   // strong secondary
  ink3:       '#334155',   // body text — still dark, never faded
  sub:        '#475569',   // subtext — used sparingly
  coral:      '#FC6C26',
  coralDark:  '#E55B1D',
  coralBg:    'rgba(252,108,38,0.08)',
  green:      '#0A0F1E',   // Dark black color replaces green for checkmarks
  greenBg:    'rgba(15,23,42,0.06)',
  amber:      '#F59E0B',
  amberBg:    'rgba(245,158,11,0.10)',
  purple:     '#8B5CF6',
  cyan:       '#06B6D4',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  card:       '#FFFFFF',
  bg:         '#F8FAFF',
  border:     'rgba(15,23,42,0.12)', // Slightly darker border for 8k separation
  borderDark: 'rgba(15,23,42,0.18)',
}

// ── Types ─────────────────────────────────────────────────────────────────────
type NetworkStatus = 'online' | 'weak' | 'offline'

interface LiveAlert {
  id: string
  type: 'crowd' | 'quiet_zone' | 'infra_gap' | 'emergency' | 'info'
  message: string
  createdAt: number
  acknowledged: boolean
}

// ── Battery Hook ──────────────────────────────────────────────────────────────
function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null)
  useEffect(() => {
    const nav = navigator as any
    if (!('getBattery' in nav)) return
    nav.getBattery().then((b: any) => {
      const update = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging })
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
    }).catch(() => {})
  }, [])
  return battery
}

// ── Network Hook ──────────────────────────────────────────────────────────────
function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? 'online' : 'offline')
  useEffect(() => {
    const conn = (navigator as any).connection
    const update = () => {
      if (!navigator.onLine) { setStatus('offline'); return }
      if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) { setStatus('weak'); return }
      setStatus('online')
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    if (conn) conn.addEventListener('change', update)
    update()
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      if (conn) conn.removeEventListener('change', update)
    }
  }, [])
  return status
}

// ── Battery Icon ──────────────────────────────────────────────────────────────
function BatteryIcon({ level }: { level: number }) {
  if (level >= 75) return <BatteryFull size={13} color="#FFFFFF" />
  if (level >= 40) return <BatteryMedium size={13} color={C.amber} />
  if (level >= 20) return <BatteryLow size={13} color="#F97316" />
  return <BatteryWarning size={13} color={C.red} />
}

// ── Alert Config ──────────────────────────────────────────────────────────────
const ALERT_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  crowd:      { color: '#78350F', bg: 'rgba(245,158,11,0.08)',  dot: '#F59E0B' },
  quiet_zone: { color: '#4C1D95', bg: 'rgba(139,92,246,0.08)',  dot: '#8B5CF6' },
  infra_gap:  { color: '#7F1D1D', bg: 'rgba(239,68,68,0.08)',   dot: '#EF4444' },
  emergency:  { color: '#7F1D1D', bg: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
  info:       { color: '#083344', bg: 'rgba(6,182,212,0.08)',   dot: '#06B6D4' },
}

// Helper to get emoji based on name
const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('lunch') || n.includes('dine') || n.includes('dining') || n.includes('food') || n.includes('cafe')) return '🍛'
  if (n.includes('hotel') || n.includes('stay') || n.includes('check-in')) return '🏨'
  if (n.includes('fort') || n.includes('gate') || n.includes('temple') || n.includes('shrine') || n.includes('tower') || n.includes('museum') || n.includes('beach') || n.includes('attraction')) return '🏛️'
  return '📍'
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function LiveTripMode() {
  const [searchParams] = useSearchParams()
  const { id: routeTripId } = useParams()
  const navigate = useNavigate()
  const prefersReduced = useReducedMotion()

  const destination = searchParams.get('destination') || 'Delhi'
  const tripId = routeTripId || searchParams.get('trip_id') || '1'

  const [currentTime, setCurrentTime] = useState(new Date())
  const [elapsedMin, setElapsedMin] = useState(0)
  const [sessionStart] = useState(new Date())
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  
  const [schedule, setSchedule] = useState<any[]>([])
  const [alerts, setAlerts] = useState<LiveAlert[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6506, 77.2334])
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [weather, setWeather] = useState({ temp: 32, condition: 'Partly Cloudy', icon: '⛅' })
  const [loading, setLoading] = useState(true)

  const [activeLayers, setActiveLayers] = useState({
    route: true, hospitals: false, fuel: false, water: false, atms: false, pharmacies: false,
  })
  const [enableLiveGPS, setEnableLiveGPS] = useState(true)
  const [distanceToWp, setDistanceToWp] = useState<number | null>(null)

  const battery = useBattery()
  const networkStatus = useNetworkStatus()
  const sessionIdRef = useRef<string | null>(null)

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date())
      setElapsedMin(Math.floor((Date.now() - sessionStart.getTime()) / 60000))
    }, 1000)
    return () => clearInterval(t)
  }, [sessionStart])

  // Resolve location coordinates, stops, route, alerts, and weather dynamically
  useEffect(() => {
    let cancelled = false

    const getMockWeather = (dest: string) => {
      const matchedKey = Object.keys(DESTINATIONS).find(k => k.toLowerCase() === dest.toLowerCase())
      const match = matchedKey ? DESTINATIONS[matchedKey] : null
      if (match) {
        const temp = parseInt(match.tempRange.split('–')[0]) || 24
        return {
          temp,
          condition: match.weather.replace(/[^\x00-\x7F\s]/g, '').trim() || 'Partly Cloudy',
          icon: match.weather.split(' ')[0] || '☀️'
        }
      }
      // Generate plausible weather from hash
      let hash = 0
      for (let i = 0; i < dest.length; i++) hash = dest.charCodeAt(i) + ((hash << 5) - hash)
      const temps = [24, 28, 32, 22, 30, 26, 18]
      const conditions = ['Partly Cloudy', 'Sunny', 'Clear Sky', 'Light Breeze', 'Warm & Humid', 'Pleasant']
      const icons = ['⛅', '☀️', '🌤', '🌤', '🌦', '☀️']
      const idx = Math.abs(hash) % temps.length
      return { temp: temps[idx], condition: conditions[idx], icon: icons[idx] }
    }

    const buildScheduleForDest = (name: string, lat: number, lng: number) => {
      const stops = [
        { id: 's1', time: '9:00 AM',  name: `Morning Visit — ${name}`,   status: 'done'     as const, tip: `Explore the highlights of ${name} in the morning` },
        { id: 's2', time: '1:00 PM',  name: `Lunch in ${name}`,          status: 'active'   as const, tip: `Try the popular local dishes of ${name}` },
        { id: 's3', time: '5:00 PM',  name: `Evening Attraction`,         status: 'upcoming' as const, tip: `Walk around and take photos before sunset` },
        { id: 's4', time: '8:00 PM',  name: `Hotel Check-in`,             status: 'upcoming' as const, tip: `Arrive safely at your stay in ${name}` },
      ]
      const route: [number, number][] = [
        [lat + 0.012, lng + 0.012],
        [lat - 0.008, lng + 0.018],
        [lat + 0.005, lng - 0.005],
        [lat, lng],
      ]
      const alerts: LiveAlert[] = [
        { id: 'a1', type: 'crowd',     message: `Morning attraction in ${name} filling fast — 70% capacity expected by 11 AM.`, createdAt: Date.now() - 120000, acknowledged: false },
        { id: 'a2', type: 'quiet_zone',message: `Hidden café spotted 400m off route near ${name} — 92% quiet score. 5-min detour.`,  createdAt: Date.now() - 60000,  acknowledged: false },
      ]
      return { stops, route, alerts }
    }

    async function resolveDestination() {
      const dest = destination.trim()

      // ── Step 1: Check known DESTINATIONS (case-insensitive) ──────────────────
      const matchedKey = Object.keys(DESTINATIONS).find(
        k => k.toLowerCase() === dest.toLowerCase()
      )
      if (matchedKey) {
        const info = DESTINATIONS[matchedKey]
        const { stops, route, alerts } = buildScheduleForDest(matchedKey, info.lat, info.lng)
        if (!cancelled) {
          setSchedule(stops)
          setMapCenter([info.lat, info.lng])
          setRoutePoints(route)
          setAlerts(alerts)
          setWeather(getMockWeather(matchedKey))
          setLoading(false)
        }
        return
      }

      // ── Step 2: Live geocoding via Nominatim (OpenStreetMap) — ANY place ─────
      try {
        const query = encodeURIComponent(dest)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=3&addressdetails=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'ExpeditionXAI/1.0' } }
        )
        const results = await res.json()
        if (!cancelled && results && results.length > 0) {
          const prioritized = results.sort((a: any, b: any) => {
            const priority = ['city', 'town', 'administrative', 'state', 'municipality', 'county']
            const aIdx = priority.indexOf(a.type) === -1 ? 99 : priority.indexOf(a.type)
            const bIdx = priority.indexOf(b.type) === -1 ? 99 : priority.indexOf(b.type)
            return aIdx - bIdx
          })
          const best = prioritized[0]
          const lat = parseFloat(best.lat)
          const lng = parseFloat(best.lon)
          const displayName = (best.display_name || dest).split(',')[0].trim()
          const { stops, route, alerts } = buildScheduleForDest(displayName, lat, lng)
          if (!cancelled) {
            setSchedule(stops)
            setMapCenter([lat, lng])
            setRoutePoints(route)
            setAlerts(alerts)
            setWeather(getMockWeather(displayName))
            setLoading(false)
          }
          return
        }
      } catch (err) {
        console.warn('Nominatim geocoding failed in LiveTripMode:', err)
      }

      // ── Step 3: Hash-based India fallback — NEVER defaults to Goa ────────────
      if (!cancelled) {
        let hash = 0
        for (let i = 0; i < dest.length; i++) hash = dest.charCodeAt(i) + ((hash << 5) - hash)
        const lat = 20 + (Math.abs(hash % 17))
        const lng = 72 + (Math.abs((hash >> 4) % 25))
        const { stops, route, alerts } = buildScheduleForDest(dest, lat, lng)
        setSchedule(stops)
        setMapCenter([lat, lng])
        setRoutePoints(route)
        setAlerts(alerts)
        setWeather(getMockWeather(dest))
        setLoading(false)
      }
    }

    resolveDestination()
    return () => { cancelled = true }
  }, [destination])

  // Delayed 3rd alert
  useEffect(() => {
    if (!schedule || schedule.length === 0) return
    const timer = setTimeout(() => {
      const targetStop = schedule[2]?.name || 'next stops'
      setAlerts(prev => [...prev, {
        id: `a-${Date.now()}`, type: 'infra_gap',
        message: `No fuel stations for next 18 km near ${targetStop}. Refuel before continuing.`,
        createdAt: Date.now(), acknowledged: false
      }])
    }, 45000)
    return () => clearTimeout(timer)
  }, [schedule])

  // Start session
  useEffect(() => {
    const start = async () => {
      try {
        const res = await axios.post(`/api/v1/trips/${tripId}/live-session/start`, { tripId, networkStatus, batteryPct: battery?.level ?? null })
        if (res.data?.sessionId) sessionIdRef.current = res.data.sessionId
      } catch { sessionIdRef.current = `local-${Date.now()}` }
    }
    start()
  }, []) // eslint-disable-line

  const handleEndTrip = async () => {
    try {
      if (sessionIdRef.current)
        await axios.post(`/api/v1/trips/${tripId}/live-session/end`, { sessionId: sessionIdRef.current, endedAt: new Date().toISOString() })
    } catch {}
    navigate(`/app/memory-weight?trip_id=${tripId}&destination=${encodeURIComponent(destination)}&post_trip=true`)
  }

  const acknowledgeAlert = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))

  const toggleLayer = (key: keyof typeof activeLayers) =>
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))

  const netColor = networkStatus === 'online' ? '#38BDF8' : networkStatus === 'weak' ? C.amber : C.red
  const netLabel = networkStatus === 'online' ? 'Online' : networkStatus === 'weak' ? 'Weak' : 'Offline'
  const unacked = alerts.filter(a => !a.acknowledged)

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh',
        background: '#0A0F1E',
        color: '#FFFFFF',
        fontFamily: F_BODY,
      }}>
        <div style={{
          width: 50, height: 50,
          border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid #FC6C26',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 20
        }} />
        <h2 style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Initializing Live Trip Briefing
        </h2>
        <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: 14 }}>
          Resolving coordinates and securing corridor for {destination}...
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'row',
        height: `calc(100vh - var(--topbar-height))`,
        marginTop: 'var(--topbar-height)',
        fontFamily: F_BODY,
        background: C.bg,
        overflow: 'hidden',
      }}
    >
      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — Trip Details + Schedule + Alerts
      ══════════════════════════════════════════════════════════ */}
      <div style={{
        width: 420, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background: C.bg, // Matches main outer background to let cards stand out
        borderRight: `1.5px solid ${C.border}`,
        overflowY: 'auto',
        boxShadow: '4px 0 32px rgba(10,15,30,0.06)',
      }}>

        {/* ── Status Bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          background: C.ink,
          gap: 12,
          position: 'sticky', top: 0, zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        }}>
          {/* LIVE pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 12, color: '#FFFFFF', letterSpacing: '0.16em', textTransform: 'uppercase' }}>LIVE</span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {battery !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <BatteryIcon level={battery.level} />
                <span style={{ fontFamily: F_BODY, fontWeight: 800, fontSize: 12.5, color: battery.level <= 20 ? C.red : '#FFFFFF' }}>{battery.level}%</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {networkStatus === 'offline' ? <WifiOff size={13} color="#94A3B8" /> : <Wifi size={13} color={netColor} />}
              <span style={{ fontFamily: F_BODY, fontWeight: 800, fontSize: 12.5, color: netColor }}>{netLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} color="#FFFFFF" />
              <span style={{ fontFamily: F_BODY, fontWeight: 800, fontSize: 12.5, color: '#FFFFFF' }}>{Math.floor(elapsedMin / 60)}h {elapsedMin % 60}m</span>
            </div>
          </div>

          {/* End Trip */}
          <button
            onClick={() => setShowEndConfirm(true)}
            style={{
              fontFamily: F_HEAD, fontWeight: 900, fontSize: 11,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '6px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.18)', border: '1.5px solid rgba(239,68,68,0.4)',
              color: '#FCA5A5', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(239,68,68,0.1)',
            }}
          >
            End Trip
          </button>
        </div>

        {/* ── Trip Header Card ── */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            background: C.card, borderRadius: 24, padding: 20,
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(10,15,30,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14
          }}>
            <div>
              <h1 style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 26, color: C.ink, lineHeight: 1.1, margin: '0 0 6px', letterSpacing: '-0.04em' }}>
                {destination} Adventure
              </h1>
              <p style={{ fontFamily: F_BODY, fontWeight: 700, fontSize: 13.5, color: C.ink2, margin: 0 }}>
                Day 2 of 3 &nbsp;·&nbsp; {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0, paddingLeft: 12, borderLeft: `1.5px solid ${C.border}` }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{weather.icon}</div>
              <p style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 15, color: C.ink, margin: '3px 0 0' }}>{weather.temp}°C</p>
              <p style={{ fontFamily: F_BODY, fontWeight: 700, fontSize: 11, color: C.sub, margin: 0 }}>{weather.condition}</p>
            </div>
          </div>
        </div>

        {/* ── Active Activity Card ── */}
        <div style={{ padding: '12px 16px 0' }}>
          <motion.div
            animate={prefersReduced ? {} : {
              boxShadow: [
                '0 4px 24px rgba(252,108,38,0.22)',
                '0 4px 40px rgba(252,108,38,0.40)',
                '0 4px 24px rgba(252,108,38,0.22)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            style={{
              borderRadius: 24, padding: '20px 24px',
              background: 'linear-gradient(135deg, #FC6C26 0%, #E55B1D 100%)',
              border: '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                NOW ACTIVE
              </span>
            </div>
            {(() => {
              const activeItem = schedule.find(item => item.status === 'active') || schedule[0]
              return (
                <>
                  <p style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 24, color: '#FFFFFF', margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {activeItem?.time ? `${activeItem.time} – ${activeItem.time === '9:00 AM' ? '11:00 AM' : activeItem.time === '1:00 PM' ? '2:30 PM' : activeItem.time === '5:00 PM' ? '7:00 PM' : '9:30 PM'}` : '1:00 PM – 2:30 PM'}
                  </p>
                  <p style={{ fontFamily: F_BODY, fontWeight: 800, fontSize: 16.5, color: '#FFFFFF', margin: '0 0 4px' }}>
                    {activeItem ? `${getEmoji(activeItem.name)} ${activeItem.name}` : '🍛 Chandni Chowk Lunch'}
                  </p>
                  <p style={{ fontFamily: F_BODY, fontWeight: 700, fontSize: 13.5, color: 'rgba(255,255,255,0.90)', margin: '0 0 16px' }}>
                    📍 {activeItem ? `${activeItem.name}, ${destination}` : `Chandni Chowk, ${destination}`}
                    {distanceToWp !== null && ` · ${distanceToWp} km away`}
                  </p>
                </>
              )
            })()}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                fontFamily: F_HEAD, fontWeight: 900, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.40)',
                color: '#FFFFFF', cursor: 'pointer',
              }}>
                <Navigation size={14} /> Navigate
              </button>
              <button style={{
                fontFamily: F_HEAD, fontWeight: 900, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.40)',
                color: '#FFFFFF', cursor: 'pointer',
              }}>
                <Check size={14} /> Mark Done
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Today's Schedule Card ── */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            background: C.card, borderRadius: 24, padding: 20,
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(10,15,30,0.03)',
          }}>
            <p style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 12, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 16px', borderBottom: `1.5px solid ${C.border}`, paddingBottom: 8 }}>
              Today's Schedule
            </p>

            <div style={{ position: 'relative' }}>
              {/* Vertical spine */}
              <div style={{ position: 'absolute', left: 14, top: 6, bottom: 6, width: 2, background: 'rgba(15,23,42,0.08)' }} />

              {schedule.map((item, i) => {
                const isDone   = item.status === 'done'
                const isActive = item.status === 'active'
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, ease: easeReveal, duration: durations.base }}
                    style={{ display: 'flex', gap: 12, marginBottom: 10, position: 'relative', paddingLeft: 32 }}
                  >
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: 8, top: 14,
                      width: 14, height: 14, borderRadius: '50%',
                      background: isDone ? C.green : isActive ? C.coral : C.card,
                      border: `2.5px solid ${isDone ? C.green : isActive ? C.coral : C.borderDark}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      {isDone && <Check size={7} color="#fff" strokeWidth={3} />}
                      {isActive && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                    </div>

                    {/* Card */}
                    <div style={{
                      flex: 1, padding: '12px 16px', borderRadius: 16,
                      background: isActive ? 'rgba(252,108,38,0.07)' : isDone ? '#F8FAFF' : '#FAFBFF',
                      border: `1.5px solid ${isActive ? 'rgba(252,108,38,0.28)' : C.border}`,
                      opacity: isDone ? 0.70 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <p style={{
                          fontFamily: F_HEAD, fontWeight: isActive ? 900 : 800, fontSize: 14.5,
                          color: isActive ? C.coral : isDone ? C.ink3 : C.ink,
                          margin: 0,
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {item.name}
                        </p>
                        <span style={{ fontFamily: F_BODY, fontWeight: 900, fontSize: 12, color: isActive ? C.coral : C.ink2, flexShrink: 0, marginLeft: 8 }}>
                          {item.time}
                        </span>
                      </div>
                      <p style={{ fontFamily: F_BODY, fontWeight: 700, fontSize: 13, color: isActive ? '#7C3410' : C.sub, margin: 0 }}>
                        💡 {item.tip}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Live Alerts Card ── */}
        {unacked.length > 0 && (
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{
              background: C.card, borderRadius: 24, padding: 20,
              border: `1.5px solid ${C.border}`,
              boxShadow: '0 4px 20px rgba(10,15,30,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: `1.5px solid ${C.border}`, paddingBottom: 8 }}>
                <Bell size={13} color={C.coral} strokeWidth={2.5} />
                <p style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 12, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>
                  Live Alerts ({unacked.length})
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                  {unacked.map(alert => {
                    const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ ease: easeReveal, duration: 0.28 }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '14px 16px', borderRadius: 16,
                          background: cfg.bg,
                          border: `2px solid ${cfg.dot}44`,
                        }}
                      >
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: cfg.dot, flexShrink: 0, marginTop: 5 }} />
                        <p style={{ fontFamily: F_BODY, fontWeight: 700, fontSize: 13.5, color: cfg.color, margin: 0, flex: 1, lineHeight: 1.5 }}>
                          {alert.message}
                        </p>
                        <button onClick={() => acknowledgeAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                          <X size={14} color={cfg.dot} strokeWidth={2.5} />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ── Emergency Help Card ── */}
        <div style={{ padding: '12px 16px 20px' }}>
          <div style={{
            background: C.card, borderRadius: 24, padding: 20,
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(10,15,30,0.03)',
          }}>
            <button
              onClick={() => setEmergencyOpen(!emergencyOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 16, cursor: 'pointer',
                fontFamily: F_HEAD, fontWeight: 900, fontSize: 14,
                background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.30)',
                color: C.red,
                boxShadow: '0 2px 8px rgba(239,68,68,0.08)',
              }}
            >
              <AlertCircle size={16} strokeWidth={2.5} /> Emergency Help
            </button>

            <AnimatePresence>
              {emergencyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={springSnappy}
                  style={{ overflow: 'hidden', marginTop: 12 }}
                >
                  <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Police',           number: '100',          icon: '🚔' },
                      { label: 'Ambulance',         number: '108',          icon: '🚑' },
                      { label: 'Tourist Helpline',  number: '1800-111-363', icon: '📞' },
                    ].map(e => (
                      <a
                        key={e.label}
                        href={`tel:${e.number}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', borderRadius: 16, textDecoration: 'none',
                          background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.18)',
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{e.icon}</span>
                        <span style={{ fontFamily: F_BODY, fontWeight: 800, fontSize: 14, color: C.ink, flex: 1 }}>{e.label}</span>
                        <span style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 14, color: C.red }}>{e.number}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — Full OSM Map
      ══════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* GPS Toggle */}
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 10 }}>
          <button
            onClick={() => setEnableLiveGPS(!enableLiveGPS)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 14, cursor: 'pointer',
              fontFamily: F_HEAD, fontWeight: 900, fontSize: 13,
              background: enableLiveGPS ? 'rgba(16,185,129,0.95)' : 'rgba(255,255,255,0.95)',
              border: enableLiveGPS ? 'none' : `2px solid ${C.borderDark}`,
              color: enableLiveGPS ? '#FFFFFF' : C.ink2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{
              width: 9, height: 9, borderRadius: '50%',
              background: enableLiveGPS ? '#fff' : '#94A3B8',
              animation: enableLiveGPS ? 'ping 1.2s ease-out infinite' : 'none',
            }} />
            {enableLiveGPS ? '⚡ GPS Active' : 'Enable GPS'}
          </button>
        </div>

        {/* Layer FABs */}
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'hospitals', emoji: '🏥', title: 'Hospitals' },
            { key: 'fuel',      emoji: '⛽', title: 'Fuel'      },
            { key: 'water',     emoji: '🚰', title: 'Water'     },
            { key: 'atms',      emoji: '💵', title: 'ATMs'      },
            { key: 'pharmacies',emoji: '💊', title: 'Pharmacy'  },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key as keyof typeof activeLayers)}
              title={l.title}
              style={{
                width: 40, height: 40, borderRadius: 12, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: activeLayers[l.key as keyof typeof activeLayers] ? C.coral : 'rgba(255,255,255,0.95)',
                border: activeLayers[l.key as keyof typeof activeLayers] ? 'none' : `2px solid ${C.borderDark}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                transition: 'all 0.18s ease',
              }}
            >
              {l.emoji}
            </button>
          ))}
        </div>

        {/* OSM Map */}
        <div style={{ flex: 1 }}>
          <OSMMap
            center={mapCenter}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            routePoints={routePoints}
            activeLayers={activeLayers}
            enableLiveGPS={enableLiveGPS}
            onDistanceUpdate={setDistanceToWp}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SOS FAB — Fixed bottom-right, impossible to miss
      ══════════════════════════════════════════════════════════ */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          boxShadow: [
            '0 0 0 0px rgba(239,68,68,0.50)',
            '0 0 0 20px rgba(239,68,68,0.00)',
          ]
        }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
        onClick={() => setEmergencyOpen(true)}
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          cursor: 'pointer', border: 'none',
          boxShadow: '0 8px 36px rgba(239,68,68,0.60)',
        }}
      >
        <Shield size={26} color="#FFFFFF" strokeWidth={2.5} />
        <span style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 10, color: '#FFFFFF', letterSpacing: '0.2em' }}>SOS</span>
      </motion.button>

      {/* ══════════════════════════════════════════════════════════
          END TRIP CONFIRM DIALOG
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(6px)',
              padding: 24,
            }}
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.90, y: 24, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{    scale: 0.90, y: 20, opacity: 0 }}
              transition={springSnappy}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#FFFFFF', borderRadius: 28,
                padding: '36px 36px',  maxWidth: 440, width: '100%',
                boxShadow: '0 30px 80px rgba(10,15,30,0.30)',
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 18, marginBottom: 24,
                background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={28} color={C.amber} />
              </div>

              <h2 style={{ fontFamily: F_HEAD, fontWeight: 900, fontSize: 26, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.04em' }}>
                End Live Trip?
              </h2>
              <p style={{ fontFamily: F_BODY, fontWeight: 600, fontSize: 16, color: C.ink3, lineHeight: 1.7, margin: '0 0 32px' }}>
                GPS tracking stops and your session is saved. You'll reflect on your trip in <strong style={{ color: C.ink, fontWeight: 800 }}>Memory Weight</strong> — tag what made this journey unforgettable.
              </p>

              <div style={{ display: 'flex', gap: 14 }}>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  style={{
                    flex: 1, padding: '15px', borderRadius: 18, cursor: 'pointer',
                    fontFamily: F_HEAD, fontWeight: 800, fontSize: 15, color: C.ink3,
                    background: '#F1F5F9', border: '1.5px solid #E2E8F0',
                  }}
                >
                  Keep Going
                </button>
                <button
                  onClick={handleEndTrip}
                  style={{
                    flex: 1, padding: '15px', borderRadius: 18, cursor: 'pointer',
                    fontFamily: F_HEAD, fontWeight: 900, fontSize: 15, color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #FC6C26, #E55B1D)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 24px rgba(252,108,38,0.38)',
                  }}
                >
                  End Trip <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

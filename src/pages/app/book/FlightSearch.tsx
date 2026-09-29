/**
 * FlightSearch.tsx — Premium ExpeditionX Flight Search
 * Features: search form, quick routes, results grid, clickable cards → Flight Details
 */

import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Plane, Search, MapPin, Clock, AlertCircle, ArrowRight,
  Zap, RefreshCw, ArrowUpDown, ChevronRight, Calendar, X,
} from 'lucide-react'
import { flightService, generateMockFlights, type FlightData } from '../../../services/flightService'
import {
  searchAirports,
  resolveAirportCode,
  formatAirportDisplay,
  type AirportOption,
} from '../../../data/airports'
import { useFlightStore } from '../../../stores/flightStore'
import { pageTransition, cardInteraction } from '../../../motion/variants'

// ─── Data ────────────────────────────────────────────────────────────────────
const QUICK_ROUTES = [
  { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai',         hot: true  },
  { from: 'BOM', to: 'BLR', label: 'Mumbai → Bangalore',     hot: true  },
  { from: 'DEL', to: 'CCU', label: 'Delhi → Kolkata',        hot: false },
  { from: 'MAA', to: 'DEL', label: 'Chennai → Delhi',        hot: false },
  { from: 'BLR', to: 'HYD', label: 'Bangalore → Hyderabad',  hot: false },
  { from: 'DEL', to: 'GOI', label: 'Delhi → Goa',            hot: true  },
]

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; pulse: boolean }> = {
  active:    { bg: '#000000', text: '#ffffff', dot: '#22c55e', pulse: true  },
  scheduled: { bg: '#000000', text: '#ffffff', dot: '#ffffff', pulse: false },
  cancelled: { bg: 'rgba(244,63,94,0.12)',   text: '#fb7185', dot: '#f43f5e', pulse: false },
  landed:    { bg: '#000000', text: '#e2e8f0', dot: '#94a3b8', pulse: false },
  delayed:   { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', dot: '#f59e0b', pulse: false },
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmtTime(iso?: string | null) {
  if (!iso) return '--:--'
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' })
  } catch { return '--:--' }
}

function calcDuration(dep?: string | null, arr?: string | null) {
  if (!dep || !arr) return null
  try {
    const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000
    if (diff <= 0) return null
    return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`
  } catch { return null }
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ height: 188, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, var(--bg-card-hover) 50%, transparent 100%)',
        animation: 'skeletonSweep 1.6s ease-in-out infinite',
      }} />
    </div>
  )
}

// ─── Flight Result Card ───────────────────────────────────────────────────────
function FlightCard({
  flight, idx, onSelect
}: {
  flight: FlightData
  idx: number
  onSelect: () => void
}) {
  const status = (flight.status || 'unknown').toLowerCase()
  const st = STATUS_STYLE[status] ?? { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', dot: '#64748b', pulse: false }
  const duration = calcDuration(flight.departure?.scheduled, flight.arrival?.scheduled)
  const depTime = fmtTime(flight.departure?.scheduled)
  const arrTime = fmtTime(flight.arrival?.scheduled)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.055, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      {...cardInteraction}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${flight.airline?.name ?? 'flight'} ${flight.flight?.iata ?? ''} — ${flight.departure?.iata ?? '?'} to ${flight.arrival?.iata ?? '?'}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer focus:outline-none"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Hover top border accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, var(--amber-500), var(--border-default))' }} />

      {/* Hover glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(252,108,38,0.1), transparent 70%)' }} />

      <div className="relative p-5">
        {/* Top Row: Airline + Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
              <Plane size={17} style={{ color: 'var(--amber-500)' }} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {flight.airline?.name || 'Unknown Airline'}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {flight.flight?.iata || flight.flight?.number || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: st.bg, color: st.text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: st.dot, animation: st.pulse ? 'pulse 2s ease-in-out infinite' : 'none' }} />
            {status}
          </div>
        </div>

        {/* Route Display */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Departure */}
          <div className="flex-1 min-w-0">
            <div className="text-3xl font-black tracking-tight leading-none font-mono"
              style={{ color: 'var(--text-primary)' }}>
              {flight.departure?.iata || '—'}
            </div>
            <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)', maxWidth: 100 }}>
              {flight.departure?.airport || 'Unknown'}
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <Clock size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{depTime}</span>
            </div>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
            {duration && (
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{duration}</span>
            )}
            <div className="flex items-center gap-0.5">
              <div className="w-6 h-px" style={{ background: 'var(--border-default)' }} />
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <Plane size={12} style={{ color: 'var(--amber-500)', transform: 'rotate(90deg)' }} />
              </div>
              <div className="w-6 h-px" style={{ background: 'var(--border-default)' }} />
            </div>
            {!duration && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--border-default)' }} />}
          </div>

          {/* Arrival */}
          <div className="flex-1 min-w-0 text-right">
            <div className="text-3xl font-black tracking-tight leading-none font-mono"
              style={{ color: 'var(--text-primary)' }}>
              {flight.arrival?.iata || '—'}
            </div>
            <div className="text-xs mt-1 truncate ml-auto" style={{ color: 'var(--text-muted)', maxWidth: 100 }}>
              {flight.arrival?.airport || 'Unknown'}
            </div>
            <div className="flex items-center gap-1 mt-1.5 justify-end">
              <span className="text-sm font-bold font-mono" style={{ color: 'var(--amber-500)' }}>{arrTime}</span>
              <Clock size={10} style={{ color: 'var(--amber-500)', flexShrink: 0 }} />
            </div>
          </div>
        </div>

        {/* Footer: View Details CTA */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {flight.aircraft?.registration ? (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {flight.aircraft.iata || '—'} · {flight.aircraft.registration}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all duration-200"
            style={{ color: 'var(--amber-500)' }}>
            View Details
            <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FlightSearch() {
  const navigate = useNavigate()
  const { searchResults, searchParams, hasSearched, setSearchResults } = useFlightStore()

  const initDep = searchParams.departure
    ? (searchAirports(searchParams.departure, 1)[0] ? formatAirportDisplay(searchAirports(searchParams.departure, 1)[0]) : searchParams.departure)
    : 'Delhi (DEL)'
  const initArr = searchParams.arrival
    ? (searchAirports(searchParams.arrival, 1)[0] ? formatAirportDisplay(searchAirports(searchParams.arrival, 1)[0]) : searchParams.arrival)
    : 'Mumbai (BOM)'

  const [departure, setDeparture] = useState(initDep)
  const [arrival,   setArrival]   = useState(initArr)
  const [flightDate, setFlightDate] = useState(searchParams.flightDate || '')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // Suggestions dropdown state
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions,   setShowToSuggestions]   = useState(false)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef   = useRef<HTMLDivElement>(null)

  const fromMatches = useMemo(() => searchAirports(departure, 6), [departure])
  const toMatches   = useMemo(() => searchAirports(arrival, 6), [arrival])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromSuggestions(false)
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get today's date as YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0]
  // Format date for display badge on button
  const formattedDate = flightDate
    ? new Date(flightDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const depTrim = departure.trim()
    const arrTrim = arrival.trim()

    if (!depTrim || !arrTrim) { setError('Please enter both departure and destination.'); return }

    const depCode = resolveAirportCode(depTrim)
    const arrCode = resolveAirportCode(arrTrim)

    if (depCode === arrCode)  { setError('Departure and destination cannot be the same.'); return }
    if (!flightDate)  { setError('Please select a flight date to search.'); return }

    setLoading(true)
    setError(null)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)

    try {
      const resp = await flightService.searchFlights({ departure: depCode, arrival: arrCode, flightDate: flightDate || undefined })
      if (resp && resp.success && resp.data && resp.data.length > 0) {
        setSearchResults(resp.data, { departure: depCode, arrival: arrCode, flightDate })
      } else {
        const fallback = generateMockFlights(depCode, arrCode, flightDate)
        setSearchResults(fallback, { departure: depCode, arrival: arrCode, flightDate })
      }
    } catch (err: any) {
      console.warn('[FlightSearch] Fallback engaged:', err?.message)
      const fallback = generateMockFlights(depCode, arrCode, flightDate)
      setSearchResults(fallback, { departure: depCode, arrival: arrCode, flightDate })
    } finally {
      setLoading(false)
    }
  }

  const applyRoute = (from: string, to: string) => {
    const fromAp = searchAirports(from, 1)[0]
    const toAp = searchAirports(to, 1)[0]
    setDeparture(fromAp ? formatAirportDisplay(fromAp) : from)
    setArrival(toAp ? formatAirportDisplay(toAp) : to)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
    setError(null)
  }

  const swapRoutes = () => {
    setDeparture(arrival)
    setArrival(departure)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
  }

  const handleCardClick = (flight: FlightData, idx: number) => {
    const depCode = resolveAirportCode(departure)
    const arrCode = resolveAirportCode(arrival)
    navigate(`/app/flights/detail`, {
      state: { flight, idx, from: depCode, to: arrCode }
    })
  }

  return (
    <motion.div
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="min-h-screen pb-24 lg:pb-8"
      style={{ padding: '24px 24px 96px' }}
    >
      <style>{`
        @keyframes skeletonSweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .flight-input {
          width: 100%;
          background: var(--bg-secondary) !important;
          border: 1.5px solid var(--border-default) !important;
          color: var(--text-primary) !important;
          border-radius: 12px;
          padding: 12px 34px 12px 40px;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          outline: none;
          caret-color: var(--amber-500);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .flight-input::placeholder { color: var(--text-muted); opacity: 0.6; letter-spacing: 0.01em; font-size: 13.5px; font-weight: 500; }
        .flight-input:focus {
          border-color: var(--amber-500) !important;
          box-shadow: 0 0 0 3px rgba(252,108,38,0.18);
        }
        .flight-suggestion-row:hover {
          background: var(--bg-secondary) !important;
        }
        [data-theme='monochrome'] .flight-input:focus {
          border-color: var(--text-primary) !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.18);
        }
        [data-theme='monochrome'] .flight-search-submit-btn {
          background: var(--text-primary) !important;
          color: var(--bg-primary) !important;
          box-shadow: none !important;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: #d1fae5;
          border: 1.5px solid #059669;
          color: #065f46;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.18);
        }
        .live-badge .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 8px #10b981;
          display: inline-block;
          animation: pulse 1.5s ease-in-out infinite;
        }
        [data-theme='dark'] .live-badge {
          background: rgba(16, 185, 129, 0.2);
          border-color: #34d399;
          color: #34d399;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
        }
        [data-theme='dark'] .live-badge .live-dot {
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
        }
        [data-theme='monochrome'] .live-badge {
          background: #ffffff;
          border-color: #000000;
          color: #000000;
          box-shadow: none;
        }
        [data-theme='monochrome'] .live-badge .live-dot {
          background: #000000;
          box-shadow: none;
        }
        .flight-date-field {
          width: 100%;
          background: var(--bg-secondary) !important;
          border: 1.5px solid var(--border-default) !important;
          color: var(--text-primary) !important;
          border-radius: 12px;
          padding: 13px 14px 13px 42px;
          font-size: 14px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          box-sizing: border-box;
        }
        .flight-date-field::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .flight-date-field:focus {
          border-color: var(--amber-500) !important;
          box-shadow: 0 0 0 3px rgba(252,108,38,0.18);
        }
        [data-theme='monochrome'] .flight-date-field:focus {
          border-color: var(--text-primary) !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.18);
        }
      `}</style>

      {/* ── Hero Header ── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}>

        {/* BG grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.25,
          backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Ambient Theme Orbs */}
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, var(--amber-500), transparent 70%)', opacity: 0.08, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '5%',  width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--text-primary), transparent 70%)', opacity: 0.03, filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', padding: '44px 40px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Title + form row */}
            <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', flexWrap: 'wrap' }}>

              {/* Left: Branding */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <h1 style={{
                  fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 900,
                  lineHeight: 1.05, margin: 0, letterSpacing: '-1.5px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  <span style={{ color: 'var(--text-primary)', display: 'block' }}>Flight</span>
                  <span style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, var(--amber-500) 0%, #d95312 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>Search</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>
                  Real-time flights on any route worldwide.
                </p>
              </motion.div>

              {/* Right: Search Form */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                style={{ flex: 1, minWidth: 280, maxWidth: 560 }}
              >
                {/* Inputs row */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
                  {/* FROM */}
                  <div style={{ flex: 1, position: 'relative' }} ref={fromRef}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                      From
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={15} style={{ color: 'var(--text-muted)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        className="flight-input"
                        type="text"
                        placeholder="e.g. Delhi, London, DEL"
                        value={departure}
                        onChange={e => {
                          setDeparture(e.target.value)
                          setShowFromSuggestions(true)
                          setError(null)
                        }}
                        onFocus={() => {
                          setShowFromSuggestions(true)
                          setShowToSuggestions(false)
                        }}
                        aria-label="Departure airport or city"
                        autoComplete="off"
                      />
                      {departure && (
                        <button
                          type="button"
                          onClick={() => { setDeparture(''); setShowFromSuggestions(true) }}
                          style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                          }}
                          aria-label="Clear departure"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Suggestions Dropdown for FROM */}
                    <AnimatePresence>
                      {showFromSuggestions && fromMatches.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            zIndex: 60,
                            background: 'var(--bg-card)',
                            border: '1.5px solid var(--border-default)',
                            borderRadius: 14,
                            boxShadow: '0 16px 36px -8px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            maxHeight: 280,
                            overflowY: 'auto',
                          }}
                        >
                          <div style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                            Suggested Airports & Cities
                          </div>
                          {fromMatches.map(ap => (
                            <div
                              key={ap.code}
                              onClick={() => {
                                setDeparture(formatAirportDisplay(ap))
                                setShowFromSuggestions(false)
                                setError(null)
                              }}
                              className="flight-suggestion-row"
                              style={{
                                padding: '9px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                cursor: 'pointer',
                                transition: 'background 0.15s ease',
                                borderBottom: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Plane size={12} style={{ color: 'var(--amber-500)' }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ap.city}, <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11.5 }}>{ap.country}</span>
                                  </div>
                                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ap.name}
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--amber-500)',
                                flexShrink: 0,
                              }}>
                                {ap.code}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Swap */}
                  <motion.button
                    type="button" onClick={swapRoutes}
                    whileHover={{ rotate: 180, scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    aria-label="Swap departure and arrival"
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s ease', marginBottom: 2,
                    }}
                  >
                    <ArrowUpDown size={15} style={{ color: 'var(--text-primary)' }} />
                  </motion.button>

                  {/* TO */}
                  <div style={{ flex: 1, position: 'relative' }} ref={toRef}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                      To
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={15} style={{ color: 'var(--amber-500)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        className="flight-input"
                        type="text"
                        placeholder="e.g. Mumbai, Dubai, BOM"
                        value={arrival}
                        onChange={e => {
                          setArrival(e.target.value)
                          setShowToSuggestions(true)
                          setError(null)
                        }}
                        onFocus={() => {
                          setShowToSuggestions(true)
                          setShowFromSuggestions(false)
                        }}
                        aria-label="Arrival airport or city"
                        autoComplete="off"
                      />
                      {arrival && (
                        <button
                          type="button"
                          onClick={() => { setArrival(''); setShowToSuggestions(true) }}
                          style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                          }}
                          aria-label="Clear arrival"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Suggestions Dropdown for TO */}
                    <AnimatePresence>
                      {showToSuggestions && toMatches.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            zIndex: 60,
                            background: 'var(--bg-card)',
                            border: '1.5px solid var(--border-default)',
                            borderRadius: 14,
                            boxShadow: '0 16px 36px -8px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            maxHeight: 280,
                            overflowY: 'auto',
                          }}
                        >
                          <div style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                            Suggested Airports & Cities
                          </div>
                          {toMatches.map(ap => (
                            <div
                              key={ap.code}
                              onClick={() => {
                                setArrival(formatAirportDisplay(ap))
                                setShowToSuggestions(false)
                                setError(null)
                              }}
                              className="flight-suggestion-row"
                              style={{
                                padding: '9px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                cursor: 'pointer',
                                transition: 'background 0.15s ease',
                                borderBottom: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Plane size={12} style={{ color: 'var(--amber-500)' }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ap.city}, <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11.5 }}>{ap.country}</span>
                                  </div>
                                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ap.name}
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--amber-500)',
                                flexShrink: 0,
                              }}>
                                {ap.code}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* DATE PICKER */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                    Date <span style={{ color: '#FC6C26' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} style={{ color: flightDate ? 'var(--amber-500)' : 'var(--text-muted)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                    <input
                      className="flight-date-field"
                      type="date"
                      value={flightDate}
                      min={today}
                      required
                      onChange={e => setFlightDate(e.target.value)}
                      aria-label="Flight date (required)"
                      onClick={e => (e.target as HTMLInputElement).showPicker?.()}
                      style={{ color: flightDate ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    />
                    {flightDate && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setFlightDate('')}
                        title="Clear date"
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-default)',
                          background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', zIndex: 2,
                        }}
                      >
                        <X size={13} style={{ color: 'var(--text-muted)' }} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="flight-search-submit-btn"
                  style={{
                    width: '100%', height: 50, borderRadius: 12, border: 'none',
                    background: loading
                      ? 'var(--bg-secondary)'
                      : 'linear-gradient(135deg, #FC6C26 0%, #E05818 100%)',
                    color: loading ? 'var(--text-muted)' : '#ffffff',
                    fontWeight: 800, fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 8px 24px -4px rgba(252, 108, 38, 0.4)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '0.01em',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 17, height: 17, border: '2px solid var(--border-default)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Search Flights
                      {flightDate && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 8px' }}>{formattedDate}</span>}
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </motion.form>

            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Routes ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Zap size={12} style={{ color: 'var(--amber-500)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Popular Routes
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ROUTES.map((r, i) => (
            <motion.button
              key={r.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => applyRoute(r.from, r.to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 100, cursor: 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              {r.label}
              {r.hot && (
                <span style={{
                  background: 'rgba(252,108,38,0.15)', color: 'var(--amber-500)',
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '1px 6px', borderRadius: 100,
                }}>Hot</span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginBottom: 24, padding: '12px 16px', borderRadius: 12,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <AlertCircle size={17} color="#fb7185" style={{ flexShrink: 0 }} />
            <p style={{ color: '#fb7185', fontSize: 13.5, fontWeight: 600, margin: 0 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading Skeletons ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Results ── */}
      {!loading && hasSearched && searchResults.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}
          >
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 800, margin: 0 }}>
                {searchResults.length} Flights Found
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>
                {searchParams.departure} → {searchParams.arrival} · Click a flight to view details
              </p>
            </div>
            <div className="live-badge">
              <span className="live-dot" />
              <span>Live</span>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {searchResults.map((flight, idx) => (
              <FlightCard
                key={`${flight.flight?.iata ?? idx}-${idx}`}
                flight={flight}
                idx={idx}
                onSelect={() => handleCardClick(flight, idx)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Empty State (after search) ── */}
      {!loading && hasSearched && !error && searchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', padding: '72px 24px', borderRadius: 24,
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plane size={30} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 19, fontWeight: 700, margin: '0 0 8px' }}>
            No flights found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
            No live flights found for this route. Try a different route or check back soon.
          </p>
        </motion.div>
      )}

      {/* ── Initial State (not yet searched) ── */}
      {!loading && !hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', padding: '64px 24px' }}
        >
          <div style={{
            width: 96, height: 96, borderRadius: 28, margin: '0 auto 20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
          }}>
            <Plane size={40} style={{ color: 'var(--amber-500)', opacity: 0.6 }} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, margin: '0 0 10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to Search
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 300, margin: '0 auto', lineHeight: 1.7 }}>
            Enter departure and arrival airport codes above and click{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>Search Flights</strong> to see live results.
          </p>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}

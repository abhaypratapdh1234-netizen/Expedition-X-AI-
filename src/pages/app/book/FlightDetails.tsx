/**
 * FlightDetails.tsx — Premium Flight Details Page
 * Full flow: view flight info → Select Flight → Continue to Trip Planner
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, ArrowLeft, MapPin, Clock, Calendar, CheckCircle2,
  Building2, Navigation, Tag, ChevronRight, Heart, Info,
  Loader2, AlertCircle, ArrowRight,
} from 'lucide-react'
import { type FlightData, getCityFromAirport } from '../../../services/flightService'
import { useFlightStore } from '../../../stores/flightStore'
import { useBookingStore, type BookingRecord } from '../../../stores/bookingStore'
import { usePlannerStore } from '../../../stores/plannerStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useWizardStore } from '../../../stores/wizardStore'
import { pageTransition } from '../../../motion/variants'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; dot: string; pulse: boolean }> = {
  active:    { bg: '#000000', text: '#ffffff', border: '#000000', dot: '#22c55e', pulse: true  },
  scheduled: { bg: '#000000', text: '#ffffff', border: '#000000', dot: '#ffffff', pulse: false },
  cancelled: { bg: 'rgba(244,63,94,0.1)',   text: '#fb7185', border: 'rgba(244,63,94,0.25)',   dot: '#f43f5e', pulse: false },
  landed:    { bg: '#000000', text: '#e2e8f0', border: '#000000', dot: '#94a3b8', pulse: false },
  delayed:   { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b', pulse: false },
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmtTime(iso?: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' })
  } catch { return null }
}

function fmtDate(iso?: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return null }
}

function calcDuration(dep?: string | null, arr?: string | null): string | null {
  if (!dep || !arr) return null
  try {
    const diff = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000
    if (diff <= 0) return null
    return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`
  } catch { return null }
}

// ─── Info Chip ────────────────────────────────────────────────────────────────
function InfoChip({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={10} style={{ color: 'var(--text-muted)' }} />}
        <span style={{ color: 'var(--text-muted)', fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {label}
        </span>
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
        {value}
      </span>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
      }}>
        <Icon size={14} style={{ color: 'var(--amber-500)' }} />
        <span style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FlightDetails() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get flight from navigation state
  const state = location.state as { flight: FlightData; idx: number; from: string; to: string } | null
  const flight: FlightData | null = state?.flight ?? null

  // Stores
  const { selectFlight, selectedFlight } = useFlightStore()
  const { addBooking } = useBookingStore()
  const { setSession, session } = usePlannerStore()
  const { saveFlight, toggleFlight, isFlightSaved } = useWishlistStore()

  // Local UI state
  const [isSelected, setIsSelected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedToWishlist, setSavedToWishlist] = useState(() => flight ? isFlightSaved(flight) : false)
  const [savedToBookings, setSavedToBookings] = useState(false)

  // Sync if flight changes
  useEffect(() => {
    if (flight) {
      setSavedToWishlist(isFlightSaved(flight))
    }
  }, [flight, isFlightSaved])

  // If no flight in state, show error
  if (!flight) {
    return (
      <motion.div
        variants={pageTransition} initial="initial" animate="animate"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={30} style={{ color: 'var(--error)', opacity: 0.7 }} />
          </div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, margin: '0 0 10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Flight Not Found
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            The requested flight information is unavailable. Please go back and select a flight from the results.
          </p>
          <button onClick={() => navigate('/app/flights')}
            style={{
              padding: '11px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #FC6C26 0%, #E05818 100%)', color: 'white', fontWeight: 700, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px -4px rgba(252, 108, 38, 0.4)',
            }}>
            <ArrowLeft size={15} />
            Back to Flights
          </button>
        </div>
      </motion.div>
    )
  }

  // ── Computed data ──
  const status = (flight.status || 'unknown').toLowerCase()
  const st = STATUS_STYLE[status] ?? { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)', dot: '#64748b', pulse: false }
  const duration = calcDuration(flight.departure?.scheduled, flight.arrival?.scheduled)
  const depTime = fmtTime(flight.departure?.scheduled)
  const arrTime = fmtTime(flight.arrival?.scheduled)
  const depDate = fmtDate(flight.departure?.scheduled || flight.flightDate)
  const arrDate = fmtDate(flight.arrival?.scheduled)
  const flightDate = fmtDate(flight.flightDate) || depDate

  // ── Actions ──
  const handleSelectFlight = () => {
    selectFlight(flight)
    setIsSelected(true)
    // Merge into Trip Planner session
    setSession({
      destination: flight.arrival?.airport || flight.arrival?.iata || session?.destination || '',
      startDate:   flight.departure?.scheduled?.split('T')[0] || session?.startDate || '',
      selectedFlightIata:  flight.flight?.iata || flight.flight?.number || '',
      selectedFlightLabel: `${flight.airline?.name ?? ''} ${flight.flight?.iata ?? ''} · ${flight.departure?.iata ?? '?'} → ${flight.arrival?.iata ?? '?'}`,
    })

    // Also pre-fill wizardStore for original Trip Setup Wizard (Screenshot 3)
    const arrivalDest = flight.arrival?.airport || flight.arrival?.iata || ''
    const place = getCityFromAirport(arrivalDest) || arrivalDest
    if (place) {
      useWizardStore.getState().setDestination(place)
    }
    const flightDate = flight.departure?.scheduled?.split('T')[0] || flight.flightDate
    if (flightDate) {
      useWizardStore.getState().setStartDate(flightDate)
    }
  }

  const handleSaveToBookings = async () => {
    if (!flight) return
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 400)) // Brief UX delay

    // 1. Save directly into Wishlist!
    saveFlight(flight)
    setSavedToWishlist(true)

    // 2. Also register into My Bookings
    const booking: BookingRecord = {
      id: `FLT-${Date.now()}`,
      type: 'flight',
      itemName: `${flight.airline?.name ?? 'Flight'} ${flight.flight?.iata ?? ''}`,
      referenceName: `${flight.flight?.iata ?? ''} · ${flight.departure?.iata ?? '?'} → ${flight.arrival?.iata ?? '?'}`,
      airline: flight.airline?.name,
      city: flight.arrival?.airport || flight.arrival?.iata || '',
      date: flight.departure?.scheduled?.split('T')[0] || new Date().toISOString().split('T')[0],
      checkInDate: flight.departure?.scheduled?.split('T')[0],
      checkOutDate: flight.arrival?.scheduled?.split('T')[0],
      totalPrice: 0,
      status: 'upcoming',
      eTicketCode: `EXP-FLT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    }
    addBooking(booking)
    setIsSaving(false)
    setSavedToBookings(true)
  }

  const handleContinue = () => {
    // 1. Ensure selected flight is stored in useFlightStore
    if (flight) {
      selectFlight(flight)
    }

    // 2. Prepare the original trip planner wizard (Screenshot 3)
    const wizard = useWizardStore.getState()
    wizard.reset()
    wizard.setStep(1)

    // 3. Pre-fill destination and start date from flight arrival & departure
    const arrivalDest = flight?.arrival?.airport || flight?.arrival?.iata || ''
    const place = getCityFromAirport(arrivalDest) || arrivalDest
    if (place) {
      wizard.setDestination(place)
    }
    const flightDate = flight?.departure?.scheduled?.split('T')[0] || flight?.flightDate
    if (flightDate) {
      wizard.setStartDate(flightDate)
    }

    // 4. Redirect directly to original AI Trip Setup wizard (Screenshot 3)
    navigate('/app/planner/setup')
  }

  return (
    <motion.div
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', padding: '24px 24px 96px', maxWidth: 900, margin: '0 auto' }}
    >
      {/* ── Back Nav ── */}
      <motion.button
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/app/flights')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 24,
          padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          transition: 'all 0.15s ease',
        }}
        whileHover={{ x: -2 }}
        aria-label="Back to flight search"
      >
        <ArrowLeft size={14} />
        Back to Flights
      </motion.button>

      {/* ── Hero Journey Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 24, marginBottom: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* BG detail */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.25,
          backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, var(--amber-500), transparent 65%)', opacity: 0.08, filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', padding: '36px 36px 32px' }}>
          {/* Airline + Status row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(252, 108, 38, 0.12)', border: '1px solid rgba(252, 108, 38, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plane size={24} style={{ color: 'var(--amber-500)' }} />
              </div>
              <div>
                <h1 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {flight.airline?.name || 'Unknown Airline'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {flight.flight?.iata && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                      {flight.flight.iata}
                    </span>
                  )}
                  {flight.airline?.iata && (
                    <span style={{ color: 'var(--text-muted)', opacity: 0.7, fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
                      · {flight.airline.iata}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: st.bg, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, flexShrink: 0, animation: st.pulse ? 'pulse 2s ease-in-out infinite' : 'none' }} />
                <span style={{ color: st.text, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  {flight.status || 'Unknown'}
                </span>
              </div>
              {flightDate && (
                <span style={{ color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 500 }}>
                  {flightDate}
                </span>
              )}
            </div>
          </div>

          {/* ── Route Timeline ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'space-between' }}>

            {/* DEPARTURE */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1, letterSpacing: '-1px' }}>
                {flight.departure?.iata || '—'}
              </div>
              {flight.departure?.airport && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6, fontWeight: 500, maxWidth: 160 }}>
                  {flight.departure.airport}
                </div>
              )}
              {depTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-500)', boxShadow: '0 0 8px rgba(252,108,38,0.5)' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{depTime}</span>
                </div>
              )}
              {depDate && <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{depDate}</div>}
            </div>

            {/* Centre connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 20px', flexShrink: 0 }}>
              {duration && (
                <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>{duration}</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ width: 48, height: 1, background: 'linear-gradient(90deg, transparent, var(--border-default))' }} />
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plane size={20} style={{ color: 'var(--amber-500)', transform: 'rotate(90deg)' }} />
                </div>
                <div style={{ width: 48, height: 1, background: 'linear-gradient(90deg, var(--border-default), transparent)' }} />
              </div>
              <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-default)' }} />
                ))}
              </div>
            </div>

            {/* ARRIVAL */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace', lineHeight: 1, letterSpacing: '-1px' }}>
                {flight.arrival?.iata || '—'}
              </div>
              {flight.arrival?.airport && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6, fontWeight: 500, maxWidth: 160, marginLeft: 'auto' }}>
                  {flight.arrival.airport}
                </div>
              )}
              {arrTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                  <span style={{ color: 'var(--amber-500)', fontSize: 22, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{arrTime}</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-500)', boxShadow: '0 0 8px rgba(252,108,38,0.5)' }} />
                </div>
              )}
              {arrDate && <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{arrDate}</div>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Details Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Departure Info */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title="Departure" icon={MapPin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {flight.departure?.airport && <InfoChip label="Airport" value={flight.departure.airport} icon={Building2} />}
              {flight.departure?.iata    && <InfoChip label="IATA Code" value={flight.departure.iata} icon={Tag} />}
              {depTime                   && <InfoChip label="Scheduled" value={depTime} icon={Clock} />}
              {depDate                   && <InfoChip label="Date" value={depDate} icon={Calendar} />}
            </div>
          </SectionCard>
        </motion.div>

        {/* Arrival Info */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <SectionCard title="Arrival" icon={Navigation}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {flight.arrival?.airport && <InfoChip label="Airport" value={flight.arrival.airport} icon={Building2} />}
              {flight.arrival?.iata    && <InfoChip label="IATA Code" value={flight.arrival.iata} icon={Tag} />}
              {arrTime                 && <InfoChip label="Scheduled" value={arrTime} icon={Clock} />}
              {arrDate                 && <InfoChip label="Date" value={arrDate} icon={Calendar} />}
            </div>
          </SectionCard>
        </motion.div>

        {/* Flight Info */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <SectionCard title="Flight Info" icon={Info}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {flight.flight?.iata    && <InfoChip label="Flight IATA" value={flight.flight.iata} icon={Tag} />}
              {flight.flight?.number  && <InfoChip label="Number" value={flight.flight.number} icon={Tag} />}
              {flight.airline?.iata   && <InfoChip label="Airline IATA" value={flight.airline.iata} icon={Plane} />}
              {duration               && <InfoChip label="Duration" value={duration} icon={Clock} />}
            </div>
          </SectionCard>
        </motion.div>

        {/* Aircraft Info — only if available */}
        {flight.aircraft && (flight.aircraft.registration || flight.aircraft.iata) && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <SectionCard title="Aircraft" icon={Navigation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {flight.aircraft.registration && <InfoChip label="Registration" value={flight.aircraft.registration} icon={Tag} />}
                {flight.aircraft.iata         && <InfoChip label="Type" value={flight.aircraft.iata} icon={Plane} />}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </div>

      {/* ── Action Section ── */}
      <AnimatePresence mode="wait">
        {!isSelected ? (
          <motion.div
            key="pre-select"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ delay: 0.25 }}
            style={{
              padding: '24px 28px', borderRadius: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 800, margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Choose this flight?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Select this flight to add it to your trip planner and save it to your Wishlist.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              <motion.button
                onClick={handleSaveToBookings}
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={(savedToWishlist || savedToBookings) ? 'flight-saved-btn' : 'flight-save-btn'}
                aria-label={(savedToWishlist || savedToBookings) ? 'Flight saved to wishlist' : 'Save flight'}
              >
                {isSaving ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Heart size={15} />}
                <span>{(savedToWishlist || savedToBookings) ? 'Saved!' : 'Save Flight'}</span>
              </motion.button>

              <motion.button
                onClick={handleSelectFlight}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flight-detail-select-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 28px', borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FC6C26 0%, #E05818 100%)',
                  border: 'none', color: '#ffffff',
                  fontSize: 14, fontWeight: 800,
                  boxShadow: '0 8px 24px -4px rgba(252, 108, 38, 0.4)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '0.01em',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                Select This Flight
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ── POST-SELECTION CONFIRMATION ── */
          <motion.div
            key="post-select"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flight-post-select-card"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div className="flight-post-select-badge">
                <CheckCircle2 size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="flight-post-select-label" style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px' }}>
                  ✓ Flight Selected
                </p>
                <h3 style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 800, margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {flight.airline?.name ?? 'Flight'} {flight.flight?.iata ?? ''}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                  {flight.departure?.iata ?? '?'} → {flight.arrival?.iata ?? '?'}
                  {duration ? ` · ${duration}` : ''}
                  {depTime ? ` · Dep. ${depTime}` : ''}
                </p>
                {selectedFlight?.selectedAt && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '6px 0 0' }}>
                    Selected at {new Date(selectedFlight.selectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                {!(savedToWishlist || savedToBookings) && (
                  <motion.button
                    onClick={handleSaveToBookings}
                    disabled={isSaving}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {isSaving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Heart size={13} />}
                    Save to Wishlist
                  </motion.button>
                )}
                {(savedToWishlist || savedToBookings) && (
                  <div className="flight-saved-text" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <CheckCircle2 size={15} />
                    <span>Saved to Wishlist</span>
                  </div>
                )}
                <motion.button
                  onClick={handleContinue}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flight-continue-btn"
                >
                  Continue to Trip Planner
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        [data-theme='monochrome'] .flight-detail-select-btn {
          background: var(--text-primary) !important;
          color: var(--bg-primary) !important;
          box-shadow: none !important;
        }
        .flight-save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          transition: all 0.2s ease;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-default);
          color: var(--text-primary);
          cursor: pointer;
        }
        .flight-save-btn:hover {
          border-color: var(--amber-500);
          color: var(--amber-500);
        }
        /* ── Post-Selection Card & Elements (All Themes) ── */
        .flight-post-select-card {
          padding: 28px 32px;
          border-radius: 20px;
          background: var(--bg-card);
          border: 1.5px solid #000000;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        .flight-post-select-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          flex-shrink: 0;
          background: #000000;
          border: 1.5px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flight-post-select-badge svg {
          color: #ffffff;
        }
        .flight-post-select-label {
          color: #000000;
        }
        .flight-continue-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 12px;
          cursor: pointer;
          background: #000000;
          border: 1.5px solid #000000;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .flight-continue-btn:hover {
          background: #1f2937;
          border-color: #1f2937;
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
        }
        .flight-saved-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          transition: all 0.2s ease;
          background: #000000;
          border: 1.5px solid #000000;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
          cursor: default;
        }
        .flight-saved-btn svg {
          color: #ffffff;
          fill: #ffffff;
        }
        .flight-saved-text {
          color: #000000;
        }
        .flight-saved-text svg {
          color: #000000;
        }

        /* ── Dark Theme Overrides ── */
        [data-theme='dark'] .flight-post-select-card {
          background: var(--bg-card);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        [data-theme='dark'] .flight-post-select-badge {
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
        }
        [data-theme='dark'] .flight-post-select-badge svg {
          color: #ffffff;
        }
        [data-theme='dark'] .flight-post-select-label {
          color: #ffffff;
        }
        [data-theme='dark'] .flight-continue-btn {
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }
        [data-theme='dark'] .flight-continue-btn:hover {
          background: #111827;
          border-color: #ffffff;
        }
        [data-theme='dark'] .flight-saved-btn {
          background: #000000;
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          box-shadow: 0 0 14px rgba(0, 0, 0, 0.5);
        }
        [data-theme='dark'] .flight-saved-btn svg {
          color: #ffffff;
          fill: #ffffff;
        }
        [data-theme='dark'] .flight-saved-text {
          color: #ffffff;
        }
        [data-theme='dark'] .flight-saved-text svg {
          color: #ffffff;
        }

        /* ── Monochrome Theme Overrides ── */
        [data-theme='monochrome'] .flight-post-select-card {
          background: var(--bg-card);
          border: 1.5px solid #000000;
          box-shadow: none;
        }
        [data-theme='monochrome'] .flight-post-select-badge {
          background: #000000;
          border: 1.5px solid #000000;
        }
        [data-theme='monochrome'] .flight-post-select-badge svg {
          color: #ffffff;
        }
        [data-theme='monochrome'] .flight-post-select-label {
          color: #000000;
        }
        [data-theme='monochrome'] .flight-continue-btn {
          background: #000000;
          border: 1.5px solid #000000;
          color: #ffffff;
          box-shadow: none;
        }
        [data-theme='monochrome'] .flight-saved-btn {
          background: #ffffff;
          border-color: #000000;
          color: #000000;
          box-shadow: none;
        }
        [data-theme='monochrome'] .flight-saved-btn svg {
          color: #000000;
          fill: #000000;
        }
        [data-theme='monochrome'] .flight-saved-text {
          color: #000000;
        }
        [data-theme='monochrome'] .flight-saved-text svg {
          color: #000000;
        }
      `}</style>
    </motion.div>
  )
}

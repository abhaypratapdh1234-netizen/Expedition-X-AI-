// Step1Destination.tsx — "Where are we going?"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Cloud, Calendar, Users, Shield, DollarSign,
  ArrowRight, Gem, Plane, X, Check, Plus, ExternalLink
} from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { useFlightStore } from '../../../../stores/flightStore'
import { getCityFromAirport, type FlightData } from '../../../../services/flightService'
import { getDestinationStat } from '../../../../lib/ai-engine'
import { WizardShell } from './WizardShell'
import { findHiddenGems } from '../../../../services/intelligenceService'
import { useIntelligenceStore } from '../../../../stores/intelligenceStore'
import { Link } from 'react-router-dom'

const DESTINATION_CHIPS = [
  { label: '📍 Current Location', value: 'New Delhi', emoji: '📍' },
  { label: 'Mumbai', value: 'Mumbai', emoji: '🌊', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=100&auto=format&fit=crop' },
  { label: 'Paris', value: 'Paris', emoji: '🗼', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=100&auto=format&fit=crop' },
  { label: 'Goa', value: 'Goa', emoji: '🌴', img: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&q=100&auto=format&fit=crop' },
  { label: 'Dubai', value: 'Dubai', emoji: '🏙️', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=100&auto=format&fit=crop' },
  { label: 'Tokyo', value: 'Tokyo', emoji: '⛩️', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=100&auto=format&fit=crop' },
  { label: 'Bali', value: 'Bali', emoji: '🌺', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=100&auto=format&fit=crop' },
]

const QUICK_AVAILABLE_FLIGHTS: FlightData[] = [
  {
    flightDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    airline: { name: 'IndiGo', iata: '6E' },
    flight: { number: '1217', iata: '6E-1217' },
    departure: { airport: 'Indira Gandhi International Airport', iata: 'DEL', scheduled: `${new Date().toISOString().split('T')[0]}T07:15:00` },
    arrival: { airport: 'Chhatrapati Shivaji Maharaj International Airport', iata: 'BOM', scheduled: `${new Date().toISOString().split('T')[0]}T09:17:00` },
    aircraft: { registration: 'VT-IZH', iata: 'A320neo' }
  },
  {
    flightDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    airline: { name: 'Air India', iata: 'AI' },
    flight: { number: '805', iata: 'AI-805' },
    departure: { airport: 'Indira Gandhi International Airport', iata: 'DEL', scheduled: `${new Date().toISOString().split('T')[0]}T10:00:00` },
    arrival: { airport: 'Chhatrapati Shivaji Maharaj International Airport', iata: 'BOM', scheduled: `${new Date().toISOString().split('T')[0]}T12:10:00` },
    aircraft: { registration: 'VT-EXF', iata: 'A320-200' }
  },
  {
    flightDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    airline: { name: 'Vistara', iata: 'UK' },
    flight: { number: '995', iata: 'UK-995' },
    departure: { airport: 'Indira Gandhi International Airport', iata: 'DEL', scheduled: `${new Date().toISOString().split('T')[0]}T14:30:00` },
    arrival: { airport: 'Manohar International Airport', iata: 'GOX', scheduled: `${new Date().toISOString().split('T')[0]}T17:05:00` },
    aircraft: { registration: 'VT-TNA', iata: 'A320neo' }
  },
  {
    flightDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    airline: { name: 'Air India', iata: 'AI' },
    flight: { number: '143', iata: 'AI-143' },
    departure: { airport: 'Indira Gandhi International Airport', iata: 'DEL', scheduled: `${new Date().toISOString().split('T')[0]}T13:20:00` },
    arrival: { airport: 'Charles de Gaulle Airport', iata: 'CDG', scheduled: `${new Date().toISOString().split('T')[0]}T18:45:00` },
    aircraft: { registration: 'VT-ANI', iata: 'B787-8' }
  },
  {
    flightDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    airline: { name: 'Emirates', iata: 'EK' },
    flight: { number: '512', iata: 'EK-512' },
    departure: { airport: 'Indira Gandhi International Airport', iata: 'DEL', scheduled: `${new Date().toISOString().split('T')[0]}T09:55:00` },
    arrival: { airport: 'Dubai International Airport', iata: 'DXB', scheduled: `${new Date().toISOString().split('T')[0]}T12:15:00` },
    aircraft: { registration: 'A6-EEO', iata: 'B777-300ER' }
  }
]

function CrowdBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { label: 'Low Crowd', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    medium: { label: 'Moderate', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    high: { label: 'High Crowd', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' },
  }
  const c = config[level] || config.medium
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold border antialiased ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function Step1Destination() {
  const { destination, setDestination, setDurationDays, durationDays } = useWizardStore()
  const { selectedFlight, selectFlight, clearSelectedFlight } = useFlightStore()
  const profile = useIntelligenceStore(state => state.profile)

  const [query, setQuery] = useState('')
  const [hoveredDest, setHoveredDest] = useState<string | null>(null)
  const [showFlightModal, setShowFlightModal] = useState(false)

  // Normalize destination if an airport name was previously saved
  useEffect(() => {
    if (destination && (destination.toLowerCase().includes('airport') || destination.toLowerCase().includes('international'))) {
      const city = getCityFromAirport(destination)
      if (city && city !== destination) {
        setDestination(city)
      }
    }
  }, [destination, setDestination])

  // If no place is selected yet but flight is present, pre-fill place from flight arrival
  useEffect(() => {
    if (!destination && selectedFlight) {
      const arrivalDest = selectedFlight.arrival?.airport || selectedFlight.arrival?.iata || ''
      const city = getCityFromAirport(arrivalDest)
      if (city) {
        setDestination(city)
      }
    }
  }, [destination, selectedFlight, setDestination])

  const displayDest = hoveredDest || destination
  const stat = displayDest ? getDestinationStat(displayDest) : null

  const filteredChips = DESTINATION_CHIPS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  )

  const isCustomDest = destination &&
    !destination.toLowerCase().includes('airport') &&
    !DESTINATION_CHIPS.some(c => c.value.toLowerCase() === destination.toLowerCase())

  const chipsToDisplay = [...filteredChips]
  if (isCustomDest && (!query || destination.toLowerCase().includes(query.toLowerCase()))) {
    chipsToDisplay.unshift({ label: destination, value: destination, emoji: '🌍' } as any)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const cleanCity = getCityFromAirport(query.trim()) || query.trim()
      setDestination(cleanCity)
      setQuery('')
    }
  }

  const handlePickFlight = (flight: FlightData) => {
    selectFlight(flight)
    const arrivalDest = flight.arrival?.airport || flight.arrival?.iata || ''
    const city = getCityFromAirport(arrivalDest)
    if (city && (!destination || destination === 'New Delhi')) {
      setDestination(city)
    }
    setShowFlightModal(false)
  }

  return (
    <WizardShell canProceed={!!destination}>
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse" />
              <span className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--text-primary)]">AI TRIP SETUP</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-[var(--text-primary)] mb-4 leading-tight antialiased">
            Where are we<br />going?
          </h1>
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-8 max-w-lg mx-auto leading-relaxed antialiased">
            Pick your flight and destination place to build your expedition.
          </p>

          {/* ── 1. SELECT FLIGHT (1 Flight) ── */}
          <div className="max-w-xl mx-auto mb-8 text-left">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Plane size={15} className="text-[#FC6C26]" />
                1. Select Flight (1 Flight)
              </span>
              {selectedFlight ? (
                <span
                  className="text-[11px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5"
                  style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #000000' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  1 Flight Selected
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  Optional
                </span>
              )}
            </div>

            {selectedFlight ? (
              <div className="bg-[var(--bg-card)] border-2 border-[#FC6C26]/30 hover:border-[#FC6C26]/50 rounded-[22px] p-4 shadow-sm flex items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26] shrink-0 font-black">
                    <Plane size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-black text-[var(--text-primary)] truncate">
                        {selectedFlight.airline?.name || 'Flight'} {selectedFlight.flightIata || selectedFlight.flightNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        {selectedFlight.departure?.iata} → {selectedFlight.arrival?.iata}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] font-medium truncate mt-0.5">
                      {selectedFlight.arrival?.airport || selectedFlight.arrival?.iata} · {selectedFlight.departure?.scheduled ? new Date(selectedFlight.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowFlightModal(true)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
                  >
                    Change Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => clearSelectedFlight()}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove flight"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFlightModal(true)}
                className="w-full bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] hover:border-[#FC6C26]/60 rounded-[22px] p-4 text-center transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FFF5F0] text-[#FC6C26] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={16} />
                </div>
                <span className="text-[14px] font-bold text-[var(--text-primary)] group-hover:text-[#FC6C26] transition-colors">
                  Select a Flight for this Expedition (1 Flight)
                </span>
              </button>
            )}
          </div>

          {/* ── 2. SELECT PLACE (1 Place) ── */}
          <div className="flex items-center justify-center mb-3">
            <span className="text-[12px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <MapPin size={14} className="text-[#3fa796]" />
              2. Select Destination Place (1 Place)
            </span>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto mb-8">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search destination city or district…"
              className="w-full pl-13 pr-24 py-5 rounded-[20px] text-[17px] font-bold border-2 border-[var(--border-subtle)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#FC6C26] focus:shadow-[0_0_0_4px_rgba(252,108,38,0.15)] transition-all shadow-sm tracking-wide antialiased"
              style={{ paddingLeft: '3.25rem' }}
              aria-label="Search for destination"
            />
            {query.trim() ? (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-xl text-[14px] font-black hover:bg-[#FC6C26] transition-colors cursor-pointer"
              >
                Set
              </button>
            ) : (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="inline-flex items-center justify-center h-7 px-2 bg-gray-50 border border-[var(--border-subtle)] rounded-[6px] text-[13px] font-bold text-[var(--text-muted)] font-sans shadow-[0_2px_0_0_rgba(229,231,235,1)]">⌘</kbd>
                <kbd className="inline-flex items-center justify-center h-7 px-2 bg-gray-50 border border-[var(--border-subtle)] rounded-[6px] text-[13px] font-bold text-[var(--text-muted)] font-sans shadow-[0_2px_0_0_rgba(229,231,235,1)]">K</kbd>
              </div>
            )}
          </form>

          {/* Destination Chip Row */}
          <div className="flex flex-wrap items-center gap-3 pb-3 justify-center mb-12">
            {chipsToDisplay.map((chip, i) => {
              const isSelected = destination?.toLowerCase() === chip.value.toLowerCase()
              return (
              <motion.button
                key={chip.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onHoverStart={() => setHoveredDest(chip.value)}
                onHoverEnd={() => setHoveredDest(null)}
                onClick={() => setDestination(chip.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[20px] text-[16px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 border-2 shadow-sm shrink-0 group antialiased cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-[0_8px_20px_-8px_rgba(252,108,38,0.5)] scale-105'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:shadow-lg hover:-translate-y-1'
                }`}
                aria-pressed={isSelected}
              >
                {chip.img ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-inner">
                    <img src={chip.img} alt={chip.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {isSelected && <div className="absolute inset-0 bg-[#FC6C26]/20 mix-blend-overlay" />}
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#FC6C26]' : 'bg-[#FFF5F0]'}`}>
                    <MapPin size={16} className={isSelected ? 'text-white' : 'text-[#FC6C26]'} />
                  </div>
                )}
                {chip.label}
              </motion.button>
            )})}
          </div>

          {/* Duration selector */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="text-[17px] font-black text-[var(--text-primary)]">Trip duration:</span>
            {[2, 3, 5, 7, 10].map(d => (
              <button
                key={d}
                onClick={() => setDurationDays(d)}
                className={`px-4 py-2 rounded-[12px] text-[15px] font-bold tracking-tight border-2 transition-all shadow-sm antialiased ${
                  durationDays === d
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {d}N
              </button>
            ))}
          </div>

          {/* Animated Stat Cards */}
          <AnimatePresence mode="wait">
            {stat && displayDest && (
              <motion.div
                key={displayDest}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-3"
              >
                {[
                  { icon: Cloud, label: 'Weather', value: stat.weather, sub: stat.tempRange, color: '#3fa796' },
                  { icon: Calendar, label: 'Best Months', value: stat.bestMonths, sub: '', color: '#FC6C26' },
                  { icon: Users, label: 'Crowd Level', value: '', sub: '', color: '#c084fc', custom: <CrowdBadge level={stat.crowdLevel} /> },
                  { icon: Shield, label: 'Safety', value: `${stat.safetyScore}/10`, sub: stat.safetyScore >= 8 ? '✅ Safe' : '⚠️ Caution', color: stat.safetyScore >= 8 ? '#3fa796' : '#FC6C26' },
                  { icon: DollarSign, label: 'Est. Budget', value: `₹${(stat.budgetMin / 1000).toFixed(0)}k–${(stat.budgetMax / 1000).toFixed(0)}k`, sub: '/ person', color: '#1B2A4A' },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[var(--bg-card)] rounded-[20px] p-4 border border-[var(--border-subtle)] shadow-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3"
                         style={{ background: `${card.color}15` }}>
                      <card.icon size={16} style={{ color: card.color }} />
                    </div>
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.label}</p>
                    {card.custom || (
                      <>
                        <p className="text-[16px] font-extrabold text-[var(--text-primary)] leading-tight antialiased">{card.value}</p>
                        {card.sub && <p className="text-[13px] text-[var(--text-secondary)] font-bold mt-0.5 antialiased">{card.sub}</p>}
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!displayDest && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex justify-between items-center w-full max-w-4xl mx-auto px-6 relative">
              <div className="flex-1 text-center">
                <span className="inline-flex items-center justify-center bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] text-[var(--text-primary)] px-6 py-3 rounded-full text-[16px] font-bold shadow-sm antialiased">
                  Select a destination above to see travel stats ↑
                </span>
              </div>
            </motion.div>
          )}

          {/* Hidden Gems suggestions */}
          {destination && (() => {
            const dna = profile?.dna || {
              mountains: 50, beach: 50, adventure: 50, luxury: 50, 
              history: 50, food: 50, photography: 50, shopping: 50, nightlife: 50
            } as any;
            const gems = findHiddenGems(dna, 3, destination)
            if (!gems.length) return null
            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-[var(--bg-card)] rounded-[24px] p-5 border border-[var(--border-subtle)] shadow-sm text-left"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                    <Gem size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[var(--text-primary)] antialiased">Hidden Gems for You</p>
                    <p className="text-[13px] font-semibold text-[var(--text-secondary)] tracking-tight antialiased">Lesser-known alternatives matching your Travel DNA</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {gems.map(gem => {
                    const isLow = gem.crowd_level === 'low'
                    const isMed = gem.crowd_level === 'medium'
                    const badgeBg = isLow ? 'bg-emerald-500/10' : isMed ? 'bg-amber-500/10' : 'bg-red-500/10'
                    const badgeText = isLow ? 'text-emerald-500' : isMed ? 'text-amber-500' : 'text-red-500'
                    const badgeBorder = isLow ? 'border-emerald-500/20' : isMed ? 'border-amber-500/20' : 'border-red-500/20'
                    return (
                    <button
                      key={gem.name}
                      onClick={() => useWizardStore.getState().setDestination(gem.name)}
                      className="flex items-center gap-4 w-full p-4 rounded-[16px] border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all group antialiased"
                    >
                      <span className="text-[20px]">{gem.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors antialiased">{gem.name}</p>
                        <p className="text-[13px] font-semibold text-[var(--text-muted)] antialiased">{gem.why_hidden}</p>
                      </div>
                      <span className={`text-[12px] font-bold tracking-tight px-2.5 py-1 rounded-full border shrink-0 antialiased ${badgeBg} ${badgeText} ${badgeBorder}`}>
                        {gem.crowd_level} crowd
                      </span>
                    </button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })()}
        </motion.div>
      </div>

      {/* Flight Selection Modal */}
      <AnimatePresence>
        {showFlightModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FC6C26]/10 text-[#FC6C26] flex items-center justify-center font-black">
                      <Plane size={18} />
                    </div>
                    <h3 className="text-[20px] font-black text-[var(--text-primary)]">
                      Select 1 Flight for Trip
                    </h3>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1 font-medium">
                    Pick a scheduled flight to attach to your itinerary and PDF export.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFlightModal(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Flight List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {QUICK_AVAILABLE_FLIGHTS.map((flight) => {
                  const isCurrent =
                    (selectedFlight?.flightIata && selectedFlight.flightIata === flight.flight?.iata) ||
                    (selectedFlight?.flightNumber && selectedFlight.flightNumber === flight.flight?.number)

                  return (
                    <div
                      key={flight.flight?.iata || flight.flight?.number}
                      onClick={() => handlePickFlight(flight)}
                      className={`p-4 rounded-[18px] border-2 transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                        isCurrent
                          ? 'border-[#FC6C26] bg-[#FC6C26]/5 shadow-sm'
                          : 'border-[var(--border-subtle)] hover:border-[#FC6C26]/60 hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#FC6C26] text-white'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] group-hover:bg-[#FFF5F0] group-hover:text-[#FC6C26]'
                          } transition-colors`}
                        >
                          <Plane size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-black text-[var(--text-primary)]">
                              {flight.airline?.name} {flight.flight?.iata}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                              {flight.departure?.iata} → {flight.arrival?.iata}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--text-secondary)] font-medium truncate mt-0.5">
                            {flight.arrival?.airport}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                            Dep {flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '07:15'} · Arr {flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:17'} · {flight.aircraft?.iata || 'Jet'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCurrent ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-[12px] font-black px-3 py-1.5 rounded-xl shadow-sm"
                            style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #000000' }}
                          >
                            <Check size={14} className="text-white" /> Selected
                          </span>
                        ) : (
                          <span className="text-[12px] font-bold text-[#FC6C26] group-hover:bg-[#FC6C26] group-hover:text-white px-3 py-1.5 rounded-xl border border-[#FC6C26]/30 transition-all">
                            Select Flight
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 px-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 flex items-center justify-between">
                <Link
                  to="/app/flights"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#FC6C26] hover:underline"
                >
                  <ExternalLink size={14} /> Search all global flights
                </Link>
                <button
                  type="button"
                  onClick={() => setShowFlightModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WizardShell>
  )
}

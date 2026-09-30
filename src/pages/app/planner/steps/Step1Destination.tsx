/**
 * Step1Destination.tsx — Feature #7: Reverse Travel Search
 * Multi-criteria scoring algorithm, NOT ML
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, Clock, Wallet, Leaf, ArrowRight, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { findDestinations, type DestinationMatch, type DestinationFilter } from '../../../../services/plannerFeatures'
import { usePlannerStore } from '../../../../stores/plannerStore'

const DESTINATION_CHIPS = [
  { label: '📍 Current Location', value: 'New Delhi', emoji: '📍' },
  { label: 'Paris', value: 'Paris', emoji: '🗼', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=100&auto=format&fit=crop' },
  { label: 'Goa', value: 'Goa', emoji: '🌴', img: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&q=100&auto=format&fit=crop' },
  { label: 'Dubai', value: 'Dubai', emoji: '🏙️', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=100&auto=format&fit=crop' },
  { label: 'Tokyo', value: 'Tokyo', emoji: '⛩️', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=100&auto=format&fit=crop' },
  { label: 'Bali', value: 'Bali', emoji: '🌺', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=100&auto=format&fit=crop' },
]

const VIBE_OPTIONS = [
  { label: 'Beach', emoji: '🏖️' },
  { label: 'Hill', emoji: '🏔️' },
  { label: 'Heritage', emoji: '🏯' },
  { label: 'Adventure', emoji: '🪂' },
  { label: 'City', emoji: '🌆' },
  { label: 'Spiritual', emoji: '🕌' },
  { label: 'Wildlife', emoji: '🐘' },
  { label: 'Nature', emoji: '🌿' },
]

const BUDGET_PRESETS = [
  { label: 'Budget', value: 2000, emoji: '💸' },
  { label: 'Mid-range', value: 4000, emoji: '💳' },
  { label: 'Premium', value: 8000, emoji: '💎' },
]

export function Step1Destination() {
  const { setSelectedDestination, setSession, setStep, completeStep, session } = usePlannerStore()

  const [filters, setFilters] = useState<DestinationFilter>({
    budgetPerDay: 4000,
    vibes: [],
    maxFlightHours: 4,
    month: new Date().getMonth() + 1,
  })
  const [results, setResults] = useState<DestinationMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(session?.destination || null)
  const [startDate, setStartDate] = useState(session?.startDate || '')
  const [duration, setDuration] = useState(session?.durationDays || 5)
  const [query, setQuery] = useState('')
  const [hoveredDest, setHoveredDest] = useState<string | null>(null)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    const res = await findDestinations(filters)
    setResults(res)
    setLoading(false)
  }

  const toggleVibe = (vibe: string) => {
    setFilters(f => ({
      ...f,
      vibes: f.vibes?.includes(vibe) ? f.vibes.filter(v => v !== vibe) : [...(f.vibes ?? []), vibe]
    }))
  }

  const handleSelect = (dest: DestinationMatch) => {
    setSelected(dest.id)
    setSelectedDestination(dest)
    setSession({
      destination: dest.name,
      vibes: dest.vibes,
      budgetPerDay: filters.budgetPerDay ?? 4000,
      waypoints: [dest.name],
      startDate,
      durationDays: duration,
    })
  }

  const handleContinue = () => {
    if (!selected) return
    completeStep(1)
    setStep(2)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleSelect({
        id: query.trim(),
        name: query.trim(),
        vibes: [],
        country: 'Global',
        region: 'Custom',
        continent: 'Global',
        description: 'Custom destination',
        matchScore: 100,
        stats: { budgetPerDay: 4000, bestMonths: [1,2,3], flightHours: 5, safetyScore: 90, natureIndex: 50, crowdLevel: 'medium' }
      })
      setQuery('')
    }
  }

  const filteredChips = DESTINATION_CHIPS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pb-24 text-center">
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

        <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tighter text-[var(--text-primary)] mb-4 leading-tight drop-shadow-sm">
          Where are we<br />going?
        </h1>
        <p className="text-[var(--text-primary)] text-[18px] font-extrabold mb-10 max-w-lg mx-auto leading-relaxed">
          Pick a destination and the AI will build your perfect expedition.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto mb-10">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search destination…"
            className="w-full pl-13 pr-24 py-5 rounded-[20px] text-[17px] font-black border-2 border-[var(--border-subtle)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#FC6C26] focus:shadow-[0_0_0_4px_rgba(252,108,38,0.08)] transition-all shadow-sm tracking-wide text-left"
            style={{ paddingLeft: '3.25rem' }}
            aria-label="Search for destination"
          />
          {query.trim() ? (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-5 py-2.5 rounded-xl text-[14px] font-black hover:bg-[#FC6C26] hover:text-white transition-colors"
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
          {filteredChips.map((chip, i) => {
            const isSelected = selected?.toLowerCase() === chip.value.toLowerCase()
            return (
            <motion.button
              key={chip.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onHoverStart={() => setHoveredDest(chip.value)}
              onHoverEnd={() => setHoveredDest(null)}
              onClick={() => handleSelect({ id: chip.value, name: chip.value, vibes: [], country: 'Global', region: 'Global', continent: 'Global', description: 'Selected', matchScore: 100, stats: { budgetPerDay: 4000, bestMonths: [], flightHours: 4, safetyScore: 90, natureIndex: 50, crowdLevel: 'medium' } })}
              className={`flex items-center gap-3 px-4 py-3 rounded-[20px] text-[16px] font-black tracking-tight whitespace-nowrap transition-all duration-300 border-2 shadow-sm shrink-0 group ${
                isSelected
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-lg scale-105'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[#FC6C26]/40 hover:shadow-lg hover:-translate-y-1'
              }`}
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
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[20px] px-4 py-2">
            <Calendar size={16} className="text-[#FC6C26]" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-[15px] font-black text-[var(--text-primary)] bg-transparent outline-none w-32"
            />
          </div>
          <span className="text-[17px] font-black text-[var(--text-primary)]">Trip duration:</span>
          {[2, 3, 5, 7, 10].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`w-12 h-10 flex flex-col items-center justify-center rounded-[12px] font-black transition-all ${
                duration === d
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-md scale-110'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[#FC6C26] hover:text-[#FC6C26]'
              }`}
            >
              <span className="text-[14px]">{d}N</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Advanced Filter panel toggle */}
      <div className="text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden mb-8">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#FC6C26]" />
            <span className="text-[15px] font-black text-[var(--text-primary)]">Advanced Discovery Filters</span>
            {filters.vibes && filters.vibes.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FC6C26] text-white text-[12px] font-black ml-2">
                {filters.vibes.length} active
              </span>
            )}
          </div>
          {filtersOpen ? <ChevronUp size={18} className="text-[var(--text-muted)]" /> : <ChevronDown size={18} className="text-[var(--text-muted)]" />}
        </button>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-gray-50"
            >
              <div className="p-4 space-y-4">
                {/* Vibes */}
                <div>
                  <p className="text-[12px] font-black uppercase tracking-wider text-[var(--text-primary)] mb-2">Travel Vibe</p>
                  <div className="flex flex-wrap gap-2">
                    {VIBE_OPTIONS.map(v => {
                      const isSelected = filters.vibes?.includes(v.label)
                      return (
                        <button
                          key={v.label}
                          onClick={() => toggleVibe(v.label)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-extrabold border transition-all ${
                            isSelected
                              ? 'bg-[#FC6C26] text-white border-[#FC6C26] shadow-md'
                              : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[#FC6C26]/40'
                          }`}
                        >
                          <span>{v.emoji}</span> {v.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <p className="text-[12px] font-black uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    Budget per day · <span className="text-[#FC6C26]">₹{filters.budgetPerDay?.toLocaleString()}/day</span>
                  </p>
                  <div className="flex gap-2">
                    {BUDGET_PRESETS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => setFilters(f => ({ ...f, budgetPerDay: b.value }))}
                        className={`flex-1 px-3 py-2.5 rounded-xl text-[13px] font-black border transition-all ${
                          filters.budgetPerDay === b.value
                            ? 'bg-[#FC6C26]/10 border-[#FC6C26] text-[#FC6C26]'
                            : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        {b.emoji} {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flight time */}
                <div>
                  <p className="text-[12px] font-black uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    Max flight time · <span className="text-[#FC6C26]">{filters.maxFlightHours}h</span>
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={filters.maxFlightHours}
                    onChange={e => setFilters(f => ({ ...f, maxFlightHours: Number(e.target.value) }))}
                    className="w-full accent-[#FC6C26]"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] mt-1">
                    <span>1h</span><span>6h</span><span>12h</span>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[13px] font-black hover:bg-[#FC6C26] hover:text-white transition-colors"
                >
                  <Search size={13} className="inline mr-2" />
                  Search Destinations
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="text-left space-y-4">
        {results.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-[16px] font-black text-[var(--text-primary)] tracking-tight">
              {results.length} destinations ranked by match score
            </h3>
            <span className="text-[12px] font-bold text-[var(--text-primary)]/75 hidden sm:block">
              Algorithm: weighted scoring · Budget(25) + Vibe(35) + Flight(20) + Season(20)
            </span>
          </div>
        )}  
        
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {results.slice(0, 15).map((dest, idx) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleSelect(dest)}
                className={`bg-[var(--bg-card)] rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selected === dest.id
                    ? 'border-black dark:border-white shadow-[0_0_0_2px_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.3)]'
                    : 'border-black/15 dark:border-white/15 hover:border-black/40 dark:hover:border-white/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji */}
                  <div className="text-3xl shrink-0 p-1.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl border border-black/5 dark:border-white/10">{dest.emoji}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[18px] font-black text-[var(--text-primary)] tracking-tight">{dest.name}</p>
                        <p className="text-[13.5px] font-bold text-[var(--text-primary)]/80 mt-0.5">{dest.region} · {dest.country}</p>
                      </div>
                      
                      {/* Match score - Black High Contrast Badge */}
                      <div className="shrink-0 flex flex-col items-center px-3.5 py-1.5 rounded-2xl bg-black/[0.05] dark:bg-neutral-800/90 border-2 border-black dark:border-white/40 shadow-sm">
                        <span className="text-[19px] font-black text-black dark:text-white leading-tight">
                          {dest.matchScore}%
                        </span>
                        <span className="text-[10px] font-black text-black/85 dark:text-white/85 uppercase tracking-widest mt-0.5">
                          match
                        </span>
                      </div>
                    </div>

                    <p className="text-[14px] font-semibold text-[var(--text-primary)]/90 mt-2 line-clamp-1">
                      {dest.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--text-primary)]">
                        <Wallet size={14} className="text-[#FC6C26]" />₹{dest.budgetMin.toLocaleString()}–{dest.budgetMax.toLocaleString()}/day
                      </span>
                      <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--text-primary)]">
                        <Clock size={14} className="text-[#FC6C26]" />{dest.flightHours}h flight
                      </span>
                      {dest.matchedFilters.slice(0, 2).map(f => (
                        <span key={f} className="px-2.5 py-1 rounded-full bg-[#FC6C26]/15 text-[#D94F0C] dark:text-[#FC6C26] text-[11px] font-black border border-[#FC6C26]/20">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Source attribution */}
      <p className="text-[11.5px] font-bold text-[var(--text-primary)]/75 text-center mt-8">
        Scoring: 15-destination seed dataset · REST Countries metadata · Season-aware weighting · No ML — transparent algorithm
      </p>

      {/* Continue Button Float */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-12 z-50"
        >
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 px-8 py-4 rounded-[16px] text-[16px] font-black tracking-tight transition-all shadow-xl border-2 bg-black text-white border-black dark:border-neutral-700 hover:bg-neutral-900 cursor-pointer select-none active:scale-[0.99]"
          >
            Continue to Route <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  )
}

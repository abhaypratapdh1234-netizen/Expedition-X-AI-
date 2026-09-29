// Step1Destination.tsx — "Where are we going?"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Cloud, Calendar, Users, Shield, DollarSign, ArrowRight, Gem } from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { getDestinationStat } from '../../../../lib/ai-engine'
import { WizardShell } from './WizardShell'
import { findHiddenGems } from '../../../../services/intelligenceService'
import { useIntelligenceStore } from '../../../../stores/intelligenceStore'

const DESTINATION_CHIPS = [
  { label: '📍 Current Location', value: 'New Delhi', emoji: '📍' },
  { label: 'Paris', value: 'Paris', emoji: '🗼', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=100&auto=format&fit=crop' },
  { label: 'Goa', value: 'Goa', emoji: '🌴', img: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&q=100&auto=format&fit=crop' },
  { label: 'Dubai', value: 'Dubai', emoji: '🏙️', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=100&auto=format&fit=crop' },
  { label: 'Tokyo', value: 'Tokyo', emoji: '⛩️', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=100&auto=format&fit=crop' },
  { label: 'Bali', value: 'Bali', emoji: '🌺', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=100&auto=format&fit=crop' },
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
  const profile = useIntelligenceStore(state => state.profile)

  const [query, setQuery] = useState('')
  const [hoveredDest, setHoveredDest] = useState<string | null>(null)

  const displayDest = hoveredDest || destination
  const stat = displayDest ? getDestinationStat(displayDest) : null

  const filteredChips = DESTINATION_CHIPS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  )

  const isCustomDest = destination && !DESTINATION_CHIPS.some(c => c.value.toLowerCase() === destination.toLowerCase())
  const chipsToDisplay = [...filteredChips]
  if (isCustomDest && (!query || destination.toLowerCase().includes(query.toLowerCase()))) {
    chipsToDisplay.unshift({ label: destination, value: destination, emoji: '🌍' } as any)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setDestination(query.trim())
      setQuery('')
    }
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
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-10 max-w-lg mx-auto leading-relaxed antialiased">
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
              className="w-full pl-13 pr-24 py-5 rounded-[20px] text-[17px] font-bold border-2 border-[var(--border-subtle)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#FC6C26] focus:shadow-[0_0_0_4px_rgba(252,108,38,0.15)] transition-all shadow-sm tracking-wide antialiased"
              style={{ paddingLeft: '3.25rem' }}
              aria-label="Search for destination"
            />
            {query.trim() ? (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-xl text-[14px] font-black hover:bg-[#FC6C26] transition-colors"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-[20px] text-[16px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 border-2 shadow-sm shrink-0 group antialiased ${
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
    </WizardShell>
  )
}

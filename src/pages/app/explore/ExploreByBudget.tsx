import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DESTINATIONS } from '../../../data/mockData'
import { Star, MapPin, ArrowRight, Zap, Filter, X } from 'lucide-react'

const DURATION_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '5 days', days: 5 },
  { label: '7 days', days: 7 },
  { label: '2 weeks', days: 14 },
]

const CATEGORY_FILTERS = ['All', 'Adventure', 'Beach', 'Historical', 'Nature', 'Offbeat', 'Food']

const BUDGET_PRESETS = [
  { label: '< ₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹20K', value: 20000 },
  { label: '₹50K', value: 50000 },
  { label: '₹1L', value: 100000 },
  { label: '₹2L', value: 200000 },
]

function getBudgetLabel(budget: number) {
  if (budget >= 100000) return `₹${(budget / 100000).toFixed(1)}L`
  if (budget >= 1000) return `₹${(budget / 1000).toFixed(0)}K`
  return `₹${budget}`
}

function getBudgetRating(cost: number, budget: number, days: number): 'great' | 'good' | 'tight' {
  const total = cost * days
  const ratio = total / budget
  if (ratio < 0.6) return 'great'
  if (ratio < 0.85) return 'good'
  return 'tight'
}

const RATING_CONFIG = {
  great: { label: '🤑 Great Value', color: 'var(--success)', bg: 'rgba(63,167,150,0.1)' },
  good: { label: '👌 Good Value', color: 'var(--teal-700)', bg: 'rgba(15,107,92,0.08)' },
  tight: { label: '💸 Fits Tightly', color: 'var(--warning)', bg: 'rgba(232,163,61,0.1)' },
}

export function ExploreByBudget() {
  const [budget, setBudget] = useState(30000)
  const [duration, setDuration] = useState(3)
  const [category, setCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const totalCost = (d.costPerDay || 0) * duration
      const budgetOk = totalCost <= budget
      const categoryOk = category === 'All' || d.category.some(c => c.toLowerCase().includes(category.toLowerCase()))
      return budgetOk && categoryOk
    }).sort((a, b) => ((a.costPerDay || 0) * duration) - ((b.costPerDay || 0) * duration))
  }, [budget, duration, category])

  const maxCost = Math.max(...DESTINATIONS.map(d => (d.costPerDay || 0))) * duration
  const budgetPercent = Math.min((budget / maxCost) * 100, 100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Explore by Budget</h1>
        <p style={{ color: 'var(--text-muted)' }}>Move the slider to discover destinations within your budget.</p>
      </motion.div>

      {/* Budget Control Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="p-6 rounded-2xl mb-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
      >
        {/* Budget Display */}
        <div className="text-center mb-6">
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Show me trips under</p>
          <motion.div
            key={budget}
            initial={{ scale: 0.95, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold font-display"
            style={{ color: 'var(--teal-700)' }}
          >
            {getBudgetLabel(budget)}
          </motion.div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            total budget for {duration} day{duration > 1 ? 's' : ''}
          </p>
        </div>

        {/* Slider */}
        <div className="relative mb-3">
          <div className="relative h-3 rounded-full mb-2" style={{ background: 'var(--bg-secondary)' }}>
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--teal-700), var(--teal-400))' }}
              animate={{ width: `${budgetPercent}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
          <input
            type="range"
            min="3000"
            max="500000"
            step="1000"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
          />
        </div>

        {/* Budget Presets */}
        <div className="flex gap-2 flex-wrap justify-center mb-5">
          {BUDGET_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => setBudget(preset.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: budget === preset.value ? 'var(--teal-700)' : 'var(--bg-secondary)',
                color: budget === preset.value ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${budget === preset.value ? 'var(--teal-700)' : 'var(--border-default)'}`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Duration Selector */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Trip Duration</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setDuration(opt.days)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                style={{
                  background: duration === opt.days ? 'var(--teal-700)' : 'var(--bg-secondary)',
                  color: duration === opt.days ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${duration === opt.days ? 'var(--teal-700)' : 'var(--border-default)'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Category Filter + Results Count */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all"
              style={{
                background: category === cat ? 'rgba(15,107,92,0.1)' : 'transparent',
                color: category === cat ? 'var(--teal-700)' : 'var(--text-muted)',
                border: `1px solid ${category === cat ? 'var(--teal-500)' : 'var(--border-subtle)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <motion.p
          key={`${filtered.length}-${budget}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-semibold shrink-0"
          style={{ color: 'var(--teal-700)' }}
        >
          {filtered.length} found
        </motion.p>
      </div>

      {/* Results */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">😅</div>
            <h3 className="font-display text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Budget too low!</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Try increasing your budget or reducing the trip duration.
            </p>
            <button
              onClick={() => { setBudget(50000); setCategory('All') }}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'var(--teal-700)' }}
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((dest, i) => {
              const totalCost = (dest.costPerDay || 0) * duration
              const rating = getBudgetRating((dest.costPerDay || 0), budget, duration)
              const config = RATING_CONFIG[rating]
              return (
                <motion.div
                  key={dest.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/app/explore/place/${dest.id}`}>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-card)',
                        transition: 'box-shadow 0.3s',
                      }}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Value badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{ background: config.bg, color: config.color, backdropFilter: 'blur(8px)' }}
                          >
                            {config.label}
                          </span>
                        </div>

                        {/* Cost */}
                        <div className="absolute bottom-3 left-3">
                          <span
                            className="px-2.5 py-1.5 rounded-lg text-white text-xs font-bold"
                            style={{ background: 'rgba(242,153,74,0.92)', backdropFilter: 'blur(4px)' }}
                          >
                            ₹{totalCost.toLocaleString()} for {duration}d
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{dest.name}</h3>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          <MapPin size={10} /> {dest.state}
                          <span className="mx-1">·</span>
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /> {dest.rating}
                        </p>

                        {/* Budget bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                            <span>₹{(dest.costPerDay || 0).toLocaleString()}/day</span>
                            <span style={{ color: config.color }}>{Math.round((totalCost / budget) * 100)}% of budget</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: config.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-1 flex-wrap">
                            {(dest.category || []).slice(0, 2).map((c: string) => (
                              <span
                                key={c}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                              >
                                {c.trim()}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs flex items-center gap-0.5 font-semibold" style={{ color: 'var(--teal-600)' }}>
                            View <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tip */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-2xl flex items-start gap-3"
          style={{ background: 'rgba(108,91,123,0.06)', border: '1px solid rgba(108,91,123,0.15)' }}
        >
          <Zap size={16} style={{ color: 'var(--violet-600)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--violet-600)' }}>AI INSIGHT</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {filtered[0]?.name} offers the best value for your ₹{getBudgetLabel(budget)} budget over {duration} day{duration > 1 ? 's' : ''}. 
              You'll have <strong style={{ color: 'var(--success)' }}>₹{(budget - ((filtered[0]?.costPerDay || 0) * duration)).toLocaleString()}</strong> left 
              for food, shopping, and experiences!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/**
 * FutureCrowdMapPage.tsx — Standing Alone Future Crowd Map™
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Search, MapPin, Flame, AlertCircle } from 'lucide-react'
import { DESTINATIONS } from '../../../data/mockData'
import { CrowdForecast } from '../../../components/planner/CrowdForecast'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { useThemeStore } from '../../../stores/themeStore'

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
const FONT_MONO = "'Inter', 'Segoe UI', sans-serif"

export function FutureCrowdMapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('2') // Default to Hallstatt (id: '2')
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  // Get unique categories for filter tabs
  const categories = useMemo(() => {
    const allCats = new Set<string>()
    DESTINATIONS.forEach(d => {
      if (Array.isArray(d.category)) {
        d.category.forEach(c => allCats.add(c))
      }
    })
    return ['All', ...Array.from(allCats)]
  }, [])

  // Filtered destination list
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.country.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCat = selectedCategory === 'All' || 
                         (Array.isArray(d.category) && d.category.includes(selectedCategory))
                         
      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory])

  // Currently selected destination
  const activePlace = useMemo(() => {
    return DESTINATIONS.find(d => d.id === selectedPlaceId) || DESTINATIONS[0]
  }, [selectedPlaceId])

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
        className="premium-border-glow-wrapper-teal"
        style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 40, padding: '52px 56px', marginBottom: 36,
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #0f172a 100%)',
          boxShadow: '0 20px 60px rgba(52,211,153,0.18), 0 4px 16px rgba(0,0,0,0.2)',
          border: '1px solid rgba(52,211,153,0.35)',
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(52,211,153,0.18)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 0%, rgba(52,211,153,0.12), transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 700 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.40)',
            marginBottom: 22,
          }}>
            <Flame size={11} style={{ color: '#6ee7b7', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#6ee7b7', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT }}>
              Infrastructure Intelligence Layer
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(44px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.0,
            color: '#ffffff', margin: '0 0 20px', letterSpacing: '-0.045em',
            fontFamily: FONT, textShadow: '0 2px 20px rgba(52,211,153,0.3)',
          }}>
            Future Crowd Map™
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 17, fontWeight: 500, lineHeight: 1.65, color: '#a7f3d0',
            maxWidth: 560, margin: 0, letterSpacing: '-0.01em', fontFamily: FONT_MONO,
          }}>
            Avoid oversaturation and plan around peak hours. Search any destination to see its 
            real-time saturation forecasts, historical baselines, and book anonymous visiting slots.
          </p>
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}
        className="grid-cols-1 lg:grid-cols-[360px_1fr]"
      >
        {/* Left: Destination Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search panel */}
          <div style={{
            padding: '20px 20px 16px', borderRadius: 24,
            background: isDark ? '#111111' : 'var(--bg-card)',
            border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Compass size={17} style={{ color: '#0d9488', flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT, letterSpacing: '-0.3px' }}>
                Select Destination
              </span>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px', borderRadius: 12,
                  border: isDark ? '1.5px solid #222222' : '1.5px solid #d1d5db',
                  background: isDark ? '#0A0A0A' : 'var(--bg-secondary)',
                  fontSize: 13, fontWeight: 500, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT_MONO,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                      : 'bg-bg-secondary border-border-default text-text-secondary hover:text-text-primary hover:border-teal-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Cards List */}
          <motion.div
            variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}
          >
            <AnimatePresence mode="popLayout">
              {filteredDestinations.map(d => {
                const isActive = d.id === selectedPlaceId
                return (
                  <motion.div
                    key={d.id}
                    variants={itemPop}
                    layoutId={`dest-card-${d.id}`}
                    onClick={() => setSelectedPlaceId(d.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
                      display: 'flex', gap: 14, alignItems: 'center',
                      transition: 'all 0.18s ease',
                      border: isActive ? '2px solid #14b8a6' : (isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)'),
                      background: isActive
                        ? (isDark ? 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(56,189,248,0.05))' : 'linear-gradient(135deg, rgba(204,251,241,0.8), rgba(186,230,253,0.4))')
                        : (isDark ? '#111111' : 'var(--bg-card)'),
                      boxShadow: isActive ? '0 4px 20px rgba(20,184,166,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <img
                      src={d.image}
                      alt={d.name}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&auto=format' }}
                      style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{
                          fontSize: 14, fontWeight: 800, margin: 0,
                          color: isActive ? (isDark ? '#2dd4bf' : '#0f766e') : (isDark ? '#ffffff' : 'var(--text-primary)'),
                          fontFamily: FONT, letterSpacing: '-0.25px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          flex: 1,
                        }}>
                          {d.name}
                        </p>
                        {d.trending && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                            background: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7',
                            color: isDark ? '#fbbf24' : '#b45309',
                            border: `1px solid ${isDark ? '#b45309' : '#fcd34d'}`,
                            fontFamily: FONT, textTransform: 'uppercase', flexShrink: 0,
                          }}>
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={9} style={{ color: '#14b8a6', flexShrink: 0 }} />
                        {d.city || d.name}, {d.country}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {Array.isArray(d.category) && d.category.slice(0, 2).map(c => (
                          <span key={c} style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                            background: isActive ? (isDark ? 'rgba(20,184,166,0.2)' : '#ccfbf1') : (isDark ? '#222222' : 'var(--bg-secondary)'),
                            color: isActive ? (isDark ? '#2dd4bf' : '#0f766e') : (isDark ? '#e2e8f0' : 'var(--text-secondary)'),
                            border: `1px solid ${isActive ? (isDark ? 'rgba(20,184,166,0.4)' : '#99f6e4') : (isDark ? '#333333' : 'var(--border-subtle)')}`,
                            fontFamily: FONT,
                          }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filteredDestinations.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)', background: isDark ? '#111111' : '#ffffff' }}>
                <AlertCircle size={24} style={{ color: '#9ca3af', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#ffffff' : '#374151', fontFamily: FONT }}>No places match search</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Detail + CrowdForecast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activePlace ? (
            <motion.div
              key={activePlace.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Place detail card */}
              <div style={{
                padding: '28px 32px', borderRadius: 28,
                background: isDark ? '#111111' : 'var(--bg-card)',
                border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                display: 'flex', gap: 24, alignItems: 'flex-start',
              }}>
                <img
                  src={activePlace.image}
                  alt={activePlace.name}
                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format' }}
                  style={{ width: 140, height: 140, borderRadius: 20, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', smDirection: 'row', gap: 10, marginBottom: 8 }}>
                    <h2 style={{
                      fontSize: 'clamp(26px, 2.5vw, 34px)', fontWeight: 900, color: isDark ? '#ffffff' : 'var(--text-primary)',
                      margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: FONT,
                    }}>
                      {activePlace.name}
                    </h2>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 800,
                      padding: '5px 14px', borderRadius: 100,
                      background: isDark ? 'rgba(20,184,166,0.15)' : '#ccfbf1',
                      color: isDark ? '#2dd4bf' : '#0f766e',
                      border: `1px solid ${isDark ? 'rgba(20,184,166,0.3)' : '#99f6e4'}`,
                      fontFamily: FONT, letterSpacing: '0.05em',
                      textTransform: 'uppercase', width: 'max-content',
                    }}>
                      {activePlace.bestTime ? `Best Time: ${activePlace.bestTime}` : 'Year-round'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 14, fontWeight: 500, color: isDark ? '#e2e8f0' : 'var(--text-secondary)',
                    lineHeight: 1.65, margin: '0 0 16px', fontFamily: FONT_MONO,
                  }}>
                    {activePlace.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Array.isArray(activePlace.category) && activePlace.category.map(c => (
                      <span key={c} style={{
                        fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8,
                        background: isDark ? 'rgba(20,184,166,0.15)' : '#ccfbf1',
                        color: isDark ? '#2dd4bf' : '#0f766e',
                        border: `1px solid ${isDark ? 'rgba(20,184,166,0.3)' : '#99f6e4'}`,
                        fontFamily: FONT, letterSpacing: '0.05em', textTransform: 'uppercase',
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CrowdForecast card wrapper */}
              <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 8px 32px rgba(20,184,166,0.10), 0 2px 8px rgba(0,0,0,0.06)' }}>
                <CrowdForecast
                  placeId={activePlace.id}
                  placeName={activePlace.name}
                  placeCategory={Array.isArray(activePlace.category) ? activePlace.category[0].toLowerCase() : 'attraction'}
                />
              </div>
            </motion.div>
          ) : (
            <div style={{
              height: 400, borderRadius: 28,
              border: '2px dashed #d1d5db',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', gap: 12,
            }}>
              <Compass size={40} style={{ color: '#9ca3af' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#ffffff' : 'var(--text-primary)', fontFamily: FONT }}>No Place Selected</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

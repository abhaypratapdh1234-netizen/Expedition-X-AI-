import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { buttonInteraction, cardInteraction, iconButtonInteraction } from '../../../motion/variants'
import { Search, Grid, List, Star, MapPin, Heart, TrendingUp, ChevronRight, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { THEMES } from '../../../data/mockData'
import { useExploreStore } from '../../../stores/exploreStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { useThemeStore } from '../../../stores/themeStore'
import { aiService } from '../../../services/aiService'
import { formatCurrency, t } from '../../../utils/formatters'
import { pageTransition, staggerContainer, itemPop, cardHover } from '../../../motion/variants'
import { springSnappy } from '../../../motion/tokens'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export function ExplorePage() {
  const navigate = useNavigate()
  const { searchResults, isSearching, filters, setFilters, performSearch } = useExploreStore()
  const { savedPlaceIds, fetchWishlist, toggleSaved } = useWishlistStore()
  const { language, currency } = useSettingsStore()
  const theme = useThemeStore(s => s.theme)
  const isMonochrome = theme === 'monochrome'
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [localSearch, setLocalSearch] = useState(filters.query || '')
  const [isSurprising, setIsSurprising] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters({ query: localSearch })
    }, 250)
    return () => clearTimeout(t)
  }, [localSearch, setFilters])

  useEffect(() => {
    performSearch()
    fetchWishlist()
    aiService.getRecommendations('user-1').then(setRecommendations)
  }, [performSearch, fetchWishlist])

  const handleSurprise = async () => {
    setIsSurprising(true)
    const dest = await aiService.generateSurpriseTrip()
    setIsSurprising(false)
    navigate(`/app/explore/place/${dest.id}`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">{t('Explore Destinations', language)}</h1>
          <p className="text-[var(--text-primary)] font-bold antialiased text-[18px] mt-2">{t("Discover the world's most beautiful places, curated by AI.", language)}</p>
        </div>
        <motion.button 
          {...buttonInteraction}
          whileTap={{ scale: 0.95 }}
          onClick={handleSurprise}
          disabled={isSurprising}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold antialiased shadow-md relative overflow-hidden"
          style={isMonochrome ? { background: 'var(--text-primary)', color: 'var(--bg-primary)' } : { background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))', color: 'white' }}>
          <Sparkles size={16} className={isSurprising ? "animate-spin" : ""} />
          {isSurprising ? t('Generating...', language) : t('Surprise Me', language)}
        </motion.button>
      </motion.div>

      {/* Recommended Carousel */}
      {recommendations.length > 0 && !localSearch && !filters.category && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h2 className="text-[13px] font-bold antialiased uppercase tracking-widest mb-4 text-[var(--text-primary)]">{t('Recommended for you', language)}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {recommendations.map(dest => (
              <motion.div key={dest.id} {...cardInteraction} className="snap-start shrink-0 w-64 rounded-2xl relative shadow-card cursor-pointer border border-border-subtle p-1 group" onClick={() => navigate(`/app/explore/place/${dest.id}`)}>
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="relative z-10 bg-bg-card rounded-xl overflow-hidden h-full flex flex-col">
                  <img src={dest.imageUrl || dest.image} alt={dest.name} className="w-full h-32 object-cover" />
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-[16px] text-[var(--text-primary)]">{dest.name}</h3>
                    <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1 mt-1.5"><MapPin size={12} /> {dest.state}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ultra-Premium Search + Filters */}
      <div className="flex gap-4 mb-8 flex-col md:flex-row">
        {/* The Billion-Dollar Search Bar */}
        <motion.div 
          className="flex-1 relative group z-50"
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Intense Neon Backdrop */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 rounded-[32px] blur-2xl opacity-10 group-focus-within:opacity-40 transition-all duration-700" />
          
          <div className="relative rounded-[24px] p-1 group">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 flex items-center rounded-[22px] overflow-hidden transition-all duration-500"
              style={{ 
                background: 'var(--bg-card)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="pl-6 pr-4 flex items-center justify-center relative z-10 transition-transform duration-500 group-focus-within:rotate-90 group-focus-within:scale-125">
                <Search size={24} className="text-text-muted group-focus-within:text-cyan-500 drop-shadow-[0_0_8px_rgba(0,242,254,0.4)] transition-all duration-300" />
              </div>
              
              <input
                type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                placeholder={t('Search breathtaking destinations...', language)}
                className="w-full py-5 bg-transparent text-xl font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] tracking-wider relative z-10"
              />
              
              <div className="pr-3 pl-3 relative z-10">
                 <button onClick={performSearch} className={`px-8 py-4 rounded-[16px] font-extrabold text-[15px] tracking-widest uppercase shadow-md hover:scale-105 transition-all duration-300 ${isMonochrome || isDark || isLight ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[0_4px_20px_rgba(44,30,22,0.3)]' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_20px_rgba(0,242,254,0.3)] hover:shadow-[0_6px_25px_rgba(0,242,254,0.6)]'}`}>
                   {t('Explore', language)}
                 </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <motion.button 
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-[20px] font-extrabold text-[15px] transition-all relative overflow-hidden group tracking-widest uppercase"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 15px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--text-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <SlidersHorizontal size={20} className={`${isMonochrome || isDark || isLight ? 'text-[var(--text-primary)]' : 'text-[#FC6C26]'} drop-shadow-sm group-hover:rotate-180 transition-transform duration-500`} /> {t('Filters', language)}
          </motion.button>
          
          <div className="flex rounded-[20px] overflow-hidden bg-bg-card p-1 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-border-subtle" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
            {(['grid', 'list'] as const).map(v => (
              <motion.button key={v} onClick={() => setView(v)}
                whileHover={view !== v ? { backgroundColor: 'var(--bg-secondary)' } : {}}
                whileTap={{ scale: 0.9 }}
                className="px-5 py-3 rounded-[16px] transition-all flex items-center justify-center relative"
                style={{ 
                  background: view === v ? (isMonochrome || isDark || isLight ? 'var(--text-primary)' : 'linear-gradient(135deg, var(--teal-600), var(--teal-800))') : 'transparent',
                  color: view === v ? (isMonochrome || isDark || isLight ? 'var(--bg-primary)' : 'white') : (isLight ? 'var(--text-primary)' : 'var(--text-muted)'),
                  boxShadow: view === v && !isMonochrome && !isDark && !isLight ? '0 4px 15px rgba(15,107,92,0.4)' : (view === v ? 'var(--shadow-sm)' : 'none')
                }}>
                {v === 'grid' ? <Grid size={18} className={view === v ? "drop-shadow-md" : ""} /> : <List size={18} className={view === v ? "drop-shadow-md" : ""} />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Ultra-Premium Theme Filters */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-6 pt-2 scrollbar-hide px-1">
        <motion.button
          onClick={() => setFilters({ category: undefined })}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="px-7 py-3.5 rounded-[18px] text-[15px] font-bold antialiased shrink-0 transition-all uppercase tracking-[0.15em] relative overflow-hidden group"
          style={{
            background: !filters.category ? (isMonochrome || isDark || isLight ? 'var(--text-primary)' : 'linear-gradient(135deg, var(--teal-500), var(--teal-700))') : 'var(--bg-card)',
            color: !filters.category ? (isMonochrome || isDark || isLight ? 'var(--bg-primary)' : 'white') : (isDark || isLight ? 'var(--text-primary)' : 'var(--text-muted)'),
            border: '1px solid',
            borderColor: !filters.category ? 'transparent' : (isDark ? 'rgba(255,255,255,0.15)' : 'var(--border-subtle)'),
            boxShadow: !filters.category ? (isMonochrome || isDark ? 'var(--shadow-sm)' : '0 10px 25px rgba(15,107,92,0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)') : '0 4px 15px rgba(0,0,0,0.03)',
          }}>
          <span className="relative z-10 font-bold antialiased">{t('All', language)}</span>
          {!filters.category && <div className="absolute inset-0 bg-gradient-to-r from-teal-400/30 to-teal-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        </motion.button>
        
        {THEMES.map((theme, i) => {
          const isActive = filters.category === theme.label;
          return (
            <motion.button 
              key={theme.id} 
              onClick={() => setFilters({ category: isActive ? undefined : theme.label })}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
              className="px-6 py-3.5 rounded-[18px] text-[14px] font-bold antialiased shrink-0 flex items-center gap-3 transition-all relative overflow-hidden group"
              style={{
                background: isActive ? (isMonochrome || isDark || isLight ? 'var(--text-primary)' : 'linear-gradient(135deg, var(--violet-500), var(--indigo-600))') : 'var(--bg-card)',
                color: isActive ? (isMonochrome || isDark || isLight ? 'var(--bg-primary)' : 'white') : (isDark || isLight ? 'var(--text-primary)' : 'var(--text-muted)'),
                border: '1px solid',
                borderColor: isActive ? 'transparent' : (isDark ? 'rgba(255,255,255,0.15)' : 'var(--border-subtle)'),
                boxShadow: isActive ? (isMonochrome || isDark ? 'var(--shadow-sm)' : '0 10px 25px rgba(99,102,241,0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)') : '0 4px 15px rgba(0,0,0,0.03)',
              }}>
              <motion.span 
                animate={isActive ? { scale: 1.3, rotate: [0, -15, 15, 0] } : { scale: 1 }} 
                transition={{ duration: 0.5 }}
                className="text-lg drop-shadow-md relative z-10"
              >
                {theme.emoji}
              </motion.span>
              <span className="tracking-wide relative z-10 font-bold antialiased">{t(theme.label, language)}</span>
              
              {/* Vibrant active hover glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              {/* Inactive hover sweep */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Results */}
      <p className="text-[16px] font-bold antialiased mb-6 text-[var(--text-primary)] uppercase tracking-widest">
        {isSearching ? t('Searching...', language) : `${searchResults.length} ${t('destinations found', language)}`}
      </p>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show"
        className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
      >
        <AnimatePresence mode="popLayout">
          {searchResults.map((dest) => (
            <motion.div
              key={dest.id}
              layout
              variants={itemPop}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            >
              <Link to={`/app/explore/place/${dest.id}`}>
                {view === 'grid' ? (
                  <div className="relative rounded-2xl cursor-pointer shadow-card border border-border-subtle group p-1 transition-transform duration-300 hover:-translate-y-1">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                    <div className="relative z-10 bg-bg-card rounded-xl overflow-hidden h-full">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={dest.imageUrl || dest.image} alt={dest.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        {dest.trending && (
                          <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold antialiased flex items-center gap-1 shadow-sm ${isMonochrome ? 'bg-white text-black' : 'bg-amber-500 text-white'}`}>
                            <TrendingUp size={10} /> {t('Trending', language)}
                          </div>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={e => { e.preventDefault(); toggleSaved(dest.id) }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/20 backdrop-blur-md">
                          <Heart size={14} className={savedPlaceIds.includes(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'} />
                        </motion.button>
                        <div className="absolute bottom-3 left-3">
                          <span className={`px-2 py-1 rounded-lg text-[14px] font-bold antialiased shadow-sm text-shadow-subtle backdrop-blur-sm ${isMonochrome ? 'bg-white text-black' : 'bg-amber-500/90 text-white'}`}>
                            {formatCurrency((dest.avgCost || dest.costPerDay) ?? 0, currency)}/day
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold antialiased text-[22px] text-[var(--text-primary)] leading-tight">{dest.name}</h3>
                            <p className="text-[14px] font-bold antialiased flex items-center gap-1 mt-1 text-[var(--text-secondary)] uppercase tracking-widest">
                              <MapPin size={14} />{dest.state}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={16} className={isMonochrome ? 'fill-[var(--text-primary)] text-[var(--text-primary)]' : 'fill-[#FC6C26] text-[#FC6C26]'} />
                            <span className="text-[16px] font-bold antialiased text-[var(--text-primary)]">{dest.rating}</span>
                          </div>
                        </div>
                        <p className="text-[16px] mt-3 line-clamp-2 font-bold text-[var(--text-secondary)]">{dest.description}</p>
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {(dest.category ? (Array.isArray(dest.category) ? dest.category : dest.category.split(',')) : []).slice(0, 2).map((cat: string) => (
                            <span key={cat} className="px-2.5 py-1 rounded-[8px] text-[13px] font-bold bg-[var(--bg-secondary)] text-[var(--text-primary)] uppercase tracking-widest border border-[var(--border-subtle)]">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl shadow-card border border-border-subtle group p-1 transition-transform duration-300 hover:-translate-y-1">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                    <div className="relative z-10 flex gap-4 p-3 bg-bg-card rounded-xl w-full h-full">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={dest.imageUrl || dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={e => { e.preventDefault(); toggleSaved(dest.id) }}
                          className="absolute top-1 right-1 p-1">
                          <Heart size={12} className={savedPlaceIds.includes(dest.id) ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-md'} />
                        </motion.button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold antialiased text-[22px] text-[var(--text-primary)]">{dest.name}</h3>
                          <span className={`text-[14px] font-bold antialiased px-2 py-1 rounded-lg border ${isMonochrome ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'text-[#FC6C26] bg-[rgba(252,108,38,0.1)] border-[rgba(252,108,38,0.2)]'}`}>{formatCurrency((dest.avgCost || dest.costPerDay) ?? 0, currency)}/day</span>
                        </div>
                        <p className="text-[14px] font-bold antialiased text-[var(--text-secondary)] uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin size={14}/> {dest.state} · ⭐ {dest.rating}</p>
                        <p className="text-[16px] mt-2 line-clamp-2 font-bold antialiased text-[var(--text-secondary)]">{dest.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-[#111827]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[32px] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[24px] font-extrabold text-[var(--text-primary)] tracking-tight">{t('Refine Search', language)}</h3>
                  <p className="text-[14px] font-bold text-[var(--text-muted)] mt-1">{t('Find your perfect destination', language)}</p>
                </div>
                <button onClick={() => setIsFilterModalOpen(false)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-[var(--text-primary)] rounded-full flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">{t('Minimum Rating', language)}</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 3, 4, 4.5].map(rating => {
                      const isRatingActive = filters.minRating === rating || (rating === 0 && !filters.minRating)
                      return (
                        <button 
                          key={rating}
                          onClick={() => setFilters({ minRating: rating === 0 ? undefined : rating })}
                          className={`py-3 rounded-[16px] text-[15px] font-bold antialiased transition-all border flex items-center justify-center gap-1 ${isRatingActive ? (isMonochrome || isDark || isLight ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'bg-[#111827] text-white border-[#111827]') : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]'}`}
                          style={{ boxShadow: isRatingActive && !isMonochrome && !isDark && !isLight ? '0 10px 20px -10px rgba(17,24,39,0.5)' : 'none' }}
                        >
                          {rating === 0 ? t('Any', language) : <>{rating}+ <Star size={14} className={isRatingActive && (!isMonochrome && !isDark && !isLight) ? 'text-[#FC6C26] fill-[#FC6C26]' : 'text-[var(--text-secondary)] fill-[var(--text-secondary)]'} /></>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">{t('Destination Type', language)}</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setFilters({ category: undefined })}
                      className={`px-5 py-3 rounded-[16px] text-[14px] font-bold antialiased transition-all border ${!filters.category ? (isMonochrome || isDark || isLight ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'bg-[#111827] text-white border-[#111827]') : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]'}`}
                    >
                      {t('All', language)}
                    </button>
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setFilters({ category: theme.label })}
                        className={`px-5 py-3 rounded-[16px] text-[14px] font-bold antialiased transition-all border flex items-center gap-2 ${filters.category === theme.label ? (isMonochrome || isDark || isLight ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'bg-[#111827] text-white border-[#111827]') : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]'}`}
                      >
                        <span className="drop-shadow-md">{theme.emoji}</span> {t(theme.label, language)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button onClick={() => { setIsFilterModalOpen(false); performSearch(); }} className="w-full bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white py-5 rounded-[20px] font-extrabold text-[16px] uppercase tracking-widest shadow-[0_15px_30px_-10px_rgba(252,108,38,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(252,108,38,0.6)] hover:scale-[1.02] transition-all">
                  {t('Show Results', language)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

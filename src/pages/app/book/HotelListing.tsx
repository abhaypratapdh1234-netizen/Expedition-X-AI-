import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Grid, List, Heart, Wifi, Coffee, Car, Waves, Dumbbell, Sparkles, Utensils, ConciergeBell, Search } from 'lucide-react'
import { useBookingStore } from '../../../stores/bookingStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useTripStore } from '../../../stores/tripStore'
import { staggerContainer, itemPop, pageTransition } from '../../../motion/variants'

export function HotelListing() {
  const { hotels, isSearching: isLoading, searchHotels } = useBookingStore()
  const { savedPlaceIds, fetchWishlist, toggleSaved } = useWishlistStore()
  const { fetchUserTrips } = useTripStore()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState(20000)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  const [locationQuery, setLocationQuery] = useState('')
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      const init = async () => {
        await fetchUserTrips()
        const currentTrips = useTripStore.getState().trips
        const defaultLoc = (currentTrips && currentTrips.length > 0 && currentTrips[0].destinations && currentTrips[0].destinations.length > 0) 
          ? currentTrips[0].destinations[0] 
          : 'Delhi'
        setLocationQuery(defaultLoc)
        searchHotels({ location: defaultLoc, maxPrice: 50000 })
      }
      init()
      fetchWishlist()
    }
  }, [fetchWishlist, fetchUserTrips, searchHotels])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (locationQuery.trim()) {
      searchHotels({ location: locationQuery.trim(), maxPrice: 50000 })
    }
  }

  const filtered = hotels.filter(h => {
    const withinPrice = h.pricePerNight <= priceRange
    const hasAmenities = selectedAmenities.length === 0 || selectedAmenities.every(reqA => 
      h.amenities?.some((hotelA: string) => hotelA.toLowerCase().includes(reqA.toLowerCase()))
    )
    return withinPrice && hasAmenities
  })

  // Map icons
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase()
    if (lower.includes('wifi')) return <Wifi size={12} />
    if (lower.includes('breakfast')) return <Coffee size={12} />
    if (lower.includes('parking')) return <Car size={12} />
    if (lower.includes('pool')) return <Waves size={12} />
    if (lower.includes('gym')) return <Dumbbell size={12} />
    if (lower.includes('spa')) return <Sparkles size={12} />
    if (lower.includes('restaurant')) return <Utensils size={12} />
    if (lower.includes('room service')) return <ConciergeBell size={12} />
    return null
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 min-h-screen relative overflow-hidden">
      {/* Massive Ambient Background Glows to make glassmorphism work */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-teal-400/10 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-[900px] h-[900px] bg-violet-400/10 rounded-full blur-[150px] -z-10 mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />

      <div className="mb-10 relative z-10 text-center max-w-2xl mx-auto pt-8">
        <h1 className="font-display text-6xl md:text-7xl mb-4 font-bold tracking-tight bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] text-transparent bg-clip-text antialiased">
          Stunning Stays
        </h1>
        <p className="text-[22px] text-[var(--text-secondary)] font-bold antialiased">Discover extraordinary properties for your unforgettable journey.</p>
      </div>

      {/* Floating Dynamic Island Filter Modules */}
      <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
        
        {/* Module 0: Location Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 p-2 pl-5 pr-2 rounded-full bg-[var(--bg-card)]/70 backdrop-blur-2xl shadow-sm border border-[var(--border-subtle)] focus-within:border-[var(--text-primary)] transition-all">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search destination..." 
            value={locationQuery}
            onChange={e => setLocationQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[16px] font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] w-32 md:w-40 antialiased"
          />
          <button type="submit" className="bg-[var(--text-primary)] text-[var(--bg-card)] px-5 py-2.5 rounded-full text-[15px] font-bold antialiased shadow-sm hover:opacity-90">
            Search
          </button>
        </form>
        {/* Module 1: Price */}
        <div className="flex items-center gap-4 p-2 pl-5 pr-2 rounded-full bg-[var(--bg-card)]/70 backdrop-blur-2xl shadow-sm border border-[var(--border-subtle)] transition-all hover:bg-[var(--bg-card)]/90">
          <span className="text-[16px] font-bold tracking-widest uppercase text-[var(--text-secondary)] antialiased">Max Price</span>
          <div className="w-32 md:w-48 px-2">
            <input type="range" min="1000" max="50000" step="1000" value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer" 
              style={{ 
                accentColor: 'var(--text-primary)',
                background: `linear-gradient(to right, var(--text-primary) ${((priceRange - 1000) / 49000) * 100}%, var(--border-strong) ${((priceRange - 1000) / 49000) * 100}%)`
              }} />
          </div>
          <div className="bg-[var(--text-primary)] text-[var(--bg-card)] px-5 py-2.5 rounded-full text-[18px] font-bold antialiased shadow-sm">
            ₹{priceRange.toLocaleString()}
          </div>
        </div>

        {/* Module 2: Amenities */}
        <div className="flex items-center p-2 rounded-full bg-[var(--bg-card)]/70 backdrop-blur-2xl shadow-sm border border-[var(--border-subtle)]">
          {['WiFi', 'Pool', 'Parking', 'Gym'].map((a) => {
            const isActive = selectedAmenities.includes(a)
            return (
              <button 
                key={a} 
                onClick={() => setSelectedAmenities(prev => isActive ? prev.filter(item => item !== a) : [...prev, a])}
                className={`px-6 py-2.5 rounded-full text-[15px] font-bold uppercase antialiased tracking-wider transition-all duration-300 ${isActive ? 'bg-[var(--text-primary)] text-[var(--bg-card)] shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'}`}>
                {a}
              </button>
            )
          })}
        </div>

        {/* Module 3: View Toggles */}
        <div className="flex items-center p-1.5 rounded-full bg-[var(--bg-card)]/70 backdrop-blur-2xl shadow-sm border border-[var(--border-subtle)]">
          {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
                style={{ 
                  background: view === v ? 'var(--text-primary)' : 'transparent', 
                  color: view === v ? 'var(--bg-card)' : 'var(--text-muted)',
                  boxShadow: view === v ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                }}>
                {v === 'grid' ? <Grid size={16} /> : <List size={16} />}
              </button>
          ))}
        </div>
        
      </div>

      <div className="text-center mb-8">
        <span className="inline-block text-[18px] font-bold antialiased text-[var(--text-secondary)] bg-[var(--bg-card)]/60 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-[var(--border-subtle)]">
          {isLoading ? 'Searching...' : `${filtered.length} hotels found`}
        </span>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
      >
        {isLoading ? (
          // Skeleton loading
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden bg-bg-card border border-border-subtle shadow-sm">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((hotel) => (
              <motion.div key={hotel.id} layout variants={itemPop} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}>
                <Link to={`/app/book/hotels/${hotel.id}`}>
                  {view === 'grid' ? (
                    <div className="rounded-[32px] overflow-hidden group transition-all duration-700 relative aspect-[3/4] cursor-pointer"
                         style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}>
                      
                      {/* Full Bleed Image */}
                      <img 
                        src={hotel.image} 
                        alt={hotel.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                        loading="lazy" 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.hasFallback) {
                            target.dataset.hasFallback = 'true';
                            target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                          }
                        }}
                      />
                      
                      {/* Dramatic Overlays for PERFECT Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-[#1B2A4A]/30 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      {/* Floating Badges (Top) */}
                      <div className="absolute top-5 left-5 right-5 z-10 flex justify-between items-start">
                        <div className="flex items-center gap-1.5 bg-[var(--bg-card)]/20 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                          <Star size={14} className="fill-amber-400 text-amber-400 drop-shadow-md" />
                          <span className="text-[18px] font-black text-white">{hotel.rating}</span>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.95)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.preventDefault(); toggleSaved(hotel.id) }}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xl shadow-lg border border-white/20 transition-all duration-300">
                          <Heart size={18} className={savedPlaceIds.includes(hotel.id) ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-black/50'} />
                        </motion.button>
                      </div>
                      
                      {/* Glassmorphic Info Panel (Bottom) */}
                      <div className="absolute bottom-5 left-5 right-5 z-10">
                        <div className="p-6 rounded-[24px] bg-[var(--bg-card)]/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          
                          <span className="inline-block px-4 py-1.5 mb-3 rounded-full text-[14px] font-bold antialiased uppercase tracking-widest text-[var(--text-primary)] bg-[var(--bg-card)] shadow-lg">
                            {hotel.category || 'Luxury'}
                          </span>
                          
                          <h3 className="font-display font-bold text-white text-5xl leading-tight mb-2 drop-shadow-lg antialiased">{hotel.name}</h3>
                          
                          <p className="text-[16px] font-bold flex items-center gap-2 text-white mb-6 drop-shadow-md antialiased">
                            <MapPin size={12} className="text-teal-400" /> {hotel.location}
                          </p>
                          
                          <div className="flex justify-between items-end">
                            <div className="flex gap-2">
                              {hotel.amenities?.slice(0, 2).map((a: string) => (
                                <span key={a} className="flex items-center gap-1 w-8 h-8 justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm" title={a}>
                                  {getAmenityIcon(a)}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-[14px] text-white/90 uppercase tracking-widest font-bold mb-1 drop-shadow-md antialiased">From</div>
                              <div className="text-5xl font-bold text-white tracking-tight drop-shadow-xl antialiased">₹{hotel.pricePerNight.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-0 p-3 rounded-[32px] bg-[var(--bg-card)]/70 backdrop-blur-xl group transition-all duration-500 relative overflow-hidden"
                         style={{ 
                           boxShadow: '0 20px 40px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                           border: '1px solid rgba(255, 255, 255, 0.6)'
                         }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="relative w-full md:w-64 h-48 md:h-full rounded-[24px] overflow-hidden shrink-0 shadow-lg">
                        <img 
                          src={hotel.image} 
                          alt={hotel.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.hasFallback) {
                              target.dataset.hasFallback = 'true';
                              target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent opacity-60" />
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.95)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.preventDefault(); toggleSaved(hotel.id) }}
                          className="absolute top-4 right-4 p-2.5 rounded-full bg-[var(--bg-card)]/20 backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300">
                          <Heart size={16} className={savedPlaceIds.includes(hotel.id) ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-black/50'} />
                        </motion.button>
                        <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[14px] font-black uppercase tracking-widest text-teal-900 bg-teal-100/90 backdrop-blur-sm border border-white/50">
                          {hotel.category || 'Luxury'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0 p-5 md:pl-8 flex flex-col justify-center relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[16px] font-black border border-amber-200">
                                <Star size={16} className="fill-amber-500 text-amber-500" /> {hotel.rating}
                              </div>
                              <span className="text-[16px] font-black text-[var(--text-secondary)]">({hotel.reviews?.toLocaleString() || '1.2k'} reviews)</span>
                            </div>
                            <h3 className="font-display font-black text-text-primary text-4xl truncate group-hover:text-teal-700 transition-colors">{hotel.name}</h3>
                            <p className="text-[18px] font-black text-[var(--text-secondary)] mt-1 flex items-center gap-1.5"><MapPin size={16} className="text-teal-500"/> {hotel.location}</p>
                          </div>
                          
                          <div className="text-right flex flex-col items-end">
                            <div className="text-[14px] text-[var(--text-secondary)] uppercase tracking-widest font-black mb-1">Per Night</div>
                            <div className="text-5xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">₹{hotel.pricePerNight.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 flex-wrap">
                          {hotel.amenities?.slice(0, 4).map((a: string) => (
                            <span key={a} className="flex items-center gap-2 px-4 py-2 text-[14px] font-black uppercase tracking-wider rounded-full bg-black/5 text-[var(--text-secondary)] border border-black/5 group-hover:bg-[var(--bg-card)] group-hover:shadow-md group-hover:text-teal-700 transition-all duration-300">
                              {getAmenityIcon(a)} {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}

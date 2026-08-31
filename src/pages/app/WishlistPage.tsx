import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, MapPin, ArrowRight, Compass, Trash2, Sparkles, SortAsc, Calendar } from 'lucide-react'
import { useWishlistStore } from '../../stores/wishlistStore'
import { placeService } from '../../services/placeService'
import { pageTransition } from '../../motion/variants'
import { useIntelligenceStore } from '../../stores/intelligenceStore'
import { computeWishlistMatchScore } from '../../services/intelligenceService'
import { useTripStore } from '../../stores/tripStore'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthStore } from '../../stores/authStore'

export function WishlistPage() {
  const { savedPlaceIds, fetchWishlist, toggleSaved, isLoading: isWishlistLoading } = useWishlistStore()
  const [destinations, setDestinations] = useState<any[]>([])
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(true)
  const [smartSorted, setSmartSorted] = useState(false)
  const { profile, compute } = useIntelligenceStore()
  const { trips, fetchUserTrips } = useTripStore()
  const { myBookings, fetchMyBookings } = useBookingStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchWishlist() }, [fetchWishlist])
  useEffect(() => {
    fetchUserTrips()
    fetchMyBookings()
  }, [])
  // Self-compute: trigger if profile not yet loaded
  useEffect(() => {
    if (!profile) {
      compute(trips, savedPlaceIds, myBookings, user?.preferences)
    }
  }, [trips.length, savedPlaceIds.length, myBookings.length, profile])
  useEffect(() => {
    async function load() {
      const allPlaces = await placeService.searchDestinations({})
      setDestinations(allPlaces)
      setIsDestinationsLoading(false)
    }
    load()
  }, [])

  const baseItems = destinations.filter(d => savedPlaceIds.includes(d.id?.toString() || d.id))

  // Smart sort: match score + seasonal timing + budget fit
  const items = smartSorted && profile
    ? [...baseItems].sort((a, b) => {
        const sa = computeWishlistMatchScore(a, profile.dna)
        const sb = computeWishlistMatchScore(b, profile.dna)
        return sb.matchScore - sa.matchScore
      })
    : baseItems

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 min-h-screen relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>

      {/* ── Ambient glow blobs ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-300/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-300/10 rounded-full blur-[140px] -z-10 animate-pulse" style={{ animationDuration: '12s', animationDelay: '3s' }} />

      {/* ════ HERO HEADER ════ */}
      <div className="mb-12 pt-4">
        <div className="flex items-end justify-between">
          <div>
            {/* Live heartbeat pulse badge */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 4px 15px rgba(239,68,68,0.1)' }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Heart size={14} className="fill-red-500 text-red-500" />
                </motion.div>
                <span className="text-[14px] font-bold antialiased uppercase tracking-widest text-red-600 dark:text-red-400">
                  {savedPlaceIds.length} Saved
                </span>
              </div>
            </div>
            <h1 className="font-display text-5xl font-bold antialiased text-[var(--text-primary)] tracking-tight leading-none mb-3">
              Travel Wishlist
            </h1>
            <p className="text-[19px] font-bold antialiased text-[var(--text-secondary)]">Your handpicked dream destinations, waiting to be explored.</p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Smart Sort Button */}
              {profile && (
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSmartSorted(prev => !prev)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-[15px] font-bold antialiased whitespace-nowrap transition-all"
                  style={smartSorted
                    ? { background: 'linear-gradient(135deg,#FC6C26,#FF8A50)', color: '#fff', boxShadow: '0 8px 20px rgba(252,108,38,0.35)' }
                    : { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                >
                  <SortAsc size={16} />
                  {smartSorted ? 'Smart Sorted' : 'Smart Sort'}
                </motion.button>
              )}
              <Link to="/app/explore">
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-7 py-4 rounded-full text-white text-[15px] font-bold antialiased uppercase tracking-widest"
                  style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', boxShadow: '0 12px 30px rgba(252, 108, 38,0.35)' }}>
                  <Compass size={18} /> Explore More
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isWishlistLoading || isDestinationsLoading ? (
          
          /* ════ LOADING SKELETON GRID ════ */
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[32px] overflow-hidden bg-[var(--bg-card)] border border-black/5" style={{ boxShadow: '0 15px 40px rgba(0,0,0,0.07)' }}>
                <div className="h-56 bg-gray-200 animate-pulse m-2 rounded-[24px]" />
                <div className="px-5 pb-5 pt-3 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-11 bg-gray-200 rounded-[18px] animate-pulse" />
                </div>
              </div>
            ))}
          </motion.div>

        ) : items.length === 0 ? (

          /* ════ EMPTY STATE ════ */
          <motion.div key="empty"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-28 rounded-[40px] text-center relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 25px 60px rgba(0,0,0,0.06)' }}>
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 via-transparent to-transparent pointer-events-none" />

            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative mb-8 z-10">
              {/* Outer glow ring */}
              <div className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#fee2e2,#fff1f2)', boxShadow: '0 20px 50px rgba(239,68,68,0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8)' }}>
                <Heart size={48} className="fill-red-500 text-red-500 drop-shadow-lg" />
              </div>
            </motion.div>

            <h3 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-3 relative z-10">Your wishlist is empty</h3>
            <p className="text-[var(--text-muted)] font-extrabold mb-10 max-w-xs relative z-10 text-[17px] leading-relaxed">
              You haven't saved any destinations yet.<br />Explore amazing places and tap ❤️ to save them.
            </p>
            <Link to="/app/explore" className="relative z-10">
              <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-9 py-4.5 rounded-full text-white font-bold uppercase tracking-widest text-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', boxShadow: '0 15px 40px rgba(252, 108, 38,0.4)', padding: '14px 36px' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
                <Sparkles size={16} className="relative z-10" />
                <span className="relative z-10">Explore Destinations</span>
                <ArrowRight size={16} className="relative z-10" />
              </motion.button>
            </Link>
          </motion.div>

        ) : (

          /* ════ DESTINATION GRID ════ */
          <motion.div key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((dest, idx) => (
                <motion.div key={dest.id} layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>

                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.35 } }}
                    className="rounded-[32px] overflow-hidden bg-[var(--bg-card)] group relative block"
                    style={{ boxShadow: '0 15px 40px rgba(0,0,0,0.07), inset 0 2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    
                    <Link to={`/app/explore/place/${dest.id}`} className="absolute inset-0 z-0" />

                    {/* ── Image section ── */}
                    <div className="relative h-56 overflow-hidden rounded-[24px] m-2 pointer-events-none">
                      <img src={dest.imageUrl || dest.image} alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" loading="lazy" />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* Remove from wishlist button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(dest.id) }}
                        className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center z-20 transition-all duration-300 pointer-events-auto cursor-pointer"
                        style={{ background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
                        <Heart size={18} className="fill-red-500 text-red-500 drop-shadow-md" />
                      </motion.button>

                      {/* Cost badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-4 py-2 rounded-full text-[13px] font-bold antialiased text-white uppercase tracking-widest"
                          style={{ background: 'rgba(252, 108, 38,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 12px rgba(252, 108, 38,0.4)' }}>
                          ₹{((dest.avgCost || dest.costPerDay) ?? 0).toLocaleString()}/day
                        </span>
                      </div>

                      {/* Name overlay at bottom */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="font-display font-bold text-3xl text-white leading-tight drop-shadow-lg mb-1">{dest.name}</h3>
                        <p className="text-white/90 text-[13px] font-bold antialiased flex items-center gap-2 uppercase tracking-widest">
                          <MapPin size={14} className="text-[#FC6C26]" /> {dest.state}
                        </p>
                      </div>
                    </div>

                    {/* ── Card bottom info ── */}
                    <div className="px-5 pb-5 pt-3 pointer-events-none">
                      {/* Match Score + Best Time chips (from shared intelligence engine) */}
                      {profile && (() => {
                        const match = computeWishlistMatchScore(dest, profile.dna)
                        return (
                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span title={match.reason}
                              className={`flex items-center gap-1.5 text-[12px] font-bold antialiased px-3 py-1.5 rounded-full cursor-help shadow-sm border ${
                                match.matchLabel === 'Strong Match' ? 'bg-[#FC6C26]/10 text-[#FC6C26] border-[#FC6C26]/20' :
                                match.matchLabel === 'Good Match' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20' :
                                'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-subtle)]'
                              }`}>
                              <Sparkles size={12} /> {match.matchLabel}
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] font-bold antialiased px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-blue-700 dark:text-blue-400 border border-[var(--border-subtle)] shadow-sm">
                              <Calendar size={12} /> {match.bestTimeToGo}
                            </span>
                          </div>
                        )
                      })()}
                      <div className="flex items-center justify-between mb-5">
                        {/* Star rating */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 3px 10px rgba(245,158,11,0.1)' }}>
                          <Star size={15} className="fill-amber-500 text-amber-500" />
                          <span className="text-[14px] font-bold antialiased text-amber-600 dark:text-amber-500">{dest.rating}</span>
                        </div>
                        {/* Tags */}
                        <div className="flex gap-2 flex-wrap justify-end">
                          {(dest.category
                            ? (Array.isArray(dest.category) ? dest.category : dest.category.split(','))
                            : dest.tags || []
                          ).slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[11px] font-bold antialiased uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="block pointer-events-auto">
                        <Link to={`/app/explore/place/${dest.id}`} className="block">
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] text-[14px] font-bold antialiased uppercase tracking-widest transition-all duration-400 relative overflow-hidden group/btn"
                            style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', color: 'var(--bg-card)', boxShadow: '0 8px 25px rgba(252, 108, 38,0.35)' }}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <Sparkles size={16} className="relative z-10" />
                            <span className="relative z-10">Plan This Trip</span>
                            <ArrowRight size={16} className="relative z-10" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

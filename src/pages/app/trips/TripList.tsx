import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, ChevronRight, Plus, Sparkles, TrendingUp, Heart, Trash2 } from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useBookingStore } from '../../../stores/bookingStore'
import { useAuthStore } from '../../../stores/authStore'
import { computeTripFitScore, computeReadinessChecklist } from '../../../services/intelligenceService'
import { ReadinessBadge } from '../../../components/ui/TripPrepPanel'
import type { Trip } from '../../../services/tripService'

export function TripList() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past' | 'drafts' | 'favorites'>('upcoming')
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const { trips, isLoading, fetchUserTrips, deleteTrip, toggleFavorite } = useTripStore()
  const { user } = useAuthStore()
  const { savedPlaceIds } = useWishlistStore()
  const { myBookings } = useBookingStore()
  const { profile, compute } = useIntelligenceStore()

  useEffect(() => {
    fetchUserTrips()
  }, [fetchUserTrips])

  useEffect(() => {
    if (trips.length > 0) {
      compute(trips, savedPlaceIds, myBookings, user?.preferences)
    }
  }, [trips.length])

  const TABS = [
    { id: 'upcoming', label: 'Upcoming', emoji: '✈️' },
    { id: 'ongoing', label: 'Ongoing', emoji: '🟢' },
    { id: 'past', label: 'Past', emoji: '📸' },
    { id: 'drafts', label: 'Drafts', emoji: '📝' },
    { id: 'favorites', label: 'Favorites', emoji: '❤️' },
  ] as const

  const filtered = trips.filter(t => {
    if (activeTab === 'favorites') return !!t.isFavorite
    if (activeTab === 'drafts') return t.status === 'draft'
    if (activeTab === 'ongoing') return t.status === 'live'
    return t.status === activeTab
  })


  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 min-h-screen relative bg-[var(--bg-primary)]">
      {/* Refined Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 relative z-10 pt-6">
        <div>
          <h1 className="font-display text-5xl mb-2 font-bold antialiased tracking-tight text-[var(--text-primary)]">
            My Trips
          </h1>
          <p className="text-[19px] font-bold antialiased text-[var(--text-secondary)] tracking-tight">All your breathtaking adventures, past and future.</p>
        </div>
        <Link to="/app/planner/setup"
          className="flex items-center gap-3 px-8 py-4 rounded-full text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-[0_10px_40px_rgba(252, 108, 38,0.4)]"
          style={{ 
            background: 'linear-gradient(135deg, #FC6C26 0%, #FC6C26 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
          <Plus size={18} strokeWidth={3} />
          Plan New Trip
        </Link>
      </div>

      {/* 10000 Billion Dollar Tab Bar */}
      <div className="flex mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex p-2 rounded-full relative"
             style={{
               background: 'var(--bg-card)',
               boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05), inset 0 2px 5px rgba(0,0,0,0.02)',
               border: '1px solid var(--border-subtle)'
             }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[15px] font-bold antialiased uppercase tracking-widest transition-all duration-300 relative group cursor-pointer ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                style={{
                  background: isActive ? '#000000' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(0,0,0,0.35)' : 'none',
                  border: isActive ? '1px solid #000000' : '1px solid transparent',
                }}>
                {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant="white" />}
                <span className="text-[20px] relative z-10">{tab.emoji}</span>
                <span className="relative z-10 font-black">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">{activeTab === 'favorites' ? '❤️' : '🗺️'}</div>
          <h3 className="font-display text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'favorites' ? 'No favorite trips yet' : `No ${activeTab} trips`}
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'favorites'
              ? 'Click the heart icon on any trip card to save your favorite adventures here!'
              : activeTab === 'upcoming' 
              ? 'Start planning your next adventure!' 
              : 'No trips in this category yet.'}
          </p>
          <Link to="/app/planner/setup"
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-block cursor-pointer shadow-md hover:scale-105 transition-all"
            style={{ background: '#FC6C26' }}>
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="block relative">
                <div className="relative rounded-[40px] group transition-all duration-700 aspect-square sm:aspect-[4/3] p-2 hover:-translate-y-2">
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                  <div className="relative z-10 w-full h-full rounded-[32px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]"
                       style={{ 
                         boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                       }}>
                  
                  {/* Image with pristine rounded crop */}
                  <div className="w-full h-[65%] overflow-hidden relative">
                    <Link to={`/app/trips/${trip.id}`} className="absolute inset-0 block">
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                    </Link>
                    
                    {/* Favorite Button (Top Left) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(trip.id)
                      }}
                      className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg border ${
                        trip.isFavorite 
                          ? 'bg-white text-[#FC6C26] border-white shadow-[0_4px_15px_rgba(252,108,38,0.4)] scale-105' 
                          : 'bg-black/50 text-white/80 hover:text-white border-white/20 hover:bg-black/70 hover:scale-110'
                      }`}
                      title={trip.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={18} className={trip.isFavorite ? 'fill-[#FC6C26] text-[#FC6C26]' : ''} />
                    </button>

                    {/* Status Badge & Delete Button (Top Right) */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <span className="px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
                        {trip.status === 'draft' ? 'Draft' : trip.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setTripToDelete(trip)
                        }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-red-600 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md border border-white/20 hover:scale-110"
                        title="Delete trip"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Clean, Bright Info Panel */}
                  <Link to={`/app/trips/${trip.id}`} className="block p-6 h-[35%] flex flex-col justify-between bg-[var(--bg-card)] relative">
                    
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-bold antialiased text-[var(--text-primary)] text-2xl lg:text-3xl leading-tight group-hover:text-[#FC6C26] transition-colors truncate">{trip.title}</h3>
                        {/* Trip Fit Score Badge — transparent weighted score from shared engine */}
                        {profile && (() => {
                          const fit = computeTripFitScore(trip, profile)
                          const color = fit.score >= 75 ? '#FC6C26' : fit.score >= 50 ? '#f59e0b' : 'var(--text-muted)'
                          const bg = fit.score >= 75 ? 'rgba(252, 108, 38, 0.1)' : fit.score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'
                          const border = fit.score >= 75 ? 'rgba(252, 108, 38, 0.2)' : fit.score >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'var(--border-subtle)'
                          return (
                            <div title={`Fit breakdown: ${fit.basis}`}
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold antialiased cursor-help shadow-sm"
                              style={{ background: bg, color, border: `2px solid ${border}` }}>
                              <Sparkles size={14} />
                              {fit.score}% fit
                            </div>
                          )
                        })()}
                      </div>
                      <div className="flex items-center gap-3 text-[14px] font-bold antialiased text-[var(--text-primary)] mt-2">
                        <span className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl shadow-sm">
                          <Calendar size={16} className="text-[#FC6C26]" />
                          {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
                          {new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl shadow-sm">
                          <Users size={16} className="text-[#FC6C26]" /> {trip.collaborators}
                        </span>
                      </div>
                    </div>

                    {trip.status !== 'draft' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[13px] font-bold antialiased uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                          <span>Budget Spent</span>
                          <span className="text-[var(--text-primary)]">
                            ₹{trip.spent.toLocaleString()} / <span className="text-[#FC6C26]">₹{trip.budget.toLocaleString()}</span>
                          </span>
                        </div>
                        
                        {/* 10000 Billion Dollar Budget Bar */}
                        <div className="h-4 w-full rounded-full overflow-hidden relative"
                             style={{ 
                               background: 'var(--bg-card)', 
                               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' 
                             }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full rounded-full relative"
                            style={{ 
                              background: 'linear-gradient(90deg, #FC6C26, #FC6C26)', 
                              boxShadow: '0 2px 10px rgba(252, 108, 38,0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)' 
                            }}>
                            {/* Inner Shine Effect */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
                          </motion.div>
                        </div>
                      </div>
                    )}
                    
                    {trip.status === 'draft' && (
                      <div className="mt-6 flex justify-between items-center text-[var(--text-muted)]">
                        <span className="text-xs font-bold bg-[var(--bg-card)] px-4 py-2 rounded-lg">📝 Draft — Not booked yet</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#FC6C26] flex items-center gap-1">Resume <ChevronRight size={14}/></span>
                      </div>
                    )}

                    {/* v4: Readiness badge on upcoming trips */}
                    {trip.status === 'upcoming' && (() => {
                      const cl = computeReadinessChecklist(trip, trip.destinations?.[0] || '')
                      return <div className="mt-2"><ReadinessBadge checklist={cl} /></div>
                    })()}

                    {/* Post-trip learning hook — shown on past trips */}
                    {(trip.status === 'past' || trip.status === 'completed') && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <TrendingUp size={10} />
                        This trip updated your Travel DNA
                      </div>
                    )}
                  </Link>
                </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-default)'
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-2xl mb-2 text-[var(--text-primary)]">
                Delete Trip?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-[var(--text-primary)]">"{tripToDelete.title}"</span>? This will permanently remove this trip.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTrip(tripToDelete.id)
                    setTripToDelete(null)
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Delete Trip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

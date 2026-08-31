import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, DollarSign, ChevronRight, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useBookingStore } from '../../../stores/bookingStore'
import { useAuthStore } from '../../../stores/authStore'
import { computeTripFitScore, computeReadinessChecklist } from '../../../services/intelligenceService'
import { ReadinessBadge } from '../../../components/ui/TripPrepPanel'

export function TripList() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past' | 'drafts'>('upcoming')
  const { trips, isLoading, fetchUserTrips } = useTripStore()
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
  ] as const

  const filtered = trips.filter(t =>
    activeTab === 'drafts' ? t.status === 'draft' :
    activeTab === 'ongoing' ? t.status === 'live' : t.status === activeTab
  )

  const statusColors: Record<string, string> = {
    upcoming: '#FC6C26',
    ongoing: 'var(--success)',
    past: 'var(--text-muted)',
    draft: 'var(--amber-500)',
  }

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
               border: '1px solid rgba(0,0,0,0.04)'
             }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[15px] font-bold antialiased uppercase tracking-widest transition-all duration-500 relative group ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #FC6C26 0%, #F1A501 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none',
                }}>
                {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />}
                <span className="text-[20px] relative z-10">{tab.emoji}</span>
                <span className="relative z-10">{tab.label}</span>
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
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="font-display text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No {activeTab} trips</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'upcoming' ? 'Start planning your next adventure!' : 'No trips in this category yet.'}
          </p>
          <Link to="/app/planner/setup"
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: '#FC6C26' }}>
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={`/app/trips/${trip.id}`} className="block">
                <div className="relative rounded-[40px] group transition-all duration-700 aspect-square sm:aspect-[4/3] cursor-pointer p-2 hover:-translate-y-2">
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                  <div className="relative z-10 w-full h-full rounded-[32px] overflow-hidden bg-[var(--bg-card)]"
                       style={{ 
                         boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                       }}>
                  
                  {/* Image with pristine rounded crop */}
                  <div className="w-full h-[65%] overflow-hidden relative">
                    <img src={trip.coverImage} alt={trip.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
                        {trip.status === 'draft' ? 'Draft' : trip.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Clean, Bright Info Panel */}
                  <div className="p-6 h-[35%] flex flex-col justify-between bg-[var(--bg-card)] relative">
                    
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-bold antialiased text-[var(--text-primary)] text-3xl leading-tight group-hover:text-[#FC6C26] transition-colors">{trip.title}</h3>
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
                  </div>
                </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

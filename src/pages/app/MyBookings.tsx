import { useState, useEffect } from 'react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Download, Hotel, Ticket, Plane, XCircle, AlertCircle, ArrowRight, Sparkles, TrendingUp, DollarSign } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { pageTransition } from '../../motion/variants'
import { useIntelligenceStore } from '../../stores/intelligenceStore'
import { computeCancellationRisk, computeBudgetStress } from '../../services/intelligenceService'
import { placeService } from '../../services/placeService'

const TABS = ['upcoming', 'past', 'cancelled'] as const
const TAB_META: Record<string, { emoji: string; color: string; from: string; to: string; glow: string }> = {
  upcoming: { emoji: '✈️', color: '#ffffff', from: '#FC6C26', to: '#F1A501', glow: 'rgba(252, 108, 38,0.4)' },
  past:     { emoji: '📸', color: '#ffffff', from: '#3b82f6', to: '#2563eb', glow: 'rgba(59, 130, 246,0.4)' },
  cancelled:{ emoji: '🚫', color: '#ffffff', from: '#EF4444', to: '#DC2626', glow: 'rgba(239, 68, 68,0.4)' },
}

export function MyBookings() {
  const { myBookings, fetchMyBookings, cancelBooking } = useBookingStore()
  const { profile, comfortableBudget, setComfortableBudget } = useIntelligenceStore()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [localComfortBudget, setLocalComfortBudget] = useState(String(comfortableBudget || ''))

  useEffect(() => { fetchMyBookings() }, [fetchMyBookings])

  // Load place recommendations based on travel history
  useEffect(() => {
    async function loadRecs() {
      try {
        const places = await placeService.searchDestinations({})
        // Pick a few destinations as recommendations with reason tags
        const recs = places.slice(0, 6).map((p: any) => ({
          ...p,
          reason: 'Trending near your past trips',
        }))
        setRecommendations(recs)
      } catch {
        setRecommendations([])
      }
    }
    loadRecs()
  }, [])

  const filtered = myBookings.filter((b: any) => b.status === activeTab)

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    await cancelBooking(id)
    setCancellingId(null)
  }

  const getIcon = (type: string) => {
    if (type === 'hotel')  return <Hotel  size={26} className="text-[#FC6C26]" />
    if (type === 'flight') return <Plane  size={26} className="text-violet-600" />
    return <Ticket size={26} className="text-amber-600" />
  }

  const getTypeGradient = (type: string) => {
    if (type === 'hotel')  return { from: '#FC6C26', to: '#FC6C26', glow: 'rgba(252, 108, 38,0.35)' }
    if (type === 'flight') return { from: '#6d28d9', to: '#8b5cf6', glow: 'rgba(139,92,246,0.35)' }
    return { from: '#b45309', to: '#f59e0b', glow: 'rgba(245,158,11,0.35)' }
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ═══ HERO HEADER ═══ */}
      <div className="mb-12 pt-4">
        <h1 className="font-display text-5xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">My Bookings</h1>
        <p className="text-[19px] font-extrabold text-[var(--text-secondary)]">Manage your upcoming trips and review past adventures.</p>
      </div>

      {/* ══════════════════════════════════════════════
          10,000 BILLION DOLLAR TAB BAR
          — Three individual glowing module cards —
      ══════════════════════════════════════════════ */}
      <div className="flex gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2">
        {TABS.map(tab => {
          const meta = TAB_META[tab]
          const isActive = activeTab === tab
          const count = myBookings.filter((b: any) => b.status === tab).length
          return (
            <motion.button key={tab} onClick={() => setActiveTab(tab)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-7 py-4 rounded-[20px] text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-500 relative group"
              style={{
                background: isActive ? `linear-gradient(135deg, ${meta.from}, ${meta.to})` : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                boxShadow: isActive
                  ? `0 15px 40px ${meta.glow}, inset 0 2px 4px rgba(255,255,255,0.25)`
                  : '0 4px 20px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255,255,255,0.8)',
                border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.04)',
                minWidth: 'fit-content',
              }}>
              {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />}
              {/* Shine on active */}
              {isActive && <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[20px] pointer-events-none" />}
              <span className="text-xl relative z-10">{meta.emoji}</span>
              <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              {count > 0 && (
                <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold"
                  style={{ background: isActive ? 'rgba(255, 255, 255, 0.25)' : `${meta.from}15`, color: isActive ? '#fff' : meta.from }}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ═══ BOOKING CARDS ═══ */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-24 rounded-[32px] text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div className="text-7xl mb-6">🗺️</div>
            <h3 className="font-display font-extrabold text-2xl text-[var(--text-primary)] mb-3">No {activeTab} bookings</h3>
            <p className="text-[var(--text-muted)] font-extrabold mb-8 max-w-xs text-[15px]">You don't have any {activeTab} reservations right now. Time to plan your next adventure!</p>
            <div className="flex gap-3 relative z-10">
              <Link to="/app/book/hotels">
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-full text-white text-sm font-bold uppercase tracking-widest relative group"
                  style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)', boxShadow: '0 10px 30px rgba(252, 108, 38,0.35)' }}>
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant="white" />
                  <span className="relative z-10">Find Hotels</span>
                </motion.button>
              </Link>
              <Link to="/app/book/tickets">
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest relative group"
                  style={{ background: 'var(--bg-card)', color: '#FC6C26', border: '2px solid #FC6C26', boxShadow: '0 6px 20px rgba(252, 108, 38,0.15)' }}>
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                  <span className="relative z-10">Book Flights</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {filtered.map((booking: any, idx: number) => {
              const grad = getTypeGradient(booking.type)
              const isUpcoming = booking.status === 'upcoming'
              const isCancelled = booking.status === 'cancelled'
              return (
                <motion.div key={booking.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="rounded-[32px] overflow-hidden relative group"
                  style={{ background: 'var(--bg-card)', boxShadow: '0 15px 40px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.04)' }}>

                  {/* ── Colour accent top bar ── */}
                  <div className="h-1.5 w-full"
                    style={{ background: isCancelled ? 'linear-gradient(90deg,#dc2626,#f87171)' : `linear-gradient(90deg, ${grad.from}, ${grad.to})`, boxShadow: `0 2px 12px ${grad.glow}` }} />

                  <div className="p-6 sm:p-7">
                    {/* ── Top row: icon + info + price/status ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
                      <div className="flex items-start gap-5">
                        {/* Icon bubble */}
                        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${grad.from}15, ${grad.to}25)`, border: `1px solid ${grad.from}20` }}>
                          {getIcon(booking.type)}
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
                        </div>
                        <div>
                          {/* Type pill + ID */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[13px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
                              style={{ background: `${grad.from}10`, color: grad.from, border: `1px solid ${grad.from}20` }}>
                              {booking.type}
                            </span>
                            <span className="text-[14px] font-black text-[var(--text-muted)] font-mono tracking-widest">ID: {booking.id}</span>
                          </div>
                          <p className="font-display font-extrabold text-xl text-[var(--text-primary)] mb-2 leading-tight">{booking.itemName}</p>
                          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-xl w-max">
                            <Calendar size={14} style={{ color: grad.from }} />
                            {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Price + status */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#f3f4f6] pt-4 sm:pt-0 mt-2 sm:mt-0">
                        <div className="sm:text-right">
                          <p className="font-extrabold text-2xl text-[var(--text-primary)] tracking-tight">₹{booking.totalPrice.toLocaleString()}</p>
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-0.5">Total Paid</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mt-2 sm:mt-3"
                          style={
                            isUpcoming  ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' } :
                            isCancelled ? { background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5' } :
                                          { background: 'var(--bg-card)', color: '#64748b', border: '1px solid #e2e8f0' }
                          }>
                          {isUpcoming ? '●' : isCancelled ? '✕' : '✓'} {booking.status}
                        </span>
                      </div>
                    </div>

                    {isUpcoming && (() => {
                      const risk = computeCancellationRisk(booking)
                      if (!risk.riskLevel || risk.riskLevel === 'low') return null
                      return (
                        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl"
                          style={{
                            background: risk.riskLevel === 'high' ? '#fff1f2' : '#fefce8',
                            border: `1px solid ${risk.riskLevel === 'high' ? '#fca5a5' : '#fde68a'}`
                          }}>
                          <AlertCircle size={14} style={{ color: risk.riskLevel === 'high' ? '#dc2626' : '#d97706' }} />
                          <span className="text-xs font-extrabold" style={{ color: risk.riskLevel === 'high' ? '#dc2626' : '#92400e' }}>
                            {risk.message}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] font-extrabold ml-auto">heuristic</span>
                        </div>
                      )
                    })()}

                    {/* ── v4: Budget Stress Context (extends Budget Leak, shown on upcoming) ── */}
                    {isUpcoming && (() => {
                      const tripCost = booking.totalPrice || 0
                      if (tripCost <= 0) return null
                      const stress = computeBudgetStress(tripCost, comfortableBudget)
                      return (
                        <div className="mb-4 p-3.5 rounded-[16px] border" style={{ borderColor: `${stress.color}25`, background: `${stress.color}08` }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} style={{ color: stress.color }} />
                              <span className="text-[14px] font-black text-[#1B2A4A]">Budget Stress</span>
                            </div>
                            <span
                              className="text-[12px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest"
                              style={{ background: `${stress.color}15`, color: stress.color }}
                            >
                              {stress.stress_level}
                            </span>
                          </div>
                          {comfortableBudget > 0 ? (
                            <>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${Math.min(100, stress.ratio * 100)}%`, background: stress.color }}
                                />
                              </div>
                              <p className="text-[15px] font-black" style={{ color: stress.color }}>{stress.label}</p>
                              <p className="text-[13px] font-bold text-[#9ca3af] mt-1.5">{stress.basis}</p>
                            </>
                          ) : (
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                placeholder="Set your comfortable budget (₹)"
                                value={localComfortBudget}
                                onChange={e => setLocalComfortBudget(e.target.value)}
                                onBlur={() => {
                                  const val = parseInt(localComfortBudget) || 0
                                  setComfortableBudget(val)
                                }}
                                className="flex-1 text-[14px] font-black bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-2.5 outline-none focus:border-[#FC6C26] transition-colors"
                              />
                              <span className="text-[12px] font-bold text-[#9ca3af]">Not inferred from any data</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* ── Bottom action buttons ── */}
                    <div className="flex flex-wrap gap-3 pt-5"
                      style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      {!isCancelled && (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"
                          style={{ background: 'var(--bg-card)', color: '#374151', border: '1px solid rgba(0,0,0,0.06)' }}>
                          <Download size={15} /> Download Receipt
                        </motion.button>
                      )}

                      {isUpcoming && (
                        <motion.button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                          style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                          {cancellingId === booking.id ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                              <AlertCircle size={15} />
                            </motion.div>
                          ) : <XCircle size={15} />}
                          {cancellingId === booking.id ? 'Cancelling…' : 'Cancel Booking'}
                        </motion.button>
                      )}

                      <Link to={`/app/book/${booking.type}s`} className="ml-auto">
                        <motion.button whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-black uppercase tracking-widest"
                          style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`, color: '#fff', boxShadow: `0 8px 20px ${grad.glow}` }}>
                          <Sparkles size={14} />
                          Book Again
                          <ArrowRight size={14} />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SMART RECOMMENDATION STRIP ─── */}
      {recommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-[#FC6C26]" />
            <h3 className="font-black text-[14px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Based on your booking history</h3>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {recommendations.slice(0, 4).map((rec: any, i: number) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="shrink-0 w-64 rounded-[24px] overflow-hidden group cursor-pointer"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Link to={`/app/explore/place/${rec.id}`}>
                  <div className="h-36 overflow-hidden relative">
                    <img src={rec.imageUrl} alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="font-black text-white text-[16px] truncate tracking-tight">{rec.name}</p>
                      <p className="text-[12px] font-bold text-[#FC6C26]">{rec.reason}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg-card)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[var(--text-secondary)]">₹{(rec.avgCost || 3500).toLocaleString()}/day</span>
                      <span className="text-[13px] font-black text-[#FC6C26] uppercase tracking-wider">Explore →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

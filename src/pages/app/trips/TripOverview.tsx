import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTripStore } from '../../../stores/tripStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { formatCurrency, t } from '../../../utils/formatters'
import { Calendar, Users, Map, DollarSign, ArrowRight, Zap, CheckCircle2, UploadCloud, Eye, Sparkles } from 'lucide-react'
import { TripPrepPanel } from '../../../components/ui/TripPrepPanel'
import { computeDecisionTimeline, computeReadinessChecklist } from '../../../services/intelligenceService'
import type { TimelineTask, ReadinessItem } from '../../../services/intelligenceService'
import { useThemeStore } from '../../../stores/themeStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'

const TABS = ['itinerary', 'budget', 'bookings', 'documents', 'collaborators', 'prep'] as const
const TAB_ICONS: Record<string, string> = { itinerary: '🗺️', budget: '💰', bookings: '🏨', documents: '📁', collaborators: '👥', prep: '✅' }

export function TripOverview() {
  const { id } = useParams()
  const { currentTrip: trip, fetchTripById, isLoading } = useTripStore()
  const { currency, language } = useSettingsStore()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('itinerary')
  const [timeline, setTimeline] = useState<TimelineTask[]>([])
  const [checklist, setChecklist] = useState<ReadinessItem[]>([])

  useEffect(() => { if (id) fetchTripById(id) }, [id, fetchTripById])

  // v4: Compute Decision Timeline + Readiness Checklist when trip loads
  useEffect(() => {
    if (!trip) return
    const dest = trip.destinations?.[0] || trip.title || ''
    if (trip.startDate) setTimeline(computeDecisionTimeline(trip.startDate, dest))
    setChecklist(computeReadinessChecklist(trip, dest))
  }, [trip?.id])

  if (isLoading || !trip) return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      <p className="text-sm text-text-muted font-medium">{t('Loading your adventure…', language)}</p>
    </div>
  )

  const days = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)

  return (
    <div className="pb-32 lg:pb-8 min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ═══════════════════════════════════════════
          ULTRA-PREMIUM HERO COVER
      ═══════════════════════════════════════════ */}
      <div className="relative h-80 overflow-hidden">
        <img src={trip.coverImage} alt={trip.title}
          className="w-full h-full object-cover" />
        {/* Cinematic gradient layers */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />

        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white font-display leading-tight drop-shadow-2xl mb-2">{trip.title}</h1>
            <p className="text-white/70 text-sm font-bold tracking-[0.2em] uppercase">{trip.destinations.join('  →  ')}</p>
          </div>
          {trip.status === 'upcoming' && (
            <Link to={`/app/trips/${trip.id}/live`}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#0f172a,#0f172a)', boxShadow: '0 12px 35px rgba(15, 23, 42,0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3)', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
              <Zap size={15} className="fill-white" /> {t('Live Mode', language)}
            </Link>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          10,000 BILLION DOLLAR STAT CARDS ROW
          — Raised floating cards from the hero —
      ═══════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 -mt-8 relative z-10 mb-8">
        <div className="grid grid-cols-4 gap-3">
          {[
            { Icon: Calendar, label: t('Start', language), value: new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), from: '#0f172a', to: '#0f172a', glow: 'rgba(15, 23, 42,0.35)' },
            { Icon: Users,    label: t('People', language), value: String(trip.collaborators), from: '#6d28d9', to: '#8b5cf6', glow: 'rgba(139,92,246,0.35)' },
            { Icon: DollarSign, label: t('Budget', language), value: formatCurrency(trip.budget, currency), from: '#b45309', to: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
            { Icon: Map,      label: t('Days', language), value: String(days), from: '#0369a1', to: '#38bdf8', glow: 'rgba(56,189,248,0.35)' },
          ].map((s) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-5 px-2 rounded-[24px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 cursor-default"
              style={{ background: 'var(--bg-card)', boxShadow: `0 20px 40px -10px ${s.glow}, 0 4px 15px rgba(0,0,0,0.04)`, border: '1px solid rgba(255,255,255,0.8)' }}>
              {/* Gradient shimmer background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.from}08, transparent 70%)` }} />
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 relative"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})`, boxShadow: `0 8px 20px ${s.glow}` }}>
                <s.Icon size={20} className="text-white" strokeWidth={2.5} />
                {/* Shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
              </div>
              <p className="font-black text-[#0f172a] text-[22px] tracking-tight leading-none mb-1.5 drop-shadow-sm">{s.value}</p>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#475569]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-0">
        {/* ═══════════════════════════════════════════
            10,000 BILLION DOLLAR TAB BAR
            — Horizontal sliding pill dock —
        ═══════════════════════════════════════════ */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="inline-flex p-1.5 rounded-full gap-1 relative"
            style={{
              background: 'var(--bg-card)',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), inset 0 2px 5px rgba(0,0,0,0.025)',
              border: '1px solid var(--border-subtle)'
            }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 cursor-pointer group ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
                  style={{
                    background: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#ffffff' : (isDark ? '#ffffff' : '#000000'),
                    boxShadow: isActive
                      ? '0 10px 25px -5px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.2)'
                      : 'none',
                    border: isActive
                      ? (isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid #000000')
                      : '1px solid transparent',
                  }}>
                  {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant="white" />}
                  {/* Subtle top shine layer on active */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full pointer-events-none" />
                  )}
                  <span className="text-base leading-none relative z-10">{TAB_ICONS[tab]}</span>
                  <span className="relative z-10 font-black">{t(tab.charAt(0).toUpperCase() + tab.slice(1), language)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            TAB CONTENT
        ═══════════════════════════════════════════ */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              {(trip.itinerary || []).map((dayPlan, i) => {
                const mainItem = dayPlan.items.length > 0 ? dayPlan.items[0].name : t('Leisure Day', language);
                const totalCost = dayPlan.items.reduce((sum, item) => sum + item.cost, 0);
                
                return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group flex gap-5 items-center px-6 py-5 rounded-[28px] cursor-pointer transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  {/* Left accent glow line */}
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-500 group-hover:top-2 group-hover:bottom-2"
                    style={{ background: 'linear-gradient(to bottom, #0f172a, #0f172a)', boxShadow: '2px 0 10px rgba(15, 23, 42,0.3)' }} />
                  {/* Day number bubble */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: 'linear-gradient(135deg, #0f172a, #0f172a)', boxShadow: '0 10px 25px rgba(15, 23, 42,0.4)' }}>
                    {dayPlan.day}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#0f172a] text-lg group-hover:text-[#0f172a] transition-colors duration-300 drop-shadow-sm tracking-tight">{t('Day', language)} {dayPlan.day} — {mainItem}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] font-bold uppercase tracking-widest text-[#475569]">{dayPlan.items.length} {t('activities', language)}</span>
                      <span className="text-[#94a3b8]">·</span>
                      <span className="text-[12px] font-black uppercase tracking-widest text-[#0f172a]">{formatCurrency(totalCost, currency)} {t('est.', language)}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-400 opacity-0 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(135deg, #0f172a, #0f172a)', boxShadow: '0 4px 12px rgba(15, 23, 42,0.4)' }}>
                    <ArrowRight size={15} className="text-white" />
                  </div>
                </motion.div>
              )})}
              <Link to="/app/planner/itinerary"
                className="flex items-center justify-center gap-3 py-5 rounded-[28px] text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #0f172a, #0f172a)', color: 'white', boxShadow: '0 15px 35px rgba(15, 23, 42,0.4)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <Sparkles size={16} className="relative z-10" /> 
                <span className="relative z-10">{t('Edit Full Itinerary', language)}</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-5">
              <div className="p-7 rounded-[28px] relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#475569] mb-2">{t('Total Spent', language)}</p>
                    <p className="text-5xl font-black text-[#0f172a] tracking-tight drop-shadow-sm">{formatCurrency(trip.spent, currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#475569] mb-2">{t('of Budget', language)}</p>
                    <p className="text-3xl font-black text-[#0f172a] drop-shadow-sm">{formatCurrency(trip.budget, currency)}</p>
                  </div>
                </div>
                {/* ULTRA PREMIUM BUDGET BAR */}
                <div className="relative h-6 w-full rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #0f172a, #0f172a, #fdecd3)', boxShadow: '0 4px 16px rgba(15, 23, 42,0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)' }}>
                    {/* Moving shine */}
                    <div className="absolute inset-0 animate-pulse"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)', animationDuration: '2s' }} />
                    {/* Top gloss */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full" />
                  </motion.div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-[13px] font-bold text-[#475569] uppercase tracking-widest">
                    {Math.round((trip.spent / trip.budget) * 100)}% {t('used', language)}
                  </p>
                  <p className="text-[13px] font-black text-[#0f172a] uppercase tracking-widest">
                    {formatCurrency(trip.budget - trip.spent, currency)} {t('remaining', language)}
                  </p>
                </div>
              </div>
              <Link to="/app/planner/cost"
                className="flex items-center justify-center gap-3 py-5 rounded-[28px] text-[15px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', boxShadow: '0 15px 35px rgba(15,23,42,0.3)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <span className="relative z-10 drop-shadow-sm">{t('Open Cost Estimator', language)}</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-3">
              {['Hotel: The Lodhi — Aug 10-12', 'Ticket: Red Fort — Aug 11 9 AM'].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group flex justify-between items-center px-6 py-5 rounded-[28px] transition-all duration-400 hover:-translate-y-0.5 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ background: 'linear-gradient(to bottom, #16a34a, #4ade80)', boxShadow: '2px 0 10px rgba(22,163,74,0.3)' }} />
                  <div className="pl-2">
                    <p className="text-[16px] font-black text-[#0f172a] drop-shadow-sm tracking-tight">{b}</p>
                    <p className="text-[12px] font-bold text-[#475569] mt-1.5 uppercase tracking-wider">Booking #{1000 + i}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">{t('Confirmed', language)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {[
                { name: 'Aadhaar Card', icon: '🪪', status: 'required' },
                { name: 'PAN Card', icon: '🪪', status: 'required' },
                { name: 'Hotel Voucher', icon: '🏨', status: 'uploaded' },
                { name: 'E-Ticket PDF', icon: '🎫', status: 'uploaded' },
              ].map((doc, i) => (
                <motion.div key={doc.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="group flex items-center gap-4 px-6 py-5 rounded-[28px] transition-all duration-400 hover:-translate-y-0.5 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                    style={{ background: doc.status === 'required' ? 'linear-gradient(to bottom,#d97706,#fbbf24)' : 'linear-gradient(to bottom,#16a34a,#4ade80)', boxShadow: `2px 0 10px ${doc.status === 'required' ? 'rgba(217,119,6,0.3)' : 'rgba(22,163,74,0.3)'}` }} />
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <p className="text-[16px] font-black text-[#0f172a] drop-shadow-sm tracking-tight">{doc.name}</p>
                    <p className="text-[11px] font-black mt-1.5 uppercase tracking-wider" style={{ color: doc.status === 'required' ? '#b45309' : '#15803d' }}>
                      {doc.status === 'required' ? `⚠ ${t('Upload required', language)}` : `✓ ${t('Uploaded', language)}`}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
                    style={doc.status === 'required'
                      ? { background: 'linear-gradient(135deg,#111827,#374151)', color: 'var(--bg-card)', boxShadow: '0 6px 16px rgba(17,24,39,0.25)' }
                      : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    {doc.status === 'required' ? <><UploadCloud size={13}/> {t('Upload', language)}</> : <><Eye size={13}/> {t('View', language)}</>}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'collaborators' && (
            <div className="space-y-3">
              {[
                { name: 'Priya Sharma', role: 'Co-organizer', from: '#0f172a', to: '#0f172a', glow: 'rgba(15, 23, 42,0.4)' },
                { name: 'Rahul K.', role: 'Collaborator', from: '#6d28d9', to: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
              ].map((person, i) => (
                <motion.div key={person.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group flex items-center gap-5 px-6 py-5 rounded-[28px] transition-all duration-400 hover:-translate-y-0.5"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${person.from}, ${person.to})`, boxShadow: `0 10px 25px ${person.glow}` }}>
                      {person.name[0]}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse" style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.6)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#0f172a] text-lg tracking-tight drop-shadow-sm">{person.name}</p>
                    <p className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mt-1">{person.role}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{t('Online', language)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'prep' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TripPrepPanel
                timeline={timeline}
                checklist={checklist}
              />
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

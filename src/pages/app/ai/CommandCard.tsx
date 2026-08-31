// CommandCard.tsx — PREMIUM DARK: 8K-clarity typography, vivid gradients, no faded CSS vars
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Loader2, XCircle, Clock, ChevronDown, ChevronUp,
  AlertTriangle, Check, X, Sparkles, Zap, MapPin, DollarSign,
  Umbrella, ShoppingBag, Globe, Receipt, Navigation, Search, Hotel, Plane,
  Compass, ArrowRight, Thermometer, Wind, Star, TrendingUp, Package
} from 'lucide-react'
import { useCommandCenterStore } from '../../../stores/commandCenterStore'
import type { CommandRun, StepLog } from '../../../stores/commandCenterStore'
import { useNavigate } from 'react-router-dom'

// ─── Intent config — UNIQUE gradient per intent ──────────────────────────────
interface IntentConfig {
  icon: React.ReactNode
  gradient: string
  glow: string
  label: string
}
const INTENT_CONFIG: Record<string, IntentConfig> = {
  weather:            { icon: <Umbrella size={16} />,    gradient: 'linear-gradient(135deg,#0369a1,#0ea5e9)',   glow: 'rgba(14,165,233,0.35)',  label: 'Weather' },
  budget:             { icon: <DollarSign size={16} />,  gradient: 'linear-gradient(135deg,#15803d,#22c55e)',   glow: 'rgba(34,197,94,0.35)',   label: 'Budget' },
  packing:            { icon: <ShoppingBag size={16} />, gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',   glow: 'rgba(245,158,11,0.35)',  label: 'Packing' },
  currency:           { icon: <Globe size={16} />,       gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)',   glow: 'rgba(124,58,237,0.35)', label: 'Currency' },
  translate:          { icon: <Globe size={16} />,       gradient: 'linear-gradient(135deg,#0891b2,#22d3ee)',   glow: 'rgba(8,145,178,0.35)',  label: 'Translate' },
  expenses:           { icon: <Receipt size={16} />,     gradient: 'linear-gradient(135deg,#059669,#34d399)',   glow: 'rgba(52,211,153,0.35)', label: 'Expenses' },
  plan_trip:          { icon: <MapPin size={16} />,      gradient: 'linear-gradient(135deg,#b91c1c,#f87171)',   glow: 'rgba(185,28,28,0.35)',  label: 'Plan Trip' },
  find_hidden_places: { icon: <Search size={16} />,      gradient: 'linear-gradient(135deg,#0f172a,#475569)',   glow: 'rgba(15,23,42,0.35)',   label: 'Discover' },
  emergency:          { icon: <Navigation size={16} />,  gradient: 'linear-gradient(135deg,#dc2626,#ef4444)',   glow: 'rgba(220,38,38,0.45)',  label: 'Emergency' },
  find_food:          { icon: <Zap size={16} />,         gradient: 'linear-gradient(135deg,#d97706,#fbbf24)',   glow: 'rgba(217,119,6,0.35)',  label: 'Find Food' },
  book_hotel:         { icon: <Hotel size={16} />,       gradient: 'linear-gradient(135deg,#4f46e5,#818cf8)',   glow: 'rgba(79,70,229,0.35)',  label: 'Hotel' },
  book_flight:        { icon: <Plane size={16} />,       gradient: 'linear-gradient(135deg,#0284c7,#38bdf8)',   glow: 'rgba(2,132,199,0.35)',  label: 'Flight' },
  cancel_booking:     { icon: <X size={16} />,           gradient: 'linear-gradient(135deg,#9f1239,#f43f5e)',   glow: 'rgba(159,18,57,0.35)',  label: 'Cancel' },
  navigate:           { icon: <Compass size={16} />,     gradient: 'linear-gradient(135deg,#0f172a,#334155)',   glow: 'rgba(15,23,42,0.35)',   label: 'Open Feature' },
}

// Theme design tokens
const DK = {
  bg:       'var(--bg-primary)',
  bgCard:   'var(--bg-card)',
  border:   'var(--border-subtle)',
  text:     'var(--text-primary)',
  textSub:  'var(--text-secondary)',
  textMuted:'var(--text-muted)',
}

const STATUS_STYLES = {
  pending:           { border: 'var(--border-subtle)',     headerBg: 'transparent',  dotColor: 'var(--text-muted)' },
  running:           { border: 'rgba(99,102,241,0.45)',      headerBg: 'rgba(99,102,241,0.10)',   dotColor: '#818cf8' },
  awaiting_approval: { border: 'rgba(245,158,11,0.50)',      headerBg: 'rgba(245,158,11,0.10)',   dotColor: '#fbbf24' },
  done:              { border: 'var(--border-subtle)',     headerBg: 'transparent',  dotColor: 'var(--text-primary)' },
  failed:            { border: 'rgba(220,38,38,0.45)',       headerBg: 'rgba(220,38,38,0.10)',    dotColor: '#f87171' },
}

// ─── Shared card shell ────────────────────────────────────────────────────────
function ResultShell({ header, accentGradient, children }: {
  header: React.ReactNode
  accentGradient: string
  children: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="mt-4 rounded-[22px] overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', fontFamily: "'Outfit','Inter',sans-serif" }}>
      {/* Card header */}
      <div className="px-6 py-5 relative overflow-hidden" style={{ background: accentGradient }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />
        <div className="relative z-10">{header}</div>
      </div>
      {/* Card body */}
      <div className="px-6 py-5" style={{ background: 'var(--bg-card)' }}>
        {children}
      </div>
    </motion.div>
  )
}

// ─── Step Row ─────────────────────────────────────────────────────────────────
function StepRow({ step, index }: { step: StepLog; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
      className="flex items-center gap-3 py-0.5"
    >
      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
        {step.status === 'done' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 450, damping: 14 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          </motion.div>
        )}
        {step.status === 'running' && <Loader2 size={16} style={{ color: '#818cf8' }} className="animate-spin" />}
        {step.status === 'failed' && <XCircle size={18} style={{ color: 'var(--error)' }} />}
        {step.status === 'pending' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-subtle)' }} />}
      </div>
      <span style={{
          fontSize: 13, flex: 1, letterSpacing: '-0.2px',
          fontWeight: step.status === 'done' ? 700 : 600,
          color: step.status === 'done' ? 'var(--text-primary)' :
                 step.status === 'running' ? '#818cf8' :
                 step.status === 'failed' ? 'var(--error)' : 'var(--text-muted)',
          fontFamily: "'Inter', sans-serif",
        }}>
        {step.name}
      </span>
      {step.durationMs !== undefined && step.status === 'done' && (
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif" }}>{step.durationMs}ms</span>
      )}
    </motion.div>
  )
}

// ─── Result Renderer ──────────────────────────────────────────────────────────
function ResultBlock({ intent, result }: { intent: string; result: unknown }) {
  const data = result as Record<string, unknown>
  const navigate = useNavigate()
  if (!data) return null

  // ── Navigate: open a feature page ──────────────────────────────────────────
  if (intent === 'navigate') {
    if (data.error) {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-5 rounded-[18px]"
          style={{ background: '#fef2f2', border: '1.5px solid rgba(220,38,38,0.2)' }}>
          <p className="text-[14px] font-black text-red-700">
            ❓ Couldn't identify a feature for: <span className="italic">"{String(data.rawText)}"</span>
          </p>
          <p className="text-[12px] font-bold text-[var(--text-muted)] mt-1">Try: "open rewards", "go to bookings", "show wishlist"...</p>
        </motion.div>
      )
    }
    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#0f172a,#334155)"
        header={
          <div className="flex items-center gap-4">
            <div className="text-5xl">{String(data.emoji)}</div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">{String(data.label)}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1">Feature located · Ready to navigate</p>
            </div>
          </div>
        }
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate(String(data.route))}
          className="w-full py-4 rounded-[18px] flex items-center justify-center gap-3 text-[15px] font-black text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0f172a,#334155)', boxShadow: '0 12px 35px rgba(15,23,42,0.4)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          <span className="relative z-10 text-xl">{String(data.emoji)}</span>
          <span className="relative z-10 uppercase tracking-widest">Open {String(data.label)}</span>
          <ArrowRight size={16} className="relative z-10" />
        </motion.button>
      </ResultShell>
    )
  }

  // ── Weather ─────────────────────────────────────────────────────────────────
  if (intent === 'weather' && data.bestMonths) {
    const months = data.bestMonths as string[]
    const monthlyData = data.monthlyData as Array<{ month: string; avgTemp: number; rainfall: string; score: number; icon: string }> | undefined
    // Show all months, best ones first
    const allMonths = monthlyData || []
    const currentTemp = Number(data.currentTemp) || 25
    const condition = String(data.condition || 'Moderate')
    const humidity = Number(data.humidity) || 60
    const season = String(data.season || months.join(', '))

    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#0369a1,#0ea5e9)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center shrink-0">
              <p className="text-[32px] font-black text-white leading-none">{currentTemp}°</p>
            </div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">{String(data.city)}</p>
              <p className="text-[14px] font-bold text-sky-100 mt-0.5">{condition}</p>
              <p className="text-[11px] font-black text-sky-300 uppercase tracking-[0.15em] mt-0.5">💧 {humidity}% humidity</p>
            </div>
          </div>
        }
      >
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Feels Like', value: `${currentTemp - 2}°C`, icon: '🌡' },
            { label: 'Humidity', value: `${humidity}%`, icon: '💧' },
            { label: 'Season', value: season.split(' ')[0], icon: '📅' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center p-3 rounded-[14px]"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-xl mb-1">{s.icon}</span>
              <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: "'Outfit',sans-serif" }}>{s.value}</p>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 10px' }}>✅ Best Months to Visit</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {months.map(m => (
            <span key={m} style={{ padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 800, color: 'white', background: 'linear-gradient(135deg,#0369a1,#0ea5e9)', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', fontFamily: "'Outfit',sans-serif" }}>
              {m}
            </span>
          ))}
        </div>

        {/* Monthly breakdown */}
        {allMonths.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 10px' }}>Monthly Snapshot</p>
            <div className="space-y-2 mb-4">
              {allMonths.map(m => (
                <div key={m.month} className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-2xl shrink-0">{m.icon}</span>
                  <div className="flex-1">
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Outfit',sans-serif" }}>{m.month}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: "'Inter',sans-serif" }}>Avg {m.avgTemp}°C · Rain: {m.rainfall}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit',sans-serif" }}>{m.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Warning */}
        {data.warning && String(data.warning).length > 3 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-[14px]"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--warning)' }}>
            <Wind size={15} style={{ color: 'var(--warning)' }} className="mt-0.5 shrink-0" />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontFamily: "'Inter',sans-serif" }}>{String(data.warning)}</p>
          </div>
        )}
      </ResultShell>
    )
  }



  // ── Budget — Cost Engine with LIVE / Est. badges ────────────────────────────
  if (intent === 'budget' && (data.quotes || data.totalINR !== undefined)) {
    const quotes = (data.quotes || []) as Array<{
      component: string; label: string; emoji: string; amount: number;
      currency: string; pricingType: 'live' | 'estimated'; source: string;
      fetchedAt: string; details?: string; expandedInfo?: string
    }>
    const lineItems = quotes.filter(q => q.component !== 'total')
    const totalQuote = quotes.find(q => q.component === 'total')
    const totalINR = Number(data.totalINR) || totalQuote?.amount || 0
    const days = Number(data.days) || 5
    const travelers = Number(data.travelers) || 1
    const liveCount = lineItems.filter(q => q.pricingType === 'live').length
    const estCount = lineItems.filter(q => q.pricingType === 'estimated').length
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#15803d,#22c55e)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center shrink-0">
              <p className="text-[28px] font-black text-white leading-none">₹</p>
            </div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">
                {String(data.destination)} · {days} Days
              </p>
              <p className="text-[13px] font-bold text-green-100 mt-0.5">
                {travelers} traveler{travelers > 1 ? 's' : ''} · from {String(data.origin || 'Delhi')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {liveCount > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-400/30 text-white">
                    {liveCount} LIVE
                  </span>
                )}
                {estCount > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/30 text-white">
                    {estCount} Est.
                  </span>
                )}
              </div>
            </div>
          </div>
        }
      >
        {/* Line items */}
        <div className="space-y-1.5 mb-4">
          {lineItems.map((q, i) => (
            <motion.div
              key={q.component}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] cursor-pointer transition-all hover:shadow-sm"
                style={{
                  background: expandedRow === q.component ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  border: `1.5px solid ${expandedRow === q.component ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                }}
                onClick={() => setExpandedRow(expandedRow === q.component ? null : q.component)}
              >
                <span className="text-xl shrink-0">{q.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0, fontFamily: "'Outfit',sans-serif" }}>{q.label}</p>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                        padding: '2px 8px', borderRadius: 100, flexShrink: 0,
                        background: q.pricingType === 'live' ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                        color: q.pricingType === 'live' ? 'var(--success)' : 'var(--warning)',
                        border: `1px solid ${q.pricingType === 'live' ? 'var(--success)' : 'var(--warning)'}`,
                      }}
                    >
                      {q.pricingType === 'live' ? '● LIVE' : '◐ Est.'}
                    </span>
                  </div>
                  {q.details && (
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif" }}>{q.details}</p>
                  )}
                </div>
                <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontFamily: "'Outfit',sans-serif" }}>
                  ₹{q.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <AnimatePresence>
                {expandedRow === q.component && q.expandedInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div style={{ margin: '0 16px', padding: '12px 16px', borderRadius: '0 0 14px 14px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--success)' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0, fontFamily: "'Inter',sans-serif" }}>{q.expandedInfo}</p>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '6px 0 0' }}>
                        Source: {q.source} · Fetched: {new Date(q.fetchedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* ── Total row ── */}
        <div style={{ padding: '18px 20px', borderRadius: 18, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#15803d,#22c55e)', boxShadow: '0 12px 36px rgba(22,163,74,0.4)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(187,247,208,0.9)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0 }}>Total Estimated Cost</p>
              <p style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1, margin: '4px 0 0', fontVariantNumeric: 'tabular-nums', fontFamily: "'Outfit',sans-serif" }}>
                ₹{totalINR.toLocaleString('en-IN')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#bbf7d0', margin: 0, fontFamily: "'Inter',sans-serif" }}>
                ₹{Math.round(totalINR / days).toLocaleString('en-IN')}/day
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(187,247,208,0.7)', margin: '3px 0 0' }}>
                {liveCount} live · {estCount} est.
              </p>
            </div>
          </div>
        </div>

        {/* FX note */}
        {data.fxRate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 14px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <TrendingUp size={12} style={{ color: 'var(--text-primary)' }} />
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Inter',sans-serif" }}>
              FX: {String(data.fxFrom)} → INR at {Number(data.fxRate).toFixed(4)}
            </p>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
              {data.fxFetchedAt ? new Date(String(data.fxFetchedAt)).toLocaleTimeString() : ''}
            </span>
          </div>
        )}

        {/* Footer note */}
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: '12px 0 0', textAlign: 'center', lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
          Tap any row to see source & timestamp · Prices marked "Est." are from public cost-of-living data
        </p>
      </ResultShell>
    )
  }


  // ── Currency ────────────────────────────────────────────────────────────────
  if (intent === 'currency' && data.converted !== undefined) {
    const isLive = String(data.source).toLowerCase().includes('live')
    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#7c3aed,#a78bfa)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center text-3xl">💱</div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">Currency Conversion</p>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] mt-1"
                style={{ color: isLive ? 'var(--success)' : 'var(--warning)' }}>
                {isLive ? '● LIVE Exchange Rates' : '⚠ Fallback Estimate'}
              </p>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px' }}>From</p>
            <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums', fontFamily: "'Outfit',sans-serif" }}>
              {Number(data.amount).toLocaleString()}
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal-500)', margin: '4px 0 0', fontFamily: "'Outfit',sans-serif" }}>{String(data.from)}</p>
          </div>
          <div style={{ fontSize: 32, color: 'var(--text-muted)', paddingBottom: 4 }}>=</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px' }}>To</p>
            <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums', fontFamily: "'Outfit',sans-serif" }}>
              {Number(data.converted).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal-500)', margin: '4px 0 0', fontFamily: "'Outfit',sans-serif" }}>{String(data.to)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <TrendingUp size={14} style={{ color: 'var(--teal-500)' }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: "'Inter',sans-serif" }}>
            Rate: 1 {String(data.from)} = {Number(data.rate).toFixed(4)} {String(data.to)}
          </p>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: isLive ? 'var(--success)' : 'var(--warning)' }}>
            {String(data.source)}
          </span>
        </div>
      </ResultShell>
    )
  }

  // ── Packing ─────────────────────────────────────────────────────────────────
  if (intent === 'packing' && data.items) {
    const items = data.items as Array<{ label: string; category?: string; priority?: string }>
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'Essentials'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, typeof items>)

    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#b45309,#f59e0b)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center text-3xl">🎒</div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">Packing List</p>
              <p className="text-[11px] font-black text-amber-200 uppercase tracking-[0.15em] mt-1">
                {String(data.destination)} · {Number(data.duration)} days · {items.length} items
              </p>
            </div>
          </div>
        }
      >
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Package size={10} />
              {category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {catItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[13px]"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg,#b45309,#f59e0b)' }}>
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ResultShell>
    )
  }

  // ── Trip Plan ────────────────────────────────────────────────────────────────
  if (intent === 'plan_trip' && data.itinerary) {
    const days = data.itinerary as Array<{ day: number; title: string; estimatedCost: number; activities?: string[] }>
    const costData = data as { low?: number; high?: number; budgetRange?: string }
    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#b91c1c,#ef4444)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center text-3xl">🗺</div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">
                {String(data.destination)} Itinerary
              </p>
              <p className="text-[11px] font-black text-red-200 uppercase tracking-[0.15em] mt-1">
                {Number(data.days)} Days · {costData.budgetRange || 'Custom Budget'}
              </p>
            </div>
          </div>
        }
      >
        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 12px' }}>Day-by-Day Plan</p>
        <div className="space-y-2 mb-4">
          {days.slice(0, 5).map((d) => (
            <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900, flexShrink: 0, background: 'linear-gradient(135deg,#b91c1c,#ef4444)', boxShadow: '0 4px 14px rgba(185,28,28,0.4)', fontFamily: "'Outfit',sans-serif" }}>
                {d.day}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.3, margin: 0, fontFamily: "'Outfit',sans-serif" }}>{d.title}</p>
                {d.activities && (
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif" }}>{d.activities[0]}</p>
                )}
              </div>
              <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0, fontFamily: "'Outfit',sans-serif" }}>₹{d.estimatedCost.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          onClick={() => { window.location.href = '/app/planner/setup' }}
          style={{ width: '100%', padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#b91c1c,#ef4444)', boxShadow: '0 12px 32px rgba(185,28,28,0.45)', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }} />
          <Sparkles size={15} style={{ position: 'relative', zIndex: 1 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>Open Full Trip Planner →</span>
        </motion.button>
      </ResultShell>
    )
  }

  // ── Emergency ───────────────────────────────────────────────────────────────
  if (intent === 'emergency' && data.hospitals) {
    const hospitals = data.hospitals as Array<{ name: string; distance: string; phone: string }>
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
        <div className="rounded-[22px] overflow-hidden"
          style={{ border: '2px solid rgba(220,38,38,0.3)', boxShadow: '0 16px 50px rgba(220,38,38,0.18)' }}>
          <div className="px-6 py-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-4xl">🚨</div>
              <div>
                <p className="text-[22px] font-black text-white tracking-tight">Emergency Services</p>
                <p className="text-[11px] font-black text-red-200 uppercase tracking-[0.15em] mt-1">Tap to call instantly</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5" style={{ background: 'var(--bg-card)' }}>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[['112', '🆘', 'All Emergency'], ['100', '👮', 'Police'], ['108', '🚑', 'Ambulance']].map(([num, emoji, label]) => (
                <a key={num} href={`tel:${num}`}
                  className="flex flex-col items-center p-4 rounded-[18px] transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-2xl mb-1">{emoji}</span>
                  <p className="text-[28px] font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>{num}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </a>
              ))}
            </div>
            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.14em] mb-2">Nearby Hospitals</p>
            <div className="space-y-2">
              {hospitals.map((h, i) => (
                <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px]"
                  style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-subtle)' }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--error)' }} />
                  <div className="flex-1">
                    <p className="text-[14px] font-black text-[var(--text-primary)]">{h.name}</p>
                    <p className="text-[12px] font-bold text-[var(--text-muted)]">{h.distance}</p>
                  </div>
                  <a href={`tel:${h.phone}`}
                    className="text-[13px] font-black px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    {h.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Hidden Places & Find Food — NEW result block ────────────────────────────
  if ((intent === 'find_hidden_places' || intent === 'find_food') && data.places) {
    const places = data.places as Array<{ name: string; rating: number; type: string; crowdLevel?: string; distance?: string; cuisine?: string; priceRange?: string }>
    const isFood = intent === 'find_food'
    return (
      <ResultShell
        accentGradient={isFood ? 'linear-gradient(135deg,#d97706,#fbbf24)' : 'linear-gradient(135deg,#0f172a,#334155)'}
        header={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center text-3xl">
              {isFood ? '🍜' : '🔍'}
            </div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">
                {isFood ? 'Local Food Spots' : 'Hidden Gems'}
              </p>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] mt-1"
                style={{ color: isFood ? '#fde68a' : '#94a3b8' }}>
                {places.length} places found · Low crowd
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {places.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="hover:shadow-md transition-shadow"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 18, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, background: isFood ? 'linear-gradient(135deg,#d97706,#fbbf24)' : 'linear-gradient(135deg,#4f46e5,#818cf8)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.3, margin: 0, fontFamily: "'Outfit',sans-serif" }}>{p.name}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: "'Inter',sans-serif" }}>
                  {p.type}{p.crowdLevel ? ` · 👥 ${p.crowdLevel}` : ''}{p.distance ? ` · 📍 ${p.distance}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit',sans-serif" }}>{p.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </ResultShell>
    )
  }

  // ── Expenses — NEW result block ─────────────────────────────────────────────
  if (intent === 'expenses') {
    const total = Number(data.total) || 0
    const breakdown = data.breakdown as Record<string, number> | undefined
    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#059669,#34d399)"
        header={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)]/15 flex items-center justify-center text-3xl">📊</div>
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">Expense Tracker</p>
              <p className="text-[11px] font-black text-emerald-200 uppercase tracking-[0.15em] mt-1">
                {data.tripName ? String(data.tripName) : 'Current Trip'} Summary
              </p>
            </div>
          </div>
        }
      >
        <div className="mb-4">
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 4px' }}>Total Spent</p>
          <p style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums', fontFamily: "'Outfit',sans-serif" }}>
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
        {breakdown && Object.keys(breakdown).length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 10px' }}>By Category</p>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([cat, amt]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 13, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', flex: 1, textTransform: 'capitalize', fontFamily: "'Outfit',sans-serif" }}>{cat}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981', fontFamily: "'Outfit',sans-serif" }}>₹{Number(amt).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {data.note && (
          <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '12px 0 0', textAlign: 'center', fontFamily: "'Inter',sans-serif" }}>{String(data.note)}</p>
        )}
      </ResultShell>
    )
  }

  // ── Hotel/Flight booking confirmed ─────────────────────────────────────────
  if ((intent === 'book_hotel' || intent === 'book_flight') && data.confirmation) {
    const conf = data.confirmation as Record<string, unknown>
    return (
      <ResultShell
        accentGradient="linear-gradient(135deg,#15803d,#22c55e)"
        header={
          <div className="flex items-center gap-4">
            <CheckCircle2 size={32} className="text-white shrink-0" />
            <div>
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">Sandbox Booking Confirmed</p>
              <p className="text-[11px] font-black text-green-200 uppercase tracking-[0.15em] mt-1">Test mode · No real payment</p>
            </div>
          </div>
        }
      >
        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 4px' }}>Booking Reference</p>
        <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: '0 0 10px', fontFamily: 'monospace' }}>{String(conf.bookingRef)}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', margin: 0, fontFamily: "'Inter',sans-serif" }}>{String(conf.note)}</p>
      </ResultShell>
    )
  }

  // ── Generic summary fallback ────────────────────────────────────────────────
  if (data.summary) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: 16, padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.6, margin: 0, fontFamily: "'Inter',sans-serif" }}>{String(data.summary)}</p>
      </motion.div>
    )
  }
  return null
}

// ─── Approval Gate ─────────────────────────────────────────────────────────────
function ApprovalGate({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{ marginTop: 16, borderRadius: 22, overflow: 'hidden', border: '2px solid rgba(245,158,11,0.45)', boxShadow: '0 20px 60px rgba(245,158,11,0.18)' }}
    >
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, background: 'rgba(245,158,11,0.08)' }}>
        <AlertTriangle size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#fde68a', letterSpacing: '-0.4px', margin: 0, fontFamily: "'Outfit',sans-serif" }}>Approval Required</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fcd34d', margin: '6px 0 0', lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
            This action will submit a reservation. Review the results above.{' '}
            <span style={{ fontWeight: 800 }}>No real payment will be charged (sandbox mode).</span>
          </p>
        </div>
      </div>
      <div style={{ padding: '16px 24px', display: 'flex', gap: 12, background: 'rgba(245,158,11,0.05)' }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onReject}
          style={{ flex: 1, padding: '14px', borderRadius: 14, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
        >
          <X size={15} /> Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={onApprove}
          style={{ flex: 2, padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#15803d,#22c55e)', boxShadow: '0 12px 30px rgba(34,197,94,0.45)', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }} />
          <Check size={15} style={{ position: 'relative', zIndex: 1 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>Confirm Booking →</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Main CommandCard ──────────────────────────────────────────────────────────
export function CommandCard({ command }: { command: CommandRun }) {
  const [expanded, setExpanded] = useState(command.status !== 'done' || command.result !== undefined)
  const { approveActiveGate, rejectActiveGate } = useCommandCenterStore()

  const intentCfg = INTENT_CONFIG[command.detectedIntent] || {
    icon: <Sparkles size={16} />,
    gradient: 'linear-gradient(135deg,#6366f1,#818cf8)',
    glow: 'rgba(99,102,241,0.3)',
    label: command.intentLabel,
  }
  const statusStyle = STATUS_STYLES[command.status]

  const isApprovalGatePending =
    command.status === 'awaiting_approval' &&
    command.steps.some(s => s.type === 'approval_gate' && s.status === 'running')

  const timeTaken = command.completedAt
    ? Math.round((new Date(command.completedAt).getTime() - new Date(command.createdAt).getTime()) / 100) / 10
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        borderRadius: 24, overflow: 'hidden',
        background: 'var(--bg-card)',
        border: `1px solid ${statusStyle.border}`,
        boxShadow: command.status === 'running' || command.status === 'awaiting_approval'
          ? 'var(--shadow-lg)'
          : 'var(--shadow-card)',
        fontFamily: "'Outfit','Inter',sans-serif",
      }}
    >
      {/* ── Card Header ── */}
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: statusStyle.headerBg, borderBottom: `1px solid ${statusStyle.border}` }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Intent icon */}
        <div
          style={{ width: 44, height: 44, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, position: 'relative', overflow: 'hidden', background: intentCfg.gradient, boxShadow: `0 8px 24px ${intentCfg.glow}` }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }} />
          <span style={{ position: 'relative', zIndex: 1 }}>{intentCfg.icon}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Query text */}
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: "'Outfit',sans-serif" }}>
            {command.rawText}
          </p>

          {/* Meta pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white', background: intentCfg.gradient }}>
              {intentCfg.label}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {Math.round(command.confidence * 100)}% match
            </span>
            {timeTaken && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                <Clock size={10} /> {timeTaken}s
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: statusStyle.dotColor }}>
              {command.status === 'awaiting_approval' ? '⚠ Awaiting approval' :
               command.status === 'running' ? '⟳ Running…' :
               command.status === 'done' ? '✓ Done' :
               command.status === 'failed' ? '✕ Failed' : '○ Pending'}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <button style={{ flexShrink: 0, padding: 6, borderRadius: 10, color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ── Expandable Body ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div style={{ padding: '16px 20px 20px' }}>

              {/* Slot tags */}
              {Object.keys(command.slots).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {Object.entries(command.slots).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.12em', background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontFamily: "'Inter',sans-serif" }}>
                      {k.replace(/_/g, ' ')}: <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{v}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Step checklist */}
              {command.steps.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4, padding: '12px 14px', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {command.steps.map((step, i) => <StepRow key={step.id} step={step} index={i} />)}
                </div>
              )}

              {/* Approval gate */}
              {isApprovalGatePending && (
                <ApprovalGate onApprove={approveActiveGate} onReject={rejectActiveGate} />
              )}

              {/* Result */}
              {command.status === 'done' && command.result && (
                <ResultBlock intent={command.detectedIntent} result={command.result} />
              )}

              {/* Error */}
              {command.status === 'failed' && (
                <div style={{ marginTop: 12, padding: '16px 20px', borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#f87171', letterSpacing: '-0.2px', margin: 0, fontFamily: "'Outfit',sans-serif" }}>
                    {command.errorMessage || 'Something went wrong. Please try again.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

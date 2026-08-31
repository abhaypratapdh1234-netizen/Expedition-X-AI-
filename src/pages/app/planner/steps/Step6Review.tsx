/**
 * Step6Review.tsx — Features #9 (Offline Emergency Pack), #10 (Travel Time Capsule)
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, Lock, MapPin, Shield, Cloud, Package, ArrowLeft, Sparkles } from 'lucide-react'
import { buildOfflinePack, sealTimeCapsule, getTimeCapsule } from '../../../services/plannerFeatures'
import { usePlannerStore } from '../../../stores/plannerStore'
import { TimeCapsuleCard } from '../../../components/planner/TimeCapsuleCard'

export function Step6Review() {
  const { session, routeSegments, packingList, offlinePackProgress, setOfflinePackProgress, timeCapsule, setTimeCapsule, setStep, resetSession } = usePlannerStore()
  const destination = session?.destination || 'Goa'
  const tripId = session?.id || 'trip-demo'

  const [offlinePackData, setOfflinePackData] = useState<Awaited<ReturnType<typeof buildOfflinePack>> | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [activeSection, setActiveSection] = useState<'summary' | 'offline' | 'capsule'>('summary')

  useEffect(() => {
    const existing = getTimeCapsule(tripId)
    if (existing) setTimeCapsule(existing)
    buildOfflinePack(tripId, destination).then(setOfflinePackData)
  }, [])

  const handleDownloadPack = async () => {
    setDownloading(true)
    setOfflinePackProgress(0)

    // Simulate progressive download
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 150))
      setOfflinePackProgress(i)
    }
    setDownloading(false)
  }

  const handleSealCapsule = (unlockAt: Date, note: string) => {
    const capsule = sealTimeCapsule(tripId, unlockAt, note)
    setTimeCapsule(capsule)
  }

  const highRiskCount = routeSegments.filter(s => s.riskBand === 'high').length
  const checkedItems = packingList?.items.filter(i => i.checked).length ?? 0

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-black text-[var(--text-primary)]">✅ Trip Review</h2>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">
          Final summary · Offline pack · Time capsule
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { key: 'summary', label: '📋 Summary' },
          { key: 'offline', label: '📦 Offline Pack' },
          { key: 'capsule', label: '🔒 Time Capsule' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all ${
              activeSection === tab.key ? 'bg-[var(--bg-card)] shadow-sm text-[#FC6C26]' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── SUMMARY TAB ── */}
        {activeSection === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Trip card */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#384D7E] rounded-2xl p-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/60 mb-1">Your Trip</p>
              <p className="text-[24px] font-black">{destination}</p>
              <p className="text-[14px] text-white/80 mt-1">
                {session?.startDate
                  ? new Date(session.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
                  : '—'} · {session?.durationDays ?? '—'} days · {session?.party ?? 'Solo'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {session?.vibes?.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded-full bg-[var(--bg-card)]/15 text-[11px] font-black">{v}</span>
                ))}
              </div>
            </div>

            {/* Signal summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Route Risk',
                  value: highRiskCount > 0 ? `${highRiskCount} High Risk` : 'All Clear',
                  icon: Shield,
                  color: highRiskCount > 0 ? '#ef4444' : '#22c55e',
                  bg: highRiskCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200',
                },
                {
                  label: 'Packing',
                  value: `${checkedItems}/${packingList?.items.length ?? 0} items`,
                  icon: Package,
                  color: '#FC6C26',
                  bg: 'bg-orange-50 border-orange-200',
                },
                {
                  label: 'Budget / Day',
                  value: `₹${(session?.budgetPerDay ?? 0).toLocaleString()}`,
                  icon: MapPin,
                  color: '#7c3aed',
                  bg: 'bg-purple-50 border-purple-200',
                },
                {
                  label: 'Offline Pack',
                  value: offlinePackProgress >= 100 ? 'Downloaded' : 'Not Downloaded',
                  icon: Download,
                  color: offlinePackProgress >= 100 ? '#22c55e' : '#6b7280',
                  bg: offlinePackProgress >= 100 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-[var(--border-subtle)]',
                },
              ].map(stat => (
                <div key={stat.label} className={`p-3 rounded-xl border ${stat.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={13} style={{ color: stat.color }} />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-[13px] font-black text-[var(--text-primary)]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Features used */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Features Active</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Reverse Search', emoji: '🌍', active: true },
                  { label: 'Risk Route', emoji: '🛡️', active: routeSegments.length > 0 },
                  { label: 'Energy Plan', emoji: '⚡', active: true },
                  { label: 'Hidden Gems', emoji: '🕵️', active: true },
                  { label: 'Crowd Data', emoji: '👥', active: true },
                  { label: 'Quiet Zones', emoji: '🤫', active: true },
                  { label: 'Scam Map', emoji: '⚠️', active: true },
                  { label: 'Weather+PlanB', emoji: '☁️', active: true },
                  { label: 'Food Safety', emoji: '🍴', active: true },
                  { label: 'Backpack', emoji: '🎒', active: !!packingList },
                  { label: 'Challenges', emoji: '🏁', active: true },
                  { label: 'SOS Escape', emoji: '🆘', active: true },
                  { label: 'Offline Pack', emoji: '📦', active: offlinePackProgress >= 100 },
                  { label: 'Time Capsule', emoji: '🔒', active: !!timeCapsule },
                  { label: 'Group Track', emoji: '👣', active: false },
                ].map(f => (
                  <div key={f.label} className={`flex items-center gap-1.5 p-2 rounded-lg ${f.active ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-[var(--border-subtle)]'}`}>
                    <span className="text-sm">{f.emoji}</span>
                    <span className={`text-[9px] font-black ${f.active ? 'text-green-700' : 'text-[#9ca3af]'}`}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── OFFLINE PACK TAB ── */}
        {activeSection === 'offline' && (
          <motion.div key="offline" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] flex items-center justify-center">
                  <Download size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-[var(--text-primary)]">Offline Emergency Pack</p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {offlinePackData ? `~${offlinePackData.estimatedSizeMB}MB` : 'Calculating...'} · Works without internet
                  </p>
                </div>
              </div>

              {/* Components list */}
              {offlinePackData && (
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bundle Contents</p>
                  {offlinePackData.components.map(c => (
                    <div key={c.name} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-[var(--border-subtle)]">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      <p className="text-[12px] text-[var(--text-primary)] flex-1">{c.name}</p>
                      <span className="text-[11px] text-[#9ca3af]">{c.sizeMB}MB</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {(downloading || offlinePackProgress > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-black text-[var(--text-primary)]">
                      {offlinePackProgress >= 100 ? '✅ Pack Downloaded!' : `Bundling... ${offlinePackProgress}%`}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{offlinePackProgress}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${offlinePackProgress}%` }}
                      className="h-full rounded-full bg-[#FC6C26]"
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleDownloadPack}
                disabled={downloading || offlinePackProgress >= 100}
                className={`w-full py-3 rounded-xl font-black text-[14px] transition-all flex items-center justify-center gap-2 ${
                  offlinePackProgress >= 100
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-[#1B2A4A] text-white hover:bg-[#FC6C26] shadow-md'
                }`}
              >
                {offlinePackProgress >= 100 ? (
                  <><CheckCircle size={16} /> Pack Downloaded</>
                ) : (
                  <><Download size={16} /> {downloading ? 'Bundling...' : '📦 Download Offline Pack'}</>
                )}
              </button>

              <p className="text-[10px] text-[#9ca3af]">
                Map tiles: OSM extracts (Geofabrik) · Emergency contacts: OpenStreetMap/Overpass ·
                No internet required after download
              </p>
            </div>
          </motion.div>
        )}

        {/* ── TIME CAPSULE TAB ── */}
        {activeSection === 'capsule' && (
          <motion.div key="capsule" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TimeCapsuleCard capsule={timeCapsule} onSeal={handleSealCapsule} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start New Trip */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={resetSession}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-subtle)] text-[13px] font-black text-[var(--text-muted)] hover:border-[#FC6C26] hover:text-[#FC6C26] transition-all"
        >
          <Sparkles size={14} /> Plan Another Trip
        </button>
      </div>
    </div>
  )
}

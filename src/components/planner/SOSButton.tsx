import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Phone, Navigation, X, AlertTriangle } from 'lucide-react'
import type { EmergencyPoint } from '../../services/plannerFeatures'

const TYPE_CONFIG = {
  hospital: { emoji: '🏥', color: '#FC6C26', bg: '#FFF5F0', border: '#FECACA', label: 'Hospital' },
  police: { emoji: '👮', color: '#1B2A4A', bg: '#F0F4FF', border: '#C7D2FE', label: 'Police' },
  embassy: { emoji: '🏛️', color: '#7c3aed', bg: '#F5F3FF', border: '#DDD6FE', label: 'Embassy / Helpline' },
  fire: { emoji: '🚒', color: '#dc2626', bg: '#FEF2F2', border: '#FECACA', label: 'Fire Station' },
}

interface SOSButtonProps {
  emergencyPoints: EmergencyPoint[]
  destination: string
}

export function SOSButton({ emergencyPoints, destination }: SOSButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shadow-[0_8px_30px_rgba(239,68,68,0.5)]"
        style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          animation: 'pulse-glow-red 2s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes pulse-glow-red {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          }
        `}</style>
        🆘
      </motion.button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] rounded-t-[28px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              {/* Handle */}
              <div className="w-12 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-black text-[var(--text-primary)]">Emergency Escape</h3>
                    <p className="text-[12px] text-[var(--text-muted)] font-bold">Nearest safe points · {destination}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Emergency number row */}
              <div className="flex items-center gap-3 mb-5 p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-2xl">🚨</span>
                <div className="flex-1">
                  <p className="text-[13px] font-black text-red-800">Universal Emergency</p>
                  <p className="text-[12px] text-red-600">Call 112 for police, fire or ambulance anywhere in India</p>
                </div>
                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-black shadow-md hover:bg-red-600 transition-colors"
                >
                  Call 112
                </a>
              </div>

              {/* Safe points */}
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  3 Nearest Safe Points · Source: OpenStreetMap/Overpass + Seed data
                </p>
                {emergencyPoints.slice(0, 3).map((ep) => {
                  const cfg = TYPE_CONFIG[ep.type] ?? TYPE_CONFIG.hospital
                  return (
                    <div
                      key={ep.id}
                      className="flex items-center gap-3 p-4 rounded-xl border"
                      style={{ background: cfg.bg, borderColor: cfg.border }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: 'white', border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-black text-[var(--text-primary)] truncate">{ep.name}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold">
                          {ep.distanceKm}km away · ~{ep.routeMinutes} min drive
                        </p>
                        <p className="text-[11px] text-[#9ca3af] truncate">{ep.address}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {ep.phone && (
                          <a
                            href={`tel:${ep.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black text-white transition-all shadow-sm"
                            style={{ background: cfg.color }}
                          >
                            <Phone size={11} /> Call
                          </a>
                        )}
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ep.lat},${ep.lon}`, '_blank')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-gray-50 transition-all"
                        >
                          <Navigation size={11} /> Navigate
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px] text-[#9ca3af] text-center mt-4">
                In a real emergency, always call local services first. This data is for planning purposes only.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

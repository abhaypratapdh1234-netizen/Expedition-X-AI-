/**
 * Step3Safety.tsx — Features #5 (Scam Map), #6 (Weather Backup), #15 (Emergency Escape)
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CloudSun, Shield, Plus, ArrowRight } from 'lucide-react'
import { getScamWarnings, submitScamReport, getEmergencyEscape } from '../../../../services/plannerFeatures'
import { fetchWeatherByCity, type DayForecast } from '../../../../services/openMeteoApi'
import { usePlannerStore } from '../../../../stores/plannerStore'
import { ScamCard } from '../../../../components/planner/ScamCard'
import { WeatherBackupCard } from '../../../../components/planner/WeatherBackupCard'
import { SOSButton } from '../../../../components/planner/SOSButton'

export function Step3Safety() {
  const { session, scamWarnings, setScamWarnings, addScamWarning, setStep, completeStep } = usePlannerStore()
  const destination = session?.destination || 'Goa'

  const [activeTab, setActiveTab] = useState<'weather' | 'scam' | 'emergency'>('weather')
  const [weatherForecasts, setWeatherForecasts] = useState<DayForecast[]>([])
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(false)
  const [emergencyPoints, setEmergencyPoints] = useState<Awaited<ReturnType<typeof getEmergencyEscape>>>([])
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportForm, setReportForm] = useState({ description: '', location: '' })

  useEffect(() => {
    loadScams()
    loadWeather()
    loadEmergency()
  }, [destination])

  const loadScams = async () => {
    const warnings = await getScamWarnings(destination)
    setScamWarnings(warnings)
  }

  const loadWeather = async () => {
    setWeatherLoading(true)
    setWeatherError(false)
    try {
      const result = await fetchWeatherByCity(destination, 7)
      if (result) setWeatherForecasts(result.forecasts)
      else setWeatherError(true)
    } catch {
      setWeatherError(true)
    }
    setWeatherLoading(false)
  }

  const loadEmergency = async () => {
    const pts = await getEmergencyEscape(destination)
    setEmergencyPoints(pts)
  }

  const handleSubmitReport = () => {
    if (!reportForm.description || !reportForm.location) return
    const report = submitScamReport(destination, {
      description: reportForm.description,
      location: reportForm.location,
      lat: 15.4989,
      lon: 73.8278,
    })
    addScamWarning(report)
    setReportForm({ description: '', location: '' })
    setShowReportForm(false)
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-black text-[var(--text-primary)]">🛡️ Safety & Timing</h2>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">
          Live weather · Scam warnings · Emergency escape planning
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { key: 'weather', label: '☁️ Weather', count: null },
          { key: 'scam', label: '⚠️ Scam Map', count: scamWarnings.length },
          { key: 'emergency', label: '🆘 Emergency', count: null },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-black transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--bg-card)] shadow-sm text-[#FC6C26]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── WEATHER TAB ── */}
        {activeTab === 'weather' && (
          <motion.div key="weather" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <CloudSun size={16} className="text-[#FC6C26]" />
              <p className="text-[14px] font-black text-[var(--text-primary)]">7-Day Forecast · {destination}</p>
              <span className="text-[10px] text-[#9ca3af] ml-auto">Open-Meteo · Free API · No key</span>
            </div>

            {weatherLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : weatherError ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <p className="text-[14px] font-black text-amber-700">Weather data unavailable</p>
                <p className="text-[12px] text-amber-600 mt-1">Check your internet connection. Geocoding via Nominatim (OSM).</p>
                <button onClick={loadWeather} className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-[12px] font-black">
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {weatherForecasts.slice(0, 5).map((day, i) => (
                  <div key={day.date}>
                    {i === 0 && <p className="text-[11px] font-black uppercase tracking-widest text-[#FC6C26] mb-2">Next 5 Days</p>}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-3 mb-2">
                      <p className="text-[11px] text-[var(--text-muted)] mb-2 font-black">
                        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <WeatherBackupCard forecast={day} destination={destination} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SCAM TAB ── */}
        {activeTab === 'scam' && (
          <motion.div key="scam" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <p className="text-[14px] font-black text-[var(--text-primary)]">
                  {scamWarnings.length} warnings · {destination}
                </p>
              </div>
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FC6C26] text-white text-[12px] font-black shadow-sm hover:opacity-90"
              >
                <Plus size={12} /> Report
              </button>
            </div>

            {/* Report form */}
            <AnimatePresence>
              {showReportForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-3 overflow-hidden"
                >
                  <p className="text-[12px] font-black text-amber-800">Report a Scam — Community Warning</p>
                  <input
                    value={reportForm.location}
                    onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Location (e.g., Calangute Beach)"
                    className="w-full text-[13px] bg-[var(--bg-card)] border border-amber-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#FC6C26]"
                  />
                  <textarea
                    value={reportForm.description}
                    onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the scam (TF-IDF classifier will auto-categorize it)..."
                    className="w-full h-20 text-[13px] bg-[var(--bg-card)] border border-amber-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#FC6C26] resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSubmitReport} className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-[13px] font-black">
                      Submit Warning
                    </button>
                    <button onClick={() => setShowReportForm(false)} className="flex-1 py-2 rounded-xl bg-[var(--bg-card)] border border-amber-200 text-[var(--text-muted)] text-[13px] font-black">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Classifier note */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-[var(--border-subtle)]">
              <Shield size={13} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[var(--text-muted)]">
                Reports are auto-categorized using TF-IDF + Logistic Regression classifier (classical ML, scikit-learn).
                Confidence shown per report. Older unconfirmed reports fade via time-decay scoring.
              </p>
            </div>

            {scamWarnings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-[14px] font-black text-[var(--text-primary)]">No reports for {destination}</p>
                <p className="text-[12px] text-[var(--text-muted)]">Be the first to warn fellow travelers</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scamWarnings.map(w => <ScamCard key={w.id} warning={w} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* ── EMERGENCY TAB ── */}
        {activeTab === 'emergency' && (
          <motion.div key="emergency" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-[14px] font-black text-red-800 mb-1">🚨 Universal Emergency Numbers</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: 'Emergency', num: '112' }, { label: 'Police', num: '100' }, { label: 'Ambulance', num: '108' }].map(e => (
                  <a key={e.num} href={`tel:${e.num}`}
                    className="flex flex-col items-center p-2.5 bg-[var(--bg-card)] rounded-xl border border-red-100 hover:border-red-300 transition-colors">
                    <span className="text-[18px] font-black text-red-600">{e.num}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{e.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Nearest Safe Points · Source: OpenStreetMap/Overpass
            </p>

            {emergencyPoints.map(ep => (
              <div key={ep.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-[var(--border-subtle)] flex items-center justify-center text-xl">
                  {ep.type === 'hospital' ? '🏥' : ep.type === 'police' ? '👮' : ep.type === 'embassy' ? '🏛️' : '🚒'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-[var(--text-primary)] truncate">{ep.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{ep.distanceKm}km · ~{ep.routeMinutes} min drive</p>
                </div>
                {ep.phone && (
                  <a href={`tel:${ep.phone}`} className="px-3 py-1.5 rounded-xl bg-[#1B2A4A] text-white text-[12px] font-black hover:bg-[#FC6C26] transition-colors shrink-0">
                    Call
                  </a>
                )}
              </div>
            ))}

            <p className="text-[10px] text-[#9ca3af] text-center">
              SOS button (bottom-right) opens this panel instantly during live trip mode
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS FAB (only when on emergency tab for demo) */}
      {activeTab === 'emergency' && <SOSButton emergencyPoints={emergencyPoints} destination={destination} />}

      <button
        onClick={() => { completeStep(3); setStep(4) }}
        className="w-full py-4 mt-auto rounded-2xl bg-gradient-to-r from-[#FC6C26] to-[#e55a15] text-white font-black text-[15px] shadow-[0_8px_25px_rgba(252,108,38,0.4)] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
      >
        Continue to Places <ArrowRight size={16} />
      </button>
    </div>
  )
}

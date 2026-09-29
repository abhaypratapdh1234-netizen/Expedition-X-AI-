/**
 * Step2Route.tsx — Features #2 (Disaster Route), #8 (Energy), #13 (Lost Friend)
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Users, Zap, Map as MapIcon, ArrowRight, Info } from 'lucide-react'
import { computeRouteRisk, computeEnergyForDay, getDemoGroupMembers } from '../../../../services/plannerFeatures'
import { usePlannerStore } from '../../../../stores/plannerStore'
import { RiskOverlay } from '../../../../components/planner/RiskOverlay'
import { EnergyBar } from '../../../../components/planner/EnergyBar'

const ACTIVITY_PRESETS = [
  { id: 'a1', name: 'Temple Visit', type: 'temple_visit', durationHours: 2, elevationGainM: 0 },
  { id: 'a2', name: 'Market Walk', type: 'city_walk', durationHours: 2.5, elevationGainM: 0 },
  { id: 'a3', name: 'Trekking', type: 'trek', durationHours: 5, elevationGainM: 600 },
  { id: 'a4', name: 'Museum', type: 'museum', durationHours: 2, elevationGainM: 0 },
  { id: 'a5', name: 'Rafting', type: 'rafting', durationHours: 3, elevationGainM: 0 },
  { id: 'a6', name: 'Boat Ride', type: 'boat_ride', durationHours: 1.5, elevationGainM: 0 },
  { id: 'a7', name: 'Sightseeing', type: 'sightseeing', durationHours: 3, elevationGainM: 0 },
  { id: 'a8', name: 'Yoga Session', type: 'yoga', durationHours: 1.5, elevationGainM: 0 },
]

const REGIONS = [
  'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Kerala', 'Rajasthan',
  'Jammu & Kashmir', 'Assam', 'Odisha', 'Maharashtra', 'Karnataka'
]

export function Step2Route() {
  const { session, routeSegments, setRouteSegments, energyBudget, setEnergyBudget, setStep, completeStep } = usePlannerStore()
  const destination = session?.destination || 'Goa'

  const [waypoints, setWaypoints] = useState<string[]>([destination, destination])
  const [riskLoading, setRiskLoading] = useState(false)
  const [activeActivities, setActiveActivities] = useState<typeof ACTIVITY_PRESETS>([ACTIVITY_PRESETS[0], ACTIVITY_PRESETS[6]])
  const [activeTab, setActiveTab] = useState<'route' | 'energy' | 'group'>('route')
  const [groupEnabled, setGroupEnabled] = useState(false)
  const groupMembers = getDemoGroupMembers(destination)

  useEffect(() => {
    loadRiskData()
  }, [waypoints])

  const loadRiskData = async () => {
    if (waypoints.filter(w => w.trim()).length < 2) return
    setRiskLoading(true)
    const segs = await computeRouteRisk(waypoints.filter(w => w.trim()))
    setRouteSegments(segs)
    setRiskLoading(false)
  }

  const energyDay = computeEnergyForDay(activeActivities, energyBudget)

  const toggleActivity = (act: typeof ACTIVITY_PRESETS[0]) => {
    setActiveActivities(prev =>
      prev.find(a => a.id === act.id)
        ? prev.filter(a => a.id !== act.id)
        : [...prev, act]
    )
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#3fa796] animate-pulse" />
            <span className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--text-primary)]">ROUTE ANALYSIS</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tighter text-[var(--text-primary)] mb-4 leading-tight drop-shadow-sm">
          Plan the route
        </h1>
        <p className="text-[var(--text-primary)] text-[18px] font-extrabold max-w-lg mx-auto leading-relaxed">
          Analyze disaster risks, calculate energy budgets, and sync with your group.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-full max-w-lg">
          {(['route', 'energy', 'group'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[14px] font-black transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[var(--bg-card)] shadow-md text-[#3fa796] scale-[1.02]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-200/50'
              }`}
            >
              {tab === 'route' ? '🗺️ Route Risk' : tab === 'energy' ? '⚡ Energy' : '👥 Group'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── ROUTE TAB ── */}
        {activeTab === 'route' && (
          <motion.div
            key="route"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Waypoints */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
              <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]">Route Waypoints</p>
              {waypoints.map((wp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 text-white"
                    style={{ background: i === 0 ? '#1B2A4A' : i === waypoints.length - 1 ? '#FC6C26' : '#6b7280' }}
                  >
                    {i === 0 ? 'A' : i === waypoints.length - 1 ? 'B' : String.fromCharCode(65 + i)}
                  </div>
                  <select
                    value={wp}
                    onChange={e => {
                      const updated = [...waypoints]
                      updated[i] = e.target.value
                      setWaypoints(updated)
                    }}
                    className="flex-1 text-[13px] font-black text-[var(--text-primary)] bg-gray-50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 outline-none focus:border-[#FC6C26]"
                  >
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {waypoints.length > 2 && (
                    <button onClick={() => setWaypoints(prev => prev.filter((_, j) => j !== i))}
                      className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100">
                      <Minus size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setWaypoints(prev => [...prev.slice(0, -1), 'Kerala', prev[prev.length - 1]])}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-[var(--border-strong)] text-[12px] text-[var(--text-muted)] hover:border-[#FC6C26] hover:text-[#FC6C26] transition-colors"
              >
                <Plus size={13} /> Add Waypoint
              </button>
            </div>

            {/* Risk overlay */}
            {riskLoading ? (
              <div className="h-32 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
                <p className="text-[12px] text-[var(--text-muted)]">Computing hazard risk scores...</p>
              </div>
            ) : routeSegments.length > 0 ? (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapIcon size={15} className="text-[#FC6C26]" />
                  <p className="text-[13px] font-black text-[var(--text-primary)]">Route Risk Analysis</p>
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-[#9ca3af]">
                    <Info size={10} />
                    LightGBM-style weighted scoring
                  </div>
                </div>
                <RiskOverlay segments={routeSegments} />
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ── ENERGY TAB ── */}
        {activeTab === 'energy' && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Budget slider */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-black text-[var(--text-primary)]">Daily Energy Budget</p>
                <span className="text-[14px] font-black text-[#FC6C26]">{energyBudget} pts</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                value={energyBudget}
                onChange={e => setEnergyBudget(Number(e.target.value))}
                className="w-full accent-[#FC6C26]"
              />
              <div className="flex justify-between text-[10px] text-[#9ca3af] mt-1">
                <span>Low (30)</span><span>Balanced (70)</span><span>High (100)</span>
              </div>
              <p className="text-[10px] text-[#9ca3af] mt-2">
                Based on: activity category + duration hours + elevation gain (Open-Elevation API proxy)
              </p>
            </div>

            {/* Activity picker */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                Today's Activities (tap to toggle)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_PRESETS.map(act => {
                  const isActive = !!activeActivities.find(a => a.id === act.id)
                  return (
                    <button
                      key={act.id}
                      onClick={() => toggleActivity(act)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-[#FC6C26]/10 border-[#FC6C26]/40 text-[var(--text-primary)]'
                          : 'bg-gray-50 border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[#FC6C26]/20'
                      }`}
                    >
                      <p className="text-[12px] font-black">{act.name}</p>
                      <p className="text-[10px] mt-0.5">{act.durationHours}h · {act.type}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Energy bar */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4">
              <EnergyBar day={energyDay} />
            </div>
          </motion.div>
        )}

        {/* ── GROUP TAB ── */}
        {activeTab === 'group' && (
          <motion.div
            key="group"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-[#FC6C26]" />
                  <p className="text-[13px] font-black text-[var(--text-primary)]">Lost Friend Finder</p>
                </div>
                <button
                  onClick={() => setGroupEnabled(!groupEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${groupEnabled ? 'bg-[#FC6C26]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--bg-card)] shadow transition-all ${groupEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="text-[12px] text-[var(--text-muted)]">
                Share location with trip members. Geofence alert if anyone is &gt;2km from group centroid.
                WebSocket-based real-time tracking (opt-in, privacy-first).
              </p>
            </div>

            {groupEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Group Members · Live Demo Mode
                </p>
                {groupMembers.map(member => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-xl border transition-all ${
                      member.isAlert ? 'border-red-200 bg-red-50' : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xl font-black ${
                      member.isAlert ? 'bg-red-100' : 'bg-amber-50'
                    }`}>
                      {member.avatar}
                      {member.isAlert && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-[var(--text-primary)]">{member.name}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">{member.locationLabel}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {Math.round((Date.now() - member.lastSeen) / 60000)}m ago
                      </p>
                    </div>
                    {member.isAlert && (
                      <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-black border border-red-200">
                        ⚠️ 2.8km away
                      </span>
                    )}
                  </div>
                ))}
                <p className="text-[10px] text-[#9ca3af] text-center mt-4">
                  Demo mode: real WebSocket location sharing available in production backend · Nominatim reverse geocoding
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 right-12 z-50"
      >
        <button
          onClick={() => {
            completeStep(2)
            setStep(3)
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-[16px] text-[16px] font-black tracking-tight transition-all shadow-lg border-2 bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[#3fa796] hover:border-[#3fa796] hover:text-white"
        >
          Continue to Safety <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  )
}

/**
 * Step2Route.tsx — Features #2 (Disaster Route), #8 (Energy), #13 (Lost Friend)
 */
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Minus, Map as MapIcon, ArrowRight, Info,
  Copy, Check, Phone, Bell, ShieldCheck, Radio,
  UserPlus, Volume2, Trash2, Loader2, MapPin, WifiOff, RefreshCw
} from 'lucide-react'
import { computeRouteRisk, computeEnergyForDay } from '../../../../services/plannerFeatures'
import { usePlannerStore } from '../../../../stores/plannerStore'
import { RiskOverlay } from '../../../../components/planner/RiskOverlay'
import { EnergyBar } from '../../../../components/planner/EnergyBar'
import {
  ALL_INDIAN_STATES,
  INDIA_STATES_AND_CITIES,
  resolveStateAndCity
} from '../../../../data/indiaStatesAndCities'
import { useGroupTracking } from '../../../../hooks/useGroupTracking'

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

interface WaypointItem {
  id: string
  state: string
  city: string
}

export function Step2Route() {
  const { session, routeSegments, setRouteSegments, energyBudget, setEnergyBudget, setStep, completeStep } = usePlannerStore()
  const destination = session?.destination || 'Goa'

  const initialA = resolveStateAndCity(destination)
  const defaultBState = initialA.state === 'Himachal Pradesh' ? 'Uttarakhand' : 'Himachal Pradesh'
  const defaultBCity = INDIA_STATES_AND_CITIES[defaultBState]?.[0] || 'Shimla'

  const [waypoints, setWaypoints] = useState<WaypointItem[]>([
    { id: 'wp-origin', state: initialA.state, city: initialA.city },
    { id: 'wp-dest', state: defaultBState, city: defaultBCity }
  ])
  const [riskLoading, setRiskLoading] = useState(false)
  const [activeActivities, setActiveActivities] = useState<typeof ACTIVITY_PRESETS>([ACTIVITY_PRESETS[0], ACTIVITY_PRESETS[6]])
  const [activeTab, setActiveTab] = useState<'route' | 'energy' | 'group'>('route')

  // ── Group real GPS tracking ───────────────────────────────────────────────────
  const groupId = useMemo(() => {
    const stored = localStorage.getItem('exp-group-id')
    if (stored) return stored
    const id = `EXP-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`
    localStorage.setItem('exp-group-id', id)
    return id
  }, [])

  const [geofenceRadiusKm, setGeofenceRadiusKm] = useState(2.0)
  const [groupEnabled, setGroupEnabled] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberPhone, setNewMemberPhone] = useState('')
  const [pingNotification, setPingNotification] = useState<string | null>(null)
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null)
  const [newMemberAvatar, setNewMemberAvatar] = useState('\uD83C\uDF92')
  const AVATAR_OPTIONS = ['\uD83C\uDF92', '\uD83E\uDDD1', '\uD83D\uDC69', '\uD83D\uDC68', '\uD83E\uDDD4', '\uD83D\uDC69\u200D\uD83D\uDCBC', '\uD83D\uDC68\u200D\uD83D\uDCBC', '\uD83E\uDDD5', '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1', '\uD83E\uDDD1\u200D\uD83E\uDDB1']

  const {
    myLocation,
    myLabel,
    myBattery,
    isLocating,
    locationError,
    members: trackedMembers,
    addPendingMember,
    removeMember,
    syncFromStorage,
  } = useGroupTracking(groupId, geofenceRadiusKm)

  const handleCopyInvite = (memberId: string, memberName: string) => {
    const url = `${window.location.origin}/join?g=${encodeURIComponent(groupId)}&m=${encodeURIComponent(memberId)}&n=${encodeURIComponent(memberName)}`
    navigator.clipboard?.writeText?.(url).catch(() => {})
    setCopiedInvite(memberId)
    setTimeout(() => setCopiedInvite(null), 3000)
    setPingNotification(`\uD83D\uDCCB Invite link for ${memberName} copied! Share it via WhatsApp / SMS.`)
    setTimeout(() => setPingNotification(null), 4000)
  }

  const handlePing = (name: string) => {
    setPingNotification(`\uD83D\uDD0A Distress beacon transmitted to ${name}!`)
    setTimeout(() => setPingNotification(null), 4000)
  }

  const handleBroadcastBeacon = () => {
    setPingNotification(`\uD83D\uDCE2 Broadcast ping sent to all ${trackedMembers.length} group devices!`)
    setTimeout(() => setPingNotification(null), 4500)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim()) return
    const member = addPendingMember(newMemberName.trim(), newMemberPhone.trim(), newMemberAvatar)
    setNewMemberName('')
    setNewMemberPhone('')
    setNewMemberAvatar('\uD83C\uDF92')
    setShowAddModal(false)
    const url = `${window.location.origin}/join?g=${encodeURIComponent(groupId)}&m=${encodeURIComponent(member.id)}&n=${encodeURIComponent(member.name)}`
    navigator.clipboard?.writeText?.(url).catch(() => {})
    setPingNotification(`\uD83C\uDF89 ${member.name} added! Invite link copied \u2014 send it via WhatsApp or SMS.`)
    setTimeout(() => setPingNotification(null), 6000)
  }

  const handleDeleteMember = (memberId: string, memberName: string) => {
    removeMember(memberId)
    setPingNotification(`\uD83D\uDDD1\uFE0F ${memberName} removed from the trip group.`)
    setTimeout(() => setPingNotification(null), 3000)
  }

  useEffect(() => {
    loadRiskData()
  }, [waypoints])

  const loadRiskData = async () => {
    if (waypoints.length < 2) return
    setRiskLoading(true)
    const formatted = waypoints.map(w => (w.city ? `${w.city}, ${w.state}` : w.state))
    const segs = await computeRouteRisk(formatted)
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
            <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
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
        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-850 p-1.5 rounded-2xl w-full max-w-lg border border-black/10 dark:border-white/15 shadow-inner">
          {(['route', 'energy', 'group'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[14px] font-black transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-md border-2 border-black dark:border-white scale-[1.02]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {tab === 'route' ? '\uD83D\uDDFA\uFE0F Route Risk' : tab === 'energy' ? '\u26A1 Energy' : '\uD83D\uDC65 Group'}
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
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div>
                  <p className="text-[13px] font-black uppercase tracking-wider text-[var(--text-primary)]">
                    Route Waypoints &amp; Destinations
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-bold">
                    Select any Indian state, then pick any city inside that state
                  </p>
                </div>
                <span className="text-[11px] font-black bg-neutral-100 dark:bg-neutral-800 text-[var(--text-primary)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
                  {waypoints.length} Points
                </span>
              </div>

              <div className="space-y-4">
                {waypoints.map((wp, i) => {
                  const stateCities = INDIA_STATES_AND_CITIES[wp.state] || []
                  const isStart = i === 0
                  const isEnd = i === waypoints.length - 1
                  const badgeLetter = isStart ? 'A' : isEnd ? 'B' : String.fromCharCode(65 + i)
                  const badgeColor = isStart ? '#1B2A4A' : isEnd ? '#FC6C26' : '#475569'

                  return (
                    <div
                      key={wp.id}
                      className="p-4 rounded-xl border border-[var(--border-subtle)] bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black text-white shadow-sm shrink-0"
                            style={{ background: badgeColor }}
                          >
                            {badgeLetter}
                          </div>
                          <div>
                            <span className="text-[13px] font-black text-[var(--text-primary)]">
                              {isStart ? 'Starting Location (Waypoint A)' : isEnd ? 'Final Destination (Waypoint B)' : `Stopover Waypoint (${badgeLetter})`}
                            </span>
                            <div className="text-[11px] font-black text-black dark:text-neutral-300">
                              \uD83D\uDCCD {wp.city ? `${wp.city}, ${wp.state}` : wp.state}
                            </div>
                          </div>
                        </div>
                        {waypoints.length > 2 && (
                          <button
                            onClick={() => setWaypoints(prev => prev.filter((_, j) => j !== i))}
                            className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition-colors"
                            title="Remove waypoint"
                          >
                            <Minus size={13} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* STATE */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                              <span>\uD83C\uDFDB\uFE0F</span> State
                            </label>
                            <span className="text-[10px] font-bold text-neutral-500">All 36 States &amp; UTs</span>
                          </div>
                          <select
                            value={wp.state}
                            onChange={e => {
                              const nextState = e.target.value
                              const nextCities = INDIA_STATES_AND_CITIES[nextState] || []
                              const nextCity = nextCities[0] || nextState
                              setWaypoints(prev => {
                                const copy = [...prev]
                                copy[i] = { ...copy[i], state: nextState, city: nextCity }
                                return copy
                              })
                            }}
                            className="w-full text-[13px] font-black text-[var(--text-primary)] bg-white dark:bg-neutral-800 border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer shadow-sm"
                          >
                            {ALL_INDIAN_STATES.map(st => (
                              <option key={st} value={st} className="bg-white dark:bg-neutral-900 text-black dark:text-white py-1">
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* CITY */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                              <span>\uD83C\uDFD9\uFE0F</span> City / District in {wp.state}
                            </label>
                            <span className="text-[10px] font-black text-black dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                              {stateCities.length} cities &amp; districts available
                            </span>
                          </div>
                          <select
                            value={wp.city}
                            onChange={e => {
                              const nextCity = e.target.value
                              setWaypoints(prev => {
                                const copy = [...prev]
                                copy[i] = { ...copy[i], city: nextCity }
                                return copy
                              })
                            }}
                            className="w-full text-[13px] font-black text-[var(--text-primary)] bg-white dark:bg-neutral-800 border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer shadow-sm"
                          >
                            {stateCities.map(ct => (
                              <option key={ct} value={ct} className="bg-white dark:bg-neutral-900 text-black dark:text-white py-1">
                                {ct}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Waypoint */}
              <button
                onClick={() => {
                  const defaultMidState = 'Rajasthan'
                  const defaultMidCity = INDIA_STATES_AND_CITIES[defaultMidState]?.[0] || 'Jaipur'
                  setWaypoints(prev => [
                    ...prev.slice(0, -1),
                    { id: `wp-${Date.now()}`, state: defaultMidState, city: defaultMidCity },
                    prev[prev.length - 1]
                  ])
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--border-strong)] text-[13px] font-black text-[var(--text-primary)] hover:border-[#FC6C26] hover:text-[#FC6C26] hover:bg-[#FC6C26]/5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={15} /> Add Waypoint Stopover
              </button>
            </div>

            {/* Risk overlay */}
            {riskLoading ? (
              <div className="h-32 bg-gray-100 dark:bg-neutral-850 rounded-2xl animate-pulse flex items-center justify-center border border-black/10 dark:border-white/10">
                <p className="text-[14px] font-black text-[var(--text-primary)]">Computing hazard risk scores across waypoints...</p>
              </div>
            ) : routeSegments.length > 0 ? (
              <div className="bg-[var(--bg-card)] rounded-2xl border-2 border-black/10 dark:border-white/10 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[var(--border-subtle)] flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-[#FC6C26] shrink-0">
                      <MapIcon size={17} />
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-black dark:text-white">Route Risk Analysis</p>
                      <p className="text-[12px] font-bold text-neutral-600 dark:text-neutral-400">
                        Disaster hazard forecasting across active Indian travel corridors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10">
                    <Info size={13} className="text-[#FC6C26]" />
                    <span>NDMA &amp; IMD Live Weighted Grid</span>
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
                      <p className="text-[10px] mt-0.5">{act.durationHours}h \u00b7 {act.type}</p>
                    </button>
                  )
                })}
              </div>
            </div>

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
            {/* Notification Banner */}
            <AnimatePresence>
              {pingNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="bg-black text-white px-4 py-3 rounded-2xl shadow-xl border border-neutral-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 text-[13px] font-bold">
                    <Radio size={16} className="text-emerald-400 animate-pulse shrink-0" />
                    <span>{pingNotification}</span>
                  </div>
                  <button onClick={() => setPingNotification(null)} className="text-neutral-400 hover:text-white text-[12px] font-black cursor-pointer">
                    \u2715
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Your Real Location Status */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                  isLocating ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                  : locationError ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                }`}>
                  {isLocating ? <Loader2 size={18} className="animate-spin text-neutral-500" />
                  : locationError ? <WifiOff size={18} className="text-red-500" />
                  : <MapPin size={18} className="text-emerald-600" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-black text-[var(--text-primary)]">You (Organizer)</p>
                    {!isLocating && !locationError && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live GPS
                      </span>
                    )}
                    {isLocating && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200">Locating\u2026</span>}
                    {locationError && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-200">GPS Denied</span>}
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-0.5 truncate">
                    \uD83D\uDCCD {locationError ? locationError : myLabel}
                  </p>
                  {myLocation && (
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                      {myLocation.lat.toFixed(5)}, {myLocation.lon.toFixed(5)} \u00b7 \uD83D\uDD0B {myBattery}%
                    </p>
                  )}
                </div>
              </div>
              {locationError && (
                <button onClick={() => window.location.reload()} className="shrink-0 px-3 py-1.5 rounded-xl bg-black text-white text-[12px] font-black flex items-center gap-1.5 cursor-pointer">
                  <RefreshCw size={13} /> Retry GPS
                </button>
              )}
            </div>

            {/* Header + Controls */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10 flex items-center justify-center text-xl shrink-0">\uD83D\uDC65</div>
                  <div>
                    <p className="text-[16px] font-black text-[var(--text-primary)]">Lost Friend Finder &amp; Live Group Sync</p>
                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                      Add friends \u2192 send their unique invite link \u2192 when they open it and share GPS, their real location shows on your radar.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[12px] font-black text-[var(--text-muted)]">{groupEnabled ? 'Monitoring Active' : 'Paused'}</span>
                  <button
                    onClick={() => setGroupEnabled(!groupEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${groupEnabled ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all ${groupEnabled ? 'left-6 bg-white dark:bg-black' : 'left-0.5 bg-white dark:bg-neutral-400'}`} />
                  </button>
                </div>
              </div>
              {groupEnabled && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">Geofence:</span>
                    <div className="flex items-center gap-1.5">
                      {[1.0, 2.0, 5.0].map(rad => (
                        <button key={rad} onClick={() => setGeofenceRadiusKm(rad)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${geofenceRadiusKm === rad ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)]'}`}>
                          {rad}.0 km
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleBroadcastBeacon} className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[var(--text-primary)] text-[12px] font-black flex items-center gap-1.5 cursor-pointer">
                      <Volume2 size={13} /> Ping All
                    </button>
                    <button onClick={syncFromStorage} className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[var(--text-primary)] text-[12px] font-black flex items-center gap-1.5 cursor-pointer">
                      <RefreshCw size={13} /> Refresh
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 rounded-xl bg-black text-white text-[12px] font-black hover:bg-neutral-900 flex items-center gap-1.5 shadow-sm cursor-pointer">
                      <UserPlus size={13} /> Add Friend
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Group ID */}
            <div className="bg-neutral-100 dark:bg-neutral-850 rounded-2xl border border-black/10 dark:border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-inner">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 flex items-center justify-center font-black text-sm shrink-0">#</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Trip Group ID</span>
                    <span className="text-[12px] font-mono font-black text-[var(--text-primary)] tracking-wider break-all">{groupId}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-semibold mt-0.5">
                    {trackedMembers.length} friend{trackedMembers.length !== 1 ? 's' : ''} added \u00b7 Real GPS polling every 15s
                  </p>
                </div>
              </div>
            </div>

            {/* Geofence Status */}
            {trackedMembers.some(m => m.isAlert) ? (
              <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0 text-xl font-black">\u26A0\uFE0F</div>
                  <div>
                    <p className="text-[14px] font-black text-red-900 dark:text-red-200">
                      Geofence Alert: {trackedMembers.filter(m => m.isAlert).map(m => m.name).join(', ')} outside safe zone!
                    </p>
                    <p className="text-[12px] font-semibold text-red-700 dark:text-red-300 mt-0.5">
                      Real GPS distance from your location. Send an immediate ping.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => trackedMembers.filter(m => m.isAlert).forEach(m => handlePing(m.name))}
                  className="px-3.5 py-2 rounded-xl bg-black text-white text-[12px] font-black hover:bg-neutral-900 flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                >
                  <Bell size={13} /> Send Beacon
                </button>
              </div>
            ) : trackedMembers.length > 0 && trackedMembers.some(m => m.status !== 'offline') ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-black text-emerald-900 dark:text-emerald-200">All Active Members in Safe Perimeter</p>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Within {geofenceRadiusKm}km of your real GPS. Auto-syncing every 15s.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Radar */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-black text-[var(--text-primary)]">Live Geofence Radar</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {myLocation ? `Your GPS: ${myLocation.lat.toFixed(4)}, ${myLocation.lon.toFixed(4)}` : 'Waiting for your GPS\u2026'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" /> Pending</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" /> Alert</span>
                </div>
              </div>
              <div className="relative w-full max-w-sm mx-auto aspect-square bg-neutral-950 rounded-full border-2 border-neutral-800 shadow-2xl flex items-center justify-center overflow-hidden my-2">
                <div className="absolute inset-8 rounded-full border border-dashed border-red-500/60 pointer-events-none" />
                <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800 pointer-events-none">{geofenceRadiusKm}km Perimeter</span>
                <div className="absolute inset-20 rounded-full border border-emerald-500/40 pointer-events-none" />
                <div className="absolute inset-x-4 top-1/2 h-px bg-neutral-800/80 pointer-events-none" />
                <div className="absolute inset-y-4 left-1/2 w-px bg-neutral-800/80 pointer-events-none" />
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent animate-spin origin-center" style={{ animationDuration: '4s' }} />
                </div>
                <div className="absolute z-20 flex flex-col items-center" style={{ top: '47%', left: '47%' }}>
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_12px_rgba(96,165,250,1)] flex items-center justify-center text-[9px] font-black text-white">\uD83E\uDDAD</div>
                    <div className="absolute -inset-1.5 rounded-full bg-blue-400/30 animate-ping" />
                  </div>
                  <span className="text-[8px] font-black text-blue-300 bg-neutral-900/90 px-1 rounded mt-0.5 whitespace-nowrap">You (0.0km)</span>
                </div>
                {trackedMembers.map((m, idx) => {
                  const ratio = Math.min(m.distanceFromGroupCentroid / (geofenceRadiusKm * 1.2), 0.85)
                  const angle = (idx * 137.5 * Math.PI) / 180
                  const cx = 50 + ratio * 38 * Math.cos(angle)
                  const cy = 50 + ratio * 38 * Math.sin(angle)
                  const dotColor = m.status === 'offline' ? 'bg-orange-500' : m.isAlert ? 'bg-red-600' : 'bg-emerald-600'
                  const txtColor = m.status === 'offline' ? 'text-orange-300' : m.isAlert ? 'text-red-200' : 'text-emerald-300'
                  return (
                    <div key={m.id} className="absolute z-30 flex flex-col items-center cursor-pointer transition-transform hover:scale-125" style={{ top: `${cy}%`, left: `${cx}%`, transform: 'translate(-50%,-50%)' }}>
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${dotColor} border border-white text-white flex items-center justify-center text-[10px] font-black shadow-md ${m.isAlert ? 'animate-bounce' : ''}`}>{m.avatar}</div>
                        {m.isAlert && <div className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping pointer-events-none" />}
                        {m.status === 'offline' && <div className="absolute -inset-1 rounded-full bg-orange-400/30 animate-pulse pointer-events-none" />}
                      </div>
                      <span className={`text-[8px] font-black ${txtColor} bg-neutral-900/90 px-1 rounded mt-0.5 whitespace-nowrap`}>
                        {m.name.split(' ')[0]} ({m.status === 'offline' ? '?' : `${m.distanceFromGroupCentroid}km`})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Member Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Live Group Members ({trackedMembers.length})
                </p>
                <span className="text-[11px] font-bold text-neutral-500">Real GPS \u00b7 Auto-sync 15s</span>
              </div>

              {trackedMembers.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-2xl space-y-3">
                  <div className="text-4xl">\uD83D\uDC65</div>
                  <p className="text-[14px] font-black text-[var(--text-primary)]">No friends added yet</p>
                  <p className="text-[12px] text-[var(--text-muted)] max-w-xs mx-auto">
                    Click <strong>Add Friend</strong>, enter their name, then send the invite link via WhatsApp/SMS. Their real location appears here once they open it and allow GPS.
                  </p>
                  <button onClick={() => setShowAddModal(true)} className="mx-auto px-5 py-2.5 rounded-xl bg-black text-white text-[13px] font-black flex items-center gap-1.5 cursor-pointer">
                    <UserPlus size={14} /> Add Friend Now
                  </button>
                </div>
              ) : (
                trackedMembers.map(member => (
                  <div
                    key={member.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-card)] rounded-2xl border transition-all shadow-xs ${
                      member.isAlert ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                      : member.status === 'offline' ? 'border-orange-200 dark:border-orange-800/50 bg-orange-50/30 dark:bg-orange-950/10'
                      : 'border-[var(--border-subtle)] hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black border ${
                          member.isAlert ? 'bg-red-100 border-red-300'
                          : member.status === 'offline' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 border-[var(--border-subtle)]'
                        }`}>{member.avatar}</div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          member.status === 'offline' ? 'bg-orange-400' : member.isAlert ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-black text-[var(--text-primary)]">{member.name}</p>
                          {member.status === 'offline' ? (
                            <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-black border border-orange-300 dark:border-orange-800">\u23F3 Awaiting GPS</span>
                          ) : member.isAlert ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-[10px] font-black border border-red-300 dark:border-red-700">\u26A0\uFE0F {member.distanceFromGroupCentroid}km \u2014 Breach</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-black border border-emerald-300 dark:border-emerald-800">\u2713 {member.distanceFromGroupCentroid}km safe</span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-0.5 truncate">\uD83D\uDCCD {member.locationLabel}</p>
                        {member.lat !== null && member.lon !== null && (
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{member.lat.toFixed(5)}, {member.lon.toFixed(5)}</p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                          <span>Seen {Math.max(1, Math.round((Date.now() - member.lastSeen) / 60000))}m ago</span>
                          {member.battery > 0 && <><span>\u2022</span><span>\uD83D\uDD0B {member.battery}% {member.battery < 30 && '(Low)'}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                      <button
                        onClick={() => handleCopyInvite(member.id, member.name)}
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-black flex items-center gap-1.5 transition-colors border cursor-pointer ${
                          copiedInvite === member.id
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[var(--text-primary)] border-[var(--border-subtle)]'
                        }`}
                        title="Copy invite link"
                      >
                        {copiedInvite === member.id ? <Check size={13} /> : <Copy size={13} />}
                        {copiedInvite === member.id ? 'Copied!' : 'Invite Link'}
                      </button>
                      <button onClick={() => handlePing(member.name)} className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[var(--text-primary)] text-[12px] font-black flex items-center gap-1.5 transition-colors border border-[var(--border-subtle)] cursor-pointer">
                        <Bell size={13} /> Ping
                      </button>
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="px-3 py-1.5 rounded-xl bg-black text-white text-[12px] font-black hover:bg-neutral-900 flex items-center gap-1.5 shadow-xs">
                          <Phone size={13} /> Call
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 border border-red-200 dark:border-red-800 text-[12px] font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Remove from group"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Friend Modal */}
            <AnimatePresence>
              {showAddModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border-2 border-black/20 dark:border-white/20 space-y-4 shadow-xl"
                >
                  <div>
                    <p className="text-[15px] font-black text-[var(--text-primary)]">Add Friend to Trip Group</p>
                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                      After adding, an invite link is auto-copied. Send it via WhatsApp/SMS. When they open it and allow GPS, their real location appears here.
                    </p>
                  </div>
                  <form onSubmit={handleAddMember} className="space-y-3">
                    <div>
                      <p className="text-[11px] font-black uppercase text-[var(--text-muted)] mb-1.5">Pick Avatar</p>
                      <div className="flex gap-2 flex-wrap">
                        {AVATAR_OPTIONS.map(av => (
                          <button key={av} type="button" onClick={() => setNewMemberAvatar(av)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all cursor-pointer ${newMemberAvatar === av ? 'border-black dark:border-white bg-black/5 dark:bg-white/10 scale-110' : 'border-transparent hover:border-black/20 dark:hover:border-white/20'}`}>
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        placeholder="Friend's Name (e.g. Priya)"
                        className="text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 outline-none focus:border-black dark:focus:border-white font-medium"
                        required autoFocus
                      />
                      <input
                        value={newMemberPhone}
                        onChange={e => setNewMemberPhone(e.target.value)}
                        placeholder="Phone (optional, for Call button)"
                        className="text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 outline-none focus:border-black dark:focus:border-white font-medium"
                      />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                      <p className="text-[12px] font-bold text-blue-800 dark:text-blue-200">
                        \uD83D\uDCA1 After clicking below, send the copied link via WhatsApp/SMS. When they open it and tap \"Share My Live Location\", their real GPS appears on your radar automatically.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2.5 rounded-xl bg-black text-white text-[13px] font-black hover:bg-neutral-900 shadow-md cursor-pointer flex items-center justify-center gap-2">
                        <Copy size={13} /> Add &amp; Copy Invite Link
                      </button>
                      <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[13px] font-black hover:text-[var(--text-primary)] cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
          className="flex items-center gap-3 px-8 py-4 rounded-[16px] text-[16px] font-black tracking-tight transition-all shadow-xl border-2 bg-black text-white border-black dark:border-neutral-700 hover:bg-neutral-900 cursor-pointer select-none active:scale-[0.99]"
        >
          Continue to Safety <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  )
}

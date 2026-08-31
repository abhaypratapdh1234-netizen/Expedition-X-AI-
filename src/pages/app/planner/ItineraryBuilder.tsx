import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Trash2, GripVertical, Sparkles, Map, DollarSign, Clock, Calendar,
  Zap, Compass, ArrowRight, Activity, Edit2, Check, X, ChevronDown, ChevronUp,
  Star, Package, Shield, Utensils, AlertTriangle, Phone, Building2, Flag,
  Route, CheckSquare, Square, Leaf, TrendingDown, Sliders, Globe
} from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { useWizardStore } from '../../../stores/wizardStore'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import type { ItineraryItem, DayPlan } from '../../../services/tripService'
import { pageTransition } from '../../../motion/variants'
import {
  getRouteOptimization,
  getPackingList,
  getFoodRecommendations,
  getSafetyInfo,
  getAISuggestion,
  getWaypointAIData,
  getEmergencyContacts,
} from '../../../lib/ai-engine'
import { DESTINATIONS } from '../../../lib/ai-engine/destinationData'
import type { PackingItem } from '../../../lib/ai-engine'
import { ScoreCard } from '../../../components/ui/ScoreCard'
import { SuggestionChip } from '../../../components/ui/SuggestionChip'
import { EnergyCurveSparkline } from '../../../components/ui/EnergyCurveSparkline'


const ICON_MAP: Record<string, string> = {
  attraction: '🏛️',
  hotel: '🏨',
  food: '🍛',
  transport: '🚗',
}

const COLOR_MAP: Record<string, string> = {
  attraction: '#3fa796',
  hotel: '#c084fc',
  food: '#FC6C26',
  transport: '#384D7E',
}

// ─── StarRating Component ───────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rating ? 'text-[#FC6C26] fill-[#FC6C26]' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

// ─── CrowdChip Component ────────────────────────────────────────────────
function CrowdChip({ percent, level }: { percent: number; level: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: '🟢' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: '🟡' },
    high: { bg: 'bg-red-50', text: 'text-red-700', dot: '🔴' },
  }
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-black ${c.bg} ${c.text}`}>
      {c.dot} {percent}% crowd
    </span>
  )
}

// ─── AI Suggestion Banner ───────────────────────────────────────────────
function AISuggestionBanner({ day, onDismiss }: { day: DayPlan; onDismiss: () => void }) {
  const suggestion = getAISuggestion(day)
  if (!suggestion) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mx-[80px] mt-4 p-4 rounded-[16px] bg-[#c084fc]/10 border border-[#c084fc]/25 flex items-start gap-3 relative"
    >
      <span className="text-[#c084fc] text-lg shrink-0">🤖</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#c084fc] mb-1 antialiased">AI Suggestion</p>
        <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-relaxed antialiased">{suggestion.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="px-3 py-1.5 rounded-[10px] bg-[#c084fc] text-white text-[13px] font-black hover:bg-[#a855f7] transition-colors">
          {suggestion.actionLabel}
        </button>
        <button onClick={onDismiss} className="w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <X size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Food Card ──────────────────────────────────────────────────────────
function FoodCard({ card }: { card: { id: string; name: string; rating: number; tags: string[]; priceRange: string; description: string } }) {
  return (
    <div className="flex-shrink-0 w-52 bg-[var(--bg-card)] rounded-[20px] p-4 border border-[var(--border-subtle)] shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[15px] font-bold text-[var(--text-primary)] leading-tight antialiased">{card.name}</p>
        <span className="text-[14px] font-bold text-[#FC6C26] shrink-0 ml-2 antialiased">{card.priceRange}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <StarRating rating={Math.round(card.rating)} />
        <span className="text-[12px] text-[var(--text-muted)] font-bold antialiased">{card.rating}</span>
      </div>
      <p className="text-[13px] text-[var(--text-secondary)] font-semibold mb-3 line-clamp-2 antialiased">{card.description}</p>
      <div className="flex flex-wrap gap-1">
        {card.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-bold antialiased bg-[#FFF5F0] text-[#FC6C26] border border-[#FC6C26]/15">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Emergency SOS Modal ─────────────────────────────────────────────────
function EmergencySOSModal({ destination, onClose }: { destination: string; onClose: () => void }) {
  const contacts = getEmergencyContacts(destination)
  const emergencyItems = [
    { icon: Phone, label: 'Police', value: contacts.police, color: '#384D7E' },
    { icon: Activity, label: 'Ambulance / Medical', value: contacts.ambulance, color: '#FC6C26' },
    { icon: Building2, label: 'Indian Embassy', value: contacts.embassy, color: '#3fa796' },
    { icon: Flag, label: 'Tourist Helpline', value: contacts.touristHelpline, color: '#c084fc' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(27,42,74,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-[var(--bg-card)] rounded-[28px] p-8 max-w-md w-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-[16px] bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-[19px] font-black text-[var(--text-primary)]">Emergency SOS</h3>
            <p className="text-[14px] text-[var(--text-muted)] font-black">{destination} Emergency Contacts</p>
          </div>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {emergencyItems.map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-[16px] border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon size={17} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-[14px] font-black text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-[15px] font-black text-[var(--text-primary)]">{item.value}</p>
                </div>
              </div>
              <a href={`tel:${item.value}`} className="px-3 py-1.5 rounded-[10px] bg-[#1B2A4A] text-white text-[13px] font-black hover:bg-[#FC6C26] transition-colors">
                Call
              </a>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] text-center font-black mt-6">
          In a real emergency, always call local emergency services first.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main ItineraryBuilder ───────────────────────────────────────────────
export function ItineraryBuilder() {
  const { currentTrip, fetchTripById, updateItinerary, optimizeDay } = useTripStore()
  const wizardState = useWizardStore()
  const navigate = useNavigate()

  const TRIP_ID = currentTrip?.id || '1'
  const destination = wizardState.destination || (currentTrip?.destinations?.[0] ?? 'Goa')

  useEffect(() => {
    // If no active trip is loaded
    if (!currentTrip) {
      // Wait a moment for potential store hydration
      const t = setTimeout(() => {
        const stillNoTrip = !useTripStore.getState().currentTrip;
        if (stillNoTrip) {
          if (!wizardState.isComplete) {
            // They haven't finished creating a trip, send them to the wizard
            navigate('/app/planner/setup', { replace: true })
          } else {
            // Wizard is complete but state was lost (e.g. hard refresh), load a fallback trip
            fetchTripById('1')
          }
        }
      }, 500)
      return () => clearTimeout(t)
    }
  }, [currentTrip, wizardState.isComplete, navigate, fetchTripById])

  // Sidebar module state
  const [optimizingDay, setOptimizingDay] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState<number | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<ItineraryItem['type']>('attraction')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', time: '', cost: 0 })
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([])
  const [showSOS, setShowSOS] = useState(false)
  const [packingList, setPackingList] = useState<PackingItem[]>([])
  const [packingExpanded, setPackingExpanded] = useState(true)
  const [optimizationExpanded, setOptimizationExpanded] = useState(true)
  const [safetyExpanded, setSafetyExpanded] = useState(true)
  const [foodExpanded, setFoodExpanded] = useState(true)

  // Generate packing list when destination is known
  useEffect(() => {
    const list = getPackingList(destination, wizardState.tripTypes)
    setPackingList(list)
  }, [destination, wizardState.tripTypes])

  const togglePackingItem = (id: string) => {
    setPackingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const days = currentTrip?.itinerary || []
  const activitiesCost = days.flatMap(d => d.items).filter(i => i.type === 'attraction').reduce((s, i) => s + i.cost, 0)
  const foodCost = days.flatMap(d => d.items).filter(i => i.type === 'food').reduce((s, i) => s + i.cost, 0)
  const hotelCost = days.flatMap(d => d.items).filter(i => i.type === 'hotel').reduce((s, i) => s + i.cost, 0)
  const transportCost = days.flatMap(d => d.items).filter(i => i.type === 'transport').reduce((s, i) => s + i.cost, 0)
  const grandTotal = activitiesCost + foodCost + hotelCost + transportCost

  const addDay = () => {
    if (days.length === 0) return
    const lastDay = days[days.length - 1]
    const nextDate = new Date(lastDay.date)
    nextDate.setDate(nextDate.getDate() + 1)
    updateItinerary(TRIP_ID, [...days, { day: days.length + 1, date: nextDate.toISOString().split('T')[0], items: [] }])
  }

  const removeItem = (dayIdx: number, itemId: string) => {
    const newDays = days.map((d, i) => i === dayIdx ? { ...d, items: d.items.filter(item => item.id !== itemId) } : d)
    updateItinerary(TRIP_ID, newDays)
  }

  const startEditing = (item: ItineraryItem) => {
    setEditingItemId(item.id)
    setEditForm({ name: item.name, time: item.time, cost: item.cost })
  }

  const saveEdit = (dayIdx: number, itemId: string) => {
    const newDays = days.map((d, i) => i === dayIdx ? { ...d, items: d.items.map(item => item.id === itemId ? { ...item, ...editForm } : item) } : d)
    updateItinerary(TRIP_ID, newDays)
    setEditingItemId(null)
  }

  const addItem = (dayIdx: number) => {
    if (!newItemName) return
    const newItem: ItineraryItem = { id: 'i' + Date.now(), name: newItemName, type: newItemType, time: '12:00 PM', cost: 0, duration: '1h' }
    const newDays = days.map((d, i) => i === dayIdx ? { ...d, items: [...d.items, newItem] } : d)
    updateItinerary(TRIP_ID, newDays)
    setNewItemName('')
    setNewItemType('attraction')
    setShowAddModal(null)
  }

  const handleOptimizeDay = async (dayIdx: number) => {
    setOptimizingDay(dayIdx)
    await optimizeDay(TRIP_ID, dayIdx, days[dayIdx].items)
    setOptimizingDay(null)
  }

  // AI data
  const safetyInfo = getSafetyInfo(destination)
  const foodCards = getFoodRecommendations(destination, wizardState.dietary)
  const routeOpt = days[0] ? getRouteOptimization(days[0]) : null
  const localTips: string[] = destination ? (DESTINATIONS[destination]?.localTips ?? []) : []

  // ── Intelligence Engine ──
  const { tripAnalysis, analyzeTrip, isAnalyzing } = useIntelligenceStore()

  useEffect(() => {
    if (currentTrip) {
      analyzeTrip(currentTrip)
    }
  }, [currentTrip?.id])

  // ── What-If Simulator state ──
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [whatIfBudget, setWhatIfBudget] = useState(wizardState.budgetMax)
  const [whatIfDuration, setWhatIfDuration] = useState(wizardState.durationDays)
  const [whatIfMonth, setWhatIfMonth] = useState(new Date().getMonth() + 1)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleWhatIfChange = useCallback(() => {
    if (!currentTrip) return
    setIsRecalculating(true)
    if (recalcTimer.current) clearTimeout(recalcTimer.current)
    recalcTimer.current = setTimeout(() => {
      // Re-invoke real analysis with modified trip parameters
      const modifiedTrip = {
        ...currentTrip,
        budget: whatIfBudget,
        durationDays: whatIfDuration,
        startDate: new Date(new Date().getFullYear(), whatIfMonth - 1, 15).toISOString().split('T')[0],
      }
      analyzeTrip(modifiedTrip)
      setIsRecalculating(false)
    }, 600)
  }, [whatIfBudget, whatIfDuration, whatIfMonth, currentTrip])


  if (!currentTrip || !currentTrip.itinerary) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F5F8FF] border-t-[#FC6C26] rounded-full animate-spin" />
          <p className="font-black text-[var(--text-primary)] tracking-widest uppercase text-sm animate-pulse">Initializing AI Timeline Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-10 pb-32 text-[#1B2A4A] font-sans relative overflow-hidden">

      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#FC6C26]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#3fa796]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">

        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse" />
                <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[var(--text-primary)] antialiased">AI Timeline Engine Active</span>
              </div>
              {wizardState.destination && (
                <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-[12px] font-black tracking-widest uppercase text-[#3fa796]">
                    📍 {wizardState.destination}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-[var(--text-primary)] mb-2 antialiased">Expedition Routing</h1>
            <p className="text-[var(--text-secondary)] font-semibold text-[17px] antialiased">Drag and drop to rearrange points. The AI will instantly recalculate transit times.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { wizardState.reset(); navigate('/app/planner/setup') }}
              className="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] px-5 py-3.5 rounded-[20px] font-bold text-[15px] transition-all shadow-sm text-[var(--text-primary)] hover:text-[#FC6C26] hover:border-[#FC6C26]/30 antialiased"
            >
              <Sparkles size={16} /> New Trip
            </button>
            <Link 
              to={(() => {
                const destInfo = Object.entries(DESTINATIONS).find(([k]) => k.toLowerCase() === destination.toLowerCase())?.[1];
                if (destInfo) {
                  return `/app/planner/map?lat=${destInfo.lat}&lng=${destInfo.lng}&name=${encodeURIComponent(destination)}`;
                }
                return `/app/planner/map?name=${encodeURIComponent(destination)}`;
              })()}
              className="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] px-6 py-4 rounded-[20px] font-bold text-[16px] text-[var(--text-primary)] transition-all shadow-sm antialiased"
            >
              <Compass size={18} className="text-[#3fa796]" /> Global Map View
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT: Day Cards (8 cols) ── */}
          <div className="lg:col-span-8 space-y-10">
            {days.map((day, dayIdx) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIdx * 0.1 }}
                className="bg-[var(--bg-card)] rounded-[32px] overflow-hidden border border-[var(--border-subtle)] relative group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]"
              >
                {/* Day Header */}
                <div className="p-8 border-b border-[var(--border-subtle)] relative overflow-hidden bg-gradient-to-r from-transparent to-[var(--text-primary)]/5">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[20px] flex flex-col items-center justify-center bg-gradient-to-br from-[#FC6C26] to-[#FC6C26] text-white font-black shadow-[0_10px_20px_-5px_rgba(252,108,38,0.4)]">
                        <span className="text-[12px] uppercase tracking-widest opacity-80 mb-0.5">Day</span>
                        <span className="text-3xl font-black leading-none">{day.day}</span>
                      </div>
                      <div>
                        <p className="font-display text-3xl font-black text-[var(--text-primary)] tracking-tight mb-1 antialiased">
                          {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                        </p>
                        <p className="text-[15px] font-black flex items-center gap-2 text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                          <Calendar size={14} className="text-[#3fa796]" />
                          {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {/* v4: Energy curve sparkline */}
                        {tripAnalysis?.energyCurves?.[day.date] && (
                          <div className="mt-2">
                            <EnergyCurveSparkline data={tripAnalysis.energyCurves[day.date]} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-[13px] font-black text-[var(--text-primary)] bg-[var(--bg-card)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                          {day.items.length} Waypoints
                        </div>
                        <div className="text-[14px] font-black flex items-center gap-1 bg-[#FFF5F0] text-[#FC6C26] px-3 py-1.5 rounded-lg border border-[#FC6C26]/20">
                          ₹{day.items.reduce((s, i) => s + i.cost, 0).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOptimizeDay(dayIdx)}
                        disabled={optimizingDay === dayIdx}
                        className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[14px] font-black text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-all disabled:opacity-50 shadow-sm"
                      >
                        {optimizingDay === dayIdx ? (
                          <><Zap size={14} className="animate-pulse text-[#3fa796]" /> Optimizing Route...</>
                        ) : (
                          <><Sparkles size={14} className="text-[#3fa796] group-hover/btn:scale-125 transition-transform" /> AI Auto-Route</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waypoints */}
                <div className="p-8 relative">
                  <div className="absolute left-[64px] top-[40px] bottom-[40px] w-[2px] bg-[var(--bg-card)] rounded-full" />

                  <Reorder.Group
                    axis="y"
                    values={day.items}
                    onReorder={(newItems) => {
                      const newDays = [...days]
                      newDays[dayIdx] = { ...newDays[dayIdx], items: newItems }
                      updateItinerary(TRIP_ID, newDays)
                    }}
                    className="space-y-4 relative z-10"
                  >
                    {day.items.map((item) => {
                      const aiData = getWaypointAIData(item.id, dayIdx)
                      const isExpanded = expandedItemId === item.id

                      return (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          dragListener={editingItemId !== item.id}
                          whileDrag={{ scale: 1.02, backgroundColor: 'var(--bg-card)', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)', zIndex: 50, borderRadius: '24px' }}
                          className="relative bg-[var(--bg-card)]"
                        >
                          <div className={`rounded-[20px] cursor-grab active:cursor-grabbing transition-all duration-300 bg-[var(--bg-card)] border shadow-sm ${isExpanded ? 'border-[#FC6C26]/20' : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)]'}`}>

                            {/* Main Row */}
                            <div className="flex items-center gap-6 p-4 group/item">
                              <GripVertical size={20} className="text-[var(--text-muted)] group-hover/item:text-[var(--text-secondary)] transition-colors ml-2 cursor-grab active:cursor-grabbing shrink-0" />
                              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl shrink-0 border"
                                style={{ background: `${COLOR_MAP[item.type]}10`, borderColor: `${COLOR_MAP[item.type]}20` }}>
                                <div style={{ color: COLOR_MAP[item.type] }}>{ICON_MAP[item.type]}</div>
                              </div>

                              {editingItemId === item.id ? (
                                <div className="flex-1 flex items-center gap-3 bg-[var(--bg-card)] p-2 rounded-[16px] border border-[var(--border-subtle)] cursor-default">
                                  <input autoFocus type="text" value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-2 text-[15px] font-black text-[var(--text-primary)] outline-none focus:border-[#FC6C26] transition-colors"
                                    placeholder="Activity Name" />
                                  <input type="text" value={editForm.time}
                                    onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                    className="w-24 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-2 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[#FC6C26] transition-colors text-center shrink-0"
                                    placeholder="10:00 AM" />
                                  <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-2 focus-within:border-[#FC6C26] transition-colors w-28 shrink-0">
                                    <span className="text-[var(--text-muted)] font-black mr-1">₹</span>
                                    <input type="number" value={editForm.cost || ''}
                                      onChange={e => setEditForm({ ...editForm, cost: parseInt(e.target.value) || 0 })}
                                      className="w-full bg-transparent text-[14px] font-black text-[var(--text-primary)] outline-none" placeholder="0" />
                                  </div>
                                  <div className="flex gap-2 pr-2 shrink-0">
                                    <button onClick={() => saveEdit(dayIdx, item.id)}
                                      className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-[#3fa796] text-white hover:bg-[#2f8879] transition-colors shadow-sm">
                                      <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingItemId(null)}
                                      className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-gray-200 text-[var(--text-secondary)] hover:bg-gray-300 transition-colors shadow-sm">
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[19px] text-[var(--text-primary)] tracking-tight truncate mb-1 antialiased">{item.name}</h3>
                                    <div className="flex items-center gap-4 text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-widest antialiased">
                                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#3fa796]" /> {item.time}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span>{item.duration}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 pr-4">
                                    <span className="text-[16px] font-black tracking-tight" style={{ color: item.cost === 0 ? '#3fa796' : '#FC6C26' }}>
                                      {item.cost === 0 ? 'Free' : `₹${item.cost.toLocaleString()}`}
                                    </span>

                                    {/* Expand chevron */}
                                    <button
                                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                      className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-gray-50 text-[var(--text-muted)] hover:bg-[#FFF5F0] hover:text-[#FC6C26] transition-colors"
                                      aria-label={isExpanded ? 'Collapse details' : 'Expand AI details'}
                                    >
                                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                    </button>

                                    <div className="flex items-center gap-2 opacity-30 group-hover/item:opacity-100 transition-opacity duration-300">
                                      <button onClick={() => startEditing(item)}
                                        className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[#3fa796] hover:text-white transition-colors" title="Edit Activity">
                                        <Edit2 size={16} />
                                      </button>
                                      <button onClick={() => removeItem(dayIdx, item.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[var(--bg-card)] text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete Activity">
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Expandable AI Detail Area */}
                            <AnimatePresence>
                              {isExpanded && editingItemId !== item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-5 pt-2 ml-[80px] border-t border-gray-50">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                      <StarRating rating={aiData.rating} />
                                      <CrowdChip percent={aiData.crowdPercent} level={aiData.crowdLevel} />
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-black bg-blue-50 text-blue-700 border border-blue-100">
                                        🌡️ {aiData.temp}°C · 💧 {aiData.rainChance}% rain
                                      </span>
                                      {/* v4: Queue timing hint */}
                                      {tripAnalysis?.queueHints?.[item.id] && (
                                        <span
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-black border"
                                          style={{ background: '#FFF8F0', color: '#f59e0b', borderColor: '#f59e0b30' }}
                                          title={tripAnalysis.queueHints[item.id].basis}
                                        >
                                          🕐 Best: {tripAnalysis.queueHints[item.id].best_hour}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-[#c084fc] text-[16px] shrink-0">🤖</span>
                                      <p className="text-[14px] text-[var(--text-primary)] font-black italic">{aiData.aiReason}</p>
                                    </div>
                                    {tripAnalysis?.queueHints?.[item.id] && (
                                      <p className="text-[11px] font-bold text-[#9ca3af] mt-2">
                                        ⏰ {tripAnalysis.queueHints[item.id].reason} — avoid {tripAnalysis.queueHints[item.id].worst_hour}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </Reorder.Item>
                      )
                    })}
                  </Reorder.Group>

                  {/* AI Suggestion Banner */}
                  <AnimatePresence>
                    {!dismissedSuggestions.includes(dayIdx) && (
                      <AISuggestionBanner
                        day={day}
                        onDismiss={() => setDismissedSuggestions(prev => [...prev, dayIdx])}
                      />
                    )}
                  </AnimatePresence>

                  {/* v4: Weather Recovery Banner */}
                  {tripAnalysis?.weatherRecovery?.[day.date] && (
                    <div className="mt-4 ml-[80px]">
                      <SuggestionChip
                        icon="🌧️"
                        label="Weather Recovery"
                        description={tripAnalysis.weatherRecovery[day.date].suggestion}
                        accentColor="#384D7E"
                        basis={tripAnalysis.weatherRecovery[day.date].basis}
                        previewContent={
                          <div>
                            <p className="text-[12px] font-black text-[#384D7E] mb-2">Indoor alternatives for this day:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {tripAnalysis.weatherRecovery[day.date].indoor_alternatives.map(alt => (
                                <span key={alt} className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#F5F8FF] text-[#384D7E] border border-[#384D7E]/20">{alt}</span>
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </div>
                  )}

                  {/* v4: Diversity Balancer Chip */}
                  {tripAnalysis?.diversityChecks?.[day.date]?.skew_detected && tripAnalysis.diversityChecks[day.date].suggested_swap && (
                    <div className="mt-3 ml-[80px]">
                      <SuggestionChip
                        icon="⚖️"
                        label="Balance this day"
                        description={`${tripAnalysis.diversityChecks[day.date].dominant_pct}% of stops are "${tripAnalysis.diversityChecks[day.date].dominant_category}" — mix it up?`}
                        accentColor="#3fa796"
                        basis={tripAnalysis.diversityChecks[day.date].basis}
                        acceptLabel="Show alternative"
                        previewContent={
                          <div className="flex items-center gap-2.5 p-3 bg-[#F0FDF4] rounded-[12px]">
                            <span className="text-[24px]">{tripAnalysis.diversityChecks[day.date].suggested_swap!.candidate_emoji}</span>
                            <div>
                              <p className="text-[13px] font-black text-[var(--text-primary)]">{tripAnalysis.diversityChecks[day.date].suggested_swap!.candidate_name}</p>
                              <p className="text-[11px] font-bold text-[#16a34a]">Adds {tripAnalysis.diversityChecks[day.date].suggested_swap!.to_category} variety</p>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  )}

                  {/* v4: Missed Opportunities for this day */}
                  {tripAnalysis?.missedOpportunities
                    ?.filter(op => op.near_day === day.date)
                    .map(op => (
                      <div key={op.poi} className="mt-3 ml-[80px]">
                        <SuggestionChip
                          icon={op.emoji}
                          label="Nearby — easy add"
                          description={`You'll be ${op.distance_m < 1000 ? `${op.distance_m}m` : `${(op.distance_m/1000).toFixed(1)}km`} from ${op.poi} — ${op.why_worth_it}`}
                          accentColor="#c084fc"
                          acceptLabel="Add to day"
                          basis={op.basis}
                          previewContent={
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={11} className={i < Math.round(op.rating) ? 'text-[#FC6C26] fill-[#FC6C26]' : 'text-gray-200 fill-gray-200'} />
                                ))}
                              </div>
                              <span className="text-[12px] font-bold text-[var(--text-muted)]">{op.rating}/5 · {op.category}</span>
                            </div>
                          }
                        />
                      </div>
                    ))
                  }

                  {/* Add Waypoint */}
                  <div className="mt-8 ml-[80px]">
                    {showAddModal === dayIdx ? (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3">
                        <select value={newItemType} onChange={e => setNewItemType(e.target.value as any)}
                          className="px-4 py-4 rounded-[16px] text-[16px] font-bold border border-[var(--border-subtle)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-[#FC6C26] transition-all cursor-pointer shadow-sm antialiased">
                          <option value="attraction">🏛️ Attraction</option>
                          <option value="food">🍛 Food</option>
                          <option value="hotel">🏨 Hotel</option>
                          <option value="transport">🚗 Transit</option>
                        </select>
                        <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                          placeholder="Search for a location to add..."
                          onKeyDown={e => e.key === 'Enter' && addItem(dayIdx)}
                          autoFocus
                          className="flex-1 px-5 py-4 rounded-[16px] text-[16px] font-bold border border-[var(--border-subtle)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-gray-400 focus:border-[#FC6C26] transition-all shadow-inner antialiased" />
                        <button onClick={() => addItem(dayIdx)} className="px-8 py-4 rounded-[16px] text-white text-[16px] font-bold bg-[#FC6C26] hover:opacity-90 shadow-[0_10px_20px_-5px_rgba(252,108,38,0.3)] transition-all shrink-0 antialiased">Add</button>
                        <button onClick={() => setShowAddModal(null)} className="px-6 py-4 rounded-[16px] text-[16px] font-bold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all shrink-0 antialiased">Cancel</button>
                      </motion.div>
                    ) : (
                      <button onClick={() => setShowAddModal(dayIdx)}
                        className="flex items-center gap-3 py-4 px-6 rounded-[16px] text-[15px] font-bold border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-400 hover:bg-[var(--bg-card)] transition-all group/add antialiased">
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] flex items-center justify-center group-hover/add:bg-[#FC6C26] transition-colors">
                          <Plus size={14} className="text-[var(--text-secondary)] group-hover/add:text-white transition-colors" />
                        </div>
                        Add New Waypoint
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add Day */}
            <button onClick={addDay}
              className="w-full flex items-center justify-center gap-3 py-8 rounded-[32px] text-[17px] font-bold border border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-[var(--border-strong)] transition-all shadow-sm group antialiased">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center group-hover:bg-[#0A0F1E] transition-colors duration-500">
                <Plus size={20} className="text-[var(--text-muted)] group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
              </div>
              Initialize Extra Day Phase
            </button>

            {/* ── AI Food Recommendation Strip ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-subtle)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-7 border-b border-[var(--border-subtle)]"
                onClick={() => setFoodExpanded(v => !v)}
              >
                <div className="w-10 h-10 rounded-[12px] bg-[#FFF5F0] flex items-center justify-center">
                  <Utensils size={18} className="text-[#FC6C26]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">AI Curated</p>
                  <p className="text-[18px] font-black text-[var(--text-primary)]">Food Recommendations for {destination}</p>
                </div>
                {foodExpanded ? <ChevronUp size={18} className="text-[var(--text-muted)]" /> : <ChevronDown size={18} className="text-[var(--text-muted)]" />}
              </button>
              <AnimatePresence>
                {foodExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="flex gap-4 overflow-x-auto p-7 pt-5 scrollbar-none">
                      {foodCards.map(card => <FoodCard key={card.id} card={card} />)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── AI Local Tips ── */}
            {localTips && localTips.length > 0 && (
              <div className="p-7 rounded-[28px] bg-[#c084fc]/10 border border-[#c084fc]/20">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={16} className="text-[#c084fc]" />
                  <span className="text-[13px] font-bold uppercase tracking-widest text-[#c084fc] antialiased">AI Local Tips — {destination}</span>
                </div>
                <ul className="space-y-2.5">
                  {localTips.map((tip: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-[15px] text-[var(--text-primary)] font-semibold antialiased">
                      <span className="text-[#c084fc] mt-0.5 shrink-0">•</span>
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT: Mission Telemetry Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* ── Trip Confidence Score Card ── */}
            {(tripAnalysis || isAnalyzing) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <ScoreCard
                  score={isAnalyzing ? '--' : (tripAnalysis?.confidence.score ?? 0)}
                  label="Trip Confidence"
                  sublabel={isAnalyzing ? 'Analyzing trip...' : tripAnalysis?.confidence.summary}
                  color="#FC6C26"
                  badge={isAnalyzing ? undefined : tripAnalysis?.confidence.label}
                  badgeColor="#FC6C26"
                  isLoading={isAnalyzing}
                  basis={tripAnalysis?.confidence.basis}
                  size="md"
                  components={tripAnalysis ? [
                    { name: 'DNA Match', value: tripAnalysis.confidence.components.dna_match, note: 'vs your Travel DNA' },
                    { name: 'Budget Fit', value: tripAnalysis.confidence.components.budget_fit },
                    { name: 'Season Fit', value: tripAnalysis.confidence.components.weather_fit, note: 'travel month' },
                    { name: 'Crowd Level', value: tripAnalysis.confidence.components.crowd_fit },
                    { name: 'Risk Fit', value: tripAnalysis.confidence.components.risk_fit },
                    { name: 'Reviews', value: tripAnalysis.confidence.components.review_sentiment },
                  ] : []}
                />
              </motion.div>
            )}

            {/* ── Risk Index Badge ── */}
            {(tripAnalysis || isAnalyzing) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <ScoreCard
                  score={isAnalyzing ? '--' : (tripAnalysis?.riskIndex.score ?? 0)}
                  label="Travel Risk Index"
                  sublabel={isAnalyzing ? 'Loading...' : tripAnalysis?.riskIndex.label}
                  color="#3fa796"
                  badge={tripAnalysis?.riskIndex.label}
                  badgeColor={tripAnalysis?.riskIndex.label === 'Low Risk' ? '#16a34a' : tripAnalysis?.riskIndex.label === 'High Risk' ? '#dc2626' : '#f59e0b'}
                  isLoading={isAnalyzing}
                  basis="Safety data: advisory data not available for all destinations (shown as 'Insufficient data')."
                  components={tripAnalysis ? [
                    { name: 'Weather', value: tripAnalysis.riskIndex.components.weather, note: 'season fit' },
                    { name: 'Safety Advisory', value: 0, isUnavailable: tripAnalysis.riskIndex.components.safety === -1, note: 'source: none' },
                    { name: 'Air Quality', value: tripAnalysis.riskIndex.components.aqi, note: 'IQAir data' },
                    { name: 'Crowd Density', value: tripAnalysis.riskIndex.components.crowd, note: 'OSM data' },
                  ] : []}
                />
              </motion.div>
            )}

            {/* ── Budget Leak Detector ── */}
            {tripAnalysis && tripAnalysis.budgetLeaks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-[var(--bg-card)] rounded-[20px] p-5 border border-amber-500/20 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-[10px] bg-amber-500/10 flex items-center justify-center">
                    <TrendingDown size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[var(--text-primary)] antialiased">Budget Leaks Detected</p>
                    <p className="text-[12px] font-bold text-amber-500 antialiased">
                      Save ₹{tripAnalysis.budgetLeaks.reduce((s, l) => s + l.savings, 0).toLocaleString()} total
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {tripAnalysis.budgetLeaks.map((leak, i) => (
                    <div key={i} className="p-3 rounded-[14px] bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-bold text-amber-600 uppercase tracking-wide antialiased">{leak.category}</p>
                        <span className="text-[12px] font-bold text-emerald-500 antialiased">Save ₹{leak.savings.toLocaleString()}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[var(--text-primary)] antialiased">
                        {leak.alternativeName}: ₹{leak.alternativeCost.toLocaleString()} vs your ₹{leak.currentCost.toLocaleString()}
                      </p>
                      <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-1 antialiased">{leak.basis}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── v4: Budget Stress Context ── */}
            {tripAnalysis && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                className="bg-[var(--bg-card)] rounded-[20px] p-5 border border-[var(--border-subtle)] shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: `${tripAnalysis.budgetStress.color}15` }}>
                    <span className="text-[16px]">💰</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[var(--text-primary)]">Budget Stress</p>
                    <p className="text-[11px] font-bold text-[#9ca3af]">vs your comfortable spend</p>
                  </div>
                  <span className="ml-auto text-[11px] font-black px-2 py-0.5 rounded-full" style={{
                    background: `${tripAnalysis.budgetStress.color}15`,
                    color: tripAnalysis.budgetStress.color
                  }}>
                    {tripAnalysis.budgetStress.stress_level.toUpperCase()}
                  </span>
                </div>

                {useIntelligenceStore.getState().comfortableBudget > 0 ? (
                  <>
                    {/* Ratio bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-bold text-[var(--text-muted)]">Trip cost</span>
                        <span className="text-[12px] font-black text-[var(--text-primary)]">₹{tripAnalysis.budgetStress.trip_cost.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, tripAnalysis.budgetStress.ratio * 100)}%`, background: tripAnalysis.budgetStress.color }} />
                      </div>
                      <p className="text-[12px] font-bold mt-1.5" style={{ color: tripAnalysis.budgetStress.color }}>{tripAnalysis.budgetStress.label}</p>
                    </div>
                    <p className="text-[10px] font-bold text-[#c4c4c4] italic">{tripAnalysis.budgetStress.basis}</p>
                  </>
                ) : (
                  <div>
                    <p className="text-[12px] font-bold text-[var(--text-muted)] mb-2">Set your comfortable trip budget to see stress level:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-50 border border-[var(--border-subtle)] rounded-[10px] px-2 py-1.5 flex-1 focus-within:border-[#FC6C26] transition-colors">
                        <span className="text-[var(--text-muted)] font-bold text-[13px] mr-1">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 30000"
                          className="flex-1 bg-transparent text-[13px] font-black text-[var(--text-primary)] outline-none w-full"
                          onBlur={(e) => {
                            const val = parseInt(e.target.value) || 0
                            useIntelligenceStore.getState().setComfortableBudget(val)
                            if (currentTrip) analyzeTrip(currentTrip)
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-[#c4c4c4] mt-2 italic">Your budget — not inferred from any data.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Eco Score ── */}
            {tripAnalysis && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <ScoreCard
                  score={tripAnalysis.ecoScore.carbon_kg === 0 ? '0' : tripAnalysis.ecoScore.carbon_kg}
                  label={`Eco Score · ${tripAnalysis.ecoScore.transport_mode}`}
                  sublabel={`${tripAnalysis.ecoScore.carbon_kg} kg CO₂ · ${tripAnalysis.ecoScore.rating}`}
                  color="#16a34a"
                  badge={tripAnalysis.ecoScore.rating === 'excellent' ? '🌿 Excellent' : tripAnalysis.ecoScore.rating === 'good' ? '🌱 Good' : tripAnalysis.ecoScore.rating === 'moderate' ? '⚠️ Moderate' : '🔴 High'}
                  badgeColor="#16a34a"
                  expandable
                  basis={`Source: ${tripAnalysis.ecoScore.source}`}
                  components={[
                    { name: 'Carbon footprint', value: `${tripAnalysis.ecoScore.carbon_kg} kg CO₂e` },
                    ...(tripAnalysis.ecoScore.suggested_swap ? [
                      { name: `💡 Switch to ${tripAnalysis.ecoScore.suggested_swap.label}`, value: `-${tripAnalysis.ecoScore.suggested_swap.savings_kg} kg (${tripAnalysis.ecoScore.suggested_swap.savings_pct}%)` }
                    ] : []),
                  ]}
                />
              </motion.div>
            )}

            {/* ── What-If Simulator ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-subtle)] shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setShowWhatIf(v => !v)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#F5F8FF] flex items-center justify-center">
                  <Sliders size={16} className="text-[#384D7E]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-black text-[var(--text-primary)]">What-If Simulator</p>
                  <p className="text-[12px] font-bold text-[var(--text-muted)]">Adjust & see scores update live</p>
                </div>
                {isRecalculating && (
                  <span className="text-[11px] font-black text-[#FC6C26] animate-pulse">Recalculating...</span>
                )}
                {showWhatIf ? <ChevronUp size={16} className="text-[#9ca3af]" /> : <ChevronDown size={16} className="text-[#9ca3af]" />}
              </button>
              <AnimatePresence>
                {showWhatIf && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-4">
                      {/* Budget slider */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[13px] font-black text-[var(--text-primary)]">Budget</span>
                          <span className="text-[13px] font-black text-[#FC6C26]">₹{whatIfBudget.toLocaleString()}</span>
                        </div>
                        <input type="range" min="5000" max="300000" step="5000" value={whatIfBudget}
                          onChange={(e) => { setWhatIfBudget(Number(e.target.value)); handleWhatIfChange() }}
                          className="w-full" style={{ accentColor: '#FC6C26' }} />
                      </div>
                      {/* Duration slider */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[13px] font-black text-[var(--text-primary)]">Duration</span>
                          <span className="text-[13px] font-black text-[#FC6C26]">{whatIfDuration} days</span>
                        </div>
                        <input type="range" min="1" max="21" step="1" value={whatIfDuration}
                          onChange={(e) => { setWhatIfDuration(Number(e.target.value)); handleWhatIfChange() }}
                          className="w-full" style={{ accentColor: '#FC6C26' }} />
                      </div>
                      {/* Month slider */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[13px] font-black text-[var(--text-primary)]">Travel Month</span>
                          <span className="text-[13px] font-black text-[#FC6C26]">
                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][whatIfMonth-1]}
                          </span>
                        </div>
                        <input type="range" min="1" max="12" step="1" value={whatIfMonth}
                          onChange={(e) => { setWhatIfMonth(Number(e.target.value)); handleWhatIfChange() }}
                          className="w-full" style={{ accentColor: '#FC6C26' }} />
                      </div>
                      {isRecalculating && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="w-4 h-4 border-2 border-[#FC6C26] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[12px] font-black text-[#FC6C26]">Recalculating scores...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mission Telemetry Panel */}
            {/* Telemetry Panel */}
            <div className="bg-[var(--bg-card)] rounded-[32px] p-8 shadow-sm border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#3fa796]/10 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-[#3fa796]" />
                </div>
                <h2 className="text-[20px] font-bold tracking-tight text-[var(--text-primary)] antialiased">Mission Telemetry</h2>
              </div>

              <div className="space-y-5 mb-8 relative z-10">
                {[
                  { label: 'Activities & Tours', value: activitiesCost, color: '#3fa796' },
                  { label: 'Food & Dining', value: foodCost, color: '#FC6C26' },
                  { label: 'Accommodations', value: hotelCost, color: '#c084fc' },
                  { label: 'Transit Routing', value: transportCost, color: '#384D7E' }
                ].map(cat => (
                  <div key={cat.label} className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0">
                    <span className="text-[15px] font-bold text-[var(--text-primary)] antialiased">{cat.label}</span>
                    <span className="text-[16px] font-bold text-[var(--text-primary)] antialiased">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-[20px] bg-[var(--bg-body)] border border-[var(--border-subtle)] relative z-10">
                <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1 antialiased">Total Projected Spend</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#FC6C26] antialiased">₹</span>
                  <motion.span key={grandTotal} initial={{ scale: 1.1, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black tracking-tight text-[var(--text-primary)] antialiased">
                    {(grandTotal === 0 ? 0 : grandTotal).toLocaleString()}
                  </motion.span>
                </div>
              </div>

              <Link to="/app/planner/cost"
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-[16px] text-white text-[16px] font-black bg-[#0A0F1E] hover:bg-[#1E293B] shadow-[0_4px_16px_rgba(10,15,30,0.15)] transition-all relative z-10">
                <DollarSign size={16} /> Detailed Financials <ArrowRight size={16} />
              </Link>

              {/* ── AI Route Optimization Card ── */}
              {routeOpt && (
                <div className="mt-6 relative z-10">
                  <button
                    onClick={() => setOptimizationExpanded(v => !v)}
                    className="w-full flex items-center gap-3 p-4 rounded-[16px] bg-[#0A0F1E]/5 border border-[#0A0F1E]/15 hover:border-[#0A0F1E]/30 transition-colors"
                  >
                    <Route size={16} className="text-[#0A0F1E] shrink-0" />
                    <span className="text-[14px] font-bold text-[var(--text-primary)] flex-1 text-left antialiased">AI Route Optimization</span>
                    {optimizationExpanded ? <ChevronUp size={14} className="text-[#0A0F1E]" /> : <ChevronDown size={14} className="text-[#0A0F1E]" />}
                  </button>
                  <AnimatePresence>
                    {optimizationExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mt-3 p-4 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-3 mb-3 text-[14px] font-bold antialiased">
                            <span className="text-[var(--text-secondary)] line-through">{routeOpt.originalKm} km</span>
                            <ArrowRight size={14} className="text-[#0A0F1E]" />
                            <span className="text-[var(--text-primary)]">{routeOpt.optimizedKm} km</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 text-center p-2.5 rounded-[10px] bg-[#FC6C26]/10 border border-[#FC6C26]/20">
                              <p className="text-[19px] font-bold text-[#FC6C26] antialiased">{routeOpt.savedMinutes}m</p>
                              <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest antialiased">Saved</p>
                            </div>
                            <div className="flex-1 text-center p-2.5 rounded-[10px] bg-[#0A0F1E]/5 border border-[#0A0F1E]/15">
                              <p className="text-[19px] font-bold text-[#0A0F1E] antialiased">₹{routeOpt.savedRs}</p>
                              <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest antialiased">Money</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Packing Assistant Card ── */}
              <div className="mt-4 relative z-10">
                <button
                  onClick={() => setPackingExpanded(v => !v)}
                  className="w-full flex items-center gap-3 p-4 rounded-[16px] bg-[#384D7E]/10 border border-[#384D7E]/20 hover:border-[#384D7E]/40 transition-colors"
                >
                  <Package size={16} className="text-[#384D7E] shrink-0" />
                  <span className="text-[14px] font-bold text-[var(--text-primary)] flex-1 text-left antialiased">Packing Assistant</span>
                  <span className="text-[12px] font-bold text-[#3fa796] antialiased">
                    {packingList.filter(i => i.checked).length}/{packingList.length}
                  </span>
                  {packingExpanded ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                </button>
                <AnimatePresence>
                  {packingExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-3 p-4 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 max-h-52 overflow-y-auto">
                        {packingList.map(item => (
                          <button
                            key={item.id}
                            onClick={() => togglePackingItem(item.id)}
                            className="flex items-center gap-3 w-full text-left group/pack"
                          >
                            {item.checked
                              ? <CheckSquare size={16} className="text-[#3fa796] shrink-0" />
                              : <Square size={16} className="text-[var(--text-muted)] group-hover/pack:text-[var(--text-secondary)] shrink-0 transition-colors" />
                            }
                            <span className={`text-[14px] font-bold flex-1 transition-colors antialiased ${item.checked ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                              {item.emoji} {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── AI Safety Card ── */}
              {safetyInfo && (
                <div className="mt-4 relative z-10">
                  <button
                    onClick={() => setSafetyExpanded(v => !v)}
                    className="w-full flex items-center gap-3 p-4 rounded-[16px] bg-[#FC6C26]/10 border border-[#FC6C26]/20 hover:border-[#FC6C26]/40 transition-colors"
                  >
                    <Shield size={16} className="text-[#FC6C26] shrink-0" />
                    <span className="text-[14px] font-bold text-[var(--text-primary)] flex-1 text-left antialiased">⚠️ AI Safety Alert</span>
                    {safetyExpanded ? <ChevronUp size={14} className="text-[#FC6C26]" /> : <ChevronDown size={14} className="text-[#FC6C26]" />}
                  </button>
                  <AnimatePresence>
                    {safetyExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mt-2 p-4 rounded-[14px] bg-[var(--bg-card)] border border-[#FC6C26]/15">
                          <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-relaxed antialiased">{safetyInfo.warning}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* AI Engine Tip */}
            <div className="p-6 rounded-[24px] bg-[#c084fc]/10 border border-[#c084fc]/20 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <Sparkles size={16} className="text-[#c084fc]" />
                <span className="text-[13px] font-bold uppercase tracking-widest text-[#c084fc] antialiased">AI Engine Tip</span>
              </div>
              <p className="text-[15px] font-semibold leading-relaxed text-[var(--text-secondary)] relative z-10 antialiased">
                Hit <span className="text-[var(--text-primary)] font-bold">"AI Auto-Route"</span> on any day. The engine will analyze global traffic data and re-sequence your waypoints for absolute maximum efficiency.
              </p>
            </div>

            {/* ── Journey Flow: Continue to Trip Intelligence Map ── */}
            <div
              className="mt-2 p-5 rounded-[24px] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(252,108,38,0.08), rgba(139,92,246,0.08))',
                border: '1.5px solid rgba(252,108,38,0.25)',
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FC6C26, #8b5cf6)' }}>
                  <Globe size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-black uppercase tracking-widest text-[#FC6C26] mb-0.5">Next Step</p>
                  <p className="text-[15px] font-bold text-[var(--text-primary)] leading-snug">Environment Intelligence Report</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Crowd forecasts · Infra gaps · Quiet zones · Route modes</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/app/planner/intelligence?destination=${encodeURIComponent(destination)}&trip_id=${TRIP_ID}&date=${new Date().toISOString().split('T')[0]}&days=${days.length}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-[14px] font-black text-white shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #FC6C26, #e55b1d)' }}
              >
                Continue to Intelligence Map <ArrowRight size={16} />
              </motion.button>
            </div>

          </div>
        </div>
      </div>


      {/* ── Emergency SOS Button (fixed) ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSOS(true)}
        className="fixed bottom-8 right-8 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-red-500 text-white text-[15px] font-black shadow-[0_8px_24px_-6px_rgba(239,68,68,0.5)] hover:bg-red-600 transition-colors"
        aria-label="Emergency SOS"
      >
        <AlertTriangle size={16} />
        SOS
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && <EmergencySOSModal destination={destination} onClose={() => setShowSOS(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}

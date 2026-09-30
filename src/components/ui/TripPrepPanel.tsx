// TripPrepPanel.tsx — Decision Timeline + Travel Readiness Checklist
// Interactive checklist & timeline: Select, Deselect, Delete, and Add custom items.
// Saves all changes permanently in localStorage per trip.
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Clock, Link as LinkIcon, ChevronDown, ChevronUp, Plus, Trash2, X, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import type { TimelineTask, ReadinessItem } from "../../services/intelligenceService"
import { useThemeStore } from "../../stores/themeStore"

interface TripPrepPanelProps {
  timeline: TimelineTask[]
  checklist: ReadinessItem[]
  tripId?: string
  onTaskDone?: (id: string, done: boolean) => void
  onChecklistStatus?: (id: string, status: ReadinessItem["status"]) => void
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  booking:   { label: "Booking", color: "#0f172a", emoji: "🏨" },
  documents: { label: "Documents", color: "#384D7E", emoji: "📋" },
  health:    { label: "Health & Safety", color: "#16a34a", emoji: "🛡️" },
  finance:   { label: "Finance & Forex", color: "#f59e0b", emoji: "💱" },
  packing:   { label: "Packing", color: "#c084fc", emoji: "🎒" },
  pre_trip:  { label: "Pre-trip Prep", color: "#3fa796", emoji: "🌤️" },
}

const STATUS_CONFIG: Record<ReadinessItem["status"], { label: string; bg: string; text: string; icon: string }> = {
  ready:          { label: "Ready",        bg: "#F0FDF4", text: "#16a34a", icon: "✅" },
  pending:        { label: "To do",        bg: "#FFF5EE", text: "#0f172a", icon: "⏳" },
  not_applicable: { label: "N/A",          bg: "#F9FAFB", text: "#9ca3af", icon: "—"  },
}

export function TripPrepPanel({ timeline, checklist, tripId, onTaskDone, onChecklistStatus }: TripPrepPanelProps) {
  const theme = useThemeStore(s => s.theme)
  const isDark = (theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark')) && theme !== 'monochrome'
  const [tab, setTab] = useState<"timeline" | "readiness">("timeline")
  const [timelineExpanded, setTimelineExpanded] = useState(true)

  // Local storage key scoped by trip
  const storageKey = `expeditionx_trip_prep_${tripId || 'default'}`

  const loadSavedData = () => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        return {
          timeline: Array.isArray(parsed.timeline) && parsed.timeline.length > 0 ? (parsed.timeline as TimelineTask[]) : null,
          checklist: Array.isArray(parsed.checklist) && parsed.checklist.length > 0 ? (parsed.checklist as ReadinessItem[]) : null,
        }
      }
    } catch (e) {
      console.error('Failed to load trip prep data:', e)
    }
    return { timeline: null, checklist: null }
  }

  const [localTimeline, setLocalTimeline] = useState<TimelineTask[]>(() => {
    const saved = loadSavedData()
    return saved.timeline || timeline
  })

  const [localChecklist, setLocalChecklist] = useState<ReadinessItem[]>(() => {
    const saved = loadSavedData()
    return saved.checklist || checklist
  })

  // Sync if props update and no local override exists
  useEffect(() => {
    const saved = loadSavedData()
    if (saved.timeline) {
      setLocalTimeline(saved.timeline)
    } else if (timeline && timeline.length > 0) {
      setLocalTimeline(timeline)
    }
  }, [tripId, timeline])

  useEffect(() => {
    const saved = loadSavedData()
    if (saved.checklist) {
      setLocalChecklist(saved.checklist)
    } else if (checklist && checklist.length > 0) {
      setLocalChecklist(checklist)
    }
  }, [tripId, checklist])

  // Helper to persist both datasets
  const persist = (nextTimeline: TimelineTask[], nextChecklist: ReadinessItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        timeline: nextTimeline,
        checklist: nextChecklist,
        updatedAt: new Date().toISOString()
      }))
    } catch (e) {
      console.error('Failed to save trip prep data:', e)
    }
  }

  // Add Item State
  const [showAddTimeline, setShowAddTimeline] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskCategory, setTaskCategory] = useState<TimelineTask['category']>("booking")
  const [taskDays, setTaskDays] = useState(7)
  const [taskEmoji, setTaskEmoji] = useState("🏨")

  const [showAddChecklist, setShowAddChecklist] = useState(false)
  const [checklistItem, setChecklistItem] = useState("")
  const [checklistEmoji, setChecklistEmoji] = useState("✅")
  const [checklistNote, setChecklistNote] = useState("")

  // Calculations
  const readyCount = localChecklist.filter(i => i.status === "ready").length
  const totalApplicable = localChecklist.filter(i => i.status !== "not_applicable").length
  const checklistPct = totalApplicable > 0 ? Math.round((readyCount / totalApplicable) * 100) : 0

  const pendingTasks = localTimeline.filter(t => !t.done)
  const doneTasks = localTimeline.filter(t => t.done)
  const timelinePct = localTimeline.length > 0 ? Math.round((doneTasks.length / localTimeline.length) * 100) : 0

  const activePct = tab === "timeline" ? timelinePct : checklistPct
  const activeCountLabel = tab === "timeline" 
    ? `${doneTasks.length}/${localTimeline.length} ready`
    : `${readyCount}/${totalApplicable} ready`
  const activeSubLabel = tab === "timeline" ? "tasks completed" : "items checked"

  // ── Actions: Timeline ────────────────────────────────────────────────────────

  const toggleTask = (id: string) => {
    const updated = localTimeline.map(t => {
      if (t.id === id) {
        const nextDone = !t.done
        onTaskDone?.(id, nextDone)
        return { ...t, done: nextDone }
      }
      return t
    })
    setLocalTimeline(updated)
    persist(updated, localChecklist)
  }

  const handleDeleteTimelineTask = (id: string) => {
    const updated = localTimeline.filter(t => t.id !== id)
    setLocalTimeline(updated)
    persist(updated, localChecklist)
  }

  const handleAddTimelineTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    const newTask: TimelineTask = {
      id: `task_${Date.now()}`,
      task: taskTitle.trim(),
      category: taskCategory,
      emoji: taskEmoji || CATEGORY_CONFIG[taskCategory]?.emoji || "📌",
      due_date: new Date().toISOString().split("T")[0],
      days_before_trip: Number(taskDays) || 7,
      done: false,
    }

    const updated = [newTask, ...localTimeline]
    setLocalTimeline(updated)
    persist(updated, localChecklist)
    setTaskTitle("")
    setTaskDays(7)
    setShowAddTimeline(false)
  }

  // ── Actions: Checklist ───────────────────────────────────────────────────────

  const toggleChecklist = (id: string) => {
    const updated = localChecklist.map(i => {
      if (i.id !== id) return i
      const next: ReadinessItem["status"] = i.status === "ready" ? "pending" : "ready"
      onChecklistStatus?.(id, next)
      return { ...i, status: next }
    })
    setLocalChecklist(updated)
    persist(localTimeline, updated)
  }

  const handleDeleteChecklistItem = (id: string) => {
    const updated = localChecklist.filter(i => i.id !== id)
    setLocalChecklist(updated)
    persist(localTimeline, updated)
  }

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!checklistItem.trim()) return

    const newItem: ReadinessItem = {
      id: `item_${Date.now()}`,
      item: checklistItem.trim(),
      emoji: checklistEmoji.trim() || "✅",
      status: "pending",
      note: checklistNote.trim() || undefined,
    }

    const updated = [...localChecklist, newItem]
    setLocalChecklist(updated)
    persist(localTimeline, updated)
    setChecklistItem("")
    setChecklistNote("")
    setShowAddChecklist(false)
  }

  const handleResetDefaults = () => {
    if (window.confirm("Reset Trip Prep to defaults? Custom additions and toggles will be restored.")) {
      setLocalTimeline(timeline)
      setLocalChecklist(checklist)
      persist(timeline, checklist)
    }
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black drop-shadow-sm tracking-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Trip Prep</h3>
          {/* Readiness gauge */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke={isDark ? "rgba(255,255,255,0.12)" : "#f3f4f6"} strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke={activePct >= 80 ? "#16a34a" : activePct >= 50 ? "#f59e0b" : (isDark ? "#94a3b8" : "#0f172a")}
                  strokeWidth="3"
                  strokeDasharray={`${(activePct / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold" style={{ color: isDark ? '#ffffff' : '#1B2A4A' }}>
                {activePct}%
              </span>
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{activeCountLabel}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#94a3b8' : '#475569' }}>{activeSubLabel}</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-[12px] mt-3 mb-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb' }}>
          {(["timeline", "readiness"] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setShowAddTimeline(false)
                setShowAddChecklist(false)
              }}
              className="flex-1 py-2.5 rounded-[9px] text-[13px] font-black uppercase tracking-widest transition-all cursor-pointer"
              style={{
                background: tab === t ? (isDark ? "#262626" : "white") : "transparent",
                color: tab === t ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#94a3b8" : "#475569"),
                boxShadow: tab === t ? (isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)") : "none",
              }}
            >
              {t === "timeline" ? "🏛 Timeline" : "✅ Checklist"}
            </button>
          ))}
        </div>

        {/* Quick Action Bar (Counts + Add Button) */}
        <div className="flex items-center justify-between mt-3 mb-1 px-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            {tab === "timeline"
              ? `${pendingTasks.length} pending · ${doneTasks.length} completed`
              : `${readyCount} of ${totalApplicable} items ready`}
          </p>
          <button
            type="button"
            onClick={() => {
              if (tab === "timeline") setShowAddTimeline(v => !v)
              else setShowAddChecklist(v => !v)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            style={{ background: isDark ? '#FC6C26' : '#0f172a' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>{tab === "timeline" ? "Add Task" : "Add Item"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════
            CHECKLIST TAB
        ═══════════════════════════════════════════ */}
        {tab === "readiness" && (
          <motion.div key="readiness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-3 space-y-2">
            
            {/* Add Checklist Item Form */}
            <AnimatePresence>
              {showAddChecklist && (
                <motion.form
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddChecklistItem}
                  className="p-4 mb-3 rounded-2xl shadow-sm space-y-3"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: isDark ? '#ffffff' : '#1e293b' }}>Add Checklist Item</span>
                    <button
                      type="button"
                      onClick={() => setShowAddChecklist(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Emoji</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={checklistEmoji}
                        onChange={e => setChecklistEmoji(e.target.value)}
                        className="w-full px-2 py-2 text-center text-lg rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                        }}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Item Title *</label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={checklistItem}
                        onChange={e => setChecklistItem(e.target.value)}
                        placeholder="e.g. Download offline maps, Power bank charged..."
                        className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Note (Optional)</label>
                    <input
                      type="text"
                      value={checklistNote}
                      onChange={e => setChecklistNote(e.target.value)}
                      placeholder="e.g. Keep digital copy in cloud storage"
                      className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                      style={{
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#ffffff' : '#0f172a',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddChecklist(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!checklistItem.trim()}
                      className="px-4 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      style={{ background: isDark ? '#FC6C26' : '#0f172a' }}
                    >
                      Save Item
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {localChecklist.map(item => {
              const cfg = STATUS_CONFIG[item.status]
              const isReady = item.status === "ready"
              return (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 p-2.5 rounded-[14px] transition-colors"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(249,250,251,0.5)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    disabled={item.status === "not_applicable"}
                    title={isReady ? "Click to deselect (mark as to-do)" : "Click to mark as ready"}
                    className="mt-0.5 w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 border transition-all active:scale-90 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      background: isReady ? "#16a34a" : (isDark ? "#1a1a1a" : "white"),
                      borderColor: isReady ? "#16a34a" : (isDark ? "#4b5563" : "#cbd5e1"),
                    }}
                  >
                    {isReady && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer select-none"
                    onClick={() => {
                      if (item.status !== "not_applicable") toggleChecklist(item.id)
                    }}
                    title={isReady ? "Click to deselect (mark as to-do)" : "Click to mark as ready"}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{item.emoji}</span>
                      <p
                        className={`text-[15px] font-black tracking-tight ${isReady ? (isDark ? 'text-slate-400 line-through' : 'text-slate-500 line-through') : ''}`}
                        style={!isReady ? { color: isDark ? '#ffffff' : '#0f172a' } : undefined}
                      >
                        {item.item}
                      </p>
                      <span
                        className="ml-auto text-[10px] font-black px-2 py-1 rounded-full shrink-0 uppercase tracking-widest"
                        style={
                          isDark
                            ? (item.status === 'ready'
                                ? { background: 'rgba(22,163,74,0.2)', color: '#4ade80' }
                                : item.status === 'pending'
                                  ? { background: 'rgba(252,108,38,0.2)', color: '#fb923c' }
                                  : { background: 'rgba(255,255,255,0.08)', color: '#94a3b8' })
                            : { background: cfg.bg, color: cfg.text }
                        }
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {item.note && <p className="text-[12px] font-medium mt-0.5" style={{ color: isDark ? '#94a3b8' : '#475569' }}>{item.note}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    title="Delete this checklist item"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer shrink-0 mt-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}

            <div className="flex items-center justify-between pt-3">
              <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">
                Interactive checklist · Click to select/deselect
              </p>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════
            TIMELINE TAB
        ═══════════════════════════════════════════ */}
        {tab === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-3">

            {/* Add Timeline Task Form */}
            <AnimatePresence>
              {showAddTimeline && (
                <motion.form
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTimelineTask}
                  className="p-4 mb-3 rounded-2xl shadow-sm space-y-3"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: isDark ? '#ffffff' : '#1e293b' }}>Add Timeline Task</span>
                    <button
                      type="button"
                      onClick={() => setShowAddTimeline(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Task Title *</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      placeholder="e.g. Buy international travel adapter, arrange airport taxi..."
                      className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                      style={{
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#ffffff' : '#0f172a',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Category & Emoji</label>
                      <select
                        value={taskCategory}
                        onChange={e => {
                          const cat = e.target.value as TimelineTask['category']
                          setTaskCategory(cat)
                          setTaskEmoji(CATEGORY_CONFIG[cat]?.emoji || "📌")
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                        }}
                      >
                        <option value="booking">🏨 Booking</option>
                        <option value="documents">📋 Documents</option>
                        <option value="health">🛡️ Health & Safety</option>
                        <option value="finance">💱 Currency & Finance</option>
                        <option value="packing">🎒 Packing</option>
                        <option value="pre_trip">🌤️ Pre-trip Prep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Days Before Trip</label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={taskDays}
                        onChange={e => setTaskDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTimeline(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!taskTitle.trim()}
                      className="px-4 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      style={{ background: isDark ? '#FC6C26' : '#0f172a' }}
                    >
                      Save Task
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Pending Tasks */}
            {pendingTasks.length === 0 && doneTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-lg font-black tracking-tight mb-1" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>No tasks yet</p>
                <p className="text-[13px] font-bold" style={{ color: isDark ? '#94a3b8' : '#475569' }}>Click &quot;+ Add Task&quot; above to create a prep item.</p>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div
                className="text-center py-5 mb-2 rounded-2xl"
                style={{
                  background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(236,253,245,0.5)',
                  border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid #d1fae5'
                }}
              >
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-base font-black tracking-tight mb-0.5" style={{ color: isDark ? '#4ade80' : '#065f46' }}>All pending tasks done!</p>
                <p className="text-[12px] font-semibold" style={{ color: isDark ? '#34d399' : '#059669' }}>You&apos;re fully prepped for this trip.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => {
                  const color = CATEGORY_CONFIG[task.category]?.color || "#6b7280"
                  const isUrgent = task.days_before_trip <= 7
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 p-2.5 rounded-[14px] transition-colors"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(249,250,251,0.6)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {/* Checkbox to mark complete */}
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        title="Click to select / mark as complete"
                        className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 border-2 transition-all hover:border-[#16a34a] hover:bg-green-50 active:scale-90 cursor-pointer"
                        style={{
                          borderColor: isDark ? "#4b5563" : "#cbd5e1",
                          background: isDark ? "#1a1a1a" : "transparent"
                        }}
                      />
                      <span className="text-[20px]">{task.emoji}</span>
                      <div
                        className="flex-1 min-w-0 pl-1 cursor-pointer select-none"
                        onClick={() => toggleTask(task.id)}
                        title="Click to select / mark as complete"
                      >
                        <p className="text-[15px] font-black truncate drop-shadow-sm tracking-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{task.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className={isDark ? "text-slate-400" : "text-[#9ca3af]"} />
                          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: isUrgent ? "#dc2626" : (isDark ? "#94a3b8" : "#475569") }}>
                            {task.days_before_trip}d before trip
                            {isUrgent ? " — urgent" : ""}
                          </p>
                        </div>
                      </div>
                      {task.link && (
                        <Link
                          to={task.link}
                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
                          style={{ color }}
                          title="Open tool"
                        >
                          <LinkIcon size={12} />
                        </Link>
                      )}
                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTimelineTask(task.id)}
                        title="Delete task"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Completed Tasks with Deselect / Uncheck & Delete */}
            {doneTasks.length > 0 && (
              <div className={`mt-4 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setTimelineExpanded(v => !v)}
                  className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest cursor-pointer mb-2"
                  style={{ color: isDark ? '#94a3b8' : '#475569' }}
                >
                  {timelineExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{doneTasks.length} Completed</span>
                  <span className="text-[11px] font-medium normal-case tracking-normal" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>(Click checkmark to deselect / restore)</span>
                </button>
                <AnimatePresence>
                  {timelineExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 mt-1">
                        {doneTasks.map(task => (
                          <div
                            key={task.id}
                            className="group flex items-center gap-3 p-2.5 rounded-[14px] transition-all"
                            style={{
                              background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(236,253,245,0.4)',
                              border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(209,250,229,0.8)'
                            }}
                          >
                            {/* Clickable checkmark to DESELECT */}
                            <button
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              title="Click to deselect / uncheck (move back to pending)"
                              className="w-5 h-5 rounded-[6px] bg-[#16a34a] hover:bg-[#15803d] flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90 cursor-pointer"
                            >
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </button>
                            <span className="text-[18px] opacity-75">{task.emoji}</span>
                            <div
                              className="flex-1 min-w-0 cursor-pointer select-none"
                              onClick={() => toggleTask(task.id)}
                              title="Click to deselect / uncheck (move back to pending)"
                            >
                              <p className={`text-[14px] font-bold line-through truncate drop-shadow-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {task.task}
                              </p>
                              <p className="text-[10px] font-semibold flex items-center gap-1 mt-0.5" style={{ color: isDark ? '#34d399' : '#047857' }}>
                                <span>Completed</span>
                                <span>•</span>
                                <span className="underline decoration-dotted hover:text-emerald-900">Click to uncheck</span>
                              </p>
                            </div>
                            {/* Delete completed task */}
                            <button
                              type="button"
                              onClick={() => handleDeleteTimelineTask(task.id)}
                              title="Delete task"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex items-center justify-between pt-3">
              <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">
                Timeline prep tasks · Select to finish, click to deselect
              </p>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact badge — used on trip list cards
export function ReadinessBadge({ checklist }: { checklist: ReadinessItem[] }) {
  const theme = useThemeStore(s => s.theme)
  const isDark = (theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark')) && theme !== 'monochrome'
  const readyCount = checklist.filter(i => i.status === "ready").length
  const totalApplicable = checklist.filter(i => i.status !== "not_applicable").length
  const pct = totalApplicable > 0 ? Math.round((readyCount / totalApplicable) * 100) : 0
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : (isDark ? "#94a3b8" : "#0f172a")

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-extrabold border"
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}
    >
      ✅ {readyCount}/{totalApplicable} ready
    </span>
  )
}

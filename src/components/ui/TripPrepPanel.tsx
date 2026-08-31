// TripPrepPanel.tsx — Decision Timeline + Travel Readiness Checklist
// A checklist — presented as "6 of 8 items ready", NOT an AI confidence score.
// Lives in TripOverview (Trip Prep tab) and TripList card badges.
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Clock, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"
import type { TimelineTask, ReadinessItem } from "../../services/intelligenceService"

interface TripPrepPanelProps {
  timeline: TimelineTask[]
  checklist: ReadinessItem[]
  onTaskDone?: (id: string, done: boolean) => void
  onChecklistStatus?: (id: string, status: ReadinessItem["status"]) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  booking:   "#0f172a",
  documents: "#384D7E",
  health:    "#16a34a",
  finance:   "#f59e0b",
  packing:   "#c084fc",
  pre_trip:  "#3fa796",
}

const STATUS_CONFIG: Record<ReadinessItem["status"], { label: string; bg: string; text: string; icon: string }> = {
  ready:          { label: "Ready",        bg: "#F0FDF4", text: "#16a34a", icon: "✅" },
  pending:        { label: "To do",        bg: "#FFF5EE", text: "#0f172a", icon: "⏳" },
  not_applicable: { label: "N/A",          bg: "#F9FAFB", text: "#9ca3af", icon: "—"  },
}

export function TripPrepPanel({ timeline, checklist, onTaskDone, onChecklistStatus }: TripPrepPanelProps) {
  const [tab, setTab] = useState<"timeline" | "readiness">("readiness")
  const [localTimeline, setLocalTimeline] = useState(timeline)
  const [localChecklist, setLocalChecklist] = useState(checklist)
  const [timelineExpanded, setTimelineExpanded] = useState(true)

  const readyCount = localChecklist.filter(i => i.status === "ready").length
  const totalApplicable = localChecklist.filter(i => i.status !== "not_applicable").length
  const pct = totalApplicable > 0 ? Math.round((readyCount / totalApplicable) * 100) : 0

  const pendingTasks = localTimeline.filter(t => !t.done)
  const doneTasks = localTimeline.filter(t => t.done)

  const toggleTask = (id: string) => {
    setLocalTimeline(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    const task = localTimeline.find(t => t.id === id)
    if (task) onTaskDone?.(id, !task.done)
  }

  const toggleChecklist = (id: string) => {
    setLocalChecklist(prev => prev.map(i => {
      if (i.id !== id) return i
      const next: ReadinessItem["status"] = i.status === "ready" ? "pending" : "ready"
      onChecklistStatus?.(id, next)
      return { ...i, status: next }
    }))
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black text-[#0f172a] drop-shadow-sm tracking-tight">Trip Prep</h3>
          {/* Readiness badge */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke={pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#0f172a"}
                  strokeWidth="3"
                  strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-[#1B2A4A]">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-[13px] font-black text-[#0f172a]">{readyCount}/{totalApplicable} ready</p>
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">items checked</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-gray-50 rounded-[12px] mt-3 mb-0">
          {(["readiness", "timeline"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-[9px] text-[13px] font-black uppercase tracking-widest transition-all"
              style={{
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "#0f172a" : "#475569",
                boxShadow: tab === t ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {t === "readiness" ? "✅ Checklist" : "📅 Timeline"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "readiness" && (
          <motion.div key="readiness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4 space-y-2.5">
            {localChecklist.map(item => {
              const cfg = STATUS_CONFIG[item.status]
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    disabled={item.status === "not_applicable"}
                    className="mt-0.5 w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 border transition-all"
                    style={{
                      background: item.status === "ready" ? "#16a34a" : "white",
                      borderColor: item.status === "ready" ? "#16a34a" : "#e5e7eb",
                    }}
                  >
                    {item.status === "ready" && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{item.emoji}</span>
                      <p className="text-[15px] font-black text-[#0f172a] drop-shadow-sm tracking-tight">{item.item}</p>
                      <span
                        className="ml-auto text-[10px] font-black px-2 py-1 rounded-full shrink-0 uppercase tracking-widest"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {item.note && <p className="text-[12px] font-bold text-[#475569] mt-1">{item.note}</p>}
                  </div>
                </div>
              )
            })}
            <p className="text-[11px] font-bold text-[#94a3b8] text-center pt-3 uppercase tracking-widest">
              This is a checklist — not an AI score. Mark items as you complete them.
            </p>
          </motion.div>
        )}

        {tab === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-lg font-black text-[#0f172a] tracking-tight mb-1">All tasks done!</p>
                <p className="text-[13px] text-[#475569] font-bold">You&apos;re fully prepped for this trip.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => {
                  const color = CATEGORY_COLORS[task.category] || "#6b7280"
                  const isUrgent = task.days_before_trip <= 7
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-[12px] bg-gray-50/60 border border-[var(--border-subtle)]">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 border-2 transition-all hover:border-[#16a34a]"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                      <span className="text-[20px]">{task.emoji}</span>
                      <div className="flex-1 min-w-0 pl-1">
                        <p className="text-[15px] font-black text-[#0f172a] truncate drop-shadow-sm tracking-tight">{task.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-[#9ca3af]" />
                          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: isUrgent ? "#dc2626" : "#475569" }}>
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
                        >
                          <LinkIcon size={12} />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {doneTasks.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setTimelineExpanded(v => !v)}
                  className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest text-[#475569] hover:text-[#0f172a]"
                >
                  {timelineExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {doneTasks.length} completed
                </button>
                <AnimatePresence>
                  {timelineExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="space-y-1.5 mt-2 opacity-50">
                        {doneTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-2 px-2 py-0.5">
                            <div className="w-5 h-5 rounded-[6px] bg-[#16a34a] flex items-center justify-center shrink-0">
                              <Check size={11} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[13px] font-bold text-[#94a3b8] line-through">{task.task}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact badge — used on trip list cards
export function ReadinessBadge({ checklist }: { checklist: ReadinessItem[] }) {
  const readyCount = checklist.filter(i => i.status === "ready").length
  const totalApplicable = checklist.filter(i => i.status !== "not_applicable").length
  const pct = totalApplicable > 0 ? Math.round((readyCount / totalApplicable) * 100) : 0
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#0f172a"

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-extrabold border"
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}
    >
      ✅ {readyCount}/{totalApplicable} ready
    </span>
  )
}

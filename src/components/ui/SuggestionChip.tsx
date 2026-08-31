// SuggestionChip.tsx — Unified "AI is proposing a change" chip
// Used by: Weather Recovery, Diversity Balancer, Missed Opportunity Finder
// One consistent interaction pattern: chip → preview → accept/dismiss
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface SuggestionChipProps {
  icon: string
  label: string
  description: string
  accentColor?: string
  previewContent?: React.ReactNode
  onAccept?: () => void
  onDismiss?: () => void
  acceptLabel?: string
  basis?: string
}

export function SuggestionChip({
  icon,
  label,
  description,
  accentColor = "#FC6C26",
  previewContent,
  onAccept,
  onDismiss,
  acceptLabel = "Apply suggestion",
  basis,
}: SuggestionChipProps) {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="rounded-[16px] border overflow-hidden"
        style={{ borderColor: `${accentColor}25`, background: `${accentColor}08` }}
      >
        <div className="flex items-center gap-3 p-3">
          <span className="text-[20px] shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-extrabold uppercase tracking-widest mb-0.5 antialiased" style={{ color: accentColor }}>
              {label}
            </p>
            <p className="text-[13px] font-bold text-[var(--text-secondary)] leading-snug antialiased">{description}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {previewContent && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-[#9ca3af]"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="px-3 py-1.5 rounded-[10px] text-white text-[12px] font-extrabold transition-all hover:opacity-90"
                style={{ background: accentColor }}
              >
                {acceptLabel}
              </button>
            )}
            <button
              onClick={() => { setDismissed(true); onDismiss?.() }}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--bg-card)]/80 text-[#9ca3af] border border-[var(--border-subtle)]"
            >
              <X size={11} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {expanded && previewContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: `${accentColor}15` }}>
                {previewContent}
                {basis && <p className="text-[10px] font-bold text-[#9ca3af] mt-3 italic">{basis}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

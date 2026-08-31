import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { usePlannerStore, STEP_META, type PlannerStep } from '../../stores/plannerStore'

export function StepRail() {
  const { currentStep, completedSteps, setStep } = usePlannerStore()

  return (
    <div className="flex flex-col gap-1 w-56 shrink-0">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FC6C26] mb-3 px-2">
        Trip Planner
      </p>
      {([1, 2, 3, 4, 5, 6] as PlannerStep[]).map((step) => {
        const meta = STEP_META[step]
        const isActive = step === currentStep
        const isDone = completedSteps.has(step)
        const isClickable = isDone || step <= currentStep

        return (
          <button
            key={step}
            onClick={() => isClickable && setStep(step)}
            disabled={!isClickable}
            className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
              isActive
                ? 'bg-[var(--bg-card)] shadow-md border border-orange-100'
                : isClickable
                  ? 'hover:bg-[var(--bg-card)]/60'
                  : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Step number / check */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-all duration-300 ${
                isDone
                  ? 'bg-[#FC6C26] text-white'
                  : isActive
                    ? 'bg-[#FC6C26] text-white shadow-[0_4px_12px_rgba(252,108,38,0.35)]'
                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {isDone ? <Check size={14} strokeWidth={3} /> : <span>{step}</span>}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-black truncate transition-colors duration-200 ${
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              }`}>
                {meta.emoji} {meta.label}
              </p>
              {isActive && (
                <p className="text-[11px] text-[#FC6C26] font-bold truncate mt-0.5">
                  {meta.description}
                </p>
              )}
            </div>

            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="step-active-bar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#FC6C26]"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

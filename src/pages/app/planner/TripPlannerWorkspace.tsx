/**
 * TripPlannerWorkspace.tsx — 6-step workspace orchestrator
 * All 15 features nested here per the master build spec.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { usePlannerStore, STEP_META } from '../../../stores/plannerStore'
import { StepRail } from '../../../components/planner/StepRail'
import { Compass } from 'lucide-react'

import { ArrowLeft } from 'lucide-react'

// Step panels (lazy-loaded for code splitting)
const Step1Destination = lazy(() =>
  import('./steps/Step1Destination').then(m => ({ default: m.Step1Destination }))
)
const Step2Route = lazy(() =>
  import('./steps/Step2Route').then(m => ({ default: m.Step2Route }))
)
const Step3Safety = lazy(() =>
  import('./steps/Step3Safety').then(m => ({ default: m.Step3Safety }))
)
const Step4Places = lazy(() =>
  import('./steps/Step4Places').then(m => ({ default: m.Step4Places }))
)
const Step5Pack = lazy(() =>
  import('./steps/Step5Pack').then(m => ({ default: m.Step5Pack }))
)
const Step6Review = lazy(() =>
  import('./steps/Step6Review').then(m => ({ default: m.Step6Review }))
)

function StepLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FC6C26]/10 flex items-center justify-center animate-pulse">
          <Compass size={22} className="text-[#FC6C26]" />
        </div>
        <p className="text-[13px] font-black text-[var(--text-muted)]">Loading step...</p>
      </div>
    </div>
  )
}

const STEP_COMPONENTS = {
  1: Step1Destination,
  2: Step2Route,
  3: Step3Safety,
  4: Step4Places,
  5: Step5Pack,
  6: Step6Review,
}

const STEP_LABELS = ['Destination', 'Route', 'Safety', 'Places', 'Budget', 'Review']

export function TripPlannerWorkspace() {
  const { currentStep, setStep } = usePlannerStore()
  const StepComponent = STEP_COMPONENTS[currentStep]

  const prevStep = () => {
    if (currentStep > 1) {
      setStep((currentStep - 1) as any)
    }
  }

  return (
    <div className="h-[100dvh] bg-[var(--bg-primary)] flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FC6C26]/8 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-black/5 dark:from-white/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* ── Top Progress Bar ── */}
      <header className="sticky top-0 z-20 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Back button */}
            <div className="w-24">
              {currentStep > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={prevStep}
                  className="flex items-center gap-2 text-[14px] font-black text-[var(--text-primary)] hover:text-[#FC6C26] transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                  Back
                </motion.button>
              )}
            </div>

            {/* Step indicator dots */}
            <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemax={6}>
              {STEP_LABELS.map((label, i) => {
                const step = i + 1
                const isActive = step === currentStep
                const isDone = step < currentStep
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={{
                          width: isActive ? 32 : 8,
                          backgroundColor: isDone ? 'var(--text-primary)' : isActive ? '#FC6C26' : 'var(--border-strong)',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="h-2 rounded-full"
                      />
                      <span className={`text-[11px] font-black tracking-[0.2em] uppercase transition-colors hidden sm:block ${isActive ? 'text-[#FC6C26]' : isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`w-6 h-px mb-4 transition-colors ${isDone ? 'bg-[var(--text-primary)]' : 'bg-[var(--border-subtle)]'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step counter */}
            <div className="w-24 flex justify-end">
              <span className="text-[15px] font-black text-[var(--text-primary)]">{currentStep}/6</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 overflow-auto"
        >
          <div className="max-w-4xl mx-auto p-8">
            <Suspense fallback={<StepLoader />}>
              <StepComponent />
            </Suspense>
          </div>
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

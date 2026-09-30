// WizardShell.tsx — Progress bar, back/next navigation wrapper for the 6-step wizard
// Step 0=Mood, 1=Destination, 2=Party, 3=Budget, 4=Preferences, 5=Variants, 6=Generating
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'

interface WizardShellProps {
  children: React.ReactNode
  canProceed: boolean
  onNext?: () => void
  hideNext?: boolean
}

const STEP_LABELS = ['Destination', 'Travel Style', 'Budget', 'Preferences', 'Style', 'Generating']

export function WizardShell({ children, canProceed, onNext, hideNext = false }: WizardShellProps) {
  const { currentStep, prevStep, nextStep } = useWizardStore()

  // Visible steps are 1-6 in display; step 0 (Mood) has its own layout
  const displayStep = currentStep  // 1..6
  const totalDisplaySteps = 6

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      nextStep()
    }
  }

  return (
    <div className="h-[100dvh] bg-[var(--bg-primary)] flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FC6C26]/8 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-black/5 dark:from-white/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* ── Top Progress Bar ── */}
      <header className="sticky top-0 z-20 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Back button */}
            <div className="w-24">
              {currentStep > 1 && currentStep < 6 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={prevStep}
                  className="flex items-center gap-2 text-[14px] font-bold text-[var(--text-primary)] hover:text-[#FC6C26] transition-colors antialiased"
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                  Back
                </motion.button>
              )}
            </div>

            {/* Step indicator dots */}
            <div className="flex items-center gap-2" role="progressbar" aria-valuenow={displayStep} aria-valuemax={totalDisplaySteps}>
              {STEP_LABELS.map((label, i) => {
                const step = i + 1
                const isActive = step === displayStep
                const isDone = step < displayStep
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
                      <span className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hidden sm:block antialiased ${isActive ? 'text-[#FC6C26]' : isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
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
              <span className="text-[15px] font-bold text-[var(--text-primary)] antialiased">{displayStep}/{totalDisplaySteps}</span>
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
          {children}

          {/* ── Inline Next Button ── */}
          {!hideNext && currentStep >= 1 && currentStep < 6 && (
            <div className="max-w-4xl mx-auto px-6 pb-12 pt-4 flex justify-end w-full">
              <motion.button
                onClick={handleNext}
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.05 } : undefined}
                whileTap={canProceed ? { scale: 0.95 } : undefined}
                className={`flex items-center gap-3 px-8 py-4 rounded-[16px] text-[16px] font-bold tracking-tight transition-all shadow-lg border-2 antialiased ${
                  canProceed
                    ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[#FC6C26] hover:border-[#FC6C26] hover:text-white shadow-[0_10px_20px_-10px_rgba(252,108,38,0.4)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-muted)] cursor-not-allowed shadow-sm opacity-70'
                }`}
                aria-label={canProceed ? 'Continue to next step' : 'Please complete the required fields to continue'}
              >
                Continue <ArrowRight size={18} />
              </motion.button>
            </div>
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

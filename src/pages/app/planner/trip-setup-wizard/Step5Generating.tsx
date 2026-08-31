// Step5Generating.tsx — AI generation animation screen (now fires at step 6)
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { useTripStore } from '../../../../stores/tripStore'
import { useIntelligenceStore } from '../../../../stores/intelligenceStore'
import { generateItinerary } from '../../../../lib/ai-engine'
import type { WizardInputs } from '../../../../lib/ai-engine'

const CHECKLIST_ITEMS = [
  'Analyzing destination data…',
  'Checking weather patterns…',
  'Finding best hotels…',
  'Mapping top attractions…',
  'Calculating walking distances…',
  'Checking opening hours…',
  'Predicting crowd levels…',
  'Discovering local festivals…',
  'Optimizing public transport…',
  'Running AI route optimization…',
]

export function Step5Generating() {
  const navigate = useNavigate()
  const wizard = useWizardStore()
  const { currentTrip, updateItinerary } = useTripStore()
  const { variants, selectedVariant } = useIntelligenceStore()
  const [checkedCount, setCheckedCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)

  const selectedVariantData = variants.find(v => v.label === selectedVariant)
  const formattedDestination = wizard.destination
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  useEffect(() => {
    const totalItems = CHECKLIST_ITEMS.length
    let count = 0

    const interval = setInterval(() => {
      if (count < totalItems) {
        count++
        setCheckedCount(count)
        setProgress(Math.min(Math.round((count / totalItems) * 98), 98))
      } else {
        clearInterval(interval)
        // Generate the itinerary from wizard inputs
        const inputs: WizardInputs = {
          destination: formattedDestination,
          party: wizard.party,
          tripTypes: wizard.tripTypes,
          budgetMin: wizard.budgetMin,
          budgetMax: wizard.budgetMax,
          accommodation: wizard.accommodation,
          transport: wizard.transport,
          food: wizard.food,
          wakeUpTime: wizard.wakeUpTime,
          walkingPreference: wizard.walkingPreference,
          energyLevel: wizard.energyLevel,
          dietary: wizard.dietary,
          activityDuration: wizard.activityDuration,
          startDate: wizard.startDate,
          durationDays: wizard.durationDays,
        }

        const itinerary = generateItinerary(inputs)
        
        // Generate a fully compliant Trip object for the store
        const newTripId = 'ai_' + Date.now()
        const endDate = new Date(new Date(wizard.startDate).getTime() + wizard.durationDays * 86400000).toISOString().split('T')[0]
        
        wizard.complete()
        
        useTripStore.getState().setNewTrip({
          id: newTripId,
          title: `${wizard.durationDays}-Day ${formattedDestination} Expedition`,
          destinations: [formattedDestination],
          coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070', // We can improve this image later
          startDate: wizard.startDate,
          endDate: endDate,
          status: 'upcoming',
          budget: wizard.budgetMax,
          spent: 0,
          collaborators: 1,
          itinerary: itinerary
        })

        setTimeout(() => {
          setIsDone(true)
          setTimeout(() => {
            navigate('/app/planner/itinerary', { replace: true })
          }, 600)
        }, 400)
      }
    }, 200)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isDone ? 0 : 1 }}
        transition={{ duration: isDone ? 0.5 : 0.3 }}
        className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6 relative overflow-hidden"
      >
        {/* Ambient glows */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FC6C26]/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#c084fc]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full text-center relative z-10">
          {/* Pulsing brain/sparkle icon */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              filter: ['drop-shadow(0 0 20px rgba(252,108,38,0.2))', 'drop-shadow(0 0 40px rgba(252,108,38,0.4))', 'drop-shadow(0 0 20px rgba(252,108,38,0.2))'],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-8 inline-block"
          >
            ✨
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] mb-3 antialiased">
            Learning your travel style…
          </h1>
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-10 antialiased">
            AI is crafting your perfect {wizard.durationDays}-day {formattedDestination} expedition.
          </p>

          {/* Checklist */}
          <div className="text-left space-y-2.5 mb-10">
            {CHECKLIST_ITEMS.map((item, i) => {
              const isChecked = i < checkedCount
              const isCurrent = i === checkedCount
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 transition-all duration-300 ${isCurrent ? 'scale-105 origin-left' : 'scale-100'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                    isChecked ? 'bg-[var(--text-primary)]' : isCurrent ? 'bg-[var(--bg-card)] border-2 border-[#FC6C26] shadow-[0_0_10px_rgba(252,108,38,0.2)]' : 'bg-[var(--bg-card)] border-2 border-[var(--border-subtle)]'
                  }`}>
                    {isChecked && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <Check size={16} className="text-[var(--bg-primary)]" strokeWidth={3} />
                      </motion.div>
                    )}
                    {isCurrent && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FC6C26] animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[17px] font-bold transition-all duration-300 tracking-tight antialiased ${
                    isChecked 
                      ? 'text-[var(--text-primary)]/40 line-through decoration-2 decoration-[var(--text-primary)]/20' 
                      : isCurrent 
                        ? 'text-[var(--text-primary)]' 
                        : 'text-[var(--text-muted)]'
                  }`}>
                    {item}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="bg-[var(--border-subtle)] rounded-full h-2 overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[15px] font-bold text-[var(--text-primary)] antialiased">
            <motion.span key={progress} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
              {progress}%
            </motion.span>
            {' '}complete — always learning…
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

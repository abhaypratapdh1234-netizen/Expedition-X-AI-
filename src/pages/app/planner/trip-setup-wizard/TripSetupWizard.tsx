// TripSetupWizard.tsx — Orchestrator: renders the right step based on wizardStore.currentStep
// Updated for Master Build v3: step 0 = Mood Picker, step 5 = Variant Selector, step 6 = Generating
import { useEffect } from 'react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { Step0Mood } from './Step0Mood'
import { Step1Destination } from './Step1Destination'
import { Step2Party } from './Step2Party'
import { Step3Budget } from './Step3Budget'
import { Step4Preferences } from './Step4Preferences'
import { Step5Variants } from './Step5Variants'
import { Step5Generating } from './Step5Generating'

export function TripSetupWizard() {
  const { currentStep, isComplete, reset } = useWizardStore()

  useEffect(() => {
    if (isComplete) {
      reset()
    }
  }, [isComplete, reset])

  if (isComplete) return null

  switch (currentStep) {
    case 0: return <Step0Mood />
    case 1: return <Step1Destination />
    case 2: return <Step2Party />
    case 3: return <Step3Budget />
    case 4: return <Step4Preferences />
    case 5: return <Step5Variants />
    case 6: return <Step5Generating />
    default: return <Step1Destination />
  }
}

// Step2Party.tsx — Who are you travelling with + trip type
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { WizardShell } from './WizardShell'

const PARTY_OPTIONS = [
  { value: 'Solo', emoji: '🧳', desc: 'Just me' },
  { value: 'Couple', emoji: '❤️', desc: 'Two of us' },
  { value: 'Friends', emoji: '🎉', desc: 'Squad trip' },
  { value: 'Family', emoji: '👨‍👩‍👧', desc: 'With family' },
  { value: 'Kids', emoji: '🧒', desc: 'Family + kids' },
  { value: 'Business', emoji: '💼', desc: 'Work travel' },
]

const TRIP_TYPES = [
  'Adventure', 'Luxury', 'Nature', 'Romantic',
  'Road Trip', 'Food', 'Shopping', 'Nightlife',
  'Backpacking', 'Photography', 'Hidden Gems',
]

function buildMicrocopy(party: string, tripTypes: string[]): string {
  if (!party && tripTypes.length === 0) return 'Tell us about your travel style…'
  const partyMap: Record<string, string> = {
    Solo: 'a solo expedition',
    Couple: 'an escape for two',
    Friends: 'a group adventure',
    Family: 'a family holiday',
    Kids: 'a kid-friendly family trip',
    Business: 'a business trip',
  }
  const partyStr = partyMap[party] || 'a trip'
  const typeStr = tripTypes.length > 0
    ? tripTypes.slice(0, 2).map(t => t.toLowerCase()).join(', ') + '-focused '
    : ''
  return `Got it — planning a ${typeStr}${partyStr}.`
}

export function Step2Party() {
  const { party, tripTypes, setParty, setTripTypes } = useWizardStore()

  const toggleTripType = (type: string) => {
    if (tripTypes.includes(type)) {
      setTripTypes(tripTypes.filter(t => t !== type))
    } else if (tripTypes.length < 3) {
      setTripTypes([...tripTypes, type])
    }
  }

  const canProceed = !!party && tripTypes.length > 0

  return (
    <WizardShell canProceed={canProceed}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Section A: Party */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] mb-2 antialiased">
            Who's travelling?
          </h2>
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-8 antialiased">Select your travel group.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
            {PARTY_OPTIONS.map((opt, i) => {
              const isSelected = party === opt.value
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setParty(opt.value)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-[24px] border-2 transition-all font-bold text-[16px] tracking-tight antialiased ${
                    isSelected
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-[0_8px_24px_-8px_rgba(255,255,255,0.2)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--bg-primary)] flex items-center justify-center"
                    >
                      <Check size={13} className="text-[var(--text-primary)]" />
                    </motion.div>
                  )}
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="text-center">
                    <p className="font-bold text-[16px] antialiased">{opt.value}</p>
                    <p className={`text-[13px] font-semibold antialiased ${isSelected ? 'text-[var(--bg-primary)]/80' : 'text-[var(--text-secondary)]'}`}>{opt.desc}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Section B: Trip Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] antialiased">
              What's your vibe?
            </h2>
            <span className={`text-[15px] font-bold tracking-tight antialiased ${tripTypes.length === 3 ? 'text-[#FC6C26]' : 'text-[var(--text-secondary)]'}`}>
              {tripTypes.length}/3 selected
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-6 antialiased">Pick up to 3 trip styles.</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {TRIP_TYPES.map((type, i) => {
              const isSelected = tripTypes.includes(type)
              const isDisabled = !isSelected && tripTypes.length >= 3
              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleTripType(type)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  className={`px-5 py-2.5 rounded-full text-[15px] font-bold tracking-tight border-2 transition-all shadow-sm antialiased ${
                    isSelected
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                      : isDisabled
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)] cursor-not-allowed opacity-50'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  {type}
                </motion.button>
              )
            })}
          </div>

          {/* Live microcopy */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${party}-${tripTypes.join('-')}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-4 rounded-[16px] bg-violet-500/10 border border-violet-500/20"
            >
              <span className="text-[18px]">🤖</span>
              <p className="text-[15px] font-semibold text-[var(--text-primary)] italic antialiased">
                {buildMicrocopy(party, tripTypes)}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </WizardShell>
  )
}

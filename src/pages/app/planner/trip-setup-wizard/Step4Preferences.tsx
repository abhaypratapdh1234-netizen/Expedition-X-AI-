// Step4Preferences.tsx — Fine-tune your travel style (7 preference rows)
import { motion } from 'framer-motion'
import { useWizardStore } from '../../../../stores/wizardStore'
import { WizardShell } from './WizardShell'

function SegRow({
  label,
  options,
  value,
  onChange,
  multi = false,
  selectedValues = [],
  onToggle,
}: {
  label: string
  options: string[]
  value?: string
  onChange?: (v: string) => void
  multi?: boolean
  selectedValues?: string[]
  onToggle?: (v: string) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[16px] font-bold text-[var(--text-primary)] shrink-0 min-w-[180px] antialiased">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isActive = multi ? selectedValues.includes(opt) : value === opt
          return (
            <button
              key={opt}
              onClick={() => multi ? onToggle?.(opt) : onChange?.(opt)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-full text-[15px] font-bold tracking-tight border-2 transition-all shadow-sm antialiased ${
                isActive
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const ENERGY_DOTS: Record<string, number> = { Relaxed: 1, Balanced: 2, 'Packed Schedule': 3 }

export function Step4Preferences() {
  const {
    wakeUpTime, walkingPreference, energyLevel, dietary,
    accessibility, languages, activityDuration,
    setWakeUpTime, setWalkingPreference, setEnergyLevel,
    setDietary, setAccessibility, setLanguages, setActivityDuration,
  } = useWizardStore()

  const toggleMulti = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  // Count how many preferences are "set"
  const setCount = [
    wakeUpTime, walkingPreference, energyLevel,
    dietary.length > 0, activityDuration,
    accessibility.length > 0, languages.length > 0,
  ].filter(Boolean).length
  const totalPrefs = 7

  return (
    <WizardShell canProceed={setCount >= 4}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Fixed header with counter */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] mb-2 antialiased">
                Fine-tune your style
              </h2>
              <p className="text-[var(--text-secondary)] text-[18px] font-semibold antialiased">The AI uses these to personalize every waypoint.</p>
            </div>
            <div className="text-right shrink-0 ml-6">
              <p className="text-[28px] font-black text-[#FC6C26] antialiased">{setCount}<span className="text-[18px] font-black text-[var(--text-secondary)] antialiased">/{totalPrefs}</span></p>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] antialiased">set</p>
              <div className="w-24 h-1.5 bg-[var(--border-subtle)] rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-[#FC6C26] rounded-full"
                  animate={{ width: `${(setCount / totalPrefs) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200 }}
                />
              </div>
            </div>
          </div>

          {/* Preference Rows */}
          <div className="mt-10 bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-subtle)] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] px-8 py-4">

            <SegRow label="⏰ Wake-up time" options={['5 AM', '7 AM', '9 AM', '11 AM']} value={wakeUpTime} onChange={setWakeUpTime} />

            <SegRow label="🚶 Walking preference" options={['Love Walking', 'Normal', 'Hate Walking']} value={walkingPreference} onChange={setWalkingPreference} />

            {/* Energy level with density dots */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-[var(--border-subtle)]">
              <span className="text-[16px] font-bold text-[var(--text-primary)] shrink-0 min-w-[180px] antialiased">⚡ Energy level</span>
              <div className="flex flex-wrap gap-2">
                {['Relaxed', 'Balanced', 'Packed Schedule'].map(opt => {
                  const isActive = energyLevel === opt
                  const dots = ENERGY_DOTS[opt]
                  return (
                    <button
                      key={opt}
                      onClick={() => setEnergyLevel(opt)}
                      aria-pressed={isActive}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-bold tracking-tight border-2 transition-all shadow-sm antialiased ${
                        isActive ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {opt}
                      <span className="flex gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-current' : 'bg-current opacity-30'}`} />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <SegRow
              label="🥗 Dietary"
              options={['Vegetarian', 'Vegan', 'Halal', 'Jain', 'No Preference']}
              multi
              selectedValues={dietary}
              onToggle={v => toggleMulti(dietary, v, setDietary)}
            />

            <SegRow
              label="♿ Accessibility"
              options={['Wheelchair', 'Senior Friendly', 'Kids Friendly']}
              multi
              selectedValues={accessibility}
              onToggle={v => toggleMulti(accessibility, v, setAccessibility)}
            />

            <SegRow
              label="🌐 Languages"
              options={['English', 'Hindi', 'French', 'Japanese']}
              multi
              selectedValues={languages}
              onToggle={v => toggleMulti(languages, v, setLanguages)}
            />

            <SegRow
              label="⏱ Activity duration"
              options={['30 min', '1 hr', '2 hr', 'Whole day']}
              value={activityDuration}
              onChange={setActivityDuration}
            />
          </div>
        </motion.div>
      </div>
    </WizardShell>
  )
}

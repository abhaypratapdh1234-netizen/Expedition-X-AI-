// Step3Budget.tsx — Budget slider + segmented pills + live cost breakdown card
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWizardStore } from '../../../../stores/wizardStore'
import { WizardShell } from './WizardShell'

const ACCOMMODATION_OPTIONS = ['Budget', 'Mid', 'Premium', 'Luxury']
const TRANSPORT_OPTIONS = ['Train', 'Flight', 'Bus', 'Rental Car']
const FOOD_OPTIONS = ['Street Food', 'Mixed', 'Fine Dining']

function SegmentedControl({
  options,
  value,
  onChange,
  label,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div>
      <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3 antialiased">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt}
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={`px-5 py-2.5 rounded-full text-[15px] font-bold tracking-tight border-2 transition-all shadow-sm antialiased ${
              value === opt
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function calcCostBreakdown(
  budgetMax: number,
  accommodation: string,
  transport: string,
  food: string,
  durationDays: number
) {
  const accMult = { Budget: 0.25, Mid: 0.35, Premium: 0.45, Luxury: 0.55 }[accommodation] ?? 0.35
  const transMult = { Bus: 0.08, Train: 0.12, 'Rental Car': 0.15, Flight: 0.22 }[transport] ?? 0.15
  const foodMult = { 'Street Food': 0.06, Mixed: 0.10, 'Fine Dining': 0.18 }[food] ?? 0.10

  const hotel = Math.round(budgetMax * accMult)
  const transport_ = Math.round(budgetMax * transMult)
  const foodCost = Math.round(budgetMax * foodMult * durationDays)
  const activities = Math.round(budgetMax * 0.12)
  const shopping = Math.round(budgetMax * 0.08)
  const buffer = Math.round(budgetMax * 0.05)
  const tax = Math.round(budgetMax * 0.03)
  const insurance = Math.round(budgetMax * 0.02)
  const total = hotel + transport_ + foodCost + activities + shopping + buffer + tax + insurance

  return { hotel, transport: transport_, food: foodCost, activities, shopping, buffer, tax, insurance, total }
}

export function Step3Budget() {
  const { budgetMin, budgetMax, accommodation, transport, food, durationDays, setBudget, setAccommodation, setTransport, setFood } = useWizardStore()
  const [localMax, setLocalMax] = useState(budgetMax)

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value)
    setLocalMax(v)
    setBudget(budgetMin, v)
  }, [budgetMin, setBudget])

  const breakdown = calcCostBreakdown(localMax, accommodation, transport, food, durationDays)
  const canProceed = localMax > budgetMin

  return (
    <WizardShell canProceed={canProceed}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] mb-2 antialiased">
            Budget & Logistics
          </h2>
          <p className="text-[var(--text-secondary)] text-[18px] font-semibold mb-10 antialiased">Set your spend and preferences — the AI adapts your trip to match.</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Controls */}
            <div className="lg:col-span-3 space-y-10">
              {/* Budget Slider */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] antialiased">Total Budget</p>
                  <motion.span
                    key={localMax}
                    initial={{ scale: 1.1, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[26px] font-black text-[#FC6C26] tracking-tighter"
                  >
                    ₹{localMax.toLocaleString()}
                  </motion.span>
                </div>
                <div className="relative py-2">
                  <input
                    type="range"
                    min={10000}
                    max={500000}
                    step={5000}
                    value={localMax}
                    onChange={handleMaxChange}
                    aria-label="Maximum budget"
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FC6C26 0%, #FC6C26 ${((localMax - 10000) / 490000) * 100}%, #E5E7EB ${((localMax - 10000) / 490000) * 100}%, #E5E7EB 100%)`,
                    }}
                  />
                  <style>{`
                    input[type=range]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      width: 22px; height: 22px;
                      border-radius: 50%;
                      background: #FC6C26;
                      border: 3px solid white;
                      box-shadow: 0 2px 8px rgba(252,108,38,0.4);
                      cursor: grab;
                    }
                    input[type=range]::-webkit-slider-thumb:active { cursor: grabbing; }
                  `}</style>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[var(--text-primary)] mt-2 antialiased">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              {/* Segmented Controls */}
              <div className="space-y-6">
                <SegmentedControl options={ACCOMMODATION_OPTIONS} value={accommodation} onChange={setAccommodation} label="Accommodation" />
                <SegmentedControl options={TRANSPORT_OPTIONS} value={transport} onChange={setTransport} label="Transport" />
                <SegmentedControl options={FOOD_OPTIONS} value={food} onChange={setFood} label="Food Preference" />
              </div>
            </div>

            {/* Right: Live Breakdown Card */}
            <div className="lg:col-span-2">
              <motion.div
                className="sticky top-24 bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-subtle)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] p-7"
                layout
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-emerald-500 text-lg">🤖</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] antialiased">AI Calculates</p>
                    <p className="text-[16px] font-bold text-[var(--text-primary)] antialiased">Cost Breakdown</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {[
                    { label: 'Hotel', value: breakdown.hotel },
                    { label: 'Transport', value: breakdown.transport },
                    { label: 'Food & Dining', value: breakdown.food },
                    { label: 'Activities', value: breakdown.activities },
                    { label: 'Shopping', value: breakdown.shopping },
                    { label: 'Emergency Buffer', value: breakdown.buffer },
                    { label: 'Tax', value: breakdown.tax },
                    { label: 'Insurance', value: breakdown.insurance },
                  ].map(row => (
                    <AnimatePresence key={row.label} mode="wait">
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[15px] font-bold text-[var(--text-primary)] antialiased">{row.label}</span>
                        <motion.span
                          key={row.value}
                          initial={{ opacity: 0.5, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[16px] font-bold text-[var(--text-primary)] antialiased"
                        >
                          ₹{row.value.toLocaleString()}
                        </motion.span>
                      </div>
                    </AnimatePresence>
                  ))}
                </div>

                <div className="p-4 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1 antialiased">Total Projected Spend</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#FC6C26] antialiased">₹</span>
                    <motion.span
                      key={breakdown.total}
                      initial={{ scale: 1.05, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-black tracking-tight text-[var(--text-primary)] antialiased"
                    >
                      {breakdown.total.toLocaleString()}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </WizardShell>
  )
}

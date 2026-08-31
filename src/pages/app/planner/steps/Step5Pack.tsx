/**
 * Step5Pack.tsx — Feature #12: Backpack Space Calculator
 * Knapsack / bin-packing algorithm — pure CS, not ML
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Package, RotateCcw, ArrowRight, Info } from 'lucide-react'
import { computePackingList, type PackingItem } from '../../../services/plannerFeatures'
import { usePlannerStore } from '../../../stores/plannerStore'
import { BackpackVisualizer } from '../../../components/planner/BackpackVisualizer'

const BAG_SIZES = [
  { label: '20L Day Pack', value: 20 },
  { label: '35L Cabin Bag', value: 35 },
  { label: '50L Trek Pack', value: 50 },
  { label: '65L Expedition', value: 65 },
]

const CATEGORY_ICONS: Record<string, string> = {
  clothing: '👕', health: '💊', hygiene: '🧴', electronics: '🔌',
  documents: '📄', gear: '🎒', footwear: '👟', accessories: '🕶️',
}

export function Step5Pack() {
  const { session, packingList, setPackingList, togglePackingItem, setStep, completeStep } = usePlannerStore()

  const [bagSize, setBagSize] = useState(35)
  const [budgetTotal, setBudgetTotal] = useState(0)
  const [generatedWithBag, setGeneratedWithBag] = useState(0)

  useEffect(() => {
    generateList(bagSize)
  }, [])

  const generateList = (newBagSize: number) => {
    const list = computePackingList({
      vibes: session?.vibes ?? ['Heritage'],
      durationDays: session?.durationDays ?? 5,
      bagCapacityLitres: newBagSize,
    })
    setPackingList(list)
    setGeneratedWithBag(newBagSize)
    // Estimate budget
    setBudgetTotal((session?.budgetPerDay ?? 3000) * (session?.durationDays ?? 5))
  }

  const handleBagChange = (size: number) => {
    setBagSize(size)
    generateList(size)
  }

  const checkedCount = packingList?.items.filter(i => i.checked).length ?? 0
  const totalCount = packingList?.items.length ?? 0

  // Group items by category
  const grouped = packingList?.items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const cat = item.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {}) ?? {}

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-black text-[var(--text-primary)]">🎒 Pack & Budget</h2>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">
          Knapsack packing algorithm · Based on your vibes + climate + duration
        </p>
      </div>

      {/* Bag size picker */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-4">
        <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Choose Your Bag</p>
        <div className="grid grid-cols-2 gap-2">
          {BAG_SIZES.map(bag => (
            <button
              key={bag.value}
              onClick={() => handleBagChange(bag.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                bagSize === bag.value
                  ? 'bg-[#FC6C26]/10 border-[#FC6C26] text-[#FC6C26]'
                  : 'bg-gray-50 border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[#FC6C26]/30'
              }`}
            >
              <p className="text-[13px] font-black">{bag.label}</p>
              <p className="text-[11px] mt-0.5">{bag.value}L capacity</p>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: visualizer + stats */}
      {packingList && (
        <div className="grid grid-cols-2 gap-4">
          {/* Backpack SVG */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-4 flex flex-col items-center">
            <BackpackVisualizer
              fillPercent={packingList.fillPercent}
              totalVolumeLitres={packingList.totalVolume}
              bagCapacityLitres={packingList.bagCapacityLitres}
              totalWeightKg={packingList.totalWeight}
            />
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Trip Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--text-muted)]">Duration</span>
                  <span className="text-[12px] font-black text-[var(--text-primary)]">{session?.durationDays ?? 5} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--text-muted)]">Destination</span>
                  <span className="text-[12px] font-black text-[var(--text-primary)]">{session?.destination || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--text-muted)]">Est. Budget</span>
                  <span className="text-[12px] font-black text-[#FC6C26]">₹{budgetTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Packing Progress</p>
              <div className="text-center py-2">
                <span className="text-[28px] font-black text-[var(--text-primary)]">{checkedCount}</span>
                <span className="text-[16px] text-[var(--text-muted)]">/{totalCount}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-[#FC6C26]"
                />
              </div>
              <p className="text-[10px] text-[#9ca3af] text-center">items packed</p>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm note */}
      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-[var(--border-subtle)]">
        <Info size={13} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[var(--text-muted)]">
          {packingList?.algorithm}
        </p>
      </div>

      {/* Packing checklist by category */}
      {packingList && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-black text-[var(--text-primary)]">Packing List</p>
            <button
              onClick={() => generateList(bagSize)}
              className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[#FC6C26] transition-colors"
            >
              <RotateCcw size={12} /> Regenerate
            </button>
          </div>

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <span className="text-lg">{CATEGORY_ICONS[category] ?? '📦'}</span>
                <p className="text-[12px] font-black capitalize text-[var(--text-primary)]">{category}</p>
                <span className="text-[10px] text-[#9ca3af] ml-auto">
                  {items.filter(i => i.checked).length}/{items.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.checked
                        ? 'bg-[#FC6C26] border-[#FC6C26]'
                        : 'border-[var(--border-strong)]'
                    }`}>
                      {item.checked && <Check size={11} strokeWidth={3} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-black transition-all ${item.checked ? 'line-through text-[#9ca3af]' : 'text-[var(--text-primary)]'}`}>
                        {item.name}
                        {item.essential && <span className="ml-1.5 text-[9px] text-[#FC6C26] font-black uppercase">essential</span>}
                      </p>
                      <p className="text-[10px] text-[#9ca3af]">{item.volumeLitres}L · {item.weightKg}kg · {item.reason}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => { completeStep(5); setStep(6) }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FC6C26] to-[#e55a15] text-white font-black text-[15px] shadow-[0_8px_25px_rgba(252,108,38,0.4)] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
      >
        Continue to Review <ArrowRight size={16} />
      </button>
    </div>
  )
}

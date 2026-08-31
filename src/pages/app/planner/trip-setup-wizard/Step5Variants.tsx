// Step5Variants.tsx — Multi-Option Trip Optimizer
// Shows 4 pill-selectable itinerary variants before generating.
// Each variant uses the same engine with different optimization weights.
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWizardStore } from '../../../../stores/wizardStore'
import { useIntelligenceStore } from '../../../../stores/intelligenceStore'
import { WizardShell } from './WizardShell'

export function Step5Variants() {
  const wizard = useWizardStore()
  const { variants, selectedVariant, generateVariants, selectVariant, isGeneratingVariants } = useIntelligenceStore()

  useEffect(() => {
    if (variants.length === 0 && !isGeneratingVariants) {
      generateVariants({
        destination: wizard.destination,
        budgetMin: wizard.budgetMin,
        budgetMax: wizard.budgetMax,
        durationDays: wizard.durationDays,
        transport: wizard.transport,
      })
    }
  }, [])

  const handleSelect = (label: typeof selectedVariant) => {
    if (!label) return
    selectVariant(label)
    wizard.setSelectedVariantLabel(label)
  }

  const selected = variants.find(v => v.label === selectedVariant)

  return (
    <WizardShell canProceed={!!selectedVariant}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse" />
                <span className="text-[12px] font-black tracking-[0.2em] uppercase text-[var(--text-primary)]">Trip Optimizer</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[var(--text-primary)] mb-3 antialiased">
              Choose your style
            </h1>
            <p className="text-[var(--text-secondary)] text-[17px] font-semibold max-w-lg mx-auto leading-relaxed antialiased">
              Same destination, different priorities. Pick one as your starting point — you can refine it later.
            </p>
          </div>

          {/* Variant cards */}
          {isGeneratingVariants ? (
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="bg-[var(--bg-card)] rounded-[24px] p-6 border border-[var(--border-subtle)] animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {variants.map((variant, i) => {
                const isSelected = selectedVariant === variant.label
                return (
                  <motion.button
                    key={variant.label}
                    onClick={() => handleSelect(variant.label)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative text-left p-6 rounded-[24px] border-2 transition-all duration-200 overflow-hidden antialiased ${
                      isSelected ? 'border-[#FC6C26]' : 'border-[var(--border-subtle)] hover:border-[var(--text-primary)]'
                    }`}
                    style={{
                      background: isSelected ? 'var(--text-primary)' : 'var(--bg-card)',
                      boxShadow: isSelected
                        ? '0 16px 40px rgba(252,108,38,0.15)'
                        : '0 4px 16px rgba(0,0,0,0.06)',
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Glow for selected */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC6C26]/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="text-3xl mb-3">{variant.emoji}</div>
                    <p
                      className="text-[18px] font-bold mb-1 antialiased"
                      style={{ color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)' }}
                    >
                      {variant.displayLabel}
                    </p>
                    <p
                      className="text-[13px] font-semibold mb-4 leading-relaxed antialiased"
                      style={{ color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)', opacity: isSelected ? 0.8 : 1 }}
                    >
                      {variant.description}
                    </p>

                    {/* Cost estimate */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold antialiased"
                      style={{
                        background: isSelected ? 'rgba(252,108,38,0.15)' : 'var(--bg-secondary)',
                        color: '#FC6C26',
                      }}
                    >
                      ₹{variant.estimatedCost.toLocaleString()}
                      <span className="opacity-70 font-bold text-[12px] antialiased">est.</span>
                    </div>

                    {/* Highlights */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {variant.highlights.map(h => (
                        <span
                          key={h}
                          className="text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-full antialiased"
                          style={{
                            background: isSelected ? 'rgba(0,0,0,0.05)' : 'var(--bg-secondary)',
                            color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Selected indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: '#FC6C26' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Selected summary */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--bg-card)] rounded-[20px] p-4 border border-[#FC6C26]/20 shadow-sm flex items-center gap-3"
              >
                <span className="text-2xl">{selected.emoji}</span>
                <div>
                  <p className="text-[14px] font-bold text-[var(--text-primary)] antialiased">
                    {selected.displayLabel} selected · {selected.durationDays} days · ~₹{selected.estimatedCost.toLocaleString()}
                  </p>
                  <p className="text-[12px] font-semibold text-[var(--text-secondary)] antialiased">
                    Hit Continue to generate your itinerary with these priorities
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </WizardShell>
  )
}

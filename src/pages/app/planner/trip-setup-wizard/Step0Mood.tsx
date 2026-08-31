// Step0Mood.tsx — Mood-based trip entry point (optional step before destination)
// Maps 7 moods to trip-shape parameters via the MOOD_PARAMS rules table.
// Selecting a mood auto-populates wizard fields — reuses the existing engine.
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useWizardStore } from '../../../../stores/wizardStore'
import { MOOD_PARAMS } from '../../../../services/intelligenceService'

export function Step0Mood() {
  const { mood, setMood, setEntryMode, setTripTypes, setEnergyLevel, nextStep } = useWizardStore()

  const handleMoodSelect = (selectedMood: string) => {
    const params = MOOD_PARAMS.find(m => m.mood === selectedMood)
    if (!params) return

    setMood(selectedMood)
    setEntryMode('mood')
    // Auto-populate wizard from mood params
    setTripTypes(params.trip_types)
    setEnergyLevel(params.energy_level)
  }

  const handleSkip = () => {
    setMood(null)
    setEntryMode('destination')
    nextStep()
  }

  const handleContinue = () => {
    if (mood) nextStep()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse" />
            <span className="text-[12px] font-extrabold tracking-widest uppercase text-[#1B2A4A]">Mood-Based Planning</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-[#1B2A4A] mb-3 leading-tight">
          How are you feeling?
        </h1>
        <p className="text-[var(--text-secondary)] text-[17px] font-bold mb-10 max-w-lg mx-auto leading-relaxed">
          Pick your current mood and we'll shape your trip around it — or skip to choose a destination directly.
        </p>

        {/* Mood Pills */}
        <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto mb-10">
          {MOOD_PARAMS.map((mp) => (
            <motion.button
              key={mp.mood}
              onClick={() => handleMoodSelect(mp.mood)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-[20px] text-[15px] font-extrabold border-2 transition-all duration-200"
              style={{
                background: mood === mp.mood ? '#FC6C26' : 'var(--bg-card)',
                color: mood === mp.mood ? 'white' : '#1B2A4A',
                borderColor: mood === mp.mood ? '#FC6C26' : 'transparent',
                boxShadow: mood === mp.mood
                  ? '0 10px 25px rgba(252,108,38,0.3)'
                  : '0 2px 12px rgba(0,0,0,0.05)',
              }}
              aria-pressed={mood === mp.mood}
            >
              <span className="text-[20px]">{mp.emoji}</span>
              {mp.mood}
            </motion.button>
          ))}
        </div>

        {/* Selected mood description */}
        {mood && (() => {
          const params = MOOD_PARAMS.find(m => m.mood === mood)
          if (!params) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto bg-[var(--bg-card)] rounded-[20px] p-5 border border-[#FC6C26]/20 shadow-lg mb-8"
            >
              <p className="text-[13px] font-extrabold text-[#FC6C26] uppercase tracking-widest mb-2">
                Your {mood} Trip
              </p>
              <p className="text-[15px] font-bold text-[#1B2A4A] mb-3">{params.description}</p>
              <div className="flex flex-wrap gap-2">
                {params.trip_types.map(type => (
                  <span
                    key={type}
                    className="text-[12px] font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: '#FFF5EE', color: '#FC6C26' }}
                  >
                    {type}
                  </span>
                ))}
                <span
                  className="text-[12px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: '#F0FDF4', color: '#16a34a' }}
                >
                  {params.energy_level} pace
                </span>
              </div>
            </motion.div>
          )
        })()}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSkip}
            className="text-[14px] font-extrabold text-[var(--text-muted)] hover:text-[#FC6C26] transition-colors underline underline-offset-4"
          >
            Skip — choose destination instead
          </button>

          {mood && (
            <motion.button
              onClick={handleContinue}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-[16px] text-[15px] font-extrabold text-white transition-all"
              style={{
                background: '#1B2A4A',
                boxShadow: '0 10px 25px rgba(27,42,74,0.3)',
              }}
            >
              Continue to Destination <ArrowRight size={18} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

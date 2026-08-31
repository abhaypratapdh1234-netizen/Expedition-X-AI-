import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, X } from 'lucide-react'
import { tripService } from '../../../services/tripService'
import { placeService } from '../../../services/placeService'
import { pageTransition } from '../../../motion/variants'

export function TripComparison() {
  const [data, setData] = useState<any>(null)
  const [destA, setDestA] = useState<any>(null)
  const [destB, setDestB] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      // Hardcoded destination IDs for comparison simulation
      const [comp, da, db] = await Promise.all([
        tripService.getComparisonData('t1', 't2'),
        placeService.getDestinationById('1'), // Delhi
        placeService.getDestinationById('2'), // Manali
      ])
      setData(comp)
      setDestA(da)
      setDestB(db)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading || !destA || !destB || !data) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading AI comparison...</div>
  }

  const COMPARE_ROWS = [
    { label: 'Cost per day', a: `₹${((destA.avgCost || destA.costPerDay) ?? 0).toLocaleString()}`, b: `₹${((destB.avgCost || destB.costPerDay) ?? 0).toLocaleString()}`, winner: (destA.avgCost || destA.costPerDay) < (destB.avgCost || destB.costPerDay) ? 'a' : 'b' },
    { label: 'Rating', a: `⭐ ${destA.rating}`, b: `⭐ ${destB.rating}`, winner: destA.rating > destB.rating ? 'a' : 'b' },
    { label: 'Best Time', a: destA.bestTime, b: destB.bestTime, winner: null },
    { label: 'Weather', a: data.tripA.weather, b: data.tripB.weather, winner: null },
    { label: 'Activities', a: data.tripA.activitiesCount, b: data.tripB.activitiesCount, winner: data.tripA.activitiesCount > data.tripB.activitiesCount ? 'a' : 'b' },
    { label: 'Flight Time', a: data.tripA.flightTime, b: data.tripB.flightTime, winner: null },
    { label: 'AI Sentiment', a: `${data.tripA.sentiment}% Positive`, b: `${data.tripB.sentiment}% Positive`, winner: data.tripA.sentiment > data.tripB.sentiment ? 'a' : 'b' },
  ]

  const aWins = COMPARE_ROWS.filter(r => r.winner === 'a').length
  const bWins = COMPARE_ROWS.filter(r => r.winner === 'b').length

  const slideLeft: any = { hidden: { x: -50, opacity: 0 }, show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } } }
  const slideRight: any = { hidden: { x: 50, opacity: 0 }, show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } } }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-hidden">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1 text-text-primary">Trip Comparison</h1>
        <p className="text-text-muted">Compare two destinations side by side with AI insights.</p>
      </div>

      {/* Destination Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-6 mb-8 items-center">
        <motion.div variants={slideLeft} initial="hidden" animate="show" className="rounded-2xl overflow-hidden shadow-card border border-border-subtle group">
          <div className="relative h-32 sm:h-48 overflow-hidden">
            <img src={destA.imageUrl || destA.image} alt={destA.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display leading-tight text-shadow-hero">{destA.name}</h2>
              <p className="text-white/95 text-xs hidden sm:block font-medium text-shadow-subtle">{destA.state}</p>
            </div>
          </div>
          <div className="p-3 text-center bg-bg-card border-t border-border-subtle">
            <motion.div key={aWins} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl sm:text-3xl font-bold font-display text-teal-600 dark:text-teal-400">{aWins}</motion.div>
            <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">Advantages</div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center relative z-10 mx-2">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg bg-bg-card border-2 border-border-default text-text-muted shadow-lg">
            VS
          </motion.div>
        </div>

        <motion.div variants={slideRight} initial="hidden" animate="show" className="rounded-2xl overflow-hidden shadow-card border border-border-subtle group">
          <div className="relative h-32 sm:h-48 overflow-hidden">
            <img src={destB.imageUrl || destB.image} alt={destB.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center sm:text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display leading-tight text-shadow-hero">{destB.name}</h2>
              <p className="text-white/95 text-xs hidden sm:block font-medium text-shadow-subtle">{destB.state}</p>
            </div>
          </div>
          <div className="p-3 text-center bg-bg-card border-t border-border-subtle">
            <motion.div key={bWins} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl sm:text-3xl font-bold font-display text-violet-600 dark:text-violet-400">{bWins}</motion.div>
            <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">Advantages</div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-card bg-bg-card">
        {COMPARE_ROWS.map((row, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.3 }}
            key={row.label}
            className="grid grid-cols-[1fr_auto_1fr] items-center transition-colors hover:bg-bg-secondary group"
            style={{ borderBottom: i === COMPARE_ROWS.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}
          >
            <div className={`px-4 py-4 flex items-center justify-between ${row.winner === 'a' ? 'bg-teal-500/5' : ''}`}>
              <span className={`text-sm sm:text-base font-semibold ${row.winner === 'a' ? 'text-teal-700 dark:text-teal-400' : 'text-text-primary'}`}>{row.a}</span>
              {row.winner === 'a' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full flex items-center justify-center bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400 shrink-0 shadow-sm ml-2">
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </div>
            
            <div className="px-4 py-4 text-center border-x border-border-subtle w-24 sm:w-32 bg-bg-secondary/50">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">{row.label}</span>
            </div>
            
            <div className={`px-4 py-4 flex items-center justify-between ${row.winner === 'b' ? 'bg-violet-500/5' : ''}`}>
              {row.winner === 'b' ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full flex items-center justify-center bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400 shrink-0 shadow-sm mr-2">
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              ) : <div className="w-6 h-6 shrink-0 mr-2" />}
              <span className={`text-sm sm:text-base font-semibold text-right w-full ${row.winner === 'b' ? 'text-violet-700 dark:text-violet-400' : 'text-text-primary'}`}>{row.b}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Verdict */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="mt-8 p-6 rounded-2xl relative overflow-hidden shadow-lg border border-teal-500/30"
        style={{ background: 'linear-gradient(135deg, var(--teal-900), var(--violet-900))' }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Check size={100} className="text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-teal-300 mb-2 uppercase tracking-widest flex items-center gap-2">
            🤖 AI VERDICT
          </p>
          <p className="text-white/90 font-medium text-base sm:text-lg leading-relaxed max-w-3xl">
            {aWins > bWins
              ? `${destA.name} wins overall for budget travelers and history lovers. It has a significantly higher AI Sentiment score and more activities per day.`
              : `${destB.name} edges out based on your preference for nature and adventure. Choose ${destA.name} if you're strictly optimizing for budget.`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Plus, Trash2, Sparkles, Check, Package } from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { useThemeStore } from '../../../stores/themeStore'
import { pageTransition, itemPop, staggerContainer } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

export function PackingChecklist() {
  const { currentTrip, fetchUserTrips, trips, fetchTripById } = useTripStore()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  const isMonochrome = theme === 'monochrome'
  
  const [categories, setCategories] = useState<Record<string, string[]>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (trips.length === 0) {
      fetchUserTrips()
    }
  }, [fetchUserTrips, trips.length])

  useEffect(() => {
    if (!currentTrip && trips.length > 0) {
      const upcoming = trips.find(t => t.status === 'upcoming') || trips[0]
      if (upcoming) fetchTripById(upcoming.id)
    }
  }, [currentTrip, trips, fetchTripById])

  useEffect(() => {
    async function generateChecklist() {
      setIsLoading(true)
      try {
        
        setCategories({
          '👕 Clothing': ['T-shirts (3-4)', 'Jeans/Pants', 'Jacket/Sweater', 'Comfortable Shoes', 'Sandals', 'Undergarments'],
          '🧴 Toiletries': ['Toothbrush & Paste', 'Sunscreen SPF50+', 'Shampoo', 'Moisturizer', 'Hand Sanitizer'],
          '📱 Electronics': ['Phone Charger', 'Power Bank', 'Headphones', 'Camera', 'Travel Adapter'],
          '💊 Health': ['Personal Medications', 'First Aid Kit', 'ORS Packets', 'Pain Relievers'],
          '📄 Documents': ['Aadhaar/Passport', 'E-Tickets', 'Hotel Vouchers', 'Travel Insurance'],
          '✨ AI Recommendations': ['Raincoat (Expected rain)', 'Mosquito Repellent (Tropical area)', 'Reusable Water Bottle']
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (currentTrip) {
      generateChecklist()
    }
  }, [currentTrip])

  const toggle = (item: string) => setChecked(prev => ({ ...prev, [item]: !prev[item] }))

  if (isLoading || Object.keys(categories).length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-4 text-teal-500">
          <Sparkles size={32} />
        </motion.div>
        <p className="text-[var(--text-muted)] font-bold tracking-wide uppercase text-sm">Generating your personalized packing list...</p>
      </div>
    )
  }

  const allItems = Object.values(categories).flat()
  const totalChecked = allItems.filter(item => checked[item]).length
  const progress = Math.round((totalChecked / allItems.length) * 100) || 0

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-6xl md:text-7xl mb-3 text-[var(--text-primary)] font-bold tracking-tight antialiased">Packing Checklist</h1>
        <p className="text-[var(--text-secondary)] text-[18px] font-bold antialiased mt-2">AI-tailored for your upcoming trip to <span className="text-[var(--text-primary)] font-bold">{currentTrip?.destinations[0] || 'your destination'}</span>.</p>
      </div>
      
      <ToolkitTabs />

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM 10,000 BILLION DOLLAR PROGRESS BAR
      ══════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="p-8 rounded-[32px] mb-10 relative overflow-hidden group"
        style={{
          background: 'var(--bg-card)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255, 255, 255, 1)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex justify-between items-end mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-teal-500" />
              <span className="font-bold antialiased text-[16px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Overall Progress</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold antialiased text-[var(--text-primary)]">{progress}% Packed</h2>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold antialiased text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)]" style={{ background: 'var(--bg-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <Check size={18} className="text-teal-500 stroke-[3]" />
              {totalChecked} / {allItems.length} ITEMS
            </span>
          </div>
        </div>

        {/* The Luxury Neon Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden relative z-10" style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <motion.div 
            className="h-full rounded-full relative"
            style={{ 
              background: isDark || isLight || isMonochrome ? 'var(--text-primary)' : 'linear-gradient(90deg, #0f766e, #14b8a6, #8b5cf6, #3b82f6)',
              backgroundSize: '200% 100%',
              boxShadow: isDark || isLight || isMonochrome ? '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)' : '0 4px 10px rgba(20,184,166,0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
            }}
            animate={{ 
              width: `${progress}%`,
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
            }} 
            transition={{ 
              width: { type: 'spring', stiffness: 50, damping: 15 },
              backgroundPosition: { repeat: Infinity, duration: 5, ease: 'linear' }
            }} 
          >
            {/* Glossy reflection line */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {progress === 100 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }} 
              className="flex items-center justify-center gap-3 p-4 rounded-[20px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05))', border: '1px solid rgba(20, 184, 166, 0.2)' }}
            >
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <CheckCircle size={24} className="text-teal-500" />
              </motion.div>
              <p className="text-[15px] font-bold antialiased text-teal-400 tracking-wider">
                FULLY PACKED & READY FOR THE ADVENTURE! 🚀
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM CATEGORY CARDS
      ══════════════════════════════════════════════ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(categories).map(([category, items], i) => {
          const isAi = category.includes('AI')
          const catChecked = items.filter(i => checked[i]).length
          const isCatComplete = catChecked === items.length && items.length > 0

          return (
            <motion.div 
              key={category} 
              variants={itemPop} 
              className="rounded-[28px] overflow-hidden transition-all duration-500 flex flex-col"
              style={{
                background: 'var(--bg-card)',
                boxShadow: isCatComplete 
                  ? '0 15px 40px rgba(20,184,166,0.1), inset 0 2px 4px rgba(255, 255, 255, 1)' 
                  : isAi 
                    ? '0 20px 50px rgba(139,92,246,0.1), inset 0 2px 4px rgba(255, 255, 255, 1)' 
                    : '0 10px 30px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255, 255, 255, 1)',
                border: isCatComplete 
                  ? '1px solid #99f6e4' 
                  : isAi 
                    ? '1px solid #ddd6fe' 
                    : '1px solid rgba(0,0,0,0.04)'
              }}
            >
              {/* Card Header */}
              <div 
                className="flex items-center justify-between px-6 py-5 relative overflow-hidden"
                style={{ 
                  background: isAi 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))' 
                    : isCatComplete 
                      ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05))' 
                      : 'var(--bg-card)',
                  borderBottom: `1px solid ${isAi ? 'rgba(139, 92, 246, 0.2)' : isCatComplete ? 'rgba(20, 184, 166, 0.2)' : 'var(--border-subtle)'}` 
                }}
              >
                {/* Header background glow */}
                {isAi && <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />}
                
                <div className="flex items-center gap-3 relative z-10">
                  {isAi && (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                      <Sparkles size={18} className="text-violet-500 drop-shadow-sm" />
                    </motion.div>
                  )}
                  <span className={`font-bold antialiased text-[22px] tracking-tight ${isAi ? 'text-violet-400' : isCatComplete ? 'text-teal-400' : 'text-[var(--text-primary)]'}`}>
                    {category}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  {isCatComplete && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-teal-900/50 p-1 rounded-full border border-teal-500/30">
                      <Check size={12} className="text-teal-400 stroke-[3]" />
                    </motion.div>
                  )}
                  <span className={`text-[15px] font-bold antialiased px-3 py-1.5 rounded-lg ${
                    isCatComplete ? 'bg-teal-600 text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-sm border border-[var(--border-subtle)]'
                  }`}>
                    {catChecked}/{items.length}
                  </span>
                </div>
              </div>

              {/* Card List Items */}
              <div className="divide-y divide-[rgba(0,0,0,0.03)] bg-[var(--bg-card)] p-2 flex-1">
                {items.map(item => (
                  <motion.div 
                    key={item} 
                    whileHover={{ scale: 1.01, backgroundColor: 'var(--bg-card)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-colors group"
                    onClick={() => toggle(item)}
                  >
                    {/* Checkbox */}
                    <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                      <motion.div
                        initial={false}
                        animate={{ scale: checked[item] ? 1 : 0, opacity: checked[item] ? 1 : 0 }}
                        className="absolute"
                      >
                        <CheckCircle size={24} className="text-teal-600 fill-teal-100 drop-shadow-md" strokeWidth={2.5} />
                      </motion.div>
                      <motion.div
                        initial={false}
                        animate={{ scale: checked[item] ? 0 : 1, opacity: checked[item] ? 0 : 1 }}
                      >
                        <Circle size={24} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                    
                    {/* Text */}
                    <span 
                      className="text-[18px] font-bold antialiased transition-all duration-300 select-none" 
                      style={{
                        color: checked[item] ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: checked[item] ? 'line-through' : 'none'
                      }}
                    >
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

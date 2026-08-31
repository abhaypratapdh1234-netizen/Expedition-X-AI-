import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Ticket, Sparkles, Filter, Navigation } from 'lucide-react'
import { toolkitService } from '../../../services/toolkitService'
import { useTripStore } from '../../../stores/tripStore'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

export function LocalEvents() {
  const { currentTrip, fetchUserTrips, trips, fetchTripById } = useTripStore()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (trips.length === 0) fetchUserTrips()
  }, [fetchUserTrips, trips.length])

  useEffect(() => {
    if (!currentTrip && trips.length > 0) {
      const upcoming = trips.find(t => t.status === 'upcoming') || trips[0]
      if (upcoming) fetchTripById(upcoming.id)
    }
  }, [currentTrip, trips, fetchTripById])

  useEffect(() => {
    async function load() {
      if (!currentTrip) return
      setIsLoading(true)
      try {
        const dest = currentTrip.destinations[0] || 'Delhi'
        const startMonth = new Date(currentTrip.startDate).getMonth() + 1
        const data = await toolkitService.getLocalEvents(dest, startMonth)
        setEvents(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [currentTrip])

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))]
  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter)

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-6xl md:text-7xl mb-3 text-text-primary font-black tracking-tight">Local Events</h1>
        <p className="text-[18px] font-black text-text-muted mt-2">Discover what's happening at your destination right now.</p>
      </div>

      <ToolkitTabs />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(cat => (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-xl text-[14px] font-black border shrink-0 transition-colors shadow-sm ${filter === cat ? 'bg-teal-600 text-white border-teal-600' : 'bg-bg-card text-text-secondary border-border-default hover:bg-bg-secondary'}`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-bg-card border border-border-subtle skeleton" />)
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((event) => (
              <motion.div key={event.id} layout variants={itemPop} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 bg-bg-card border border-border-subtle shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  
                  {/* Category Accent Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                  <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center text-3xl shrink-0 shadow-inner border border-border-default group-hover:scale-105 transition-transform">
                    {event.emoji || '🎉'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-black text-[22px] text-text-primary leading-tight">{event.name}</h3>
                        <span className="inline-block mt-2 px-3 py-1 rounded-md text-[12px] font-black uppercase tracking-widest bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                          {event.category}
                        </span>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="font-black text-[20px] text-amber-500 tracking-tight">{event.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-4 text-[14px] text-text-muted font-black">
                      <span className="flex items-center gap-2 bg-bg-secondary px-4 py-2 rounded-lg border border-border-default w-max">
                        <Calendar size={16} className="text-teal-600" /> {event.date}
                      </span>
                      <span className="flex items-center gap-2 bg-bg-secondary px-4 py-2 rounded-lg border border-border-default w-max group-hover:border-violet-500/30 transition-colors">
                        <MapPin size={16} className="text-violet-600" /> {event.location}
                      </span>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-black text-white shadow-sm" style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))' }}>
                        <Ticket size={18} /> Get Tickets
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-black border border-border-default text-text-secondary bg-bg-card hover:bg-bg-secondary transition-colors">
                        <Navigation size={18} /> Directions
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
      
      {/* AI Suggestion */}
      {!isLoading && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-[14px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">AI Event Match</p>
            <p className="text-[16px] text-text-secondary leading-relaxed font-black">Based on your itinerary, the <strong className="font-black text-text-primary">{filtered[0].name}</strong> perfectly aligns with your free afternoon on {filtered[0].date.split(',')[0]}. It's only 15 mins away from your hotel!</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

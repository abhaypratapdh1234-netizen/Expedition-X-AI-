import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Heart, Share2, Download, Plus, Filter, Grid, BookOpen, Sparkles, Video, PlayCircle } from 'lucide-react'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { aiService } from '../../../services/aiService'
import { MemoryTimeline } from '../../../components/planner/MemoryTimeline'
import { MemoryTagger } from '../../../components/planner/MemoryTagger'
import { useInfrastructureStore } from '../../../stores/infrastructureStore'

const MEMORY_PHOTOS = [
  { id: 'm1', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format', place: 'Red Fort', date: 'Aug 11, 2026', liked: true, width: 2, height: 2 },
  { id: 'm2', url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=600&auto=format', place: 'India Gate', date: 'Aug 11, 2026', liked: false, width: 1, height: 1 },
  { id: 'm3', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format', place: 'Qutub Minar', date: 'Aug 12, 2026', liked: true, width: 1, height: 2 },
  { id: 'm4', url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&auto=format', place: 'Lotus Temple', date: 'Aug 12, 2026', liked: false, width: 2, height: 1 },
  { id: 'm5', url: 'https://images.unsplash.com/photo-1534759926762-58c6459fd4b5?w=600&auto=format', place: 'Old Delhi', date: 'Aug 11, 2026', liked: true, width: 1, height: 1 },
  { id: 'm6', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format', place: 'Humayun\'s Tomb', date: 'Aug 12, 2026', liked: false, width: 1, height: 1 },
]

// Trip stops for Memory Timeline
const TRIP_STOPS = [
  { id: 'stop-1', name: 'Red Fort', date: 'Aug 11', placeId: 'delhi-red-fort' },
  { id: 'stop-2', name: 'India Gate', date: 'Aug 11', placeId: 'delhi-india-gate' },
  { id: 'stop-3', name: 'Old Delhi', date: 'Aug 11', placeId: 'delhi-old-delhi' },
  { id: 'stop-4', name: 'Qutub Minar', date: 'Aug 12', placeId: 'delhi-qutub-minar' },
  { id: 'stop-5', name: 'Lotus Temple', date: 'Aug 12', placeId: 'delhi-lotus-temple' },
  { id: 'stop-6', name: "Humayun's Tomb", date: 'Aug 12', placeId: 'delhi-humayun-tomb' },
]

export function TripMemories() {
  const [likes, setLikes] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMORY_PHOTOS.map(p => [p.id, p.liked]))
  )
  const [view, setView] = useState<'grid' | 'diary'>('grid')
  const [isGenerating, setIsGenerating] = useState(false)
  const [recapGenerated, setRecapGenerated] = useState(false)
  const [selectedStopForTag, setSelectedStopForTag] = useState<typeof TRIP_STOPS[0] | null>(null)
  const { loadTripMemories } = useInfrastructureStore()

  const tripId = 'trip-delhi-2026'

  useEffect(() => {
    loadTripMemories(tripId)
  }, [])

  const toggleLike = (id: string) => setLikes(prev => ({ ...prev, [id]: !prev[id] }))
  const likedCount = Object.values(likes).filter(Boolean).length

  const handleGenerateRecap = async () => {
    setIsGenerating(true)
    setRecapGenerated(true)
    setIsGenerating(false)
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1 text-text-primary">Trip Memories</h1>
          <p className="text-text-muted">Delhi Adventure · {MEMORY_PHOTOS.length} photos · {likedCount} favorites</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden border border-border-default bg-bg-secondary p-1">
            {[{ v: 'grid' as const, I: Grid }, { v: 'diary' as const, I: BookOpen }].map(({ v, I }) => (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                key={v} 
                onClick={() => setView(v)} 
                className={`px-3 py-1.5 rounded-lg transition-colors ${view === v ? 'bg-bg-card shadow-sm text-teal-600 dark:text-teal-400' : 'text-text-muted hover:text-text-primary'}`}
              >
                <I size={16} />
              </motion.button>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-border-default bg-bg-card text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <Plus size={16} /> Add
          </motion.button>
        </div>
      </div>

      {/* Memory Weight™ — Timeline */}
      <div className="mb-8">
        <MemoryTimeline 
          tripId={tripId} 
          stops={TRIP_STOPS} 
          activeStopId={selectedStopForTag?.id}
          onStopSelect={(stopId) => {
            const stop = TRIP_STOPS.find(s => s.id === stopId)
            setSelectedStopForTag(stop || null)
          }}
        />
      </div>

      {view === 'grid' ? (
        <>
          {/* AI Highlights Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="p-1 rounded-2xl mb-8 relative overflow-hidden group shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--violet-600))' }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10 bg-bg-card/95 backdrop-blur-md p-5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-5 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-base">AI Travel Recap</p>
                  <p className="text-text-muted text-sm mt-0.5">Generate a cinematic highlight reel from your best photos.</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleGenerateRecap}
                disabled={isGenerating || recapGenerated}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-80"
                style={{ background: recapGenerated ? 'var(--success)' : 'linear-gradient(135deg, var(--violet-600), var(--fuchsia-600))' }}
              >
                {isGenerating ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={16} /></motion.div> Generating...</>
                ) : recapGenerated ? (
                  <><PlayCircle size={16} /> Watch Recap</>
                ) : (
                  <><Video size={16} /> Generate Reel</>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Masonry-style Grid */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px]">
            {MEMORY_PHOTOS.map((photo, i) => {
              // Custom span calculation for faux masonry
              const colSpan = photo.width === 2 ? 'col-span-2' : 'col-span-1'
              const rowSpan = photo.height === 2 ? 'row-span-2' : 'row-span-1'
              
              return (
                <motion.div
                  key={photo.id}
                  variants={itemPop}
                  className={`relative rounded-2xl overflow-hidden group shadow-sm border border-border-subtle ${colSpan} ${rowSpan}`}
                >
                  <img src={photo.url} alt={photo.place} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleLike(photo.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all bg-black/30 backdrop-blur-md hover:bg-black/50 z-10"
                  >
                    <Heart size={16} className={likes[photo.id] ? 'fill-red-500 text-red-500' : 'text-white'} />
                  </motion.button>

                  <div className="absolute bottom-3 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-bold font-display leading-tight">{photo.place}</p>
                    <p className="text-white/80 text-xs mt-0.5">{photo.date}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      ) : (
        /* Diary View */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-10">
          {['Aug 11', 'Aug 12'].map((date, di) => (
            <div key={date} className="relative pl-8 sm:pl-12 border-l-2 border-border-subtle">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-teal-600 border-4 border-bg-primary shadow-sm" />
              
              <h3 className="font-display text-2xl mb-4 text-text-primary">{date}, 2026</h3>
              
              <div className="p-6 rounded-2xl mb-6 bg-bg-card border border-border-subtle shadow-sm relative">
                <BookOpen size={24} className="absolute top-6 right-6 text-border-default opacity-20" />
                <p className="text-sm leading-relaxed text-text-secondary italic">
                  {di === 0
                    ? "Today was absolutely incredible. Started at the magnificent Red Fort — the history and grandeur is unreal. Chandni Chowk's narrow lanes and the famous chole bhature at Ram Ji was a food lover's paradise."
                    : "Our last day in Delhi was bittersweet. Qutub Minar's ancient stone work left us speechless. The Lotus Temple at dusk was serene and peaceful — a perfect way to end our adventure."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MEMORY_PHOTOS.slice(di * 3, di * 3 + 3).map(photo => (
                  <motion.div key={photo.id} whileHover={{ scale: 1.05 }} className="rounded-xl overflow-hidden aspect-square shadow-sm border border-border-subtle cursor-pointer relative group">
                    <img src={photo.url} alt={photo.place} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-10 max-w-2xl mx-auto">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold border border-border-default bg-bg-card text-text-primary hover:bg-bg-secondary transition-colors shadow-sm">
          <Download size={16} /> Save Album
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))' }}>
          <Share2 size={16} /> Share Link
        </motion.button>
      </div>

      {/* Memory Weight™ — Tag Your Stops */}
      <div className="mt-10 space-y-4">
        <h3 className="text-lg font-bold text-text-primary">Tag Your Memories</h3>
        <p className="text-sm text-text-muted mb-4">Select a stop to tag with emotional weights — what did each place mean to you?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TRIP_STOPS.map(stop => (
            <motion.button
              key={stop.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStopForTag(selectedStopForTag?.id === stop.id ? null : stop)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selectedStopForTag?.id === stop.id
                  ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))'
                  : 'var(--bg-secondary)',
                color: selectedStopForTag?.id === stop.id ? '#ec4899' : 'var(--text-secondary)',
                border: `1px solid ${selectedStopForTag?.id === stop.id ? 'rgba(236, 72, 153, 0.3)' : 'var(--border-subtle)'}`,
              }}
            >
              📍 {stop.name}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {selectedStopForTag && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <MemoryTagger
                tripId={tripId}
                placeId={selectedStopForTag.placeId}
                placeName={selectedStopForTag.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}


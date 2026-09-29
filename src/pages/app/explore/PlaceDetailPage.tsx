import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { buttonInteraction, cardInteraction, iconButtonInteraction } from '../../../motion/variants'
import { MapPin, Star, Clock, DollarSign, Heart, Plus, Shield, ArrowRight, ChevronLeft, Cloud, CheckCircle, Navigation, AlertTriangle, Sparkles } from 'lucide-react'
import { placeService } from '../../../services/placeService'
import { aiService } from '../../../services/aiService'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { pageTransition, staggerContainer, itemPop, cardHover } from '../../../motion/variants'
import { springSnappy } from '../../../motion/tokens'
import { LocalTimeWidget } from '../../../components/widgets/LocalTimeWidget'
import { MegaGallery } from '../../../components/gallery/MegaGallery'
import { CrowdForecast } from '../../../components/planner/CrowdForecast'
import { QuietScore } from '../../../components/planner/QuietScore'
import { DestinationExplanation } from './DestinationExplanation'

export function PlaceDetailPage() {
  const { id } = useParams()
  const { savedPlaceIds, toggleSaved } = useWishlistStore()
  
  const [dest, setDest] = useState<any>(null)
  const [safety, setSafety] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [costConfidence, setCostConfidence] = useState<any>(null)
  const [transport, setTransport] = useState<any>(null)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'food' | 'reviews'>('overview')
  const [addedToTrip, setAddedToTrip] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setIsLoading(true)
      try {
        const d = await placeService.getDestinationById(id)
        if (!d) throw new Error('Not found')
        setDest(d)
        
        // Fetch parallel async data
        const [safe, wthr, cost, trans] = await Promise.all([
          placeService.getSafetyAdvisory(d.name),
          aiService.getWeatherSuggestions(String(d.id)),
          aiService.getCostConfidence({ totalEstimate: (d.avgCost || 2500) * 5 }),
          placeService.getNearbyTransport(d.latitude, d.longitude)
        ])
        
        setSafety(safe)
        setWeather(wthr)
        setCostConfidence(cost)
        setTransport(trans)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading || !dest) return <div className="p-8 text-center text-text-muted animate-pulse">Loading destination details...</div>

  const isSaved = savedPlaceIds.includes(dest.id)
  const TABS = ['overview', 'hotels', 'food', 'reviews'] as const

  const MOCK_REVIEWS = [
    { name: 'Rahul K.', rating: 5, text: 'Absolutely stunning! The historical significance is incredible.', date: '2 days ago', sentiment: 'Positive', score: 95 },
    { name: 'Meera S.', rating: 4, text: 'Worth visiting. Get there early to avoid crowds.', date: '1 week ago', sentiment: 'Positive', score: 82 },
    { name: 'Amit R.', rating: 3, text: 'Bit crowded on weekends. Morning visits are best.', date: '2 weeks ago', sentiment: 'Neutral', score: 60 },
  ]

  const handleAddItinerary = () => {
    if (!isSaved) {
      toggleSaved(dest.id)
    }
    setAddedToTrip(true)
    setTimeout(() => setAddedToTrip(false), 2000)
  }

  const getFoodForCity = (city: string) => {
    const map: Record<string, any[]> = {
      'Delhi': [{name:'Chole Bhature', emoji:'🥘', price:'₹120'}, {name:'Butter Chicken', emoji:'🍛', price:'₹350'}, {name:'Paratha', emoji:'🥙', price:'₹80'}, {name:'Jalebi', emoji:'🥨', price:'₹50'}],
      'Mumbai': [{name:'Vada Pav', emoji:'🍔', price:'₹20'}, {name:'Pav Bhaji', emoji:'🥘', price:'₹150'}, {name:'Pani Puri', emoji:'🥙', price:'₹40'}, {name:'Filter Coffee', emoji:'☕', price:'₹30'}],
      'Goa': [{name:'Fish Curry', emoji:'🍲', price:'₹300'}, {name:'Prawns', emoji:'🍤', price:'₹400'}, {name:'Bebinca', emoji:'🍰', price:'₹150'}, {name:'Mocktail', emoji:'🍹', price:'₹200'}],
    }
    return map[city] || [
      { name: 'Local Thali', emoji: '🍛', price: '₹150' },
      { name: 'Street Snacks', emoji: '🥟', price: '₹50' },
      { name: 'Traditional Sweets', emoji: '🍯', price: '₹80' },
      { name: 'Specialty Tea', emoji: '☕', price: '₹30' },
    ]
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-24 lg:pb-8">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-black">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.8 }}
          src={dest.imageUrl || dest.image} alt={dest.name} className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Back Button */}
        <Link to="/app/explore"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60">
          <ChevronLeft size={16} /> Back
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleSaved(dest.id)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60">
            <Heart size={18} className={isSaved ? 'fill-red-500 text-red-500' : 'text-white'} />
          </motion.button>
        </div>

        {/* Destination Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-4xl font-bold text-white font-display tracking-tight text-shadow-hero">{dest.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-white/95 text-sm font-semibold text-shadow-subtle">
                  <MapPin size={16} /> {dest.state}, {dest.country}
                </span>
                <span className="flex items-center gap-1 text-white/95 text-sm font-semibold text-shadow-subtle">
                  <Star size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-md" /> {dest.rating}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Intelligence Banner */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} 
          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Weather Widget */}
          {weather && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle shadow-card">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] text-blue-500 flex items-center justify-center text-xl">
                {weather.monthlyData?.[0]?.icon || '⛅'}
              </div>
              <div>
                <p className="text-xs text-text-muted">Best Time</p>
                <p className="font-semibold text-sm text-text-primary">{dest.bestTime}</p>
              </div>
            </div>
          )}

          {/* Safety Widget */}
          {safety && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle shadow-card">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${safety.level === 'Safe' ? 'bg-green-50 text-green-500' : 'bg-[var(--bg-card)] text-orange-500'}`}>
                {safety.level === 'Safe' ? <Shield size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <p className="text-xs text-text-muted">AI Safety Score</p>
                <p className={`font-semibold text-sm ${safety.level === 'Safe' ? 'text-green-600' : 'text-orange-600'}`}>
                  {safety.score}/100 - {safety.level}
                </p>
              </div>
            </div>
          )}

          {/* AI Cost Widget */}
          {costConfidence && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle shadow-card">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] text-amber-500 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted">Est. 5-Day Cost (AI)</p>
                <div className="flex items-end justify-between">
                  <p className="font-semibold text-sm text-text-primary">₹{costConfidence.mostLikely?.toLocaleString() ?? 0}</p>
                  <span className="text-[10px] bg-bg-secondary px-1.5 py-0.5 rounded text-text-muted">
                    {costConfidence.confidenceScore * 100}% conf.
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <motion.button
            {...buttonInteraction}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddItinerary}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md relative overflow-hidden flex-1 sm:flex-none justify-center ${addedToTrip ? 'bg-gradient-to-br from-teal-500 to-teal-400 text-white' : 'bg-gradient-to-br from-gray-900 to-black dark:from-teal-600 dark:to-teal-800 text-white'}`}
          >
            <AnimatePresence mode="wait">
              {addedToTrip ? (
                <motion.div key="check" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="flex items-center gap-2">
                  <CheckCircle size={18} /> Added to Itinerary
                </motion.div>
              ) : (
                <motion.div key="plus" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="flex items-center gap-2">
                  <Plus size={18} /> Add to Itinerary
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <Link to={`/app/planner/map?lat=${dest.latitude}&lng=${dest.longitude}&name=${encodeURIComponent(dest.name)}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border-default bg-bg-card text-text-primary hover:bg-bg-secondary transition-colors flex-1 sm:flex-none">
            <Navigation size={18} /> Map
          </Link>
        </div>



        {/* Tab Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Premium World-Class Overview Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group border border-border-subtle bg-bg-card/40 backdrop-blur-3xl overflow-hidden"
                  >
                    {/* Animated gradient background mesh */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    
                    {/* Glowing accent border */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-400 rounded-l-[2rem] shadow-[0_0_15px_rgba(20,184,166,0.3)]"></div>
                    
                    <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative z-10">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/60 group-hover:scale-110 transition-transform duration-500">
                          <Sparkles size={26} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="pt-1">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-500 mb-3 tracking-tight">
                          The Essence of {dest.name}
                        </h3>
                        <div className="relative">
                          <span className="absolute -top-4 -left-3 text-5xl font-serif text-teal-600/10 leading-none">"</span>
                          <p className="text-base sm:text-[1.05rem] leading-[1.8] text-text-secondary font-medium tracking-wide">
                            {dest.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Detailed Explanation & Interesting Facts */}
                  <DestinationExplanation placeName={dest.name} />

                  {/* Mega Gallery */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-500 mb-3 tracking-tight">
                      Photo Gallery
                    </h3>
                    <MegaGallery placeId={dest.id} placeName={dest.name} />
                  </div>

                  {/* Infrastructure Intelligence Layer */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Future Crowd Map™ */}
                    <CrowdForecast
                      placeId={String(dest.id)}
                      placeName={dest.name}
                      placeCategory={dest.category || 'attraction'}
                    />

                    {/* Quiet Tourism™ */}
                    <QuietScore
                      placeId={String(dest.id)}
                      placeCategory={dest.category || 'default'}
                    />
                  </div>
                </div>
              )}


            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

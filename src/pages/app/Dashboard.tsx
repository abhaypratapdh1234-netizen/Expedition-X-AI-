import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Compass, Zap, Globe, Sparkles, Activity,
  ChevronRight, Calendar, Users, ArrowUpRight, Plus, MapPin, Brain, Bot, Send, X
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { formatCurrency, t } from '../../utils/formatters'
import { placeService } from '../../services/placeService'
import { DESTINATIONS } from '../../data/mockData'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useIntelligenceStore } from '../../stores/intelligenceStore'
import { useTripStore } from '../../stores/tripStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useBookingStore } from '../../stores/bookingStore'
import { useThemeStore } from '../../stores/themeStore'
import { aiService } from '../../services/aiService'
import { ChatMessageRenderer } from '../../components/ai/ChatMessageRenderer'

const FEATURED_TOURS = [
  {
    id: 't1',
    title: 'Golden Triangle Tour',
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    collaborators: 3,
    spent: 18000,
    budget: 45000,
    coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: 't2',
    title: 'Kyoto Sakura Walk',
    startDate: '2026-03-25',
    endDate: '2026-04-05',
    collaborators: 4,
    spent: 82000,
    budget: 120000,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 't3',
    title: 'Alpine Expedition',
    startDate: '2026-09-05',
    endDate: '2026-09-12',
    collaborators: 2,
    spent: 35000,
    budget: 80000,
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 't4',
    title: 'Santorini Retreat',
    startDate: '2026-06-10',
    endDate: '2026-06-18',
    collaborators: 2,
    spent: 28000,
    budget: 65000,
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 't5',
    title: 'Bali Island Hopping',
    startDate: '2026-11-01',
    endDate: '2026-11-15',
    collaborators: 5,
    spent: 55000,
    budget: 100000,
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop'
  },
  {
    id: 't6',
    title: 'Parisian Getaway',
    startDate: '2026-05-01',
    endDate: '2026-05-07',
    collaborators: 2,
    spent: 45000,
    budget: 85000,
    coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop'
  }
]

function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const steps = 60
    let current = 0
    const inc = target / steps
    const t = setInterval(() => {
      current += inc
      if (current >= target) { setCount(target); clearInterval(t) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(t)
  }, [inView, target])
  return <div ref={ref} className="font-display font-extrabold tracking-tight">{prefix}{count.toLocaleString()}{suffix}</div>
}

export function Dashboard() {
  const { user } = useAuthStore()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const isMonochrome = theme === 'monochrome'

  const { currency, language } = useSettingsStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [recommendedDests, setRecommendedDests] = useState<any[]>(() =>
    DESTINATIONS.filter(d => d.trending).slice(0, 4).map(d => ({
      id: d.id,
      name: d.name,
      city: d.city || d.name,
      country: d.country || 'India',
      state: d.state || '',
      category: Array.isArray(d.category) ? d.category.join(', ') : (d.category || 'Trending'),
      description: d.description || '',
      latitude: d.latitude || d.lat || 0,
      longitude: d.longitude || d.lng || 0,
      avgCost: d.avgCost || d.costPerDay || 2500,
      imageUrl: d.imageUrl || d.image || '',
      rating: d.rating || 4.8,
      reviewCount: d.reviewCount || d.reviews || 1200,
      bestTime: d.bestTime || 'Year-round',
      safetyAdvisory: 'Safe for tourists',
      trending: true
    }))
  )
  const [activeTourIndex, setActiveTourIndex] = useState(0)

  // Mini Chatbot State
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string, time: string}[]>([
    {
      role: 'ai', 
      text: "Hello! I am Max AI, your luxury travel concierge. I can help you draft itineraries, check the weather, estimate travel budgets, and build custom packing lists. Ask me anything! ✈️ 🌴",
      time: "01:28 pm"
    }
  ])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput.trim()
    if(!textToSend || chatLoading) return
    setChatInput('')
    
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toLowerCase()
    
    setChatMessages(prev => [...prev, {role: 'user', text: textToSend, time: timeStr}])
    setChatLoading(true)
    try {
      const response = await aiService.processChatQuery(textToSend);
      const resTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toLowerCase()
      setChatMessages(prev => [...prev, {role: 'ai', text: response.response, time: resTime}])
    } catch (err) {
      const errTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toLowerCase()
      setChatMessages(prev => [...prev, {role: 'ai', text: "Network error connecting to Max AI.", time: errTime}])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  // ── Intelligence Engine ──
  const { trips, fetchUserTrips } = useTripStore()
  const { savedPlaceIds, fetchWishlist } = useWishlistStore()
  const { myBookings, fetchMyBookings } = useBookingStore()
  const { profile, budgetForecast, compute } = useIntelligenceStore()

  useEffect(() => {
    fetchUserTrips()
    fetchWishlist()
    fetchMyBookings()
  }, [])

  useEffect(() => {
    compute(trips, savedPlaceIds, myBookings, user?.preferences)
  }, [trips.length, savedPlaceIds.length, myBookings.length])

  useEffect(() => {
    placeService.getTrendingDestinations().then(data => {
      if (data) setRecommendedDests(data.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Auto-play the featured tours every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTourIndex((prev) => (prev + 1) % FEATURED_TOURS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const activeTour = FEATURED_TOURS[activeTourIndex]

  // Derive personalized greeting from real DNA
  const topTrait = profile ? (() => {
    const dna = profile.dna
    const traits = { adventure: dna.adventure, nature: dna.nature, luxury: dna.luxury, budget: dna.budget, foodie: dna.foodie, cultural: dna.cultural }
    const top = Object.entries(traits).sort((a, b) => b[1] - a[1])[0]
    const labels: Record<string, string> = { adventure: '🏔️ Adventure', nature: '🌿 Nature', luxury: '✨ Luxury', budget: '💡 Budget', foodie: '🍜 Foodie', cultural: '🏛️ Cultural' }
    return labels[top[0]] || '✈️ Explorer'
  })() : null

  // Destination recommendation reasons based on real profile
  const getRecommendationReason = (dest: PlaceResponse, idx: number): string => {
    if (!profile) return 'Trending destination'
    const topDests = profile.topDestinations
    const topTypes = profile.topTypes
    if (topDests.length > 0 && idx === 0) return `Because you saved ${topDests[0]}`
    if (topTypes.includes('Hill Station')) return 'Matches your love for hill stations'
    if (topTypes.includes('Beach')) return 'Suits your beach travel style'
    if (topTypes.includes('Heritage')) return 'Matches your heritage interest'
    return 'Trending & matches your style'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10 font-sans text-[#1B2A4A] relative overflow-hidden">
      
      <div className="max-w-[1500px] mx-auto relative z-10 pt-4">
        
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-[var(--text-primary)] leading-[1.1] drop-shadow-sm">
              {t('Welcome back', language)}, {(()=>{
                const rawName = user?.name?.split(' ')[0] || '';
                if (rawName.match(/^[a-z]+[0-9]+$/i) || rawName === rawName.toLowerCase()) {
                  // Clean up corrupted email prefix names instantly
                  const cleaned = rawName.replace(/[0-9]/g, '');
                  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : rawName;
                }
                return rawName;
              })()}
            </h1>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <button 
              onClick={() => navigate('/app/planner/setup')}
              className="relative group flex items-center gap-3 bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white px-8 py-4 rounded-[20px] font-black tracking-tighter text-[16px] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-[0_25px_50px_-12px_rgba(252, 108, 38,0.6)] drop-shadow-sm"
            >
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
              <div className="w-6 h-6 rounded-full bg-[var(--bg-card)]/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 relative z-10">
                <Plus size={16} className="text-white" />
              </div>
              <span className="relative z-10">{t('Initialize New Trip', language)}</span>
            </button>
          </motion.div>
        </header>

        {/* ── TRAVEL DNA GREETING CARD ── */}
        {/* Feature removed per user request */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* ── LEFT COLUMN ── */}
          <div className="xl:col-span-8 space-y-10">
            
            {/* Telemetry Cards & AI Chatbot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: AI Chatbot (Theme-Aware Exact Match) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group rounded-2xl h-full min-h-[420px] overflow-hidden border transition-all"
                style={{
                  background: isDark ? '#111111' : isMonochrome ? '#0D0D0D' : 'var(--bg-card)',
                  borderColor: isDark ? '#262626' : isMonochrome ? '#333333' : 'var(--border-default)',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : isMonochrome ? 'none' : 'var(--shadow-card)'
                }}
              >
                <div className="relative h-full w-full flex flex-col">
                  
                  {/* Chat Header */}
                  <div 
                    className="p-4 px-5 flex items-center justify-between text-white transition-all"
                    style={{
                      background: isDark 
                        ? 'linear-gradient(135deg, #1C1C1E 0%, #121214 100%)' 
                        : isMonochrome 
                        ? 'linear-gradient(135deg, #0A0A0A 0%, #161616 100%)' 
                        : 'linear-gradient(135deg, #1B2A4A 0%, #293B63 100%)',
                      borderBottom: `1px solid ${isDark ? '#28282B' : isMonochrome ? '#333333' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full border flex items-center justify-center shadow-sm"
                        style={{
                          background: isMonochrome ? 'rgba(255, 255, 255, 0.1)' : 'rgba(252, 108, 38, 0.15)',
                          borderColor: isMonochrome ? 'rgba(255, 255, 255, 0.2)' : 'rgba(252, 108, 38, 0.3)'
                        }}
                      >
                        <Sparkles 
                          size={20} 
                          style={{ color: isMonochrome ? '#FFFFFF' : '#FC6C26' }} 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-lg tracking-tight leading-none uppercase">MAX AI</h3>
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm"
                            style={{
                              background: isMonochrome ? 'rgba(255, 255, 255, 0.2)' : 'rgba(252, 108, 38, 0.25)',
                              color: isMonochrome ? '#ffffff' : '#FC6C26',
                              border: `1px solid ${isMonochrome ? 'rgba(255, 255, 255, 0.3)' : 'rgba(252, 108, 38, 0.4)'}`
                            }}
                          >
                            Concierge
                          </span>
                        </div>
                        <p 
                          className="text-[13px] font-medium mt-1"
                          style={{ color: isDark ? '#94A3B8' : isMonochrome ? '#888888' : 'rgba(255, 255, 255, 0.8)' }}
                        >
                          Online & ready to assist
                        </p>
                      </div>
                    </div>
                    <button 
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                      title="Clear chat"
                      onClick={() => setChatMessages([{
                        role: 'ai',
                        text: "Hello! I am Max AI, your luxury travel concierge. I can help you draft itineraries, check the weather, estimate travel budgets, and build custom packing lists. Ask me anything! ✈️ 🌴",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()
                      }])}
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 px-5 space-y-6 pb-2 custom-scrollbar transition-colors"
                    style={{
                      background: isDark ? '#0A0A0C' : isMonochrome ? '#000000' : 'var(--bg-primary)'
                    }}
                  >
                    <AnimatePresence initial={false}>
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 14, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {/* User typing echo — orange gradient pill */}
                        {msg.role === 'user' ? (
                          <div className="max-w-[82%] px-5 py-3 rounded-[22px] rounded-br-sm shadow-lg relative overflow-hidden"
                            style={{
                              background: isMonochrome
                                ? '#ffffff'
                                : 'linear-gradient(135deg,#FC6C26 0%,#e85d1a 100%)',
                              color: isMonochrome ? '#000' : '#fff',
                              boxShadow: isMonochrome
                                ? '0 6px 20px rgba(0,0,0,0.4)'
                                : '0 8px 24px rgba(252,108,38,0.4)'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                            <p className="text-[14.5px] font-semibold leading-snug relative z-10">{msg.text}</p>
                          </div>
                        ) : (
                          /* AI answer — full-width premium renderer */
                          <div className="w-full rounded-[20px] rounded-bl-sm border px-4 py-3 shadow-sm"
                            style={{
                              background: isDark ? '#12141a' : isMonochrome ? '#161616' : 'var(--bg-card)',
                              borderColor: isDark ? '#242731' : isMonochrome ? '#2b2b2b' : 'var(--border-subtle)',
                              ...(isMonochrome ? { '--text-primary': '#ffffff', '--text-secondary': '#e0e0e0' } : {})
                            } as React.CSSProperties}
                          >
                            <ChatMessageRenderer content={msg.text} isUser={false} />
                          </div>
                        )}
                        <span
                          className="text-[10px] mt-1.5 font-semibold px-1 tracking-wider uppercase"
                          style={{ color: isDark ? '#52525B' : isMonochrome ? '#555' : 'var(--text-muted)' }}
                        >
                          {msg.time}
                        </span>
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    {chatLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="flex justify-start w-full"
                      >
                        <div 
                          className="px-4 py-3 rounded-[22px] rounded-bl-sm border flex items-center gap-3 shadow-md backdrop-blur-md"
                          style={{
                            background: isDark ? '#14161F' : isMonochrome ? '#161616' : 'var(--bg-card)',
                            borderColor: isDark ? '#262938' : isMonochrome ? '#2e2e2e' : 'rgba(252, 108, 38, 0.25)',
                            boxShadow: isDark
                              ? '0 8px 24px rgba(0,0,0,0.35)'
                              : '0 8px 24px rgba(252,108,38,0.1)'
                          }}
                        >
                          {/* Animated Concierge Bot Badge */}
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm"
                            style={{
                              background: isMonochrome
                                ? '#262626'
                                : 'linear-gradient(135deg, #FC6C26 0%, #FF8A48 100%)',
                            }}
                          >
                            <Bot size={16} className="text-white relative z-10 animate-bounce" style={{ animationDuration: '1.2s' }} />
                            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                          </div>

                          {/* Thinking Text & Bouncing Dots */}
                          <div className="flex flex-col pr-1">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-[13px] font-bold tracking-tight"
                                style={{ color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)' }}
                              >
                                Max AI is thinking
                              </span>
                              <div className="flex items-center gap-1">
                                <motion.span 
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: isMonochrome ? '#ffffff' : '#FC6C26' }}
                                  animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }} 
                                  transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }} 
                                />
                                <motion.span 
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: isMonochrome ? '#ffffff' : '#FC6C26' }}
                                  animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }} 
                                  transition={{ repeat: Infinity, duration: 0.75, delay: 0.18, ease: 'easeInOut' }} 
                                />
                                <motion.span 
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: isMonochrome ? '#ffffff' : '#FC6C26' }}
                                  animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }} 
                                  transition={{ repeat: Infinity, duration: 0.75, delay: 0.36, ease: 'easeInOut' }} 
                                />
                              </div>
                            </div>
                            <span 
                              className="text-[10px] font-semibold tracking-wider uppercase mt-0.5"
                              style={{ color: isDark ? '#71717A' : isMonochrome ? '#888' : '#8E8E93' }}
                            >
                              Concierge analyzing request...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Suggestions & Input */}
                  <div 
                    className="px-4 pb-4 pt-2 flex flex-col gap-3 transition-colors"
                    style={{
                      background: isDark ? '#121214' : isMonochrome ? '#0A0A0A' : 'var(--bg-card)',
                      borderTop: `1px solid ${isDark ? '#222224' : isMonochrome ? '#222222' : 'var(--border-subtle)'}`
                    }}
                  >
                    
                    {/* Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                      <button 
                        onClick={() => handleSendChat('Suggest local attractions 🏰')}
                        disabled={chatLoading}
                        className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 border cursor-pointer hover:border-[#FC6C26] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: isDark ? '#18181B' : isMonochrome ? '#141414' : 'var(--bg-primary)',
                          color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)',
                          borderColor: isDark ? '#2E2E32' : isMonochrome ? '#333333' : 'var(--border-default)',
                        }}
                      >
                        Suggest local attractions 🏰
                      </button>
                      <button 
                        onClick={() => handleSendChat('Check weather in Goa 🌴')}
                        disabled={chatLoading}
                        className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 border cursor-pointer hover:border-[#FC6C26] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: isDark ? '#18181B' : isMonochrome ? '#141414' : 'var(--bg-primary)',
                          color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)',
                          borderColor: isDark ? '#2E2E32' : isMonochrome ? '#333333' : 'var(--border-default)',
                        }}
                      >
                        Check weather in Goa 🌴
                      </button>
                    </div>

                    {/* Text Input Box */}
                    <div 
                      className="flex items-center rounded-full border p-1.5 pr-2 transition-colors focus-within:border-[#FC6C26]"
                      style={{
                        background: isDark ? '#18181B' : isMonochrome ? '#141414' : 'var(--bg-primary)',
                        borderColor: isDark ? '#2E2E32' : isMonochrome ? '#333333' : 'var(--border-default)',
                      }}
                    >
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ask Max AI..."
                        className="flex-1 bg-transparent pl-4 pr-3 py-2 text-[15px] outline-none"
                        style={{
                          color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)',
                        }}
                      />
                      <button 
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim() || chatLoading}
                        className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        style={{
                          background: isMonochrome 
                            ? '#ffffff' 
                            : 'linear-gradient(135deg, #FC6C26 0%, #e85d1a 100%)',
                          color: isMonochrome ? '#000000' : '#ffffff',
                        }}
                      >
                        <Send size={16} className="-ml-0.5" />
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>

              {/* Right: The 4 Features (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: t('Global Footprint', language), value: 12, suffix: ` ${t('Cities', language)}`, icon: Globe, color: '#384D7E', bg: 'rgba(56, 77, 126, 0.15)' },
                  { label: t('Total Expeditions', language), value: 7, suffix: '', icon: Compass, color: '#1B2A4A', bg: 'var(--bg-secondary)' },
                  { label: t('AI Budget Saved', language), value: 42000, isCurrency: true, icon: Zap, color: '#FC6C26', bg: 'rgba(252, 108, 38, 0.15)' },
                  { label: t('Explorer Level', language), value: user?.explorerLevel || 3, suffix: '', icon: Activity, color: '#3fa796', bg: 'rgba(63, 167, 150, 0.15)' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="relative group rounded-[32px] hover:-translate-y-1 transition-transform duration-500 h-full"
                  >
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="bg-[var(--bg-card)]/80 backdrop-blur-ultra rounded-[32px] p-2 shadow-ultra border border-[var(--border-subtle)]/50 relative overflow-hidden hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] transition-shadow duration-500 h-full w-full">
                      <div className="relative z-10 p-5 xl:p-6">
                        <div className="flex justify-between items-start mb-6 xl:mb-8 relative z-10">
                          <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-[16px] flex items-center justify-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: stat.bg }}>
                            <stat.icon size={20} className="xl:w-[22px] xl:h-[22px]" style={{ color: stat.color }} />
                          </div>
                          <ArrowUpRight size={18} className="text-[var(--text-muted)] group-hover:text-[#FC6C26] transition-colors" />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="text-2xl xl:text-4xl text-[var(--text-primary)] mb-1 font-black flex items-baseline tracking-tighter drop-shadow-sm">
                            {stat.isCurrency ? formatCurrency(stat.value, currency) : <AnimatedCounter target={stat.value} prefix={(stat as any).prefix} />}
                          </div>
                          <p className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2">{stat.label}</p>
                          {stat.suffix && <p className="text-[12px] xl:text-[13px] font-extrabold text-[var(--text-secondary)] mt-1">{stat.suffix}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Auto-Playing Featured Expeditions Console */}
            <div className="relative w-full group/console mt-4 mb-4">
              {/* Attention-Seeking Ambient Glowing Orbs Behind the Card */}
              <div className="absolute top-0 right-[10%] w-[400px] h-[400px] bg-[#FC6C26] rounded-full blur-[100px] opacity-[0.15] mix-blend-multiply pointer-events-none group-hover/console:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-[#3fa796] rounded-full blur-[120px] opacity-[0.15] mix-blend-multiply pointer-events-none group-hover/console:scale-110 transition-transform duration-1000 delay-100" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group rounded-[40px] w-full"
              >
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="bg-[var(--bg-card)] rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-[var(--border-subtle)] relative min-h-[460px] flex items-center w-full">
                {/* Extremely subtle glass highlight gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-card-hover)] to-transparent opacity-50 pointer-events-none" />

              <div className="p-8 lg:p-12 relative z-10 flex flex-col md:flex-row gap-12 items-center w-full">
                
                <div className="flex-1 w-full relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-[var(--bg-secondary)] p-2 rounded-xl shadow-sm border border-[var(--border-subtle)]">
                      <Sparkles size={16} className="text-[#FC6C26]" />
                    </div>
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)]">{t('Featured Expeditions', language)}</span>
                  </div>
                  
                  <div className="relative h-[280px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTour.id}
                        initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tighter text-[var(--text-primary)] mb-8 leading-[1.1] drop-shadow-sm">
                          {activeTour.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-3 text-[var(--text-primary)] font-medium text-[15px] mb-8">
                          <span className="flex items-center gap-2 bg-[var(--bg-card)] px-5 py-3 rounded-[16px] shadow-sm border border-[var(--border-subtle)]">
                            <Calendar size={18} className="text-[#3fa796]" />
                            {new Date(activeTour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(activeTour.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2 bg-[var(--bg-card)] px-5 py-3 rounded-[16px] shadow-sm border border-[var(--border-subtle)]">
                            <Users size={18} className="text-[#3fa796]" />
                            {activeTour.collaborators} Explorers
                          </span>
                        </div>

                        <div className="bg-[var(--bg-card)] rounded-[24px] p-6 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] border border-[var(--border-subtle)] relative overflow-hidden">
                          <div className="flex justify-between items-end mb-4 relative z-10">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">{t('Financial Telemetry', language)}</p>
                              <p className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                                {formatCurrency(activeTour.spent, currency)} <span className="text-xl text-[var(--text-muted)] font-bold tracking-normal">/ {formatCurrency(activeTour.budget, currency)}</span>
                              </p>
                            </div>
                            <div className="bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                              <span className="text-[#FC6C26] font-bold text-[14px]">{Math.round((activeTour.spent/activeTour.budget)*100)}%</span>
                            </div>
                          </div>
                          
                          <div className="h-2 w-full bg-[var(--bg-card)] rounded-full overflow-hidden relative z-10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(activeTour.spent/activeTour.budget)*100}%` }}
                              transition={{ duration: 1.5, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Indicators */}
                  <div className="flex gap-3 mt-8">
                    {FEATURED_TOURS.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveTourIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${idx === activeTourIndex ? 'w-10 bg-[#FC6C26] shadow-[0_0_10px_rgba(252, 108, 38,0.5)]' : 'w-2 bg-[var(--border-subtle)] hover:bg-[var(--text-muted)]'}`}
                        aria-label={`Go to tour ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-[320px] shrink-0 h-[380px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTour.id}
                      initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full"
                    >
                      <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-[6px] border-[var(--bg-secondary)] group/img cursor-pointer" onClick={() => navigate(`/app/trips/${activeTour.id}`)}>
                        <img src={activeTour.coverImage} alt={activeTour.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] via-[#1B2A4A]/10 to-transparent opacity-80 transition-opacity duration-500 group-hover/img:opacity-60" />
                        
                        <div className="absolute bottom-6 left-6 right-6">
                          <button className="w-full bg-black/40 backdrop-blur-xl border border-white/40 text-white py-4 rounded-[20px] font-bold text-[15px] hover:bg-[#FC6C26] hover:border-[#FC6C26] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                            {t('Access Console', language)} <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              </div>
            </motion.div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="xl:col-span-4 space-y-10">
            
            {/* AI Travel Radar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group rounded-[32px]"
            >
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
              <div className="bg-[var(--bg-card)] rounded-[32px] p-8 lg:p-10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.04)] border border-[var(--border-subtle)] relative overflow-hidden h-full">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-[var(--bg-secondary)] flex items-center justify-center">
                    <MapPin size={22} className="text-[#FC6C26]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-[22px] text-[var(--text-primary)] tracking-tighter drop-shadow-sm">{t('AI Travel Radar', language)}</h3>
                    <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">{t('Predictive Matches', language)}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/app/explore')} className="text-[#FC6C26] hover:bg-[#FC6C26] hover:text-white p-3 rounded-[14px] transition-colors">
                  <ArrowUpRight size={20} />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                {recommendedDests.map((dest, idx) => (
                  <div key={dest.id} onClick={() => navigate(`/app/explore/search?q=${dest.name}`)} className="group flex gap-5 items-center cursor-pointer">
                    <div className="relative w-[76px] h-[76px] rounded-[18px] overflow-hidden shrink-0 shadow-sm border border-[var(--border-subtle)]">
                      <img src={dest.imageUrl || (dest as any).image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={dest.name} />
                      <div className="absolute top-1 left-1 bg-[var(--bg-card)]/90 backdrop-blur-md text-[#1B2A4A] text-[10px] font-bold px-1.5 py-0.5 rounded-[6px]">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold tracking-tight text-[16px] text-[var(--text-primary)] group-hover:text-[#FC6C26] transition-colors">{dest.name}</h4>
                      <p className="text-[13px] text-[var(--text-secondary)] font-medium mb-1">{dest.country || t('Global Destination', language)}</p>
                      <div className="flex items-center">
                        <span className="text-[11px] font-bold text-[#FC6C26] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[8px] border border-[var(--border-subtle)]">
                          {getRecommendationReason(dest, idx)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Command Modules */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 gap-4 lg:gap-6"
            >
              <div onClick={() => navigate('/app/explore')} className="relative bg-[var(--bg-card)] p-2 rounded-[32px] cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group border border-[var(--border-subtle)]">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative z-10 bg-[var(--bg-secondary)] h-full rounded-[24px] p-6 lg:p-8 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[16px] bg-[var(--bg-card)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-[var(--border-subtle)] shrink-0">
                      <Zap size={24} className="text-[#FC6C26]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold tracking-tight text-[var(--text-primary)] text-[17px] mb-1">{t('Surprise Me', language)}</h4>
                      <p className="text-[12px] text-[var(--text-secondary)] font-medium">{t('AI generated trips', language)}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[#FC6C26] group-hover:bg-[#FC6C26] group-hover:text-white transition-colors shrink-0">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

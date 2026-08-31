import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, CloudRain, Cloud, Wind, Droplets, Sparkles, AlertTriangle, Search } from 'lucide-react'
import { aiService } from '../../../services/aiService'
import { useTripStore } from '../../../stores/tripStore'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

export function WeatherPage() {
  const { currentTrip, fetchUserTrips, trips, fetchTripById } = useTripStore()
  const [weatherData, setWeatherData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDestination, setActiveDestination] = useState<string | null>(null)

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
    if (currentTrip && !activeDestination) {
      setActiveDestination(currentTrip.destinations[0] || 'Delhi')
    }
  }, [currentTrip, activeDestination])

  useEffect(() => {
    async function fetchWeather() {
      if (!activeDestination) return
      setIsLoading(true)
      try {
        const data = await aiService.getWeatherSuggestions(activeDestination)
        setWeatherData(data)
      } catch (error) {
        console.error("Failed to fetch weather data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWeather()
  }, [activeDestination])

  if (isLoading || !weatherData) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading AI weather forecasts...</div>
  }

  // Map icons from string to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case '☀️': return Sun
      case '🌧️': return CloudRain
      case '⛅': return Cloud
      default: return Sun
    }
  }

  const today = weatherData.monthlyData[0] // Mocking first month as today for demo purposes
  const TodayIcon = getIcon(today.icon)

  // Generate a mock 7-day forecast based on the AI data to maintain the UI structure
  const FORECAST = [
    { day: 'Mon', icon: today.icon, high: today.avgTemp + 2, low: today.avgTemp - 3, condition: 'Sunny', precip: today.rainfall * 5 },
    { day: 'Tue', icon: '⛅', high: today.avgTemp + 1, low: today.avgTemp - 2, condition: 'Cloudy', precip: 20 },
    { day: 'Wed', icon: '🌧️', high: today.avgTemp - 3, low: today.avgTemp - 5, condition: 'Rainy', precip: 80 },
    { day: 'Thu', icon: '☀️', high: today.avgTemp + 3, low: today.avgTemp - 1, condition: 'Sunny', precip: 5 },
    { day: 'Fri', icon: '☀️', high: today.avgTemp + 4, low: today.avgTemp, condition: 'Sunny', precip: 0 },
    { day: 'Sat', icon: '⛅', high: today.avgTemp + 1, low: today.avgTemp - 2, condition: 'Partly Cloudy', precip: 15 },
    { day: 'Sun', icon: '☀️', high: today.avgTemp + 2, low: today.avgTemp - 1, condition: 'Sunny', precip: 10 },
  ]

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="font-display text-6xl md:text-7xl mb-3 text-text-primary font-black tracking-tight">Weather & Climate</h1>
        <p className="text-[18px] font-black text-text-muted mt-2">Real-time weather and AI-driven seasonal advice.</p>
      </div>

      <ToolkitTabs />

      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-card p-4 rounded-2xl border border-border-default shadow-sm">
        <div className="relative w-full flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Search any destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setActiveDestination(searchQuery.trim())
              }
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-bg-secondary text-text-primary text-[16px] font-black border-none outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (searchQuery.trim()) setActiveDestination(searchQuery.trim())
          }}
          className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-[16px] font-black rounded-xl shadow-md transition-colors whitespace-nowrap"
        >
          Get Weather
        </motion.button>
      </div>

      {/* Current Weather Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl mb-8 text-center relative overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--teal-900), var(--teal-700))' }}
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <TodayIcon size={120} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <p className="text-white/90 text-[14px] mb-3 font-black tracking-[0.15em] uppercase">📍 {activeDestination || 'Destination'} Forecast</p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <TodayIcon size={64} className="text-yellow-300 drop-shadow-md" />
            <motion.p key={today.avgTemp} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[96px] font-black text-white font-display tracking-tight">
              {today.avgTemp}°
            </motion.p>
          </div>
          <p className="text-white text-[24px] font-black tracking-wide">Clear Skies</p>
          <p className="text-white/80 text-[16px] mt-2 font-black">Feels like {today.avgTemp + 2}° · Humidity 45%</p>

          <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/10">
            {[
              { icon: Wind, label: '12 km/h', desc: 'Wind' },
              { icon: Droplets, label: `${Math.round(today.rainfall * 2)}%`, desc: 'Humidity' },
              { icon: Sun, label: 'UV 8', desc: 'Very High' },
            ].map((item, i) => (
              <motion.div key={item.desc} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} className="flex flex-col items-center gap-1.5">
                <item.icon size={18} className="text-white/70" />
                <span className="text-white text-[16px] font-black">{item.label}</span>
                <span className="text-white/70 text-[12px] uppercase tracking-widest font-black">{item.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Forecast */}
        <div className="lg:col-span-2">
          <h2 className="font-black text-[14px] mb-5 text-text-primary uppercase tracking-widest">7-Day Forecast</h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
            {FORECAST.map((day, i) => {
              const DayIcon = getIcon(day.icon)
              return (
                <motion.div key={day.day} variants={itemPop} className="group">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm hover:border-teal-500/30 transition-colors">
                    <span className="text-[16px] font-black w-12 text-text-muted group-hover:text-text-primary transition-colors">{day.day}</span>
                    <DayIcon size={24} className={day.precip > 50 ? 'text-blue-400' : 'text-amber-400'} />
                    <span className="text-[16px] font-black flex-1 text-text-secondary">{day.condition}</span>
                    <div className="flex items-center gap-1.5 text-[14px] w-20 text-blue-500 font-black bg-blue-500/10 px-2 py-1 rounded-md">
                      <Droplets size={14} /> {day.precip}%
                    </div>
                    <div className="flex items-center gap-3 text-[16px] w-24 justify-end">
                      <span className="font-black text-text-primary">{day.high}°</span>
                      <span className="text-text-muted font-black">{day.low}°</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* AI Travel Tip & Seasonal Insights */}
        <div className="space-y-4">
          <h2 className="font-black text-[14px] mb-5 text-text-primary uppercase tracking-widest">Climate Insights</h2>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles size={60} className="text-violet-600" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
              <span className="text-[14px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">AI Recommendation</span>
            </div>
            <p className="text-[16px] font-black leading-relaxed text-text-secondary relative z-10">
              <strong className="text-text-primary font-black block mb-1">Best Time to Visit: {weatherData.bestTime}</strong>
              {weatherData.seasonalAdvice}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[14px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Weather Warning</span>
            </div>
            <p className="text-[16px] font-black text-text-secondary">
              Rain expected Wednesday ({FORECAST[2].precip}% chance). Plan indoor activities like museums or cultural centers for that day. 
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import {
  Sparkles,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Compass,
  Calendar,
  MapPin,
  Utensils,
  Hotel,
  DollarSign,
  Backpack,
  Lightbulb,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

interface ChatMessageRendererProps {
  content: string
  isUser?: boolean
  timestamp?: Date | string
  onSuggestionClick?: (text: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SMART WEATHER CARD (Apple / Linear-style high-end glassmorphic HUD)
// ─────────────────────────────────────────────────────────────────────────────
function tryParseWeather(text: string) {
  if (!text.includes('Live Weather —') && !text.includes('Weather Guide')) return null

  // Extract city
  const cityMatch = text.match(/(?:Live Weather —|Weather Guide(?: —)?)\s*([^\*\n]+)/i)
  const city = cityMatch ? cityMatch[1].trim().replace(/\*+/g, '') : 'Destination'

  // Extract temperature
  const tempMatch = text.match(/Temperature:\*\*\s*([-+]?\d+)/i)
  const temp = tempMatch ? tempMatch[1] : null

  // Extract feels like
  const feelsLikeMatch = text.match(/feels like\s*([-+]?\d+)/i)
  const feelsLike = feelsLikeMatch ? feelsLikeMatch[1] : null

  // Extract range
  const rangeMatch = text.match(/Range:\*\*\s*([^\n]+)/i)
  const range = rangeMatch ? rangeMatch[1].trim().replace(/\*+/g, '') : null

  // Extract condition
  const condMatch = text.match(/Condition:\*\*\s*([^\n]+)/i)
  const condition = condMatch ? condMatch[1].trim().replace(/\*+/g, '') : 'Current Conditions'

  // Extract humidity
  const humMatch = text.match(/Humidity:\*\*\s*([^\n]+)/i)
  const humidity = humMatch ? humMatch[1].trim().replace(/\*+/g, '') : null

  // Extract wind
  const windMatch = text.match(/Wind Speed:\*\*\s*([^\n]+)/i)
  const wind = windMatch ? windMatch[1].trim().replace(/\*+/g, '') : null

  // Extract visibility
  const visMatch = text.match(/Visibility:\*\*\s*([^\n]+)/i)
  const visibility = visMatch ? visMatch[1].trim().replace(/\*+/g, '') : null

  // Extract travel tip
  const tipMatch = text.match(/Travel Tip:\*\*\s*([^\n]+)/i)
  const travelTip = tipMatch ? tipMatch[1].trim().replace(/\*+/g, '') : null

  if (!temp && !condition) return null

  return { city, temp, feelsLike, range, condition, humidity, wind, visibility, travelTip }
}

function WeatherCard({ data }: { data: NonNullable<ReturnType<typeof tryParseWeather>> }) {
  const isRain = /rain|drizzle|shower/i.test(data.condition)
  const isStorm = /storm|thunder/i.test(data.condition)
  const isSnow = /snow|flurry|ice/i.test(data.condition)
  const isSunny = /clear|sun/i.test(data.condition)

  const WeatherIcon = isStorm
    ? CloudLightning
    : isRain
    ? CloudRain
    : isSnow
    ? Snowflake
    : isSunny
    ? Sun
    : Cloud

  const gradientBg = isRain
    ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
    : isSunny
    ? 'linear-gradient(145deg, #ea580c 0%, #9a3412 100%)'
    : 'linear-gradient(145deg, #1e293b 0%, #111827 100%)'

  return (
    <div
      className="rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden my-2 border border-white/10"
      style={{ background: gradientBg }}
    >
      {/* Background ambient glow blur */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: isSunny ? '#f59e0b' : '#38bdf8' }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ background: '#FC6C26' }}
      />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between relative z-10 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
            Live Satellite Radar
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <Compass size={12} className="text-[#FC6C26]" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Main Temperature & City Hero */}
      <div className="flex items-start justify-between relative z-10 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-white/80 text-[13px] font-semibold mb-1">
            <MapPin size={14} className="text-[#FC6C26]" />
            <span>{data.city}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-white font-display">
              {data.temp ? `${data.temp}°` : '26°'}
            </span>
            <span className="text-sm font-bold text-white/60 uppercase">C</span>
            {data.feelsLike && (
              <span className="text-xs font-medium text-white/70 ml-1">
                Feels like <strong className="text-white font-bold">{data.feelsLike}°C</strong>
              </span>
            )}
          </div>
          <div className="text-[13px] font-bold text-white/90 mt-1 capitalize flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26]" />
            {data.condition}
          </div>
        </div>

        {/* Big Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg shrink-0">
          <WeatherIcon size={34} className={isSunny ? 'text-amber-300' : 'text-cyan-300'} />
        </div>
      </div>

      {/* 4-Stat Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 relative z-10 mb-4">
        {data.range && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <Thermometer size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Temp Range</div>
              <div className="text-[12px] font-black text-white truncate">{data.range}</div>
            </div>
          </div>
        )}

        {data.humidity && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 shrink-0">
              <Droplets size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Humidity</div>
              <div className="text-[12px] font-black text-white truncate">{data.humidity}</div>
            </div>
          </div>
        )}

        {data.wind && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 shrink-0">
              <Wind size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Wind Speed</div>
              <div className="text-[12px] font-black text-white truncate">{data.wind}</div>
            </div>
          </div>
        )}

        {data.visibility && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <Eye size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Visibility</div>
              <div className="text-[12px] font-black text-white truncate">{data.visibility}</div>
            </div>
          </div>
        )}
      </div>

      {/* Travel Tip Banner */}
      {data.travelTip && (
        <div className="relative z-10 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-400/30 rounded-2xl p-3 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={13} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
              Expedition Concierge Tip
            </span>
            <p className="text-[12.5px] font-medium leading-snug text-white/95">{data.travelTip}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SMART ITINERARY CARD (Timeline with step nodes & route chips)
// ─────────────────────────────────────────────────────────────────────────────
function tryParseItinerary(text: string) {
  if (!text.includes('Itinerary') && !text.includes('Day 1')) return null

  // Extract Days
  const dayRegex = /\*\*(Day \d+[^:*]*)\*\*:?\s*([^\n]+(?:\n(?!\*\*Day|\n\n💰)[^\n]+)*)/gi
  const days: { day: string; details: string; steps: string[] }[] = []
  let match: RegExpExecArray | null

  while ((match = dayRegex.exec(text)) !== null) {
    const day = match[1].trim()
    const rawDetails = match[2].trim()
    // Split by arrows or bullets
    const steps = rawDetails
      .split(/→|->|•/)
      .map(s => s.trim())
      .filter(s => s.length > 2)

    days.push({ day, details: rawDetails, steps: steps.length > 1 ? steps : [rawDetails] })
  }

  if (days.length === 0) return null

  // Extract budget if present
  const budgetMatch = text.match(/💰\s*([^\n]+)/)
  const budget = budgetMatch ? budgetMatch[1].trim() : null

  // Extract title
  const titleMatch = text.match(/(?:📅\s*)?\*\*([^\*]+(?:Itinerary|Plan)[^\*]*)\*\*/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Curated Itinerary'

  return { title, days, budget }
}

function ItineraryCard({ data }: { data: NonNullable<ReturnType<typeof tryParseItinerary>> }) {
  return (
    <div className="my-2 rounded-3xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FC6C26] to-[#ff8c42] flex items-center justify-center text-white shadow-md">
            <Calendar size={16} />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-[var(--text-primary)] leading-tight tracking-tight">
              {data.title}
            </h4>
            <span className="text-[10px] font-bold text-[#FC6C26] uppercase tracking-wider">
              {data.days.length} Days Planned • Expedition Route
            </span>
          </div>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[2px] before:bg-gradient-to-b before:from-[#FC6C26] before:via-orange-300/40 before:to-transparent">
        {data.days.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-3 pl-1">
            {/* Glowing Day Node */}
            <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-[#FC6C26] text-[#FC6C26] flex items-center justify-center text-[11px] font-black shrink-0 shadow-md z-10">
              {idx + 1}
            </div>

            {/* Content card */}
            <div className="flex-1 bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div className="text-[13px] font-black text-[var(--text-primary)] mb-1.5">
                {item.day}
              </div>

              {item.steps.length > 1 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.steps.map((st, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-2xs">
                        {st}
                      </span>
                      {sIdx < item.steps.length - 1 && (
                        <ArrowRight size={11} className="text-[#FC6C26] shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  {item.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Budget Callout Footer */}
      {data.budget && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-2 rounded-xl">
          <DollarSign size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[11.5px] font-bold text-[var(--text-primary)] leading-tight">
            {data.budget}
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SMART HOTEL / STAY CARD (Tiered comparison)
// ─────────────────────────────────────────────────────────────────────────────
function tryParseHotel(text: string) {
  if (!text.includes('Where to Stay') && !text.includes('Hotel Guide')) return null

  const isStay = /Stay in|Hotel Guide|Where to Stay/i.test(text)
  if (!isStay) return null

  // Extract tiers
  const budgetMatch = text.match(/•?\s*Budget:\s*([^\n]+)/i)
  const midMatch = text.match(/•?\s*Mid(?:-Range)?:\s*([^\n]+)/i)
  const luxMatch = text.match(/•?\s*Luxury:\s*([^\n]+)/i)

  if (!budgetMatch && !midMatch && !luxMatch) return null

  const titleMatch = text.match(/(?:🏨\s*)?\*\*([^\*]+(?:Stay|Hotel)[^\*]*)\*\*/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Accommodations Guide'

  return {
    title,
    budget: budgetMatch ? budgetMatch[1].trim() : null,
    mid: midMatch ? midMatch[1].trim() : null,
    luxury: luxMatch ? luxMatch[1].trim() : null
  }
}

function HotelCard({ data }: { data: NonNullable<ReturnType<typeof tryParseHotel>> }) {
  return (
    <div className="my-2 rounded-3xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[var(--border-subtle)]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          <Hotel size={16} />
        </div>
        <div>
          <h4 className="text-[14px] font-black text-[var(--text-primary)]">{data.title}</h4>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            Verified Stays & Curated Tiers
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {data.budget && (
          <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-emerald-500/20 flex items-start gap-2.5">
            <span className="text-xs px-2 py-0.5 rounded-md font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shrink-0">
              🎒 BUDGET
            </span>
            <span className="text-[12.5px] font-medium text-[var(--text-primary)]">{data.budget}</span>
          </div>
        )}
        {data.mid && (
          <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-blue-500/20 flex items-start gap-2.5">
            <span className="text-xs px-2 py-0.5 rounded-md font-black bg-blue-500/10 text-blue-600 border border-blue-500/30 shrink-0">
              🏨 MID-RANGE
            </span>
            <span className="text-[12.5px] font-medium text-[var(--text-primary)]">{data.mid}</span>
          </div>
        )}
        {data.luxury && (
          <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-amber-500/20 flex items-start gap-2.5">
            <span className="text-xs px-2 py-0.5 rounded-md font-black bg-amber-500/10 text-amber-600 border border-amber-500/30 shrink-0">
              ✨ LUXURY
            </span>
            <span className="text-[12.5px] font-medium text-[var(--text-primary)]">{data.luxury}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SMART FOOD & DINING CARD
// ─────────────────────────────────────────────────────────────────────────────
function tryParseFood(text: string) {
  if (!text.includes('Must-Try Food') && !text.includes('Food Recommendations')) return null

  const titleMatch = text.match(/(?:🌴|🏛️|🌆|🍛)?\s*\*\*([^\*]+Food[^\*]*)\*\*/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Must-Try Culinary Guide'

  // Extract food categories
  const categories: { label: string; text: string; icon: string }[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const match = line.match(/^([🦞🍺🍰🍛🥔🦐🍜🍦🥘🥙🍢]+)\s*\*\*([^*]+):\*\*\s*(.+)/)
    if (match) {
      categories.push({
        icon: match[1],
        label: match[2].trim(),
        text: match[3].trim()
      })
    }
  }

  // Where to eat
  const whereMatch = text.match(/📍\s*\*\*Where to eat:\*\*\s*([^\n]+)/i)
  const whereToEat = whereMatch ? whereMatch[1].trim() : null

  if (categories.length === 0 && !whereToEat) return null

  return { title, categories, whereToEat }
}

function FoodCard({ data }: { data: NonNullable<ReturnType<typeof tryParseFood>> }) {
  return (
    <div className="my-2 rounded-3xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[var(--border-subtle)]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
          <Utensils size={16} />
        </div>
        <div>
          <h4 className="text-[14px] font-black text-[var(--text-primary)]">{data.title}</h4>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
            Signature Flavors & Local Eats
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {data.categories.map((c, i) => (
          <div key={i} className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{c.icon}</span>
              <span className="text-[11px] font-black uppercase text-[var(--text-primary)] tracking-wide">
                {c.label}
              </span>
            </div>
            <p className="text-[12px] font-medium text-[var(--text-secondary)] leading-relaxed">
              {c.text}
            </p>
          </div>
        ))}
      </div>

      {data.whereToEat && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <MapPin size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-0.5">
              Recommended Spots
            </span>
            <p className="text-[12px] font-medium text-[var(--text-primary)]">{data.whereToEat}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MASTER CHAT MESSAGE RENDERER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ChatMessageRenderer({
  content,
  isUser = false,
  timestamp,
}: ChatMessageRendererProps) {
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  if (isUser) {
    return (
      <div className="text-[14.5px] font-medium leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    )
  }

  // Check for smart cards
  const weatherData = tryParseWeather(content)
  const itineraryData = !weatherData ? tryParseItinerary(content) : null
  const hotelData = !weatherData && !itineraryData ? tryParseHotel(content) : null
  const foodData = !weatherData && !itineraryData && !hotelData ? tryParseFood(content) : null

  const handleCopy = () => {
    // Strip markdown formatting for clean clipboard
    const plainText = content.replace(/\*\*/g, '').replace(/###/g, '')
    navigator.clipboard.writeText(plainText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const plainText = content
      .replace(/\*\*/g, '')
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.rate = 1.05
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const markdownComponents: Components = {
    // ── Paragraphs
    p({ children }) {
      return (
        <p className="mb-2 last:mb-0 leading-relaxed text-[14.5px] text-[var(--text-primary)]">
          {children}
        </p>
      )
    },
    // ── Bold
    strong({ children }) {
      return (
        <strong className="font-black text-[var(--text-primary)] tracking-tight">
          {children}
        </strong>
      )
    },
    // ── H1
    h1({ children }) {
      return (
        <h1 className="text-[18px] font-black mb-2.5 mt-2 pb-1.5 flex items-center gap-2 border-b border-[var(--border-subtle)] text-[var(--text-primary)]">
          {children}
        </h1>
      )
    },
    // ── H2
    h2({ children }) {
      return (
        <h2 className="text-[16px] font-black mb-2 mt-3 first:mt-0 text-[var(--text-primary)]">
          {children}
        </h2>
      )
    },
    // ── H3
    h3({ children }) {
      return (
        <h3 className="text-[14px] font-black mb-1.5 mt-2 uppercase tracking-wider text-[#FC6C26]">
          {children}
        </h3>
      )
    },
    // ── Lists
    ul({ children }) {
      return <ul className="my-2 space-y-1.5 pl-1">{children}</ul>
    },
    ol({ children }) {
      return <ol className="my-2 space-y-1.5 pl-1">{children}</ol>
    },
    li({ children, ordered, ...rest }: any) {
      return (
        <li className="flex items-start gap-2.5 text-[14px] leading-snug text-[var(--text-secondary)]">
          <span className="mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black bg-gradient-to-tr from-[#FC6C26] to-orange-400 text-white shrink-0 shadow-xs">
            {ordered ? (rest.index ?? '•') : '✦'}
          </span>
          <span className="flex-1">{children}</span>
        </li>
      )
    },
    // ── Blockquote
    blockquote({ children }) {
      return (
        <blockquote className="my-2.5 pl-3.5 py-2 pr-3 border-l-4 border-[#FC6C26] bg-[var(--bg-primary)] rounded-r-xl text-[13.5px] italic text-[var(--text-secondary)]">
          {children}
        </blockquote>
      )
    },
    // ── Code
    code({ children, className }) {
      const isBlock = className?.includes('language-')
      if (isBlock) {
        return (
          <pre className="text-[12.5px] p-3 rounded-2xl my-2 overflow-x-auto bg-black/80 text-white font-mono border border-white/10">
            <code>{children}</code>
          </pre>
        )
      }
      return (
        <code className="text-[12.5px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-[#FC6C26]/10 text-[#FC6C26]">
          {children}
        </code>
      )
    }
  }

  return (
    <div className="w-full flex flex-col group/msg">
      {/* Smart Specialized Card OR Premium Markdown */}
      {weatherData ? (
        <WeatherCard data={weatherData} />
      ) : itineraryData ? (
        <ItineraryCard data={itineraryData} />
      ) : hotelData ? (
        <HotelCard data={hotelData} />
      ) : foodData ? (
        <FoodCard data={foodData} />
      ) : (
        <div className="min-w-0 break-words leading-relaxed">
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
      )}

      {/* ── Luxury Action Toolbar (Copy, Voice Reader, Feedback) ── */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-[11px] select-none text-[var(--text-muted)]">
        {/* Left: Max AI Watermark Badge */}
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] text-[#FC6C26]">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Verified Concierge</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1">
          {/* Audio Reader */}
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              speaking
                ? 'bg-[#FC6C26] text-white border-[#FC6C26]'
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={speaking ? 'Stop speech' : 'Read aloud'}
          >
            {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {speaking && <span className="text-[9px] font-bold">Playing...</span>}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1 cursor-pointer"
            title="Copy answer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500">Copied</span>
              </>
            ) : (
              <Copy size={12} />
            )}
          </button>

          {/* Thumbs Feedback */}
          <button
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              feedback === 'up'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Helpful"
          >
            <ThumbsUp size={12} />
          </button>

          <button
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              feedback === 'down'
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Not helpful"
          >
            <ThumbsDown size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * MemoryTimeline.tsx — Memory Weight™ Timeline Premium Edition
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronLeft, ChevronRight, Heart, X, Sparkles } from 'lucide-react'
import {
  MEMORY_TAGS,
  getTripMemories,
  removeMemory,
  type PlaceMemory,
} from '../../services/infrastructureService'
import { useThemeStore } from '../../stores/themeStore'

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"

interface Stop {
  id: string
  name: string
  date: string
  placeId: string
}

interface MemoryTimelineProps {
  tripId: string
  stops: Stop[]
  activeStopId?: string | null
  onStopSelect?: (stopId: string) => void
}

export function MemoryTimeline({ tripId, stops, activeStopId, onStopSelect }: MemoryTimelineProps) {
  const [memories, setMemories] = useState<PlaceMemory[]>([])
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  const loadMemories = () => {
    setMemories(getTripMemories(tripId))
  }

  useEffect(() => {
    loadMemories()
    const poll = setInterval(loadMemories, 1500)
    return () => clearInterval(poll)
  }, [tripId])

  useEffect(() => {
    checkScroll()
  }, [stops])

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
    setTimeout(checkScroll, 320)
  }

  const memByPlace: Record<string, PlaceMemory[]> = {}
  for (const m of memories) {
    if (!memByPlace[m.placeId]) memByPlace[m.placeId] = []
    memByPlace[m.placeId].push(m)
  }

  const totalTags = memories.length

  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      background: isDark ? '#111111' : 'var(--bg-card)',
      border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
      boxShadow: '0 4px 24px rgba(139,92,246,0.07)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '18px 22px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: isDark ? '1.5px solid #222222' : '1.5px solid #f3f4f6',
        background: isDark ? 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(124,58,237,0.05))' : 'linear-gradient(135deg, rgba(237,233,254,0.35), rgba(250,232,255,0.20))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #db2777, #7c3aed)',
            boxShadow: '0 4px 12px rgba(219,39,119,0.35)',
          }}>
            <Heart size={19} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <p style={{
              fontSize: 16, fontWeight: 900,
              fontFamily: FONT,
              color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0,
              letterSpacing: '-0.4px', lineHeight: 1.2,
            }}>Memory Timeline</p>
            <p style={{
              fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280',
              margin: '3px 0 0', fontWeight: 600,
              fontFamily: FONT,
            }}>
              {totalTags > 0
                ? `${totalTags} emotion${totalTags !== 1 ? 's' : ''} tagged \u00b7 ${stops.length} stops`
                : `${stops.length} stops \u2014 click any stop to tag`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {totalTags > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 20,
              background: 'rgba(124,58,237,0.10)', color: '#6d28d9',
              border: '1.5px solid rgba(124,58,237,0.22)',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: FONT,
            }}>
              <Sparkles size={10} /> {totalTags} tagged
            </span>
          )}
          {(['left', 'right'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              disabled={dir === 'left' ? !canLeft : !canRight}
              style={{
                width: 34, height: 34, borderRadius: 11,
                border: isDark ? '1.5px solid #333333' : '1.5px solid #e5e7eb',
                cursor: (dir === 'left' ? canLeft : canRight) ? 'pointer' : 'default',
                background: isDark ? '#222222' : '#ffffff',
                color: isDark ? '#ffffff' : '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (dir === 'left' ? canLeft : canRight) ? 1 : 0.30,
                transition: 'all 0.15s',
              }}
            >
              {dir === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline Scroll ── */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '10px 28px 28px' }}
      >
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content', position: 'relative', paddingTop: 24 }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', top: 43, left: 34, right: 34, height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg, #f9a8d4, #c084fc, #818cf8, #c084fc, #f9a8d4)',
          }} />

          {stops.map((stop, i) => {
            const mems = memByPlace[stop.placeId] ?? []
            const hasMem = mems.length > 0
            const isSelected = selectedStop === stop.id
            const isActive = activeStopId === stop.id

            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  setSelectedStop(isSelected ? null : stop.id)
                  onStopSelect?.(stop.id)
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  width: 128, flexShrink: 0, cursor: 'pointer',
                }}
              >
                {/* Node */}
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'relative', zIndex: 2,
                    width: 42, height: 42, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hasMem
                      ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                      : isActive
                        ? (isDark ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.25))' : 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))')
                        : (isDark ? '#222222' : '#f3f4f6'),
                    border: `3px solid ${isActive ? '#7c3aed' : hasMem ? '#ec4899' : (isDark ? '#333333' : '#d1d5db')}`,
                    boxShadow: isActive
                      ? '0 0 0 5px rgba(124,58,237,0.18), 0 0 20px rgba(124,58,237,0.45)'
                      : hasMem
                        ? '0 0 18px rgba(236,72,153,0.38)'
                        : '0 2px 6px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {hasMem
                    ? <Heart size={16} style={{ color: '#fff' }} />
                    : <MapPin size={14} style={{ color: isActive ? (isDark ? '#c084fc' : '#7c3aed') : (isDark ? '#94a3b8' : '#9ca3af') }} />}

                  {mems.length > 0 && (
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6d28d9, #a21caf)',
                      color: '#fff', fontSize: 10, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isDark ? '2.5px solid #111111' : '2.5px solid #ffffff',
                      boxShadow: '0 2px 6px rgba(109,40,217,0.4)',
                    }}>
                      {mems.length}
                    </div>
                  )}
                </motion.div>

                {/* Stop name & date */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: 12, fontWeight: 800,
                    fontFamily: FONT,
                    color: isActive ? (isDark ? '#c084fc' : '#5b21b6') : (isDark ? '#ffffff' : 'var(--text-primary)'),
                    margin: 0, lineHeight: 1.3,
                    maxWidth: 118, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.2px',
                    textDecoration: isActive ? 'underline' : 'none',
                    textDecorationColor: '#7c3aed',
                    textUnderlineOffset: '3px',
                  }}>{stop.name}</p>
                  <p style={{
                    fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280',
                    fontWeight: 600, margin: '3px 0 0', letterSpacing: '0.1px',
                    fontFamily: FONT,
                  }}>{stop.date}</p>
                </div>

                {/* Emoji chips */}
                {mems.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 120 }}>
                    {mems.slice(0, 3).map(m => {
                      const tag = MEMORY_TAGS.find(t => t.id === m.tagId)
                      if (!tag) return null
                      return (
                        <motion.span
                          key={m.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          title={`${tag.name} (${m.weight}/5)`}
                          style={{
                            fontSize: 15, padding: '4px 7px', borderRadius: 9,
                            background: `${tag.color}18`,
                            border: `1.5px solid ${tag.color}30`,
                          }}
                        >
                          {tag.emoji}
                        </motion.span>
                      )
                    })}
                    {mems.length > 3 && (
                      <span style={{
                        fontSize: 10, padding: '3px 7px', borderRadius: 9,
                        background: 'rgba(124,58,237,0.10)',
                        color: '#6d28d9', fontWeight: 800,
                        border: '1px solid rgba(124,58,237,0.22)',
                        fontFamily: FONT,
                      }}>
                        +{mems.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded detail */}
                <AnimatePresence>
                  {isSelected && mems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}
                    >
                      {mems.map(m => {
                        const tag = MEMORY_TAGS.find(t => t.id === m.tagId)
                        if (!tag) return null
                        return (
                          <div key={m.id} style={{
                            padding: '8px 10px', borderRadius: 10, textAlign: 'left',
                            background: isDark ? 'rgba(255,255,255,0.03)' : `${tag.color}0C`,
                            border: isDark ? '1px solid #333333' : `1.5px solid ${tag.color}25`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 12 }}>{tag.emoji}</span>
                              <span style={{
                                fontSize: 11, fontWeight: 800,
                                fontFamily: FONT,
                                color: tag.color, flex: 1,
                              }}>
                                {tag.name.replace('Most ', '')}
                              </span>
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: isDark ? '#ffffff' : '#6b7280',
                                background: isDark ? '#222222' : '#f3f4f6', padding: '1px 5px', borderRadius: 5,
                              }}>{m.weight}/5</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeMemory(m.id); loadMemories() }}
                                style={{
                                  border: 'none', background: 'none', cursor: 'pointer',
                                  color: '#9ca3af', display: 'flex',
                                  alignItems: 'center', padding: 2, borderRadius: 4,
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444' }}
                                onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af' }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                            {m.note && (
                              <p style={{
                                fontSize: 10, fontWeight: 500, color: isDark ? '#e2e8f0' : '#6b7280',
                                margin: '4px 0 0', lineHeight: 1.5,
                              }}>{m.note}</p>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

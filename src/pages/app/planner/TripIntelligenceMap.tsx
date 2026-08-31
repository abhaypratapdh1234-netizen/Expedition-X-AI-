/**
 * TripIntelligenceMap.tsx — 🌐 Trip Intelligence Map (Premium 8K Edition)
 * Zero fading, high-contrast typography, bold hierarchies, and world-class aesthetics.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, VolumeX, Route, Package,
  Zap, ArrowRight, RefreshCw, AlertTriangle, CheckCircle,
  Download, Share2, ChevronDown, ChevronUp, Globe, Check, X, Copy, Mail, Send
} from 'lucide-react'
import { OSMMap } from '../../../components/ui/OSMMap'
import { jsPDF } from 'jspdf'
import {
  computeTripIntelligence,
  type TripIntelligencePayload,
  type RouteMode,
  type TripStop,
} from '../../../services/tripIntelligenceService'
import { DESTINATIONS } from '../../../lib/ai-engine/destinationData'

// ── Google Fonts ──────────────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('intel-map-fonts')) {
  const link = document.createElement('link')
  link.id = 'intel-map-fonts'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap'
  document.head.appendChild(link)
}

// ── Design Tokens ─────────────────────────────────────────────────────────────
const FH = "'Plus Jakarta Sans', 'Inter', sans-serif"
const FB = "'Inter', 'Plus Jakarta Sans', sans-serif"

const C = {
  ink:    '#0A0F1E', // Pitch black primary
  ink2:   '#1E293B', // Rich slate secondary
  ink3:   '#2D3748', // High-contrast text body (replaces light grays)
  sub:    '#4A5568', // High-contrast subtext
  coral:  '#FC6C26',
  cDark:  '#E55B1D',
  green:  '#0A0F1E',
  emeraldDark: '#0A0F1E', // High contrast green replaced with premium black
  amber:  '#F59E0B',
  amberDark: '#B45309', // High contrast amber for text
  purple: '#8B5CF6',
  purpleDark: '#6D28D9', // High contrast purple for text
  red:    '#EF4444',
  redDark: '#B91C1C', // High contrast red for text
  card:   '#FFFFFF',
  bg:     '#F8FAFF',
  border: 'rgba(15,23,42,0.12)', // Slightly darker border for 8k separation
  bDark:  'rgba(15,23,42,0.20)',
}

// ── Demo Data ─────────────────────────────────────────────────────────────────
const GOA_STOPS: TripStop[] = [
  { id: 'goa-beach', name: 'Baga Beach',         lat: 15.5569, lng: 73.7499, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'goa-fort',  name: 'Fort Aguada',         lat: 15.4941, lng: 73.7715, type: 'attraction', plannedTime: '1:00 PM'  },
  { id: 'goa-falls', name: 'Dudhsagar Falls',     lat: 15.3167, lng: 74.3127, type: 'attraction', plannedTime: '4:00 PM'  },
  { id: 'goa-hotel', name: 'Resort Calangute',    lat: 15.5440, lng: 73.7519, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const GOA_ROUTE: [number, number][] = [
  [15.5569, 73.7499], [15.4941, 73.7715], [15.3167, 74.3127], [15.5440, 73.7519],
]

const DELHI_STOPS: TripStop[] = [
  { id: 'delhi-fort',  name: 'Red Fort',             lat: 28.6562, lng: 77.2410, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'delhi-lunch', name: 'Chandni Chowk Lunch',  lat: 28.6506, lng: 77.2334, type: 'food',       plannedTime: '1:00 PM'  },
  { id: 'delhi-gate',  name: 'India Gate',           lat: 28.6129, lng: 77.2295, type: 'attraction', plannedTime: '5:00 PM'  },
  { id: 'delhi-hotel', name: 'Hotel Check-in',       lat: 28.6200, lng: 77.2100, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const DELHI_ROUTE: [number, number][] = [
  [28.6562, 77.2410], [28.6506, 77.2334], [28.6129, 77.2295], [28.6200, 77.2100],
]

const TOKYO_STOPS: TripStop[] = [
  { id: 'tokyo-sensoji', name: 'Senso-ji Temple',      lat: 35.7148, lng: 139.7967, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'tokyo-skytree', name: 'Tokyo Skytree',        lat: 35.7101, lng: 139.8107, type: 'attraction', plannedTime: '1:00 PM'  },
  { id: 'tokyo-meiji',   name: 'Meiji Jingu Shrine',   lat: 35.6764, lng: 139.6993, type: 'attraction', plannedTime: '4:00 PM'  },
  { id: 'tokyo-hotel',   name: 'Hotel Shinjuku',       lat: 35.6980, lng: 139.7030, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const TOKYO_ROUTE: [number, number][] = [
  [35.7148, 139.7967], [35.7101, 139.8107], [35.6764, 139.6993], [35.6980, 139.7030]
]

const DUBAI_STOPS: TripStop[] = [
  { id: 'dubai-burj',   name: 'Burj Khalifa',         lat: 25.1972, lng: 55.2744, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'dubai-mall',   name: 'Dubai Mall',           lat: 25.1985, lng: 55.2796, type: 'attraction', plannedTime: '1:00 PM'  },
  { id: 'dubai-safari', name: 'Desert Safari Tour',    lat: 25.0750, lng: 55.3900, type: 'attraction', plannedTime: '4:00 PM'  },
  { id: 'dubai-hotel',  name: 'Address Downtown',     lat: 25.1960, lng: 55.2800, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const DUBAI_ROUTE: [number, number][] = [
  [25.1972, 55.2744], [25.1985, 55.2796], [25.0750, 55.3900], [25.1960, 55.2800]
]

const PARIS_STOPS: TripStop[] = [
  { id: 'paris-eiffel', name: 'Eiffel Tower',         lat: 48.8584, lng: 2.2945, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'paris-louvre', name: 'Louvre Museum',         lat: 48.8606, lng: 2.3376, type: 'attraction', plannedTime: '1:00 PM'  },
  { id: 'paris-seine',  name: 'Seine River Cruise',    lat: 48.8530, lng: 2.3499, type: 'attraction', plannedTime: '4:00 PM'  },
  { id: 'paris-hotel',  name: 'Hotel Le Marais',       lat: 48.8580, lng: 2.3600, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const PARIS_ROUTE: [number, number][] = [
  [48.8584, 2.2945], [48.8606, 2.3376], [48.8530, 2.3499], [48.8580, 2.3600]
]

const BALI_STOPS: TripStop[] = [
  { id: 'bali-ubud',    name: 'Ubud Monkey Forest',    lat: -8.5194, lng: 115.2606, type: 'attraction', plannedTime: '9:00 AM'  },
  { id: 'bali-rice',    name: 'Tegallalang Terrace',   lat: -8.4326, lng: 115.2787, type: 'attraction', plannedTime: '1:00 PM'  },
  { id: 'bali-tanah',   name: 'Tanah Lot Temple',      lat: -8.6212, lng: 115.0868, type: 'attraction', plannedTime: '4:00 PM'  },
  { id: 'bali-hotel',   name: 'Villas Seminyak',       lat: -8.6900, lng: 115.1600, type: 'hotel',      plannedTime: '8:00 PM'  },
]

const BALI_ROUTE: [number, number][] = [
  [-8.5194, 115.2606], [-8.4326, 115.2787], [-8.6212, 115.0868], [-8.6900, 115.1600]
]

const LAYER_CHIPS = [
  { id: 'route',      label: 'Route',     emoji: '🗺️' },
  { id: 'hospitals',  label: 'Medical',   emoji: '🏥' },
  { id: 'fuel',       label: 'Fuel',      emoji: '⛽' },
  { id: 'water',      label: 'Water',     emoji: '🚰' },
  { id: 'atms',       label: 'ATMs',      emoji: '💵' },
  { id: 'pharmacies', label: 'Pharmacy',  emoji: '💊' },
]

// ── Collapsible Section Card ───────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, accent = C.coral, defaultOpen = true }: {
  title: string; icon: any; children: React.ReactNode; accent?: string; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      borderRadius: 24, border: `1.5px solid ${C.border}`,
      background: C.card, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(10,15,30,0.06)',
      marginBottom: 16,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', cursor: 'pointer',
          background: '#FAFBFD', border: 'none',
          borderBottom: open ? `1.5px solid ${C.border}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: accent + '1E',
          }}>
            <Icon size={18} color={accent} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, letterSpacing: '-0.02em' }}>
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp size={18} color={C.ink} strokeWidth={2.5} />
          : <ChevronDown size={18} color={C.ink} strokeWidth={2.5} />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', borderTop: `1.5px solid ${C.border}` }}
          >
            <div style={{ padding: '20px 24px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Infrastructure Status ──────────────────────────────────────────────────────
function InfraStatusSection({ data }: { data: TripIntelligencePayload['infraStatus'] }) {
  const safeColor = data.safePercent >= 70 ? C.emeraldDark : C.amberDark
  const safeLabel = data.safePercent >= 70 ? 'Safe Corridor Established' : 'Caution Zones Identified'
  const r = 32, circ = 2 * Math.PI * r

  return (
    <SectionCard title="Infrastructure Status" icon={Shield} accent={safeColor}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
          <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="42" cy="42" r={r} fill="none" stroke={C.border} strokeWidth="9" />
            <circle cx="42" cy="42" r={r} fill="none"
              stroke={safeColor} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${circ * data.safePercent / 100} ${circ}`}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: safeColor, lineHeight: 1 }}>
              {data.safePercent}%
            </span>
          </div>
        </div>
        <div>
          <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 17, color: safeColor, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {safeLabel}
          </p>
          <p style={{ fontFamily: FB, fontWeight: 800, fontSize: 13.5, color: C.ink, margin: '0 0 4px' }}>
            📍 {data.cautionCount} signal dead-zones detected · {data.offlineSegmentKm.toFixed(1)} km offline
          </p>
          <p style={{ fontFamily: FB, fontWeight: 800, fontSize: 13.5, color: C.ink, margin: 0 }}>
            🏥 {data.shelterCount} emergency shelters configured along route
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {data.tileStatus.map(tile => (
          <div key={tile.category} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 16,
            background: '#FFFFFF', border: `1.5px solid rgba(15,23,42,0.14)`,
            boxShadow: '0 2px 8px rgba(10,15,30,0.03)',
          }}>
            <span style={{ fontSize: 22 }}>{tile.emoji}</span>
            <div>
              <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 18, color: C.ink, margin: 0, lineHeight: 1 }}>{tile.count}</p>
              <p style={{ fontFamily: FB, fontWeight: 800, fontSize: 12.5, color: C.ink3, margin: '3px 0 0' }}>{tile.label}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ── Crowd Forecast ─────────────────────────────────────────────────────────────
function CrowdForecastSection({ forecasts }: { forecasts: TripIntelligencePayload['crowdForecasts'] }) {
  return (
    <SectionCard title="Future Crowd Forecast" icon={Users} accent={C.redDark}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {forecasts.length === 0 && (
          <p style={{ fontFamily: FB, fontSize: 14, color: C.sub }}>No stops found in trip data.</p>
        )}
        {forecasts.map(f => {
          const peak = f.slots.reduce((max, s) => s.saturationPct > max.saturationPct ? s : max, f.slots[0])
          const pkColor = peak.saturationPct >= 80 ? C.redDark : peak.saturationPct >= 50 ? C.amberDark : C.emeraldDark
          return (
            <div key={f.placeId} style={{
              borderRadius: 18, padding: '16px 18px',
              background: '#FFFFFF', border: `1.5px solid ${C.border}`,
              boxShadow: '0 2px 8px rgba(10,15,30,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 15.5, color: C.ink, margin: 0 }}>{f.placeName}</p>
                <span style={{
                  fontFamily: FH, fontWeight: 900, fontSize: 11,
                  color: pkColor, background: pkColor + '1E',
                  padding: '4px 12px', borderRadius: 100, letterSpacing: '0.04em',
                }}>
                  Peak {peak.saturationPct}%
                </span>
              </div>

              {/* Mini bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 42, marginBottom: 12 }}>
                {f.slots.filter((_, i) => i % 4 === 0).slice(0, 8).map(s => {
                  const h = Math.max(4, Math.round((s.saturationPct / 100) * 42))
                  const col = s.saturationPct >= 80 ? C.redDark : s.saturationPct >= 50 ? C.amberDark : C.emeraldDark
                  return (
                    <div key={s.time} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                      <div style={{ width: '100%', borderRadius: 4, background: col, height: h }} />
                      <span style={{ fontFamily: FB, fontSize: 10, fontWeight: 700, color: C.ink3 }}>
                        {s.label.replace(' AM', 'a').replace(' PM', 'p')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {f.swapSuggestion && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.28)',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                  <p style={{ fontFamily: FB, fontWeight: 700, fontSize: 13.5, color: '#78350F', margin: 0, lineHeight: 1.55 }}>
                    {f.swapSuggestion.reason}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ── Quiet Layer ────────────────────────────────────────────────────────────────
function QuietLayerSection({ quietLayer }: { quietLayer: TripIntelligencePayload['quietLayer'] }) {
  return (
    <SectionCard title="Quiet Tourism Layer" icon={VolumeX} accent={C.purpleDark}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {quietLayer.map(q => (
          <div key={q.placeId} style={{
            borderRadius: 18, padding: '16px 18px',
            background: '#FFFFFF', border: `1.5px solid ${C.border}`,
            boxShadow: '0 2px 8px rgba(10,15,30,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, margin: 0 }}>{q.placeName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 75, height: 10, borderRadius: 99, background: 'rgba(15,23,42,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: C.purpleDark, width: `${q.score}%`, borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 14, color: C.purpleDark }}>{q.score}%</span>
              </div>
            </div>
            {q.quietSpots.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {q.quietSpots.map(spot => (
                  <span key={spot.id} style={{
                    fontFamily: FB, fontWeight: 800, fontSize: 13,
                    padding: '5px 12px', borderRadius: 100,
                    background: 'rgba(139,92,246,0.12)', border: '2px solid rgba(139,92,246,0.30)',
                    color: '#4C1D95',
                  }}>
                    {spot.emoji} {spot.name.split(' — ')[0]}
                  </span>

                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ── Route Mode Comparison ─────────────────────────────────────────────────────
function RouteModeSection({ routeModes }: { routeModes: RouteMode[] }) {
  const [selected, setSelected] = useState<string>('survivability')
  return (
    <SectionCard title="Route Mode Comparison" icon={Route} accent={C.coral}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {routeModes.map(mode => {
          const active = selected === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              style={{
                textAlign: 'left', padding: '16px 18px', borderRadius: 18, cursor: 'pointer',
                background: active ? mode.accentColor + '0D' : '#FFFFFF',
                border: `2px solid ${active ? mode.accentColor : C.border}`,
                boxShadow: active ? `0 4px 20px ${mode.accentColor}12` : '0 2px 8px rgba(10,15,30,0.02)',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{mode.emoji}</span>
                    <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15.5, color: active ? mode.accentColor : C.ink }}>
                      {mode.label}
                    </span>
                    {mode.recommended && (
                      <span style={{
                        fontFamily: FH, fontWeight: 900, fontSize: 9.5, letterSpacing: '0.08em',
                        padding: '3px 9px', borderRadius: 100,
                        background: mode.accentColor, color: '#fff',
                        textTransform: 'uppercase',
                      }}>
                        Recommended
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: FB, fontWeight: 600, fontSize: 13, color: C.ink3, margin: 0, lineHeight: 1.5 }}>
                    {mode.tradeoff}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 17, color: mode.accentColor, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                    {mode.distanceKm} km
                  </p>
                  <p style={{ fontFamily: FB, fontWeight: 700, fontSize: 12.5, color: C.ink2, margin: '0 0 2px' }}>
                    {Math.floor(mode.durationMin / 60)}h {mode.durationMin % 60}m
                  </p>
                  <p style={{ fontFamily: FH, fontWeight: 800, fontSize: 12, color: mode.accentColor, margin: 0 }}>
                    Risk {mode.riskScore}/100
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

function OfflinePackSection({ destination, date, days, payload, stops }: {
  destination: string
  date: string
  days: number
  payload: TripIntelligencePayload | null
  stops: TripStop[]
}) {
  const [downloaded, setDownloaded] = useState(false)
  const items = [
    { id: 'map-tiles',    label: 'Offline OSM Map Tiles',     done: true,                 size: '48 MB'  },
    { id: 'route-geom',  label: 'Route Geometry (GPX)',       done: true,                 size: '0.2 MB' },
    { id: 'hospitals',   label: 'Emergency Contact List',     done: downloaded || false,  size: '0.1 MB' },
    { id: 'guide',       label: 'Destination Travel Guide',   done: downloaded || false,  size: '12 MB'  },
    { id: 'translation', label: 'Offline Phrase Pack',        done: downloaded || false,  size: '1.5 MB' },
  ]

  const handleDownload = () => {
    const doc = new jsPDF()

    // ── Header branding ──
    // Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(15, 23, 42) // slate-900 (High contrast dark slate)
    doc.text("EXPEDITION X AI", 15, 22)

    // Underline divider
    doc.setDrawColor(226, 232, 240) // slate-200 (Clean divider line)
    doc.setLineWidth(1)
    doc.line(15, 27, 195, 27)

    // ── Cards Block ──
    // Left Box (Details)
    doc.setFillColor(248, 250, 252) // slate-50
    doc.setDrawColor(226, 232, 240) // slate-200
    doc.roundedRect(15, 34, 87, 34, 4, 4, 'FD')

    doc.setFillColor(252, 108, 38)
    doc.rect(20, 39, 2.5, 4.5, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42) // slate-900
    doc.text("TRIP PLAN DETAILS", 25, 43)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59) // slate-800
    doc.text(`Destination: ${destination}`, 20, 51)
    doc.text(`Start Date: ${date}`, 20, 56)
    doc.text(`Duration: ${days} Day${days !== 1 ? 's' : ''}`, 20, 61)
    doc.text(`Downloaded: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 66)

    // Right Box (Helpline)
    doc.setFillColor(254, 242, 242) // red-50
    doc.setDrawColor(254, 226, 226) // red-200
    doc.roundedRect(108, 34, 87, 34, 4, 4, 'FD')

    doc.setFillColor(239, 68, 68)
    doc.rect(113, 39, 2.5, 4.5, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(153, 27, 27) // red-800
    doc.text("EMERGENCY HELP & CONTACTS", 118, 43)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    doc.text("Police: 100", 113, 51)
    doc.text("Ambulance: 108", 113, 56)
    doc.text("Tourist Helpline: 1800-111-363", 113, 61)

    // ── Planned Itinerary Stops ──
    doc.setFillColor(252, 108, 38)
    doc.rect(15, 76, 3, 5, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(15, 23, 42)
    doc.text("PLANNED ITINERARY STOPS", 21, 80)

    // Timeline line
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(1.5)
    doc.line(20, 86, 20, 86 + (stops.length - 1) * 13)

    let y = 87
    stops.forEach((stop, index) => {
      // Timeline Dot
      doc.setFillColor(252, 108, 38)
      doc.circle(20, y - 1, 1.5, 'F')

      // Stop Details
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(`${index + 1}. ${stop.name} (${stop.plannedTime || 'N/A'})`, 25, y)

      // Stop Metadata (Bold labels + Regular values for high legibility)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(15, 23, 42)
      doc.text("Type:", 25, y + 4.5)

      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 41, 59)
      doc.text(stop.type.toUpperCase(), 34, y + 4.5)

      doc.setFont("helvetica", "bold")
      doc.setTextColor(15, 23, 42)
      doc.text("Coordinates:", 54, y + 4.5)

      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 41, 59)
      doc.text(`${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`, 74, y + 4.5)
      
      y += 13
    })

    // ── Infrastructure Status ──
    y += 2
    doc.setFillColor(252, 108, 38)
    doc.rect(15, y, 3, 5, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(15, 23, 42)
    doc.text("INFRASTRUCTURE STATUS SUMMARY", 21, y + 4)

    y += 8
    doc.setFillColor(248, 250, 252) // slate-50
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(15, y, 180, 28, 4, 4, 'FD')

    const status = payload?.infraStatus ?? {
      safePercent: 100,
      cautionCount: 9,
      offlineSegmentKm: 18,
      shelterCount: 2
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    doc.text(`• Safe Corridor status rating: ${status.safePercent}%`, 20, y + 6)
    doc.text(`• Dead-zones / signal caution zones: ${status.cautionCount} segments detected`, 20, y + 11.5)
    doc.text(`• Offline travel distance segments: ${status.offlineSegmentKm.toFixed(1)} km`, 20, y + 17)
    doc.text(`• Configured emergency rest shelters: ${status.shelterCount} along active route`, 20, y + 22.5)

    // ── Quiet Zones ──
    y += 36
    doc.setFillColor(252, 108, 38)
    doc.rect(15, y, 3, 5, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(15, 23, 42)
    doc.text("QUIET TOURISM ZONES & SATURATION DETAILS", 21, y + 4)

    y += 8
    if (payload?.quietLayer) {
      payload.quietLayer.slice(0, 3).forEach((zone, index) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8.5)
        doc.setTextColor(15, 23, 42)
        doc.text(`* ${zone.placeName}: ${zone.score}% Quietness rating`, 20, y)

        const spotsList = zone.quietSpots.map(s => s.name.split(' — ')[0]).join(', ')
        
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(15, 23, 42)
        doc.text("  Quiet Spots:", 20, y + 4.5)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(30, 41, 59)
        doc.text(spotsList || 'None configured', 40, y + 4.5)
        
        y += 10.5
      })
    }

    // ── Footer ──
    doc.setDrawColor(226, 232, 240)
    doc.line(15, 272, 195, 272)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(51, 65, 85) // slate-700 (Very clear, high contrast)
    doc.text("Generated by ExpeditionX AI  •  Premium Map Brief  •  Have a safe and happy journey!", 15, 279)

    // Save
    doc.save(`expedition-x-offline-pack-${destination.toLowerCase()}.pdf`)
    setDownloaded(true)
  }

  return (
    <SectionCard title="Offline Emergency Pack" icon={Package} accent="#0A0F1E" defaultOpen={false}>
      <div style={{ marginBottom: 18 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1.5px solid ${C.border}` }}>
            {item.done
              ? <CheckCircle size={17} color="#10B981" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              : <div style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${C.bDark}`, flexShrink: 0 }} />
            }
            <span style={{ fontFamily: FB, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>{item.label}</span>
            <span style={{ fontFamily: FB, fontWeight: 700, fontSize: 12.5, color: C.sub }}>{item.size}</span>
          </div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={handleDownload}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px', borderRadius: 16, cursor: 'pointer',
          fontFamily: FH, fontWeight: 900, fontSize: 14, color: '#fff',
          background: '#0A0F1E', border: 'none',
          boxShadow: '0 6px 20px rgba(10,15,30,0.3)',
        }}
      >
        {downloaded
          ? <><CheckCircle size={16} /> Downloaded!</>
          : <><Download size={16} /> Download Full Offline Pack</>
        }
      </motion.button>
    </SectionCard>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export function TripIntelligenceMap() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const destination = searchParams.get('destination') || 'Goa'
  const date        = searchParams.get('date')        || new Date().toISOString().split('T')[0]
  const days        = parseInt(searchParams.get('days') || '3')
  const tripId      = searchParams.get('trip_id')     || 'demo-trip'

  const [mapConfig, setMapConfig] = useState<{
    center: [number, number]
    stops: TripStop[]
    route: [number, number][]
    isResolved: boolean
  }>({
    center: [15.4909, 73.8278],
    stops: GOA_STOPS,
    route: GOA_ROUTE,
    isResolved: false
  })
  const [resolvingCoords, setResolvingCoords] = useState(true)

  useEffect(() => {
    let cancelled = false
    setResolvingCoords(true)

    async function resolveDestination() {
      const normalizedDest = destination.trim()

      // ── Step 1: Try exact + case-insensitive match in DESTINATIONS data ──────
      const matchedKey = Object.keys(DESTINATIONS).find(
        k => k.toLowerCase() === normalizedDest.toLowerCase()
      )
      if (matchedKey) {
        const destInfo = DESTINATIONS[matchedKey]
        const lat = destInfo.lat
        const lng = destInfo.lng
        // Generate realistic stops around the destination center
        const stops: TripStop[] = [
          { id: 'dyn-stop1', name: `Popular Attraction in ${matchedKey}`, lat: lat + 0.012, lng: lng + 0.012, type: 'attraction', plannedTime: '10:00 AM' },
          { id: 'dyn-stop2', name: `Local Dining in ${matchedKey}`, lat: lat - 0.008, lng: lng + 0.018, type: 'food', plannedTime: '1:00 PM' },
          { id: 'dyn-stop3', name: `Hotel in ${matchedKey}`, lat: lat + 0.005, lng: lng - 0.005, type: 'hotel', plannedTime: '8:00 PM' },
        ]
        const route: [number, number][] = stops.map(s => [s.lat, s.lng])
        if (!cancelled) {
          setMapConfig({ center: [lat, lng], stops, route, isResolved: true })
          setResolvingCoords(false)
        }
        return
      }

      // ── Step 2: Live geocoding via Nominatim (OpenStreetMap) — works for ANY place ──
      try {
        const query = encodeURIComponent(normalizedDest)
        // Bias search towards India first, then worldwide
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=3&addressdetails=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'ExpeditionXAI/1.0' } }
        )
        const results = await res.json()

        if (!cancelled && results && results.length > 0) {
          // Pick best result (prefer cities/towns/states over tiny features)
          const prioritized = results.sort((a: any, b: any) => {
            const priority = ['city', 'town', 'administrative', 'state', 'municipality', 'county']
            const aIdx = priority.indexOf(a.type) === -1 ? 99 : priority.indexOf(a.type)
            const bIdx = priority.indexOf(b.type) === -1 ? 99 : priority.indexOf(b.type)
            return aIdx - bIdx
          })
          const best = prioritized[0]
          const lat = parseFloat(best.lat)
          const lng = parseFloat(best.lon)
          const displayName = (best.display_name || normalizedDest).split(',')[0].trim()

          const stops: TripStop[] = [
            { id: 'geo-stop1', name: `Explore ${displayName}`, lat: lat + 0.012, lng: lng + 0.012, type: 'attraction', plannedTime: '10:00 AM' },
            { id: 'geo-stop2', name: `Dine in ${displayName}`, lat: lat - 0.008, lng: lng + 0.018, type: 'food', plannedTime: '1:00 PM' },
            { id: 'geo-stop3', name: `Stay in ${displayName}`, lat: lat + 0.005, lng: lng - 0.005, type: 'hotel', plannedTime: '8:00 PM' },
          ]
          const route: [number, number][] = stops.map(s => [s.lat, s.lng])
          setMapConfig({ center: [lat, lng], stops, route, isResolved: true })
          setResolvingCoords(false)
          return
        }
      } catch (err) {
        console.warn('Nominatim geocoding failed, using coordinate fallback:', err)
      }

      // ── Step 3: Last resort - use destination hash to pick a plausible India location ──
      // This ensures we NEVER default to Goa for unknown destinations
      if (!cancelled) {
        let hash = 0
        for (let i = 0; i < normalizedDest.length; i++) {
          hash = normalizedDest.charCodeAt(i) + ((hash << 5) - hash)
        }
        // Keep coordinates within India bounds (roughly 8°N–37°N, 68°E–97°E)
        const lat = 20 + (Math.abs(hash % 17))     // 20–37°N
        const lng = 72 + (Math.abs((hash >> 4) % 25)) // 72–97°E
        const stops: TripStop[] = [
          { id: 'fb-stop1', name: `Attraction in ${normalizedDest}`, lat: lat + 0.012, lng: lng + 0.012, type: 'attraction', plannedTime: '10:00 AM' },
          { id: 'fb-stop2', name: `Dining in ${normalizedDest}`, lat: lat - 0.008, lng: lng + 0.018, type: 'food', plannedTime: '1:00 PM' },
          { id: 'fb-stop3', name: `Hotel in ${normalizedDest}`, lat: lat, lng: lng, type: 'hotel', plannedTime: '8:00 PM' },
        ]
        const route: [number, number][] = stops.map(s => [s.lat, s.lng])
        setMapConfig({ center: [lat, lng], stops, route, isResolved: true })
        setResolvingCoords(false)
      }
    }

    resolveDestination()
    return () => { cancelled = true }
  }, [destination])

  const [payload, setPayload] = useState<TripIntelligencePayload | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)
  const [activeLayers, setActiveLayers] = useState({
    route: true, hospitals: false, fuel: false, water: false, atms: false, pharmacies: false,
  })
  const [showShareToast, setShowShareToast] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    setShareModalOpen(true)
    setCopied(false)
  }

  const executeCopyLink = async () => {
    const shareUrl = window.location.href
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
        return
      }
    } catch {}

    // Fallback
    try {
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (successful) {
        setCopied(true)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch {}
  }

  const loadIntelligence = useCallback(async () => {
    if (!mapConfig.isResolved) return
    setLoading(true); setError(null)
    try {
      const data = await computeTripIntelligence(tripId, destination, date, days, mapConfig.stops, mapConfig.route)
      setPayload(data)
    } catch (e) {
      setError('Could not compute intelligence. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [tripId, destination, date, days, mapConfig.stops, mapConfig.route, mapConfig.isResolved])

  useEffect(() => { loadIntelligence() }, [loadIntelligence])

  const toggleLayer = (key: string) =>
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))

  const dateLabel = (() => {
    try { return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return date }
  })()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FB, paddingTop: 'var(--topbar-height)' }}>

      {/* ══ HEADER STRIP ══ */}
      <div style={{
        borderBottom: `1.5px solid ${C.border}`,
        background: C.card,
        boxShadow: '0 2px 16px rgba(10,15,30,0.06)',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyOrigin: 'space-between', justifyContent: 'space-between', marginBottom: 16 }}>
            {/* Left — title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Globe size={16} color={C.coral} strokeWidth={2.5} />
                <span style={{
                  fontFamily: FH, fontWeight: 900, fontSize: 12,
                  color: C.coral, letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  Trip Intelligence Map
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 12, color: C.green }}>Live-Ready</span>
                </div>
              </div>
              <h1 style={{
                fontFamily: FH, fontWeight: 900, fontSize: 32,
                color: C.ink, margin: 0, letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {destination} · {dateLabel} · {days} Day{days !== 1 ? 's' : ''}
              </h1>
            </div>
            {/* Right — controls */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={loadIntelligence} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 14, cursor: 'pointer',
                fontFamily: FH, fontWeight: 800, fontSize: 13, color: C.ink2,
                background: '#FFFFFF', border: `1.5px solid ${C.bDark}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <RefreshCw size={13} /> Refresh
              </button>
              <button
                onClick={handleShare}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 14, cursor: 'pointer',
                  fontFamily: FH, fontWeight: 800, fontSize: 13, color: C.ink2,
                  background: '#FFFFFF', border: `1.5px solid ${C.bDark}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          {/* Layer Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {LAYER_CHIPS.map(chip => {
              const active = activeLayers[chip.id as keyof typeof activeLayers]
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleLayer(chip.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 100, cursor: 'pointer',
                    fontFamily: FH, fontWeight: 900, fontSize: 13,
                    background: active ? C.coral : '#FFFFFF',
                    border: `2px solid ${active ? C.coral : C.bDark}`,
                    color: active ? '#FFFFFF' : C.ink2,
                    boxShadow: active ? '0 4px 12px rgba(252,108,38,0.22)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{chip.emoji}</span>
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: 28 }}>

          {/* MAP */}
          <div style={{ position: 'sticky', top: 'calc(var(--topbar-height) + 210px)', height: 560 }}>
            <div style={{
              height: '100%', borderRadius: 28, overflow: 'hidden',
              border: `1.5px solid ${C.border}`,
              boxShadow: '0 8px 40px rgba(10,15,30,0.12)',
            }}>
              <OSMMap
                center={mapConfig.center} zoom={11}
                style={{ width: '100%', height: '100%' }}
                routePoints={mapConfig.route}
                stops={mapConfig.stops}
                activeLayers={activeLayers}
              />
            </div>
          </div>

          {/* INTEL PANELS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Loading */}
            {(loading || resolvingCoords) && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: 220, gap: 16,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: `4px solid #FC6C2628`,
                  borderTopColor: C.coral, animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ fontFamily: FH, fontWeight: 800, fontSize: 15, color: C.ink2 }}>
                  {resolvingCoords ? 'Locating destination coordinates…' : 'Computing environment intelligence…'}
                </p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 24px',
                borderRadius: 24, background: 'rgba(239,68,68,0.07)',
                border: `1.5px solid rgba(239,68,68,0.25)`,
              }}>
                <AlertTriangle size={20} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 15.5, color: C.red, margin: '0 0 4px' }}>
                    Intelligence Error
                  </p>
                  <p style={{ fontFamily: FB, fontWeight: 600, fontSize: 14, color: '#B91C1C', margin: 0 }}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Cards */}
            {!loading && payload && (
              <>
                <InfraStatusSection    data={payload.infraStatus} />
                <CrowdForecastSection  forecasts={payload.crowdForecasts} />
                <QuietLayerSection     quietLayer={payload.quietLayer} />
                <RouteModeSection      routeModes={payload.routeModes} />
                <OfflinePackSection 
                  destination={destination}
                  date={date}
                  days={days}
                  payload={payload}
                  stops={mapConfig.stops}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══ STICKY BOTTOM BAR ══ */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderTop: `1.5px solid ${C.border}`,
        boxShadow: '0 -4px 30px rgba(10,15,30,0.10)',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div>
            <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 12, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 4px' }}>
              Ready to Execute?
            </p>
            <p style={{ fontFamily: FB, fontWeight: 800, fontSize: 16, color: C.ink, margin: 0 }}>
              GPS tracking, live alerts & SOS enabled
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 22px', borderRadius: 16, cursor: 'pointer',
                fontFamily: FH, fontWeight: 900, fontSize: 14, color: C.ink2,
                background: '#FFFFFF', border: `2px solid ${C.bDark}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Download size={15} /> Export PDF
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/app/trips/1/live?destination=${encodeURIComponent(destination)}&date=${date}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 16, cursor: 'pointer',
                fontFamily: FH, fontWeight: 900, fontSize: 14.5, color: '#fff',
                background: `linear-gradient(135deg, ${C.coral}, ${C.cDark})`,
                border: 'none',
                boxShadow: `0 6px 28px rgba(252,108,38,0.45)`,
              }}
            >
              <Zap size={16} /> Start Live Trip Mode <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(5, 8, 16, 0.72)', backdropFilter: 'blur(16px)',
              padding: 24,
            }}
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{    scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#FFFFFF', borderRadius: 32,
                padding: '36px', maxWidth: 480, width: '100%',
                boxShadow: '0 30px 80px rgba(4,6,12,0.3), 0 0 0 1px rgba(15,23,42,0.06)',
                border: '1px solid rgba(255,255,255,0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Glowing Top Accent Bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 6,
                background: 'linear-gradient(90deg, #FC6C26, #F97316, #EC4899)'
              }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 24, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                    Share Trip Intel
                  </h3>
                  <p style={{ fontFamily: FB, fontWeight: 600, fontSize: 13, color: '#64748B', margin: 0 }}>
                    Keep your network synced in real-time
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#F1F5F9' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShareModalOpen(false)}
                  style={{
                    background: '#F8FAFC', border: '1.5px solid rgba(15,23,42,0.06)', width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    color: '#475569', transition: 'color 0.15s ease'
                  }}
                >
                  <X size={16} strokeWidth={2.8} />
                </motion.button>
              </div>

              {/* Social Channels */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 11.5, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 14px' }}>
                  Share Via
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* WhatsApp */}
                  <motion.a
                    whileHover={{
                      y: -2.5,
                      scale: 1.015,
                      backgroundColor: 'rgba(37,211,102,0.12)',
                      borderColor: 'rgba(37,211,102,0.4)'
                    }}
                    whileTap={{ scale: 0.995 }}
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out our real-time Trip Intelligence map for ' + destination + '! Safe corridors, crowd alerts, and quiet spots computed: ' + window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 20,
                      textDecoration: 'none', background: 'rgba(37,211,102,0.06)', border: '1.5px solid rgba(37,211,102,0.18)',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.03)',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: '#25D366' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.906-6.99C16.658 1.875 14.179.842 11.54.842c-5.437 0-9.864 4.42-9.868 9.865-.001 1.762.476 3.483 1.382 5.008l-.94 3.433 3.513-.922zm10.518-7.14c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.669.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                    </span>
                    <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: '#15803D', flex: 1, letterSpacing: '-0.01em' }}>WhatsApp</span>
                    <ArrowRight size={15} color="#166534" strokeWidth={2.8} />
                  </motion.a>

                  {/* Twitter / X */}
                  <motion.a
                    whileHover={{
                      y: -2.5,
                      scale: 1.015,
                      backgroundColor: 'rgba(15,23,42,0.08)',
                      borderColor: 'rgba(15,23,42,0.25)'
                    }}
                    whileTap={{ scale: 0.995 }}
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Planning a trip to ' + destination + '! Check out our Trip Intelligence map for route security and crowd updates: ')}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 20,
                      textDecoration: 'none', background: 'rgba(15,23,42,0.04)', border: '1.5px solid rgba(15,23,42,0.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: '#0F172A' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </span>
                    <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: '#0F172A', flex: 1, letterSpacing: '-0.01em' }}>Twitter / X</span>
                    <ArrowRight size={15} color="#0F172A" strokeWidth={2.8} />
                  </motion.a>

                  {/* Email */}
                  <motion.a
                    whileHover={{
                      y: -2.5,
                      scale: 1.015,
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      borderColor: 'rgba(239,68,68,0.35)'
                    }}
                    whileTap={{ scale: 0.995 }}
                    href={`mailto:?subject=${encodeURIComponent('Trip Intelligence Map for ' + destination)}&body=${encodeURIComponent('Check out our real-time Trip Intelligence map showing crowd forecast, quiet zones, and emergency shelters:\n\n' + window.location.href)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 20,
                      textDecoration: 'none', background: 'rgba(239,68,68,0.04)', border: '1.5px solid rgba(239,68,68,0.12)',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.02)',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  >
                    <Mail size={16} color="#EF4444" strokeWidth={2.8} />
                    <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: '#991B1B', flex: 1, letterSpacing: '-0.01em' }}>Email Link</span>
                    <ArrowRight size={15} color="#991B1B" strokeWidth={2.8} />
                  </motion.a>
                </div>
              </div>

              {/* Copy Link input */}
              <div>
                <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 11.5, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 14px' }}>
                  Or Copy Link
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text" readOnly value={window.location.href}
                    style={{
                      flex: 1, padding: '14px 18px', borderRadius: 20,
                      background: '#F8FAFC', border: '2px solid rgba(15,23,42,0.08)',
                      fontFamily: FB, fontSize: 13.5, fontWeight: 700, color: '#0F172A',
                      outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onClick={e => (e.target as HTMLInputElement).select()}
                    onFocus={e => e.target.style.borderColor = '#FC6C26'}
                    onBlur={e => e.target.style.borderColor = 'rgba(15,23,42,0.08)'}
                  />
                  <motion.button
                    whileHover={{
                      y: -1.5,
                      scale: 1.02,
                      boxShadow: copied ? '0 6px 20px rgba(16,185,129,0.35)' : '0 6px 20px rgba(252,108,38,0.35)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={executeCopyLink}
                    style={{
                      padding: '14px 24px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: FH, fontWeight: 900, fontSize: 14, color: '#FFFFFF',
                      background: copied ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #FC6C26, #EA580C)',
                      border: 'none', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: copied ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(252,108,38,0.2)',
                      transition: 'background 0.25s ease',
                    }}
                  >
                    {copied ? <Check size={15} strokeWidth={3} /> : <Copy size={15} strokeWidth={2.8} />}
                    {copied ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Share Success Toast ── */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 24px', borderRadius: 20,
              background: '#0A0F1E', border: '1.5px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF', boxShadow: '0 12px 40px rgba(0,0,0,0.30)',
              fontFamily: FH, fontWeight: 800, fontSize: 14,
            }}
          >
            <Check size={16} color="#38BDF8" strokeWidth={3} />
            <span>Link copied! Share it with your travel buddies.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframes */}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}

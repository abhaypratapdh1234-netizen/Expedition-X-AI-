/**
 * CostEstimator.tsx — 💰 Premium Cost Recalculator (8K Edition)
 * Bold weights, high contrast typography, dark ink variables, and zero fading.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Sparkles, TrendingDown, DollarSign } from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { tripService } from '../../../services/tripService'
import { aiService } from '../../../services/aiService'
import { pageTransition } from '../../../motion/variants'

// ── Google Fonts ──────────────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('cost-estimator-fonts')) {
  const link = document.createElement('link')
  link.id = 'cost-estimator-fonts'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap'
  document.head.appendChild(link)
}

// ── Typography & Styling Tokens ──────────────────────────────────────────────
const FH = "'Plus Jakarta Sans', 'Inter', sans-serif"
const FB = "'Inter', 'Plus Jakarta Sans', sans-serif"

const C = {
  ink:       '#0A0F1E', // Absolute contrast primary text
  ink2:      '#1E293B', // High contrast secondary
  ink3:      '#334155', // High contrast body
  sub:       '#475569', // Readable subtext (no longer faded gray)
  coral:     '#FC6C26',
  teal:      '#0A0F1E', // Premium dark black instead of teal
  tealDark:  '#020617',
  green:     '#1E293B', // Slate instead of green
  greenDark: '#0F172A',
  purple:    '#6D28D9',
  card:      '#FFFFFF',
  bg:        '#F8FAFF',
  border:    'rgba(15,23,42,0.12)', // Thick 8K contrast boundary
}

const COLORS = [C.teal, C.purple, C.coral, '#334155', '#F59E0B']

export function CostEstimator() {
  const { currentTrip, fetchTripById } = useTripStore()
  
  const [days, setDays] = useState(5)
  const [people, setPeople] = useState(2)
  const [hotelType, setHotelType] = useState<'budget' | 'mid' | 'luxury'>('mid')
  
  const [budgetData, setBudgetData] = useState<any[]>([])
  const [confidence, setConfidence] = useState<any>(null)
  
  const TRIP_ID = '1'

  useEffect(() => {
    fetchTripById(TRIP_ID)
  }, [fetchTripById, TRIP_ID])

  const HOTEL_COSTS = { budget: 800, mid: 3500, luxury: 12000 }

  const costs = {
    transport: 1500 * people,
    stay: Math.ceil(people / 2) * HOTEL_COSTS[hotelType] * days,
    food: 600 * people * days,
    activities: 500 * people * days,
    misc: 300 * people * days,
  }

  const total = Object.values(costs).reduce((a, b) => a + b, 0)

  useEffect(() => {
    async function loadData() {
      try {
        const breakdown = await tripService.getBudgetBreakdown(TRIP_ID)
        setBudgetData(breakdown)
      } catch {}
      try {
        const conf = await aiService.getCostConfidence({ totalEstimate: total })
        setConfidence(conf)
      } catch {}
    }
    loadData()
  }, [total])

  const pieData = Object.entries(costs).map(([key, val]) => ({ name: key, value: val }))

  const barData = confidence ? [
    { name: 'Low', amount: confidence.low, fill: '#475569' },
    { name: 'Estimated', amount: confidence.mostLikely, fill: C.teal },
    { name: 'High', amount: confidence.high, fill: C.purple },
  ] : []

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ fontFamily: FB, background: C.bg, minHeight: '100vh', padding: '32px 28px pb-32' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 32, color: C.ink, margin: '0 0 6px', letterSpacing: '-0.04em' }}>
          Cost Estimator
        </h1>
        <p style={{ fontFamily: FB, fontWeight: 600, fontSize: 14.5, color: C.ink3, margin: 0 }}>
          Plan your budget with AI-powered cost breakdowns and ML confidence intervals.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 28, alignItems: 'start' }}>
        
        {/* LEFT COLUMN — Parameters & AI Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Controls Card */}
          <div style={{
            borderRadius: 24, padding: 24, border: `1.5px solid ${C.border}`,
            background: C.card, boxShadow: '0 4px 20px rgba(10,15,30,0.06)'
          }}>
            <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, margin: '0 0 20px', borderBottom: `1.5px solid ${C.border}`, paddingBottom: 10 }}>
              Trip Parameters
            </h3>

            {/* Days Slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.ink2 }}>Days</label>
                <motion.span key={days} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontFamily: FH, fontWeight: 900, fontSize: 13.5, color: C.teal }}>
                  {days} days
                </motion.span>
              </div>
              <input 
                type="range" min="1" max="14" value={days} onChange={e => setDays(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} 
              />
            </div>

            {/* People Slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.ink2 }}>Travelers</label>
                <motion.span key={people} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontFamily: FH, fontWeight: 900, fontSize: 13.5, color: C.teal }}>
                  {people} people
                </motion.span>
              </div>
              <input 
                type="range" min="1" max="10" value={people} onChange={e => setPeople(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} 
              />
            </div>

            {/* Hotel Stay Type Grid */}
            <div>
              <label style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.ink2, display: 'block', marginBottom: 10 }}>Stay Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {(['budget', 'mid', 'luxury'] as const).map(type => {
                  const active = hotelType === type
                  return (
                    <button
                      key={type} onClick={() => setHotelType(type)}
                      style={{
                        padding: '11px 0', borderRadius: 12, cursor: 'pointer',
                        fontFamily: FH, fontWeight: 900, fontSize: 12.5, textTransform: 'capitalize',
                        background: active ? C.teal : '#FFFFFF',
                        color: active ? '#FFFFFF' : C.ink2,
                        border: `2px solid ${active ? C.teal : C.border}`,
                        boxShadow: active ? '0 4px 12px rgba(15,107,92,0.22)' : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* AI Confidence Gauge Card */}
          {confidence && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: 24, padding: 24,
                background: 'rgba(109,40,217,0.06)', border: '1.5px solid rgba(109,40,217,0.28)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={16} color={C.purple} strokeWidth={2.5} />
                <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 12, color: C.purple, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  AI Confidence Model
                </span>
              </div>
              
              <div style={{ position: 'relative', height: 10, background: 'rgba(15,23,42,0.12)', borderRadius: 99, marginTop: 20, marginBottom: 8, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    left: `${Math.max(0, (confidence.low / (confidence.mostLikely * 1.5)) * 100)}%`, 
                    width: `${Math.min(100, ((confidence.high - confidence.low) / (confidence.mostLikely * 1.5)) * 100)}%`, 
                    opacity: 1 
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', height: '100%', borderRadius: 99,
                    background: 'linear-gradient(to right, #10B981, #F59E0B, #8B5CF6)',
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FB, fontWeight: 700, fontSize: 11.5, color: C.ink2 }}>
                <span>₹{confidence.low.toLocaleString()} (Low)</span>
                <span>₹{confidence.high.toLocaleString()} (High)</span>
              </div>
              
              <div style={{ marginTop: 20, display: 'flex', items: 'center', justifyContent: 'space-between', borderTop: `1px dashed rgba(109,40,217,0.2)`, paddingTop: 12 }}>
                <span style={{ fontFamily: FB, fontWeight: 700, fontSize: 13.5, color: C.ink2 }}>ML Accuracy Score</span>
                <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: C.purple }}>{confidence.confidenceScore * 100}%</span>
              </div>
            </motion.div>
          )}

          {/* Savings Tip Box */}
          <div style={{
            borderRadius: 24, padding: 20,
            background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <TrendingDown size={16} color={C.greenDark} strokeWidth={2.5} />
              <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 12, color: C.greenDark, letterSpacing: '0.12em' }}>
                SAVE ₹{Math.floor(total * 0.15).toLocaleString()}
              </span>
            </div>
            <p style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.greenDark, margin: 0, lineHeight: 1.5 }}>
              Book 2 weeks in advance and travel mid-week for up to 15% lower costs.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Estimated Total & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Estimated Total Display Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '36px 40px', borderRadius: 28, textAlign: 'center', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, #0A0F1E 0%, #0D5C4F 100%)',
              boxShadow: '0 8px 32px rgba(10,15,30,0.18)',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08, backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div style={{ position: 'relative', zIndex: 10 }}>
              <p style={{ fontFamily: FH, fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                Estimated Total ({days} days, {people} people)
              </p>
              <motion.div key={total} initial={{ scale: 1.08 }} animate={{ scale: 1 }} style={{ fontFamily: FH, fontWeight: 900, fontSize: 52, color: '#FFFFFF', letterSpacing: '-0.04em', textShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                ₹{total.toLocaleString()}
              </motion.div>
              <p style={{ fontFamily: FB, fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0' }}>
                ₹{Math.round(total / people).toLocaleString()} per person
              </p>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* Pie Chart Card */}
            <div style={{
              borderRadius: 24, padding: 24, border: `1.5px solid ${C.border}`,
              background: C.card, boxShadow: '0 4px 20px rgba(10,15,30,0.06)',
            }}>
              <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, margin: '0 0 16px' }}>
                Budget Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value"
                    animationDuration={1000} animationEasing="ease-out">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v: any) => `₹${v.toLocaleString()}`} 
                    contentStyle={{ borderRadius: '12px', border: `1.5px solid ${C.border}`, boxShadow: '0 8px 30px rgba(10,15,30,0.12)', fontFamily: FB, fontWeight: 700 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {pieData.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.ink2, textTransform: 'capitalize' }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 13.5, color: C.ink }}>
                      ₹{item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart Card */}
            <div style={{
              borderRadius: 24, padding: 24, border: `1.5px solid ${C.border}`,
              background: C.card, boxShadow: '0 4px 20px rgba(10,15,30,0.06)',
            }}>
              <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, margin: '0 0 16px' }}>
                AI Models Comparison
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ left: -10, right: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: C.ink2 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: C.ink2 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(v: any) => `₹${v.toLocaleString()}`} cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '12px', border: `1.5px solid ${C.border}`, boxShadow: '0 8px 30px rgba(10,15,30,0.12)', fontFamily: FB, fontWeight: 700 }} 
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={1000}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <p style={{ fontFamily: FB, fontWeight: 700, fontSize: 13, color: C.sub, margin: 0 }}>
                  Regression Model Outputs
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Table Card */}
          <div style={{
            borderRadius: 24, padding: 24, border: `1.5px solid ${C.border}`,
            background: C.card, boxShadow: '0 4px 20px rgba(10,15,30,0.06)',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 16, color: C.ink, margin: '0 0 16px' }}>
              Detailed Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['Category', 'Per Person', 'Total', '% of Budget'].map(h => (
                      <th key={h} style={{ fontFamily: FH, fontWeight: 900, fontSize: 12.5, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 12 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(costs).map(([key, value], index) => (
                    <motion.tr key={key} layout style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ py: '14px', fontFamily: FB, fontWeight: 800, fontSize: 14, color: C.ink, textTransform: 'capitalize', padding: '14px 0' }}>
                        {key}
                      </td>
                      <td style={{ fontFamily: FB, fontWeight: 700, fontSize: 13.5, color: C.ink3, padding: '14px 0' }}>
                        ₹{Math.round(value / people).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: FH, fontWeight: 900, fontSize: 14.5, color: C.coral, padding: '14px 0' }}>
                        ₹{value.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: FH, fontWeight: 800, fontSize: 13.5, color: C.ink2, minWidth: 32 }}>
                            {Math.round((value / total) * 100)}%
                          </span>
                          <div style={{ width: 80, height: 7, background: 'rgba(15,23,42,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 99, width: `${(value / total) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  <tr style={{ background: 'rgba(15,23,42,0.03)' }}>
                    <td style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: C.ink, padding: '16px 12px', borderRadius: '12px 0 0 12px' }}>
                      Total Estimate
                    </td>
                    <td />
                    <td style={{ fontFamily: FH, fontWeight: 900, fontSize: 15.5, color: C.teal, padding: '16px 0' }}>
                      ₹{total.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: C.ink, padding: '16px 12px', borderRadius: '0 12px 12px 0' }}>
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}

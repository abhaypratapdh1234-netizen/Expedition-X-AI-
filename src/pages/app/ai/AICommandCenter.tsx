// AICommandCenter.tsx — PREMIUM DARK UI: 8K-crisp typography, vivid gradients, glassmorphism
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Send, Trash2, Brain, Zap,
  Umbrella, DollarSign, ShoppingBag, Globe, Receipt,
  MapPin, Search, Navigation, Hotel, Info, ChevronRight, Command
} from 'lucide-react'
import { useCommandCenterStore } from '../../../stores/commandCenterStore'
import { classifyIntent, dispatchCommand, INTENTS } from '../../../services/commandCenterService'
import { CommandCard } from './CommandCard'

// ── Google Fonts injection ──────────────────────────────────────────────────
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap'
if (typeof document !== 'undefined' && !document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = FONT_LINK
  document.head.appendChild(link)
}

// ── Design tokens (responsive to theme) ────────────────────────────────────────────────────
const T = {
  bg:          'var(--bg-primary)',
  bgCard:      'var(--bg-card)',
  bgCardHover: 'var(--bg-card-hover)',
  border:      'var(--border-subtle)',
  borderAccent:'var(--teal-500)',
  text:        'var(--text-primary)',
  textSub:     'var(--text-secondary)',
  textMuted:   'var(--text-muted)',
  indigo:      'var(--teal-500)',
  indigoGlow:  'var(--shadow-teal)',
  emerald:     'var(--success)',
  red:         'var(--error)',
}

// ─────────────────────────────────────────────
// QUICK COMMAND CHIPS
// ─────────────────────────────────────────────
const QUICK_COMMANDS = [
  { text: 'Weather in Goa',               icon: <Umbrella size={14} />,    gradient: 'linear-gradient(135deg,#0369a1,#0ea5e9)', glow: 'rgba(14,165,233,0.4)'   },
  { text: 'Budget for 5 days in Manali',  icon: <DollarSign size={14} />,  gradient: 'linear-gradient(135deg,#15803d,#22c55e)', glow: 'rgba(34,197,94,0.4)'   },
  { text: 'Packing list for Ladakh trek', icon: <ShoppingBag size={14} />, gradient: 'linear-gradient(135deg,#b45309,#f59e0b)', glow: 'rgba(245,158,11,0.4)'  },
  { text: 'Convert ₹10000 to USD',        icon: <Globe size={14} />,       gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)', glow: 'rgba(124,58,237,0.4)'  },
  { text: 'Plan my trip to Singapore',    icon: <MapPin size={14} />,      gradient: 'linear-gradient(135deg,#b91c1c,#f87171)', glow: 'rgba(239,68,68,0.4)'   },
  { text: 'Find hidden places near Pune', icon: <Search size={14} />,      gradient: 'linear-gradient(135deg,#4f46e5,#818cf8)', glow: 'rgba(129,140,248,0.4)' },
  { text: 'Nearest hospital emergency',   icon: <Navigation size={14} />,  gradient: 'linear-gradient(135deg,#dc2626,#ef4444)', glow: 'rgba(220,38,38,0.45)'  },
  { text: 'Track my expenses',            icon: <Receipt size={14} />,     gradient: 'linear-gradient(135deg,#059669,#34d399)', glow: 'rgba(16,185,129,0.4)'  },
]

// ─────────────────────────────────────────────
// DID YOU MEAN CARD
// ─────────────────────────────────────────────
function DidYouMean({ rawText, onSelect }: { rawText: string; onSelect: (text: string) => void }) {
  const result = classifyIntent(rawText)
  const alts = [result.intent, ...result.alternatives.map(a => a.intent)].slice(0, 3)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1.5px solid rgba(245,158,11,0.3)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(245,158,11,0.12)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }} className="flex items-center gap-4">
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--warning)', boxShadow: '0 8px 20px rgba(217,119,6,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤔</div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Did you mean one of these?</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '2px 0 0' }}>Confidence too low to auto-execute</p>
        </div>
      </div>
      <div style={{ padding: '12px 16px' }} className="space-y-2">
        {alts.map(intent => (
          <motion.button
            key={intent.name}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(intent.samples[0])}
            style={{
              width: '100%', textAlign: 'left', padding: '14px 18px',
              borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              cursor: 'pointer', transition: 'all 0.18s',
            }}
            className="group"
          >
            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg,#d97706,#f59e0b)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {intent.label.split(' ')[0]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: T.text, letterSpacing: '-0.3px', margin: 0 }}>{intent.label}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub, margin: '2px 0 0' }}>e.g. "{intent.samples[0]}"</p>
            </div>
            <ChevronRight size={15} style={{ color: T.textMuted }} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// AI MEMORY PANEL
// ─────────────────────────────────────────────
function MemoryPanel() {
  const { memory } = useCommandCenterStore()
  const entries = Object.entries(memory).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={16} style={{ color: 'white' }} />
        </div>
        <p style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: 0 }}>AI Memory — Learned Preferences</p>
      </div>
      <div style={{ padding: '10px 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{key.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{String(value)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// ANIMATED BACKGROUND — mesh gradient
// ─────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Radial mesh orbs */}
      {[
        { size: 600, top: '-10%', left: '-12%', color: 'rgba(99,102,241,0.07)', delay: 0 },
        { size: 500, top: '50%', right: '-8%', color: 'rgba(14,165,233,0.05)', delay: 2 },
        { size: 400, bottom: '5%', left: '35%', color: 'rgba(124,58,237,0.05)', delay: 4 },
        { size: 300, top: '25%', left: '55%', color: 'rgba(16,185,129,0.04)', delay: 1 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size, height: orb.size,
            top: (orb as any).top, left: (orb as any).left,
            right: (orb as any).right, bottom: (orb as any).bottom,
            background: `radial-gradient(circle at center, ${orb.color} 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 10 + i * 2, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.3,
      }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
function EmptyState({ onDispatch }: { onDispatch: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ maxWidth: 640, margin: '0 auto', fontFamily: "'Outfit', 'Inter', sans-serif" }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 8 }}>


        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            fontSize: 'clamp(40px, 6vw, 58px)',
            fontWeight: 900,
            letterSpacing: '-2.5px',
            color: T.text,
            lineHeight: 1.05,
            margin: '0 0 18px',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          What can I
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            execute for you?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: T.textSub,
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.65,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Speak or type a travel command — I classify your intent,
          extract destination &amp; budget, then run a step-by-step workflow.
        </motion.p>
      </div>

      {/* Command chips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {QUICK_COMMANDS.map((cmd, i) => (
          <motion.button
            key={cmd.text}
            initial={{ opacity: 0, y: 18, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.055 + 0.22, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.03, y: -4, boxShadow: `0 20px 50px ${cmd.glow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDispatch(cmd.text)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px', borderRadius: 20, textAlign: 'left',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: 'var(--shadow-card)',
            }}
            className="group"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: cmd.gradient,
              boxShadow: `0 8px 20px ${cmd.glow}`,
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'transform 0.2s',
            }}>
              {cmd.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{cmd.text}</p>
            </div>
            <ChevronRight size={14} style={{ color: T.textMuted, flexShrink: 0 }} />
          </motion.button>
        ))}
      </div>

    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export function AICommandCenter() {
  const { commands, clearHistory } = useCommandCenterStore()
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [focused, setFocused] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [lowConfidenceText, setLowConfidenceText] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [voiceSupported] = useState(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const feedEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [commands.length])

  const handleDispatch = useCallback(async (text?: string) => {
    const query = (text || input).trim()
    if (!query || isDispatching) return
    const classification = classifyIntent(query)
    if (classification.confidence < classification.intent.minConfidence) {
      setLowConfidenceText(query)
      setInput('')
      return
    }
    setLowConfidenceText(null)
    setInput('')
    setIsDispatching(true)
    try { await dispatchCommand(query) } finally { setIsDispatching(false) }
  }, [input, isDispatching])

  const handleVoice = useCallback(() => {
    if (!voiceSupported) return
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-IN'
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setInput(transcript)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec; rec.start(); setIsListening(true)
  }, [isListening, voiceSupported])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDispatch() }
  }

  const hasContent = commands.length > 0 || lowConfidenceText

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: T.bg,
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative',
      }}
    >
      <AnimatedBackground />

      {/* ═══ HEADER ═══ */}
      <div
        style={{
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 20,
          position: 'relative',
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${T.border}`,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Title */}
          <div>
            <p style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              AI Command Center
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Info */}
          <div style={{ position: 'relative' }}>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setShowInfo(s => !s)}
              style={{
                width: 38, height: 38, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: showInfo ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'var(--bg-secondary)',
                color: showInfo ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
              }}
            >
              <Info size={15} style={{ strokeWidth: 2.5 }} />
            </motion.button>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.93 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.93 }}
                  style={{
                    position: 'absolute', right: 0, top: 48,
                    width: 300, borderRadius: 20, padding: 24,
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-strong)',
                    zIndex: 50,
                  }}
                >
                  <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.3px', fontFamily: "'Outfit', sans-serif" }}>How it works</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    Type or speak a command. The AI classifies your intent with a confidence score, fills destination &amp; budget slots, then runs a deterministic workflow step-by-step.
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.13em', marginTop: 12 }}>
                    Confidence below threshold → shows clarification, never guesses
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear */}
          {commands.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={clearHistory}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(239,68,68,0.12)', color: 'var(--error)',
                border: '1.5px solid rgba(239,68,68,0.3)',
                fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Outfit', sans-serif"
              }}
            >
              <Trash2 size={14} style={{ strokeWidth: 2.5 }} /> Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* ═══ FEED ═══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {!hasContent && <EmptyState onDispatch={handleDispatch} />}

          {hasContent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <MemoryPanel />

              {lowConfidenceText && (
                <DidYouMean
                  rawText={lowConfidenceText}
                  onSelect={(text) => { setLowConfidenceText(null); handleDispatch(text) }}
                />
              )}

              {[...commands].reverse().map(cmd => (
                <CommandCard key={cmd.id} command={cmd} />
              ))}

              {/* Quick chips */}
              <div style={{ paddingTop: 8, paddingBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 10 }}>Try another command</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK_COMMANDS.slice(0, 5).map(cmd => (
                    <motion.button
                      key={cmd.text}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDispatch(cmd.text)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 16px', borderRadius: 100,
                        background: cmd.gradient, color: 'white',
                        boxShadow: `0 6px 18px ${cmd.glow}`,
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                        border: 'none',
                      }}
                    >
                      {cmd.icon} {cmd.text}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div ref={feedEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ═══ INPUT BAR ═══ */}
      <div
        style={{
          padding: '16px 20px 20px',
          flexShrink: 0, zIndex: 20, position: 'relative',
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border-subtle)',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -16px 50px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <motion.div
            animate={{
              boxShadow: focused
                ? '0 0 0 2px rgba(99,102,241,0.5), 0 24px 70px rgba(99,102,241,0.2)'
                : '0 8px 32px rgba(0,0,0,0.4)',
            }}
            transition={{ duration: 0.18 }}
            style={{
              display: 'flex', gap: 8, alignItems: 'center',
              borderRadius: 28, padding: '8px 8px 8px 8px',
              background: 'rgba(255,255,255,0.05)',
              border: focused ? '1.5px solid rgba(99,102,241,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
              transition: 'border 0.18s',
            }}
          >
            {/* Mic */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={handleVoice}
              title={voiceSupported ? (isListening ? 'Stop recording' : 'Voice command') : 'Voice not supported'}
              style={{
                padding: 12, borderRadius: 18, flexShrink: 0,
                background: isListening ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'rgba(255,255,255,0.07)',
                color: isListening ? 'white' : voiceSupported ? T.text : T.textMuted,
                boxShadow: isListening ? '0 8px 24px rgba(220,38,38,0.5)' : 'none',
                border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening && (
                <motion.div
                  style={{ position: 'absolute', inset: 0, borderRadius: 18, background: '#f87171', opacity: 0.25 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                />
              )}
            </motion.button>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={isListening ? '🎙 Listening…' : 'Command: "Plan a 3-day Goa trip under ₹15,000"…'}
              rows={1}
              style={{
                flex: 1, background: 'transparent', outline: 'none',
                resize: 'none', maxHeight: 128, minHeight: 48,
                color: T.text, fontSize: 15, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                caretColor: '#6366f1', lineHeight: '1.55',
                padding: '12px 8px',
                border: 'none',
              }}
            />

            {/* Spinner */}
            {isDispatching && (
              <div style={{ flexShrink: 0, padding: '0 8px' }}>
                <motion.div
                  style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid #6366f1', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.65, ease: 'linear' }}
                />
              </div>
            )}

            {/* Send */}
            <motion.button
              onClick={() => handleDispatch()}
              disabled={!input.trim() || isDispatching}
              whileHover={input.trim() && !isDispatching ? { scale: 1.08, rotate: -5 } : {}}
              whileTap={input.trim() && !isDispatching ? { scale: 0.92 } : {}}
              style={{
                padding: '12px 14px', borderRadius: 20, flexShrink: 0,
                background: input.trim() && !isDispatching
                  ? 'linear-gradient(135deg,#6366f1,#818cf8)'
                  : 'rgba(255,255,255,0.07)',
                color: input.trim() && !isDispatching ? 'white' : T.textMuted,
                boxShadow: input.trim() && !isDispatching ? '0 10px 30px rgba(99,102,241,0.5)' : 'none',
                border: 'none', cursor: input.trim() && !isDispatching ? 'pointer' : 'default',
                opacity: !input.trim() || isDispatching ? 0.4 : 1,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              {input.trim() && !isDispatching && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)', borderRadius: '20px 20px 0 0' }} />
              )}
              <Send size={18} style={{ position: 'relative', zIndex: 1 }} />
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Sparkles, RotateCcw, Bookmark, ThumbsUp, ThumbsDown, Zap, MapPin } from 'lucide-react'
import { aiService } from '../../../services/aiService'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import { detectTripPlanningIntent } from '../../../services/intelligenceService'
import { useNavigate } from 'react-router-dom'
import { ChatMessageRenderer } from '../../../components/ai/ChatMessageRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tripIntent?: { hasIntent: boolean; params: Record<string, string> } // handoff signal
}

const QUICK_PROMPTS = [
  { text: 'Plan a 3-day Delhi itinerary', emoji: '🏛️' },
  { text: 'Best street food in Mumbai', emoji: '🍜' },
  { text: 'Manali in December — weather?', emoji: '🏔️' },
  { text: 'Budget trip Goa under ₹10,000', emoji: '🏖️' },
]

const AI_RESPONSES: Record<string, string> = {
  default: "I'd be happy to help you plan your perfect trip! What destination are you interested in? I can help with itineraries, cost estimates, accommodation, local food spots, and much more! 🗺️",
}

export function AIChat() {
  const navigate = useNavigate()
  const { assistantContext, profile } = useIntelligenceStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: profile
        ? `Hi! I already know your travel style — you prefer ${['adventure', 'nature', 'luxury', 'budget', 'foodie', 'cultural'].reduce((top, t) => (profile.dna[t as keyof typeof profile.dna] > profile.dna[top as keyof typeof profile.dna] ? t : top), 'adventure')} trips, avg ${profile.avgDuration} days with ~₹${(profile.avgBudget/1000).toFixed(0)}k budget. How can I help plan your next adventure? 🗺️`
        : AI_RESPONSES.default,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [focused, setFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text?: string) => {
    const content = text || input
    if (!content.trim()) return

    // Detect structured trip planning intent for handoff
    const intent = detectTripPlanningIntent(content)

    const userMsg: Message = { id: Date.now() + '-u', role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    try {
      // Inject user context into AI call if we have it
      const enrichedQuery = assistantContext
        ? `${assistantContext}\n\nUser message: ${content}`
        : content
      const aiResponse = await aiService.processChatQuery(enrichedQuery)
      const aiMsg: Message = {
        id: Date.now() + '-a',
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        tripIntent: intent.hasIntent ? intent : undefined,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + '-e', role: 'assistant', content: "Sorry, I couldn't process that right now.", timestamp: new Date() }])
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ══════════════════════════════════════════════
          PREMIUM HEADER
      ══════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between z-10 shrink-0"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-4">
          {/* AI Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', boxShadow: '0 8px 20px rgba(109,40,217,0.4)' }}>
              <Sparkles size={22} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"
              style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.6)' }}>
              <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-75" />
            </div>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)] text-base tracking-tight">ExpeditionX AI</p>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest">● Online · Travel Expert</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setMessages([{ id: 'init', role: 'assistant', content: AI_RESPONSES.default, timestamp: new Date() }])}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          style={{ background: 'var(--bg-card)', color: '#374151', border: '1px solid rgba(0,0,0,0.06)' }}>
          <RotateCcw size={13} /> New Chat
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════
          MESSAGES AREA
      ══════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Quick Prompt Pills */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 mb-8 max-w-3xl mx-auto w-full">
            {QUICK_PROMPTS.map((p, i) => (
              <motion.button key={p.text}
                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(p.text)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full text-[15px] font-black transition-all duration-300 shadow-sm"
                style={{
                  background: 'var(--bg-card)',
                  color: '#374151',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255, 255, 255, 0.8)'
                }}>
                <span className="text-base">{p.emoji}</span>
                <span>{p.text}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`flex gap-4 max-w-3xl mx-auto w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md relative overflow-hidden`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,#0f766e,#14b8a6)'
                    : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
                  boxShadow: msg.role === 'user'
                    ? '0 6px 18px rgba(20,184,166,0.4)'
                    : '0 6px 18px rgba(109,40,217,0.4)'
                }}>
                {msg.role === 'user' ? 'U' : <Sparkles size={16} />}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
              </div>

              {/* Bubble */}
              <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className="flex flex-col max-w-[85%]">
                  <div className={`px-6 py-4 text-[15px] font-medium leading-relaxed ${msg.role === 'user' ? 'text-white' : ''}`}
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg,#0f766e,#14b8a6)'
                        : 'var(--bg-card)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                      borderRadius: msg.role === 'user' ? '22px 4px 22px 22px' : '4px 22px 22px 22px',
                      boxShadow: msg.role === 'user'
                        ? '0 10px 30px rgba(20,184,166,0.35)'
                        : '0 6px 25px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    }}>
                    <ChatMessageRenderer content={msg.content} isUser={msg.role === 'user'} />
                  </div>

                  {msg.role === 'assistant' && msg.id !== 'init' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-1.5 mt-2.5 px-2">
                      {[ThumbsUp, ThumbsDown, Bookmark].map((Icon, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-xl transition-all"
                          style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.04)' }}>
                          <Icon size={13} />
                        </motion.button>
                      ))}
                      {/* Structured handoff: "Plan This Trip" button */}
                      {msg.tripIntent?.hasIntent && (
                        <motion.button
                          whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const p = msg.tripIntent!.params
                            const q = new URLSearchParams()
                            if (p.destination) q.set('destination', p.destination)
                            if (p.duration) q.set('duration', p.duration)
                            if (p.budget) q.set('budget', p.budget)
                            if (p.companions) q.set('companions', p.companions)
                            navigate(`/app/planner/setup?${q.toString()}`)
                          }}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[14px] font-black text-white"
                          style={{ background: 'linear-gradient(135deg,#FC6C26,#FF8A50)', boxShadow: '0 6px 18px rgba(252,108,38,0.4)' }}
                        >
                          <MapPin size={11} /> Plan This Trip →
                        </motion.button>
                      )}
                      <span className="text-[13px] font-black text-[var(--text-muted)] self-center ml-auto uppercase tracking-wider">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live Typing Preview — ghost bubble while user composes */}
        <AnimatePresence>
          {input.trim() && !typing && (
            <motion.div
              key="typing-preview-aichat"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="flex gap-4 max-w-3xl mx-auto w-full flex-row-reverse"
            >
              {/* User avatar ghost */}
              <div
                className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md relative overflow-hidden opacity-60"
                style={{
                  background: 'linear-gradient(135deg,#0f766e,#14b8a6)',
                  boxShadow: '0 6px 18px rgba(20,184,166,0.3)'
                }}
              >
                U
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
              </div>

              {/* Ghost typing bubble */}
              <div className="flex flex-col items-end flex-1">
                <div
                  className="px-6 py-3.5 text-[14px] font-semibold relative overflow-hidden"
                  style={{
                    background: 'rgba(20,184,166,0.1)',
                    border: '1.5px dashed rgba(20,184,166,0.6)',
                    borderRadius: '22px 4px 22px 22px',
                    color: '#0f766e',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {input}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.85 }}
                    className="inline-block ml-0.5 w-[2px] h-[15px] rounded-full align-middle"
                    style={{ background: '#0f766e' }}
                  />
                </div>
                <span className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  composing...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
              className="flex gap-4 max-w-3xl mx-auto w-full">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs shadow-md relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', boxShadow: '0 6px 18px rgba(109,40,217,0.4)' }}>
                <Sparkles size={16} />
              </div>
              <div className="px-6 py-5 flex items-center gap-1.5"
                style={{ background: 'var(--bg-card)', borderRadius: '4px 22px 22px 22px', boxShadow: '0 6px 25px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)' }}
                    animate={{ y: [0, -7, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ══════════════════════════════════════════════
          10,000 BILLION DOLLAR INPUT BAR
      ══════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 py-5 shrink-0"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 -8px 30px rgba(0,0,0,0.04)' }}>
        <div className="max-w-3xl mx-auto">

          <div className="relative group p-[2px] rounded-[30px]">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            {/* The star of the show: the input bar */}
            <motion.div
              animate={{
                boxShadow: focused
                  ? '0 0 0 3px rgba(20,184,166,0.15), 0 20px 60px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)'
                  : '0 10px 40px rgba(0,0,0,0.07), inset 0 2px 4px rgba(255,255,255,0.8)',
              }}
              transition={{ duration: 0.3 }}
              className="relative z-10 flex gap-3 items-end rounded-[28px] p-2.5 overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: focused ? '1.5px solid rgba(20,184,166,0.5)' : '1.5px solid rgba(0,0,0,0.06)',
              }}>

            {/* Subtle shimmer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/3 via-transparent to-violet-500/3 pointer-events-none" />

            {/* Mic button */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-3.5 rounded-[18px] shrink-0 transition-all duration-300 relative z-10"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <Mic size={18} />
            </motion.button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask me to plan an itinerary, estimate costs, or compare destinations…"
              rows={1}
              className="flex-1 bg-transparent px-3 py-4 outline-none text-[16px] font-black text-[var(--text-primary)] resize-none max-h-36 min-h-[56px] relative z-10"
              style={{ color: 'var(--text-primary)', caretColor: '#0f766e' }}
            />

            {/* Send button — the pièce de résistance */}
            <motion.button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              whileHover={input.trim() && !typing ? { scale: 1.05, rotate: -5 } : {}}
              whileTap={input.trim() && !typing ? { scale: 0.92 } : {}}
              className="p-3.5 rounded-[18px] shrink-0 disabled:opacity-40 transition-all duration-300 relative z-10 overflow-hidden"
              style={{
                background: input.trim() && !typing
                  ? 'linear-gradient(135deg,#0f766e,#14b8a6)'
                  : 'var(--bg-card)',
                color: input.trim() && !typing ? 'var(--bg-card)' : '#6b7280',
                boxShadow: input.trim() && !typing ? '0 8px 25px rgba(20,184,166,0.45)' : 'none',
                border: input.trim() && !typing ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0,0,0,0.05)',
              }}>
              {/* Shine on active */}
              {input.trim() && !typing && (
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-[18px]" />
              )}
              <Send size={18} className="relative z-10" />
            </motion.button>
          </motion.div>
          </div>

          {/* Footer disclaimer */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <Zap size={10} className="text-[var(--text-muted)]" />
            <p className="text-[11px] font-extrabold text-center text-[var(--text-muted)] uppercase tracking-[0.2em]">
              AI can make mistakes. Verify important travel plans.
            </p>
            <Zap size={10} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

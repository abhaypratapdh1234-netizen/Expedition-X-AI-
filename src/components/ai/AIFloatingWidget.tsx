import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  Mic,
  MicOff,
  Bot
} from 'lucide-react'
import { springSnappy } from '../../motion/tokens'
import { aiService } from '../../services/aiService'
import { useThemeStore } from '../../stores/themeStore'
import { ChatMessageRenderer } from './ChatMessageRenderer'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const widgetOpen = {
  hidden: { opacity: 0, scale: 0.85, y: 30, x: 20, transformOrigin: 'bottom right' },
  show: { opacity: 1, scale: 1, y: 0, x: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.85, y: 30, x: 20, transition: { duration: 0.2 } }
}

const QUICK_PROMPTS = [
  { text: "Check weather in Goa 🌴", query: "What is the weather like in Goa?" },
  { text: "Suggest local attractions 🕌", query: "Suggest top local attractions in Goa" },
  { text: "Goa 4-day itinerary 📅", query: "Give me a 4-day Goa itinerary" },
  { text: "Packing list for Ladakh 🎒", query: "Create a packing list for Ladakh" },
  { text: "How to get cheap tickets 🎫", query: "How do I find the cheapest tickets?" },
  { text: "Must-try food in Mumbai 🥘", query: "What is the must-try food in Mumbai?" }
]

export function AIFloatingWidget() {
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const isMonochrome = theme === 'monochrome'

  const [open, setOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! 👋 I am **Max AI**, your personal luxury travel concierge powered by ExpeditionX.\n\nI can deliver **real-time weather satellite telemetry**, build **custom day-by-day itineraries**, compare **handpicked hotels**, and forecast **accurate travel budgets**.\n\nAsk me anything or choose a quick prompt below! ✈️🌴",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTypingPreview, setIsTypingPreview] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 80)
    }
  }, [open, messages, loading])

  // Setup Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript))
        }
        setIsListening(false)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: Math.random().toString(),
        text: "Conversation refreshed. How may I assist your upcoming voyage today? 🗺️✨",
        sender: 'ai',
        timestamp: new Date()
      }
    ])
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await aiService.processChatQuery(textToSend)
      const aiMessage: Message = {
        id: Math.random().toString(),
        text: response.response,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch {
      const errorMessage: Message = {
        id: Math.random().toString(),
        text: "I experienced a brief connection interruption. Please try re-sending your question! 🥺",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={widgetOpen}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-[32px] overflow-hidden flex flex-col shadow-2xl border relative transition-all duration-300 backdrop-blur-xl"
            style={{
              width: isExpanded ? 'min(92vw, 520px)' : 'min(92vw, 420px)',
              height: isExpanded ? '680px' : '580px',
              background: isDark
                ? '#0d0e12'
                : isMonochrome
                ? '#0D0D0D'
                : 'var(--bg-card)',
              borderColor: isDark
                ? '#242731'
                : isMonochrome
                ? '#2e2e2e'
                : 'var(--border-subtle)',
              boxShadow: isDark
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(252, 108, 38, 0.08)'
                : '0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 0 30px rgba(252, 108, 38, 0.12)'
            }}
          >
            {/* ══════════════════════════════════════════════════════════════════
                LUXURY CONCIERGE TOPBAR
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className="p-4 sm:p-5 flex items-center justify-between text-white relative overflow-hidden shrink-0 select-none"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #16181f 0%, #0d0e12 100%)'
                  : isMonochrome
                  ? 'linear-gradient(135deg, #0A0A0A 0%, #161616 100%)'
                  : 'linear-gradient(135deg, #1B2A4A 0%, #293B63 100%)',
                borderBottom: `1px solid ${
                  isDark ? '#242731' : isMonochrome ? '#262626' : 'rgba(255, 255, 255, 0.08)'
                }`
              }}
            >
              {/* Ambient header glow */}
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#FC6C26] opacity-15 rounded-full blur-2xl pointer-events-none" />

              {/* Concierge Profile */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #FC6C26 0%, #ff8c42 100%)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Sparkles size={20} className="text-white drop-shadow" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  </div>
                  {/* Glowing online status pulse */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1B2A4A]">
                    <div className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[16px] tracking-tight text-white font-display">
                      MAX AI
                    </span>
                    <span
                      className="text-[9.5px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-md"
                      style={{
                        background: 'rgba(252, 108, 38, 0.25)',
                        color: '#ff9858',
                        border: '1px solid rgba(252, 108, 38, 0.4)'
                      }}
                    >
                      CONCIERGE
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-white/70 flex items-center gap-1.5">
                    <span>Enterprise Travel Intelligence</span>
                  </p>
                </div>
              </div>

              {/* Action Icons: Maximize, Reset, Close */}
              <div className="flex items-center gap-1 relative z-10">
                {/* Reset / New Chat */}
                <button
                  onClick={handleClearChat}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw size={14} />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={isExpanded ? 'Compact mode' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MESSAGES CONTAINER
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 transition-colors select-text"
              style={{
                background: isDark
                  ? '#090a0d'
                  : isMonochrome
                  ? '#050505'
                  : 'var(--bg-primary)'
              }}
            >
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    /* ── User Bubble ── */
                    <div
                      className="max-w-[85%] px-4 py-3 shadow-lg relative overflow-hidden"
                      style={{
                        background: isMonochrome
                          ? '#ffffff'
                          : 'linear-gradient(135deg,#FC6C26 0%,#e85d1a 100%)',
                        color: isMonochrome ? '#000' : '#fff',
                        borderRadius: '22px 22px 4px 22px',
                        boxShadow: isMonochrome
                          ? '0 6px 20px rgba(0,0,0,0.4)'
                          : '0 10px 28px rgba(252,108,38,0.45)',
                      }}
                    >
                      {/* Shimmer highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-[22px]" />
                      <ChatMessageRenderer content={msg.text} isUser />
                    </div>
                  ) : (
                    /* ── AI Answer Card ── */
                    <div
                      className="w-full px-4 py-4 shadow-sm"
                      style={{
                        background: isDark ? '#12141a' : isMonochrome ? '#141414' : 'var(--bg-card)',
                        borderRadius: '4px 22px 22px 22px',
                        border: `1px solid ${
                          isDark ? '#242731' : isMonochrome ? '#2b2b2b' : 'var(--border-subtle)'
                        }`,
                        ...(isMonochrome ? { '--text-primary': '#ffffff', '--text-secondary': '#e0e0e0' } : {})
                      } as React.CSSProperties}
                    >
                      <ChatMessageRenderer
                        content={msg.text}
                        isUser={false}
                        onSuggestionClick={handleSend}
                      />
                    </div>
                  )}

                  {/* Timestamp */}
                  <span
                    className="text-[10px] mt-1 px-1 font-semibold tracking-wide"
                    style={{ color: isDark ? '#71717A' : isMonochrome ? '#777777' : 'var(--text-muted)' }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}

              {/* Live Typing Preview — shows while user types */}
              <AnimatePresence>
                {inputValue.trim() && !loading && (
                  <motion.div
                    key="typing-preview"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col items-end"
                  >
                    <div
                      className="max-w-[85%] px-4 py-3 relative overflow-hidden"
                      style={{
                        background: isMonochrome
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(252,108,38,0.15)',
                        border: `1.5px dashed ${
                          isMonochrome ? 'rgba(255,255,255,0.5)' : '#FC6C26'
                        }`,
                        borderRadius: '22px 22px 4px 22px',
                        color: isMonochrome ? '#fff' : '#FC6C26',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <p className="text-[13px] font-semibold leading-snug">
                        {inputValue}
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 0.9 }}
                          className="inline-block ml-0.5 w-[2px] h-[14px] rounded-full align-middle"
                          style={{ background: isMonochrome ? '#fff' : '#FC6C26' }}
                        />
                      </p>
                    </div>
                    <span
                      className="text-[9px] mt-1 px-1 font-bold uppercase tracking-widest"
                      style={{ color: isDark ? '#52525B' : isMonochrome ? '#555' : 'var(--text-muted)' }}
                    >
                      typing...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shimmering AI Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl rounded-tl-sm max-w-[220px] shadow-sm border"
                  style={{
                    background: isDark ? '#12141a' : isMonochrome ? '#141414' : 'var(--bg-card)',
                    borderColor: isDark ? '#242731' : isMonochrome ? '#2b2b2b' : 'var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#FC6C26]/20 flex items-center justify-center text-[#FC6C26] shrink-0">
                    <Bot size={14} className="animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[12px] font-black block text-[var(--text-primary)]">
                      Max AI is analyzing...
                    </span>
                    <span className="flex gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FC6C26] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                QUICK ACTION SUGGESTION CHIPS
            ══════════════════════════════════════════════════════════════════ */}
            <div
              className="px-3.5 py-2.5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 transition-colors"
              style={{
                background: isDark ? '#0d0e12' : isMonochrome ? '#0A0A0A' : 'var(--bg-card)',
                borderTop: `1px solid ${
                  isDark ? '#1f222a' : isMonochrome ? '#222222' : 'var(--border-subtle)'
                }`
              }}
            >
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.query)}
                  className="px-3 py-1.5 rounded-full border text-[12px] font-bold transition-all cursor-pointer select-none hover:border-[#FC6C26] hover:scale-102 active:scale-98 shadow-xs"
                  style={{
                    background: isDark ? '#161820' : isMonochrome ? '#141414' : 'var(--bg-primary)',
                    color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)',
                    borderColor: isDark ? '#262933' : isMonochrome ? '#333333' : 'var(--border-default)'
                  }}
                >
                  {prompt.text}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MESSAGE INPUT BAR
            ══════════════════════════════════════════════════════════════════ */}
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSend(inputValue)
              }}
              className="p-3.5 sm:p-4 flex items-center gap-2 shrink-0 transition-colors"
              style={{
                background: isDark ? '#0d0e12' : isMonochrome ? '#0A0A0A' : 'var(--bg-card)',
                borderTop: `1px solid ${
                  isDark ? '#1f222a' : isMonochrome ? '#222222' : 'var(--border-subtle)'
                }`
              }}
            >
              {/* Speech Recognition Mic Button */}
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                      : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)]'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak to Max AI'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening... speak now'
                      : 'Ask Max AI anything (weather, food, itinerary)...'
                  }
                  className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition-all focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20"
                  style={{
                    background: isDark ? '#14161d' : isMonochrome ? '#141414' : 'var(--bg-primary)',
                    borderColor: inputValue
                      ? isDark ? '#FC6C26' : isMonochrome ? '#888' : '#FC6C26'
                      : isDark ? '#262933' : isMonochrome ? '#333333' : 'var(--border-default)',
                    color: isDark || isMonochrome ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: inputValue
                      ? `0 0 0 3px ${isMonochrome ? 'rgba(255,255,255,0.08)' : 'rgba(252,108,38,0.12)'}`
                      : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  disabled={loading}
                />
                {/* Char count indicator when typing */}
                {inputValue.length > 0 && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50 pointer-events-none"
                    style={{ color: isDark || isMonochrome ? '#fff' : '#FC6C26' }}
                  >
                    {inputValue.length}
                  </span>
                )}
              </div>

              {/* Send Button */}
              <motion.button
                type="submit"
                disabled={loading || !inputValue.trim()}
                whileHover={!loading && inputValue.trim() ? { scale: 1.08 } : {}}
                whileTap={!loading && inputValue.trim() ? { scale: 0.92 } : {}}
                className="w-11 h-11 rounded-2xl disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all cursor-pointer shrink-0 relative overflow-hidden"
                style={{
                  background: isMonochrome
                    ? '#ffffff'
                    : 'linear-gradient(135deg, #FC6C26 0%, #e85d1a 100%)',
                  color: isMonochrome ? '#000000' : '#ffffff',
                  boxShadow: inputValue.trim() && !isMonochrome
                    ? '0 8px 24px rgba(252,108,38,0.5)'
                    : 'none'
                }}
                title="Send query"
              >
                {/* Shimmer on hover */}
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%', skewX: -15 }}
                  animate={inputValue.trim() ? { x: ['100%', '-100%'] } : { x: '-100%' }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                />
                <Send size={18} className="relative z-10" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Launcher Trigger Button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative overflow-hidden cursor-pointer group"
            style={{
              background: isMonochrome
                ? '#000000'
                : 'linear-gradient(135deg, #FC6C26 0%, #e85d1a 100%)',
              border: isMonochrome ? '1px solid #333333' : '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: isMonochrome
                ? '0 10px 30px rgba(0,0,0,0.6)'
                : '0 12px 30px rgba(252,108,38,0.45)'
            }}
            aria-label="Open Max AI Travel Concierge"
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-white opacity-25"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
            />
            <MessageSquare size={24} className="relative z-10 group-hover:scale-110 transition-transform" />

            {/* Notification badge */}
            <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm z-20" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

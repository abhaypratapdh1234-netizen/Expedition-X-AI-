import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { springSnappy } from '../../motion/tokens'
import { aiService } from '../../services/aiService'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const widgetOpen = {
  hidden: { opacity: 0, scale: 0.8, y: 50, x: 50, transformOrigin: 'bottom right' },
  show: { opacity: 1, scale: 1, y: 0, x: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.8, y: 50, x: 50, transition: { duration: 0.2 } }
}

const QUICK_PROMPTS = [
  { text: "Suggest local attractions 🕌", query: "Suggest local attractions" },
  { text: "Check weather in Goa 🌴", query: "What is the weather like in Goa?" },
  { text: "How to get cheap tickets 🎫", query: "How do I find the cheapest tickets?" },
  { text: "Packing list for Ladakh 🎒", query: "Create a packing list for Ladakh" }
]

export function AIFloatingWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I am Max AI, your luxury travel concierge. I can help you draft itineraries, check the weather, estimate travel budgets, and build custom packing lists. Ask me anything! ✈️🌴",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 100)
    }
  }, [open, messages, loading])

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
    } catch (error) {
      const errorMessage: Message = {
        id: Math.random().toString(),
        text: "I'm having trouble connecting to the servers right now. Please try again! 🥺",
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
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={widgetOpen}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-[340px] sm:w-[380px] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] relative"
            style={{ height: '540px' }}
          >
            {/* Elegant Gradient Header */}
            <div 
              className="p-5 flex items-center justify-between text-white relative overflow-hidden shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--violet-600))' }}
            >
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                  <Sparkles size={20} className="text-amber-200 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[16px] tracking-tight">MAX AI</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">CONCIERGE</span>
                  </div>
                  <span className="text-[11px] text-white/80 font-medium">Online & ready to assist</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close Chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[var(--teal-600)] text-white rounded-tr-none'
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
                    }`}
                  >
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1 font-semibold">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-2xl rounded-tl-none max-w-[150px] shadow-sm"
                >
                  <span className="text-[12px] font-bold">Max AI is typing</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.query)}
                  className="px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[12px] font-bold text-[var(--text-primary)] hover:border-[var(--teal-600)] transition-all cursor-pointer select-none"
                >
                  {prompt.text}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(inputValue)
              }}
              className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Max AI..."
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-600)] transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="w-11 h-11 rounded-xl bg-[var(--teal-600)] hover:bg-[var(--teal-700)] disabled:bg-zinc-400 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl relative overflow-hidden cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--violet-600))' }}
          >
            <motion.div
              className="absolute inset-0 bg-[var(--bg-card)] opacity-20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            <MessageSquare size={24} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

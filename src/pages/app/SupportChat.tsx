import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Bot, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pageTransition } from '../../motion/variants'
import { aiService } from '../../services/aiService'
import { ChatMessageRenderer } from '../../components/ai/ChatMessageRenderer'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hi there! I\'m Alex from ExpeditionX Support. How can I help you today?', sender: 'agent', time: '10:00 AM' }
]

export function SupportChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userText = input
    const newMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }

    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    // Mark as delivered after 400ms
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
    }, 400)

    try {
      // Small realistic typing delay (600–1200ms), then instant response
      const delay = 600 + Math.random() * 600
      await new Promise(resolve => setTimeout(resolve, delay))

      const result = await aiService.processChatQuery(userText)
      const replyText = result.response || "I'm here to help! Could you tell me more about what you need? 😊"

      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m))
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: replyText,
          sender: 'agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Happy to help! 😊 Ask me about destinations, trip planning, budgets, hotels, tickets, or local food!",
          sender: 'agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex flex-col h-[100dvh] bg-bg-primary max-w-2xl mx-auto border-x border-border-subtle relative">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-bg-card border-b border-border-subtle shadow-sm z-10 shrink-0 sticky top-0">
        <Link to="/app/help">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-bg-secondary transition-colors">
            <ArrowLeft size={20} />
          </motion.button>
        </Link>
        <div className="flex items-center gap-3">
           <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] dark:bg-teal-900/30 text-teal-600 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                <Bot size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-bg-card" />
           </div>
           <div>
              <h2 className="font-bold text-text-primary text-sm">Customer Support</h2>
              <p className="text-xs text-text-muted">Typically replies in 2 mins</p>
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="text-center mb-8">
           <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg-secondary px-3 py-1 rounded-full border border-border-default">Today</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              layout
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                msg.sender === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-sm border border-teal-500' 
                  : 'bg-bg-card text-text-primary rounded-tl-sm border border-border-subtle'
              }`}>
                <ChatMessageRenderer content={msg.text} isUser={msg.sender === 'user'} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 px-1">
                <span className="text-[10px] font-medium text-text-muted">{msg.time}</span>
                {msg.sender === 'user' && (
                  <span className="text-text-muted">
                    {msg.status === 'sent' ? <CheckCheck size={12} className="opacity-50" /> : <CheckCheck size={12} className="text-blue-500" />}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 max-w-[85%] mr-auto p-4 rounded-2xl rounded-tl-sm bg-bg-card border border-border-subtle shadow-sm w-max"
            >
              <motion.div className="w-2 h-2 rounded-full bg-text-muted" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
              <motion.div className="w-2 h-2 rounded-full bg-text-muted" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
              <motion.div className="w-2 h-2 rounded-full bg-text-muted" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-bg-card border-t border-border-subtle shrink-0 sticky bottom-0 z-10 pb-safe">
        <div className="relative flex items-center bg-bg-secondary rounded-2xl border border-border-default focus-within:border-teal-500 transition-colors shadow-sm p-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium text-text-primary outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-opacity shrink-0"
          >
            <Send size={16} className="ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

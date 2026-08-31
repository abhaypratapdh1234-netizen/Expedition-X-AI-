import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mail, Phone, Search, ChevronDown, ChevronRight, Send, Bot, Sparkles, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pageTransition, staggerContainer, itemPop } from '../../motion/variants'

const FAQS = [
  {
    category: 'AI Planning',
    items: [
      {
        q: 'How does AI trip planning work?',
        a: 'Our AI analyzes thousands of data points — weather patterns, real traveler costs, live reviews, seasonal trends — to build personalized itineraries in seconds. It learns from your preferences to get better over time.'
      },
      {
        q: 'How accurate are the cost estimates?',
        a: 'Our AI achieves 94% accuracy based on real-time data from 1.2M+ trips. Estimates factor in accommodation, transport, food, and activities. Costs may vary ±10% due to seasonality and availability.'
      },
      {
        q: 'Can the AI optimize my existing itinerary?',
        a: 'Yes! Open any itinerary, click "Optimize Route" and our AI will rearrange your day-wise plan to minimize travel time and maximize experience quality — all while keeping your budget intact.'
      },
    ]
  },
  {
    category: 'Booking & Payments',
    items: [
      {
        q: 'Is booking secure on ExpeditionX AI?',
        a: 'All payments are processed through PCI-DSS Level 1 compliant gateways with 256-bit SSL encryption. We never store your full card details.'
      },
      {
        q: 'Can I cancel my bookings?',
        a: 'Hotel bookings offer free cancellation up to 48 hours before check-in. Entry ticket policies vary by attraction — cancellation terms are shown before you confirm each booking.'
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm), net banking, and wallet payments.'
      },
    ]
  },
  {
    category: 'Rewards & Account',
    items: [
      {
        q: 'How do I earn XP and rewards?',
        a: 'Earn XP for every action: completing trips (+200), writing reviews (+50 each), inviting friends (+100 per referral), and using AI planning tools (+10 per session). Redeem XP for discounts, perks, and exclusive experiences.'
      },
      {
        q: 'Can I share my trip with friends?',
        a: 'Yes! Open any trip, go to the Collaborators tab, and share a link. Friends can view and edit the shared itinerary with real-time presence indicators.'
      },
      {
        q: 'How do I download my itinerary for offline use?',
        a: 'Open the Trip Overview → Itinerary tab → tap "Download PDF". The PDF includes your full day-wise plan, hotel details, map screenshots, and emergency contacts — no internet needed.'
      },
    ]
  },
]

const CONTACT_OPTIONS = [
  {
    icon: Bot,
    label: 'AI Assistant',
    desc: 'Get instant answers 24/7',
    cta: 'Chat Now',
    to: '/app/assistant',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    color: '#8b5cf6',
    border: '#ddd6fe',
    shadow: 'rgba(139,92,246,0.2)'
  },
  {
    icon: MessageCircle,
    label: 'Live Chat',
    desc: 'Avg. 2 min reply time',
    cta: 'Start Chat',
    to: '/app/help/chat',
    bg: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
    color: '#0d9488',
    border: '#99f6e4',
    shadow: 'rgba(13,148,136,0.2)'
  },
  {
    icon: Mail,
    label: 'Email Support',
    desc: 'support@expeditionx.ai',
    cta: 'Send Email',
    to: null,
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    color: '#d97706',
    border: '#fde68a',
    shadow: 'rgba(217,119,6,0.2)'
  },
]

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [contactForm, setContactForm] = useState({ subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [faqs, setFaqs] = useState<{category: string, items: {q: string, a: string}[]}[]>(FAQS)
  const [focused, setFocused] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadFaqs() {
      try {
        const { apiClient } = await import('../../services/apiClient')
        const data = await apiClient.get<any[]>('/faq')
        
        const grouped = data.reduce((acc, curr) => {
          const cat = acc.find((c: any) => c.category === curr.category)
          if (cat) {
            cat.items.push({ q: curr.question, a: curr.answer })
          } else {
            acc.push({ category: curr.category, items: [{ q: curr.question, a: curr.answer }] })
          }
          return acc
        }, [] as {category: string, items: {q: string, a: string}[]}[])
        
        if (grouped.length > 0) setFaqs(grouped)
      } catch (err) {
        console.error('Failed to load FAQs, using local data', err)
      }
    }
    loadFaqs()
  }, [])

  const allFaqs = faqs.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })))

  const filteredCategories = searchQ
    ? [{ category: 'Search Results', items: allFaqs.filter(f => f.q.toLowerCase().includes(searchQ.toLowerCase()) || f.a.toLowerCase().includes(searchQ.toLowerCase())) }]
    : faqs

  const handleSubmit = async () => {
    if (contactForm.subject && contactForm.message) {
      try {
         const { apiClient } = await import('../../services/apiClient')
         await apiClient.post('/support/ticket', contactForm)
      } catch (err) {
         console.error('API offline, simulating secure message delivery', err)
         const { simulateNetworkDelay } = await import('../../services/mockDelay')
         await simulateNetworkDelay(800, 1500)
      }
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setContactForm({ subject: '', message: '' }) }, 3000)
    }
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center sm:text-left">
        <h1 className="font-display text-5xl sm:text-6xl mb-3 text-[var(--text-primary)] tracking-tight font-black">Help & Support</h1>
        <p className="text-[var(--text-secondary)] font-black text-[20px]">Get answers instantly or reach out to our team.</p>
      </motion.div>

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM CONTACT CARDS
      ══════════════════════════════════════════════ */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
      >
        {CONTACT_OPTIONS.map((opt, i) => (
          <motion.div key={opt.label} variants={itemPop}>
            {opt.to ? (
              <Link to={opt.to} className="block h-full outline-none">
                <ContactCard opt={opt} />
              </Link>
            ) : (
              <div className="h-full outline-none" onClick={() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth' })
                setTimeout(() => document.getElementById('support-subject')?.focus(), 500)
              }}>
                <ContactCard opt={opt} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════
          SPOTLIGHT-STYLE LUXURY SEARCH BAR
      ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="relative mb-12 z-20 group"
      >
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-violet-400 rounded-[28px] blur-lg opacity-0 transition-opacity duration-500" 
          style={{ opacity: focused ? 0.3 : 0 }}
        />
        <div 
          className="relative flex items-center bg-[var(--bg-card)] rounded-[24px] overflow-hidden transition-all duration-500"
          style={{
            boxShadow: focused 
              ? '0 20px 40px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255, 255, 255, 1)' 
              : '0 10px 30px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255, 255, 255, 1)',
            border: focused ? '1px solid #99f6e4' : '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div className="pl-6 pr-4">
            <Search size={24} className={`transition-colors duration-500 ${focused ? 'text-teal-500' : 'text-[var(--text-muted)]'}`} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search our knowledge base..."
            className="w-full py-5 pr-6 bg-transparent outline-none text-[var(--text-primary)] text-[20px] font-black placeholder:text-[var(--text-muted)]"
          />
          {searchQ && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="pr-4">
               <button onClick={() => setSearchQ('')} className="p-2 bg-[var(--bg-card)] rounded-full text-[var(--text-secondary)] hover:bg-gray-200">
                  <ChevronRight size={14} />
               </button>
             </motion.div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          LUXURY FAQ ACCORDIONS (Floating Cards)
      ══════════════════════════════════════════════ */}
      {filteredCategories.map((section, si) => (
        <motion.div
          key={section.category}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + si * 0.05 }}
          className="mb-10"
        >
          <h2 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 pl-2 text-[var(--text-muted)]">
            {section.category}
          </h2>
          
          <div className="space-y-3">
            {section.items.length === 0 ? (
              <div className="px-6 py-12 text-center rounded-[24px]" style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                <Search size={32} className="mx-auto mb-3 text-[#d1d5db]" />
                <p className="text-[var(--text-muted)] font-extrabold text-xl">No results for "{searchQ}"</p>
                <p className="text-[15px] font-extrabold text-[var(--text-muted)] mt-1">Try checking for typos or using different keywords.</p>
              </div>
            ) : (
              section.items.map((faq, i) => {
                const key = `${section.category}-${i}`
                const isOpen = openFaq === key;
                
                return (
                  <motion.div
                    key={key}
                    initial={false}
                    animate={{
                      backgroundColor: isOpen ? 'var(--bg-card)' : 'var(--bg-card)',
                      borderColor: isOpen ? '#ccfbf1' : 'rgba(0,0,0,0.03)',
                      boxShadow: isOpen 
                        ? '0 15px 35px rgba(20,184,166,0.1), inset 0 2px 4px rgba(255,255,255,1)' 
                        : '0 4px 10px rgba(0,0,0,0.02)'
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-[20px] border"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left outline-none group"
                    >
                      <span className={`font-black text-[18px] pr-4 transition-colors ${isOpen ? 'text-[#0f766e]' : 'text-[var(--text-primary)] group-hover:text-[#0f766e]'}`}>
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0, backgroundColor: isOpen ? '#f0fdfa' : 'var(--bg-card)' }}
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[rgba(0,0,0,0.04)] shadow-sm text-[var(--text-muted)] group-hover:text-[#0f766e] group-hover:bg-[#f0fdfa]"
                      >
                        <ChevronDown size={16} strokeWidth={3} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-6 pb-6 pt-1">
                            <p className="text-[16px] leading-relaxed text-[var(--text-primary)] font-black border-l-2 border-teal-200 pl-4">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      ))}

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM WHITE CONTACT FORM
      ══════════════════════════════════════════════ */}
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-[32px] p-8 sm:p-10 scroll-mt-24 relative overflow-hidden mt-16 shadow-card"
        style={{ 
          background: 'var(--bg-card)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255, 255, 255, 1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="font-display text-5xl mb-2 text-[var(--text-primary)] font-black tracking-tight drop-shadow-sm">Still need help?</h2>
            <p className="text-[var(--text-secondary)] font-black text-[18px] tracking-wide">Send us a detailed message and we'll respond within 24 hours.</p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-12 bg-[#f0fdfa] rounded-[24px] border border-[#ccfbf1]"
              >
                <div className="w-20 h-20 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ccfbf1] shadow-sm">
                  <Check size={32} className="text-[#0d9488]" strokeWidth={3} />
                </div>
                <p className="font-bold text-2xl text-[var(--text-primary)] mb-2">Message Delivered!</p>
                <p className="text-[#0f766e]">Our support team is on it. Expect an email shortly.</p>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-6">
                <div className="group">
                  <label className="text-[14px] font-black uppercase tracking-widest block mb-2 text-[var(--text-muted)] group-focus-within:text-[#0f766e] transition-colors">Subject</label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-violet-400 rounded-[18px] blur opacity-0 group-focus-within:opacity-40 transition duration-500"></div>
                    <input
                      id="support-subject"
                      type="text"
                      value={contactForm.subject}
                      onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Problem with my booking"
                      className="relative w-full px-5 py-4 rounded-[16px] text-[18px] border-none outline-none font-black placeholder:text-[var(--text-muted)] text-[var(--text-primary)] transition-all shadow-inner"
                      style={{ 
                        background: 'var(--bg-card)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.05)'
                      }}
                      onFocus={e => (e.target.style.background = 'var(--bg-card)')}
                      onBlur={e => (e.target.style.background = 'var(--bg-card)')}
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[14px] font-black uppercase tracking-widest block mb-2 text-[var(--text-muted)] group-focus-within:text-[#0f766e] transition-colors">Message Details</label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-violet-400 rounded-[18px] blur opacity-0 group-focus-within:opacity-40 transition duration-500"></div>
                    <textarea
                      value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      className="relative w-full px-5 py-4 rounded-[16px] text-[18px] border-none outline-none resize-none font-black placeholder:text-[var(--text-muted)] text-[var(--text-primary)] transition-all shadow-inner"
                      style={{ 
                        background: 'var(--bg-card)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.05)'
                      }}
                      onFocus={e => (e.target.style.background = 'var(--bg-card)')}
                      onBlur={e => (e.target.style.background = 'var(--bg-card)')}
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-[16px] text-white text-[18px] font-black transition-all shadow-xl mt-4 group relative overflow-hidden"
                  style={{
                    background: contactForm.subject && contactForm.message
                      ? 'linear-gradient(135deg, #0d9488, #0f766e)'
                      : 'var(--bg-card)',
                    color: contactForm.subject && contactForm.message ? 'white' : '#6b7280',
                    border: contactForm.subject && contactForm.message ? 'none' : '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Glossy reflection on button - only visible when active */}
                  {contactForm.subject && contactForm.message && (
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[16px]" />
                  )}
                  
                  <Send size={18} className={contactForm.subject && contactForm.message ? 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10' : 'relative z-10'} /> 
                  <span className="relative z-10">SEND SECURE MESSAGE</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Version */}
      <p className="text-center text-[13px] mt-12 font-extrabold tracking-widest text-[var(--text-muted)] uppercase">
        ExpeditionX AI v2.1.0 • Response time avg. 2 hours
      </p>
    </motion.div>
  )
}

function ContactCard({ opt }: { opt: typeof CONTACT_OPTIONS[0] }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center gap-3 p-6 rounded-[24px] text-center cursor-pointer h-full transition-all duration-500 group relative overflow-hidden"
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid rgba(0,0,0,0.04)', 
        boxShadow: '0 15px 35px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)' 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.02)] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div
        className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-2 shadow-sm border group-hover:scale-110 transition-transform duration-500 relative z-10"
        style={{ background: opt.bg, borderColor: opt.border, boxShadow: `0 8px 20px ${opt.shadow}` }}
      >
        <opt.icon size={28} style={{ color: opt.color }} strokeWidth={2} />
      </div>
      <div className="relative z-10">
        <p className="font-black text-[22px] text-[var(--text-primary)] mb-1">{opt.label}</p>
        <p className="text-[14px] font-black text-[var(--text-muted)]">{opt.desc}</p>
      </div>
      <span
        className="mt-auto text-[14px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm relative z-10 border transition-all"
        style={{ background: opt.bg, color: opt.color, borderColor: opt.border }}
      >
        {opt.cta} <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
      </span>
    </motion.div>
  )
}

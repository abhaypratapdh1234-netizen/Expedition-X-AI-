import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Search, ChevronDown, Mail, MessageCircle, Send } from 'lucide-react'
import { useSettingsStore } from '../../../stores/settingsStore'
import { t } from '../../../utils/formatters'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const FAQS = [
  { q: 'How does AI generation work?', a: 'Our AI analyzes millions of data points, including your preferences, global trends, and real-time availability, to craft a personalized itinerary in seconds.' },
  { q: 'Can I change my currency?', a: 'Yes! Navigate to the Preferences section in Settings to choose from USD, INR, EUR, GBP, and AED.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use bank-grade AES-256 encryption. We do not store your raw credit card details on our servers.' },
  { q: 'How do I invite collaborators?', a: 'Open any trip from your Dashboard, navigate to the Collaborators tab, and share the unique invite link.' }
]

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { language } = useSettingsStore()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [message, setMessage] = useState('')

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setActiveFaq(null)
      setShowContact(false)
      setMessage('')
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-[var(--bg-card)] rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden relative flex flex-col max-h-[85vh]"
              style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              {/* Premium Header */}
              <div className="relative pt-12 pb-10 px-8 text-center shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <HelpCircle size={150} className="text-white" />
                </div>
                
                <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-card)]/10 flex items-center justify-center text-white hover:bg-[var(--bg-card)]/20 transition-all z-10">
                  <X size={20} />
                </button>
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{t('Help & Support', language)}</h2>
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-6">{t('How can we help you plan your next adventure?', language)}</p>
                  
                  <div className="relative max-w-md mx-auto">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input 
                      type="text" 
                      placeholder={t('Search for answers...', language)}
                      className="w-full bg-[var(--bg-card)]/10 border border-white/20 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl outline-none focus:bg-[var(--bg-card)]/20 focus:border-[#FC6C26] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="px-8 py-8 overflow-y-auto custom-scrollbar flex-1 bg-[var(--bg-card)]/30">
                <AnimatePresence mode="wait">
                  {!showContact ? (
                    <motion.div 
                      key="faqs"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">{t('Frequently Asked Questions', language)}</h3>
                      {FAQS.map((faq, i) => {
                        const isActive = activeFaq === i
                        return (
                          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                            <button 
                              onClick={() => setActiveFaq(isActive ? null : i)}
                              className="w-full flex items-center justify-between p-5 text-left"
                            >
                              <span className={`font-bold text-[15px] ${isActive ? 'text-[#FC6C26]' : 'text-[var(--text-primary)]'}`}>{t(faq.q, language)}</span>
                              <motion.div animate={{ rotate: isActive ? 180 : 0 }} className="text-[var(--text-muted)] shrink-0">
                                <ChevronDown size={20} />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {isActive && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: 'auto', opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-5 pt-0 text-[var(--text-muted)] text-[15px] leading-relaxed border-t border-gray-50">
                                    {t(faq.a, language)}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="contact"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto bg-[#FFF5F0] rounded-2xl flex items-center justify-center mb-4 text-[#FC6C26]">
                          <MessageCircle size={30} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('Send us a message', language)}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Our support team usually replies within 24 hours.', language)}</p>
                      </div>

                      <div className="space-y-4">
                        <textarea 
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={t('Describe your issue in detail...', language)}
                          className="w-full h-32 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 text-[var(--text-primary)] outline-none focus:border-[#FC6C26] focus:ring-4 focus:ring-[#FC6C26]/10 transition-all resize-none shadow-sm"
                        />
                        <button 
                          className="w-full bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(252, 108, 38,0.3)] hover:shadow-[0_15px_30px_rgba(252, 108, 38,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={18} /> {t('Send Message', language)}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 shrink-0 border-t border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-card)]">
                {!showContact ? (
                  <>
                    <div className="text-sm">
                      <span className="text-[var(--text-secondary)]">{t('Still need help?', language)}</span>
                    </div>
                    <button 
                      onClick={() => setShowContact(true)}
                      className="px-6 py-3 rounded-xl bg-[#FFF5F0] text-[#FC6C26] font-bold text-sm hover:bg-[#FFE4D6] transition-colors flex items-center gap-2"
                    >
                      <Mail size={16} /> {t('Contact Support', language)}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowContact(false)}
                    className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ← {t('Back to FAQ', language)}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

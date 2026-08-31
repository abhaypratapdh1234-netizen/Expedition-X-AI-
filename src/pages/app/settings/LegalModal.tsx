import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, Key, CheckCircle2 } from 'lucide-react'
import { useSettingsStore } from '../../../stores/settingsStore'
import { t } from '../../../utils/formatters'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms'
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const { language } = useSettingsStore()

  const isPrivacy = type === 'privacy'
  const title = isPrivacy ? t('Privacy Policy', language) : t('Terms of Service', language)
  const Icon = isPrivacy ? ShieldAlert : Key

  const content = isPrivacy ? [
    {
      title: 'Data Collection',
      body: 'We collect only the absolute minimum data required to provide you with a world-class, personalized AI travel experience. This includes your preferences, saved destinations, and itinerary histories.'
    },
    {
      title: 'Data Usage',
      body: 'Your data is strictly yours. It is never sold to third parties. We use it exclusively to train your personal AI travel agent and tailor the most breathtaking itineraries globally.'
    },
    {
      title: 'Bank-Grade Security',
      body: 'All personal information and payment details are secured using state-of-the-art AES-256 encryption. Your privacy is our uncompromising priority.'
    }
  ] : [
    {
      title: 'Acceptance of Terms',
      body: 'By accessing or using ExpeditionX AI, you agree to be bound by these ultra-premium Terms of Service. If you disagree, you may not access our exclusive travel features.'
    },
    {
      title: 'User Responsibilities',
      body: 'You agree to use our AI generation systems responsibly. Automated scraping, abuse of the generation limits, or malicious activities will result in immediate termination of your world-class access.'
    },
    {
      title: 'Limitation of Liability',
      body: 'While our AI models strive for absolute perfection, travel conditions change. We recommend verifying critical bookings directly. ExpeditionX AI is not liable for missed flights or sudden venue closures.'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            onClick={onClose}
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
              <div className="relative pt-12 pb-8 px-8 text-center shrink-0" style={{ background: 'linear-gradient(180deg, #FFF4D6 0%, #ffffff 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FC6C26] to-[#FC6C26]" />
                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-200 transition-all">
                  <X size={20} />
                </button>
                <div className="w-16 h-16 mx-auto rounded-[20px] bg-gradient-to-br from-[#FFF5F0] to-[#FFE4D6] flex items-center justify-center mb-6 shadow-sm border border-[#FFE4D6]">
                  <Icon size={28} className="text-[#FC6C26]" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">{title}</h2>
                <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{t('Last updated: October 2026', language)}</p>
              </div>

              {/* Scrollable Content */}
              <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-8">
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed font-medium">
                    {t('Welcome to ExpeditionX AI. Please read these terms carefully before utilizing our services.', language)}
                  </p>
                  
                  {content.map((section, i) => (
                    <motion.div 
                      key={section.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      className="relative pl-6"
                    >
                      <div className="absolute left-0 top-1 w-1 h-full bg-gradient-to-b from-[#FC6C26] to-[#FC6C26] rounded-full opacity-30" />
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        {t(section.title, language)}
                      </h3>
                      <p className="text-[var(--text-muted)] text-[15px] leading-relaxed">
                        {t(section.body, language)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 shrink-0 border-t border-[var(--border-subtle)] flex justify-end bg-[var(--bg-card)]/50">
                <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-[#111827] text-white font-bold text-[15px] hover:bg-[#1f2937] transition-colors shadow-[0_10px_20px_rgba(17,24,39,0.1)] flex items-center gap-2">
                  <CheckCircle2 size={18} /> {t('I Understand', language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

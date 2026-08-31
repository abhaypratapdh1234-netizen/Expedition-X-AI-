import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, Trash2 } from 'lucide-react'
import { useSettingsStore } from '../../../stores/settingsStore'
import { useAuthStore } from '../../../stores/authStore'
import { t } from '../../../utils/formatters'
import { useNavigate } from 'react-router-dom'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { language } = useSettingsStore()
  const { deleteAccount } = useAuthStore()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')

  const isConfirmed = confirmText === 'DELETE'

  const handleDelete = () => {
    if (isConfirmed) {
      deleteAccount()
      navigate('/')
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(24px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--bg-card)] rounded-[32px] shadow-[0_25px_50px_-12px_rgba(225,29,72,0.3)] overflow-hidden relative flex flex-col"
              style={{ border: '1px solid rgba(225,29,72,0.2)' }}
            >
              {/* Danger Header */}
              <div className="relative pt-10 pb-8 px-8 text-center" style={{ background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)' }}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <ShieldAlert size={150} className="text-red-600" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600" />
                
                <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all z-10">
                  <X size={20} />
                </button>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-100 to-rose-50 flex items-center justify-center mb-6 shadow-sm border border-red-100">
                    <Trash2 size={36} className="text-red-600 drop-shadow-sm" />
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">{t('Delete Account', language)}</h2>
                  <p className="text-sm font-bold text-red-600 uppercase tracking-[0.2em]">{t('Permanent Action', language)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 relative z-10">
                <p className="text-[var(--text-muted)] text-[15px] leading-relaxed text-center mb-6">
                  {t('Are you absolutely sure you want to delete your account? This action cannot be undone. All your saved itineraries, preferences, and bookings will be permanently erased.', language)}
                </p>

                <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-subtle)] mb-8">
                  <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3">
                    {t('Type DELETE to confirm', language)}
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-lg font-bold text-center tracking-widest outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-red-600 placeholder-gray-300"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleClose}
                    className="flex-1 px-6 py-4 rounded-xl text-[15px] font-bold text-gray-700 bg-[var(--bg-card)] hover:bg-gray-200 transition-colors"
                  >
                    {t('Cancel', language)}
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={!isConfirmed}
                    className="flex-1 px-6 py-4 rounded-xl text-[15px] font-bold text-white transition-all shadow-[0_10px_20px_rgba(225,29,72,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: isConfirmed ? 'linear-gradient(135deg, #ef4444, #e11d48)' : '#6b7280' }}
                  >
                    <Trash2 size={18} /> {t('Permanently Delete', language)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

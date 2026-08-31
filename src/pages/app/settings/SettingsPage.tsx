import { useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../../stores/themeStore'
import type { Theme } from '../../../stores/themeStore'
import { useAuthStore } from '../../../stores/authStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import { t } from '../../../utils/formatters'
import { Sun, Moon, Bell, Globe, Lock, Trash2, ChevronRight, Check, LogOut, ShieldAlert, Key, HelpCircle, Palette, Brain } from 'lucide-react'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { LegalModal } from './LegalModal'
import { SupportModal } from './SupportModal'
import { DeleteAccountModal } from './DeleteAccountModal'

function ToggleSwitch({ checked, onChange, icon: Icon }: { checked: boolean; onChange: (v: boolean) => void, icon?: any }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 shadow-inner ${checked ? 'border-none' : 'bg-[var(--bg-card)] border border-[#e5e7eb]'}`}
      style={checked ? { background: 'linear-gradient(135deg, #FC6C26, #FC6C26)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' } : {}}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${checked ? 'bg-[var(--bg-card)]' : 'bg-[#6b7280]'}`}
        style={{ marginLeft: checked ? 'auto' : '0' }}
      >
        {Icon && <Icon size={12} className={checked ? 'text-[#FC6C26]' : 'text-white'} />}
      </motion.div>
    </motion.button>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const { logout } = useAuthStore()
  const { currency, language, setCurrency, setLanguage } = useSettingsStore()
  const { comfortableBudget, setComfortableBudget } = useIntelligenceStore()
  const [notifs, setNotifs] = useState({ deals: true, updates: true, reminders: false, newsletter: false })
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [localBudget, setLocalBudget] = useState(String(comfortableBudget || ''))

  const SECTIONS = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Deal Alerts', desc: 'Get notified about travel deals', control: <ToggleSwitch checked={notifs.deals} onChange={v => setNotifs(p => ({ ...p, deals: v }))} /> },
        { label: 'App Updates', desc: 'New features and improvements', control: <ToggleSwitch checked={notifs.updates} onChange={v => setNotifs(p => ({ ...p, updates: v }))} /> },
        { label: 'Trip Reminders', desc: 'Reminders before your trips', control: <ToggleSwitch checked={notifs.reminders} onChange={v => setNotifs(p => ({ ...p, reminders: v }))} /> },
      ]
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        {
          label: 'Currency',
          desc: 'Choose your preferred currency',
          control: (
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-[15px] font-black outline-none bg-[var(--bg-card)] border border-[#e5e7eb] text-[var(--text-primary)] focus:border-[#FC6C26] cursor-pointer shadow-inner">
              {['INR', 'USD', 'EUR', 'GBP', 'AED'].map(c => <option key={c}>{c}</option>)}
            </select>
          )
        },
        {
          label: 'Language',
          desc: 'App interface language',
          control: (
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-[15px] font-black outline-none bg-[var(--bg-card)] border border-[#e5e7eb] text-[var(--text-primary)] focus:border-[#FC6C26] cursor-pointer shadow-inner">
              {['English', 'Hindi'].map(l => <option key={l}>{l}</option>)}
            </select>
          )
        }
      ]
    }
  ]

  const LINKS = [
    { label: 'Privacy Policy', icon: ShieldAlert, id: 'privacy' },
    { label: 'Terms of Service', icon: Key, id: 'terms' },
    { label: 'Help & Support', icon: HelpCircle, id: 'support' },
  ]

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-3xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-display font-black text-5xl mb-2 text-[var(--text-primary)] tracking-tight">{t('Settings', language)}</h1>
        <p className="text-[var(--text-secondary)] text-[18px] font-black tracking-wide mt-2">{t('Customize your ExpeditionX AI experience.', language)}</p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show">

        {/* ── Appearance / Theme ── */}
        <motion.div variants={itemPop} className="mb-8">
          <h2 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2 text-[#FC6C26]">
            <Palette size={18} /> Appearance
          </h2>
          <div
            className="rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1 relative group"
            style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255,255,255,1)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div className="p-5">
              <p className="text-[18px] font-black text-[var(--text-primary)] mb-1">Theme</p>
              <p className="text-[14px] font-black text-[var(--text-muted)] mb-4">Choose how the app looks</p>
              <div className="flex gap-3 flex-wrap">
                {([
                  { value: 'light' as Theme,       label: 'Warm Light',  icon: Sun },
                  { value: 'dark' as Theme,        label: 'Warm Dark',   icon: Moon },
                  { value: 'monochrome' as Theme,  label: 'Monochrome',  icon: Palette },
                ] as { value: Theme; label: string; icon: any }[]).map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(value)}
                    className="flex flex-col items-center gap-2 p-3 rounded-[16px] border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: theme === value ? '#FC6C26' : 'var(--border-subtle)',
                      background: theme === value ? 'rgba(252,108,38,0.08)' : 'var(--bg-card-hover)',
                      minWidth: 88,
                    }}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm border transition-colors ${theme === value ? 'border-[#FC6C26] bg-[#FC6C26]/10 text-[#FC6C26]' : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-black text-[var(--text-primary)] text-center leading-tight">{label}</span>
                    {theme === value && (
                      <span className="text-[10px] font-black text-[#FC6C26] uppercase tracking-widest">Active</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {SECTIONS.map((section) => (
          <motion.div variants={itemPop} key={section.title} className="mb-8">
            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2 text-[#FC6C26]">
              <section.icon size={18} /> {t(section.title, language)}
            </h2>
            <div className="rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1 relative group"
                 style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)', border: '1px solid rgba(0,0,0,0.04)' }}>
              {section.items.map((item, i) => (
                <div key={item.label}
                  className="flex items-center justify-between p-5"
                  style={{ borderBottom: i < section.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  <div className="pr-4">
                    <p className="text-[18px] font-black text-[var(--text-primary)]">{t(item.label, language)}</p>
                    <p className="text-[14px] font-black text-[var(--text-muted)] mt-1">{t(item.desc, language)}</p>
                  </div>
                  <div className="shrink-0">{item.control}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* ── v4: Decision Intelligence Preferences ── */}
        <motion.div variants={itemPop} className="mb-8">
          <h2 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2 text-[#FC6C26]">
            <Brain size={18} /> Decision Intelligence
          </h2>
          <div
            className="rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1 relative group"
            style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="p-5">
              <p className="text-[18px] font-black text-[var(--text-primary)] mb-0.5">Comfortable Trip Budget</p>
              <p className="text-[14px] font-black text-[var(--text-muted)] mb-3">Used to calculate Budget Stress — not AI-inferred</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-2.5 flex-1 focus-within:border-[#FC6C26] transition-colors">
                  <span className="text-[#FC6C26] font-black text-[18px] mr-1.5">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={localBudget}
                    onChange={e => setLocalBudget(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(localBudget) || 0
                      setComfortableBudget(val)
                    }}
                    className="flex-1 bg-transparent text-[18px] font-black text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                {comfortableBudget > 0 && (
                  <span className="text-[13px] font-black text-[#16a34a] px-3 py-1.5 bg-green-50 rounded-full border border-green-100 shrink-0">
                    ✓ Set
                  </span>
                )}
              </div>
              <p className="text-[13px] font-black text-[#c4c4c4] italic mt-3">Your input only. Not inferred from bookings or travel history.</p>
            </div>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div variants={itemPop} className="mb-8">
           <h2 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2 text-[var(--text-muted)]">
              <ShieldAlert size={18} /> {t('Legal & Support', language)}
            </h2>
          <div className="rounded-[24px] overflow-hidden transition-all duration-500 relative group hover:-translate-y-1"
                 style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)' }}>
            {LINKS.map((link, i) => (
              <motion.div key={link.label} whileHover={{ backgroundColor: 'var(--bg-card)', x: 4 }}
                onClick={() => setActiveModal(link.id as any)}
                className="flex items-center gap-4 p-5 cursor-pointer transition-all"
                style={{ borderBottom: i < LINKS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div className="w-10 h-10 rounded-[14px] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)] group-hover:text-[#FC6C26] transition-colors">
                   <link.icon size={18} />
                </div>
                <span className="text-[18px] font-black text-[var(--text-primary)] flex-1">{t(link.label, language)}</span>
                <ChevronRight size={18} className="text-[var(--text-primary)] group-hover:text-[#FC6C26] transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemPop} className="mb-8 mt-12">
          <div className="p-8 rounded-[24px] border border-red-500/20 relative overflow-hidden"
               style={{ background: 'rgba(225, 29, 72, 0.05)', boxShadow: '0 10px 30px rgba(225,29,72,0.1)' }}>
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
               <ShieldAlert size={120} className="text-red-500" />
             </div>
            <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 text-red-500">{t('Danger Zone', language)}</p>
            <p className="text-[16px] font-bold text-[var(--text-primary)] mb-6 max-w-sm leading-relaxed">{t('Once you delete your account, there is no going back. Please be certain.', language)}</p>
            <motion.button onClick={() => setShowDeleteModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 justify-center px-6 py-3.5 rounded-xl text-[16px] font-black border border-red-500/30 text-red-500 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] transition-colors shadow-sm cursor-pointer">
              <Trash2 size={18} /> {t('Delete Account', language)}
            </motion.button>
          </div>
        </motion.div>

        {/* App Version */}
        <motion.p variants={itemPop} className="text-center text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-12 mb-4">
          ExpeditionX AI v2.1.0 · Made with ❤️ for travelers
        </motion.p>
      </motion.div>

      <LegalModal isOpen={activeModal === 'privacy' || activeModal === 'terms'} type={activeModal === 'terms' ? 'terms' : 'privacy'} onClose={() => setActiveModal(null)} />
      <SupportModal isOpen={activeModal === 'support'} onClose={() => setActiveModal(null)} />
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </motion.div>
  )
}


import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Search, Bell, Sun, Moon, Menu, ChevronDown,
  User, Settings, LogOut, Compass, Command, Sparkles,
  Ticket, Tag, Calendar, Users, ShieldCheck, Palette
} from 'lucide-react'
import type { Theme } from '../../stores/themeStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { t } from '../../utils/formatters'
import { springSnappy, springSoft, easeReveal, easeExit, durations } from '../../motion/tokens'
import { dropdownVariants, dropdownItemVariants } from '../../motion/variants'
import { prefetchRoute } from '../../utils/routePrefetcher'

interface TopbarProps {
  onMenuClick: () => void
  user: any
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
  const { theme, setTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const { logout } = useAuthStore()
  const { unreadCount, notifications, markRead } = useNotificationStore()
  const { language } = useSettingsStore()
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReduced = useReducedMotion()

  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [bellWiggling, setBellWiggling] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  const prevUnreadCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      setBellWiggling(true)
      setTimeout(() => setBellWiggling(false), 600)
    }
    prevUnreadCount.current = unreadCount
  }, [unreadCount])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  const handleNotifClick = (notif: any) => {
    if (!notif.read) markRead(notif.id)
    setNotifOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const getNotifIcon = (type: string) => {
    switch(type) {
      case 'booking': return <Ticket size={16} className="text-[#8b5cf6]" />
      case 'trip': return <Calendar size={16} className="text-[#0f766e]" />
      case 'promo': return <Tag size={16} className="text-[#f59e0b]" />
      case 'referral': return <Users size={16} className="text-[#3b82f6]" />
      case 'system': return <ShieldCheck size={16} className="text-[#64748b]" />
      default: return <Bell size={16} className="text-[var(--text-muted)]" />
    }
  }

  const getNotifBg = (type: string) => {
    switch(type) {
      case 'booking': return 'bg-gradient-to-br from-[#ede9fe] to-[#ddd6fe] shadow-sm border-[#c4b5fd]'
      case 'trip': return 'bg-gradient-to-br from-[#ccfbf1] to-[#99f6e4] shadow-sm border-[#5eead4]'
      case 'promo': return 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a] shadow-sm border-[#fcd34d]'
      case 'referral': return 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] shadow-sm border-[#93c5fd]'
      case 'system': return 'bg-gradient-to-br from-[#FFF4D6] to-[#FFF4D6] shadow-sm border-[#cbd5e1]'
      default: return 'bg-[var(--bg-card)] border-[#e5e7eb] shadow-sm'
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/app/explore/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchFocused(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const suggestions = ['Delhi', 'Goa', 'Manali', 'Jaipur'].filter(d =>
    d.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[260px] z-50 flex items-center gap-6 px-10"
      style={{
        height: '76px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(40px) saturate(200%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--shadow-ultra)',
        transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onMenuClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid rgba(0,0,0,0.06)' }}
      >
        <Menu size={18} />
      </motion.button>

      {/* Desktop Nav Links */}
      <nav 
        className="hidden lg:flex items-center gap-2 shrink-0 font-sans ml-2 relative"
        onMouseLeave={() => setHoveredNav(null)}
      >
        {[
          { label: 'Explore', to: '/app/explore' },
          { label: 'Trip Planner', to: '/app/planner/setup' },
          { label: 'Book', to: '/app/book/hotels' },
          { label: 'Travel Toolkit', to: '/app/toolkit/packing' }
        ].map((item) => {
          const isActive = item.to === '/app/planner/setup'
            ? location.pathname.startsWith('/app/planner')
            : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={() => setHoveredNav(item.to)}
              className="relative px-5 py-2.5 rounded-full group block"
            >
              {hoveredNav === item.to && !isActive && (
                <motion.div
                  layoutId="topbar-hover-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.04)', zIndex: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {isActive && (
                 <motion.div
                  layoutId="topbar-active-bg"
                 className="absolute inset-0 rounded-full shadow-md"
                 style={{
                   background: 'linear-gradient(135deg, #FC6C26 0%, #FC6C26 100%)',
                 }}
                 transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
               />
              )}
              {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant="white" />}
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-300 whitespace-nowrap"
                style={{ color: isActive ? 'var(--bg-card)' : 'var(--text-primary)' }}>
                {t(item.label, language)}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM 10,000 BILLION DOLLAR SEARCH BAR
          The crown jewel of the app interface.
      ══════════════════════════════════════════════ */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto relative z-50 hidden md:block">
          <motion.div
            animate={{ scale: searchFocused && !prefersReduced ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full group/inner z-10 rounded-full"
          >
            <GlowingEffect spread={60} glow={true} disabled={false} proximity={250} inactiveZone={0.01} borderWidth={3} />
          {/* Ambient Aurora Glow (Only visible on focus) */}
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                className="absolute -inset-4 rounded-[32px] blur-2xl pointer-events-none opacity-40"
                style={{
                  background: 'linear-gradient(120deg, rgba(252, 108, 38,0.6), rgba(223,105,81,0.5), rgba(252, 108, 38,0.6))',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease infinite',
                  zIndex: -1
                }}
              />
            )}
          </AnimatePresence>
          
          <style>{`@keyframes shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

          {/* Search Input Container */}
          <div className="relative z-10 flex items-center rounded-full overflow-hidden transition-all duration-400"
            style={{
              background: searchFocused ? 'var(--bg-card)' : (isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255, 255, 255, 0.7)'),
              boxShadow: searchFocused 
                ? (isDark 
                    ? '0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(252, 108, 38,0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                    : '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(252, 108, 38,0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)')
                : (isDark
                    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 2px 5px rgba(0,0,0,0.1)'
                    : 'inset 0 2px 4px rgba(255, 255, 255, 0.5), 0 2px 5px rgba(0,0,0,0.02)'),
              border: searchFocused ? '1px solid transparent' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.04)'),
              backdropFilter: searchFocused ? 'none' : 'blur(10px)'
            }}
          >
            {/* Search Icon */}
            <div className="pl-5 pr-3 py-3 flex items-center justify-center">
              <motion.div animate={{ rotate: searchFocused ? 90 : 0, scale: searchFocused ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <Search size={18} className="transition-colors duration-300" style={{ color: searchFocused ? '#FC6C26' : '#6b7280' }} />
              </motion.div>
            </div>
            
            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search destinations, trips, users...', language)}
              className="w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[#9ca3af] py-3.5 font-black tracking-wide"
              onFocus={() => {
                setSearchFocused(true)
                prefetchRoute('explore')
              }}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              style={{ caretColor: '#FC6C26' }}
            />
            
            {/* Keyboard Shortcut Hint / AI Sparkles */}
            <div className="pr-4 pl-2 flex items-center gap-2">
              <AnimatePresence mode="wait">
                {searchFocused ? (
                  <motion.div key="sparkles" initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5 }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)', boxShadow: '0 4px 10px rgba(252, 108, 38,0.3)' }}>
                    <Sparkles size={14} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.span key="cmd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden sm:flex text-[10px] font-bold px-2 py-1.5 rounded-md tracking-widest items-center gap-1 uppercase" style={{ background: 'var(--bg-card)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)', color: 'var(--text-muted)', boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <Command size={10} /> K
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Autosuggest Dropdown ── */}
          <AnimatePresence>
            {searchFocused && searchQuery && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 8, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-full left-0 right-0 rounded-[24px] overflow-hidden z-50 p-2"
                style={{
                  background: 'var(--bg-card)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isDark 
                    ? '0 30px 60px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                    : '0 30px 60px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                }}
              >
                <div className="px-4 py-2 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Suggested Destinations</div>
                {suggestions.map((dest, i) => (
                  <motion.button
                    key={dest}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    type="button"
                    onClick={() => {
                      navigate(`/app/explore/search?q=${dest}`)
                      setSearchQuery('')
                      setSearchFocused(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all text-left rounded-2xl group hover:bg-[var(--bg-card)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[var(--bg-card)] group-hover:shadow-sm" style={{ background: 'var(--bg-card)' }}>
                      <Compass size={14} className="text-[#FC6C26]" />
                    </div>
                    {dest}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
      </form>

      {/* ══════════════════════════════════════════════
          RIGHT ACTIONS (Theme, Notifications, Profile)
      ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 ml-auto">
        {/* ── Theme Picker ── */}
        <div className="relative" ref={themeRef}>
          <motion.button
            onClick={() => setThemeOpen(!themeOpen)}
            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all relative"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
            title="Change theme"
          >
            <Palette size={16} className="text-[var(--text-secondary)]" />
          </motion.button>
          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-3 rounded-[20px] overflow-hidden z-50 bg-[var(--bg-card)] p-3 shadow-2xl border border-[var(--border-subtle)]"
                style={{ minWidth: 220 }}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-2 pb-3 pt-1">Theme</p>
                {([
                  { value: 'light' as Theme, label: 'Warm Light', icon: Sun },
                  { value: 'dark' as Theme, label: 'Warm Dark', icon: Moon },
                  { value: 'monochrome' as Theme, label: 'Monochrome', icon: Palette },
                ] as { value: Theme; label: string; icon: any }[]).map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    whileHover={{ x: 4 }}
                    onClick={() => { setTheme(value); setThemeOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all text-left whitespace-nowrap mb-1 last:mb-0 hover:bg-[var(--bg-card-hover)]"
                    style={{
                      background: theme === value ? 'var(--bg-card-hover)' : 'transparent',
                    }}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 shadow-sm border transition-colors ${theme === value ? 'border-[#FC6C26] bg-[#FC6C26]/10 text-[#FC6C26]' : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                      <Icon size={14} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[14px] font-display tracking-tight ${theme === value ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-secondary)]'}`}>{label}</span>
                    {theme === value && (
                      <span className="ml-auto text-[10px] font-black text-[#FC6C26] uppercase tracking-[0.15em] bg-[#FC6C26]/10 px-2 py-1 rounded-md">Active</span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            onClick={() => setNotifOpen(!notifOpen)}
            animate={bellWiggling ? { rotate: [0, -10, 10, -10, 10, -5, 5, 0] } : { rotate: 0 }}
            transition={bellWiggling ? { duration: 0.6 } : {}}
            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all relative"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
          >
            <Bell size={16} className="text-[var(--text-secondary)]" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#ef4444', fontSize: '9px', boxShadow: '0 2px 5px rgba(239,68,68,0.4)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notif Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-3 w-80 rounded-[24px] overflow-hidden z-50 bg-[var(--bg-card)]"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.04)] bg-[var(--bg-card)]">
                  <Link to="/app/notifications" onClick={() => setNotifOpen(false)} className="text-[16px] font-bold antialiased text-[var(--text-primary)] hover:text-[#FC6C26] uppercase tracking-widest transition-colors cursor-pointer">
                    {t('Notifications', language)}
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} onClick={() => handleNotifClick(n)} className={`px-4 py-3 cursor-pointer rounded-xl hover:bg-[var(--bg-card)] transition-colors flex items-start gap-3 ${!n.read ? 'bg-[var(--bg-card)]/30' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getNotifBg(n.type)}`}>
                        {n.icon ? <span className="text-xl">{n.icon}</span> : getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[14px] font-bold antialiased text-[var(--text-primary)]">{n.title}</p>
                        <p className="text-[12px] font-bold antialiased text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <motion.button
            onClick={() => setProfileOpen(!profileOpen)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all group"
            style={{ background: isDark ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-subtle)', boxShadow: isDark ? '0 4px 10px rgba(0,0,0,0.2)' : '0 4px 10px rgba(0,0,0,0.03)' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner overflow-hidden border border-[var(--border-subtle)]" style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <motion.div animate={{ rotate: profileOpen ? 180 : 0 }}>
              <ChevronDown size={14} className={`${isDark ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'} group-hover:text-[#FC6C26] transition-colors`} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-3 w-56 rounded-[24px] overflow-hidden z-50 bg-[var(--bg-card)] p-2"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              >
                <div className="px-5 py-4 mb-3 rounded-xl bg-[var(--bg-card)] border border-[rgba(0,0,0,0.04)]">
                  <p className="text-[16px] font-extrabold antialiased text-[var(--text-primary)]">{user?.name || 'Traveler'}</p>
                  <p className="text-[13px] font-extrabold antialiased text-[var(--text-primary)] mt-0.5">{user?.email}</p>
                </div>
                {[
                  { icon: User, label: 'Profile', to: '/app/profile' },
                  { icon: Settings, label: 'Settings', to: '/app/settings' },
                ].map((item) => (
                  <Link key={item.label} to={item.to} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-[14px] font-extrabold antialiased text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl transition-all">
                    <item.icon size={18} strokeWidth={3} /> {t(item.label, language)}
                  </Link>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 mt-1 text-[14px] font-extrabold antialiased text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-all">
                  <LogOut size={18} strokeWidth={3} /> {t('Log Out', language)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Compass, Sun, Moon, Palette } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import type { Theme } from '../../stores/themeStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export function PublicNavbar() {
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    const handleOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [])

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'How It Works', to: '/about' },
  ]

  const isLanding = location.pathname === '/'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out py-4 px-4 sm:px-6 md:px-8"
      style={{
        paddingTop: scrolled ? '0.75rem' : '1.5rem',
      }}
    >
      <div className="max-w-7xl mx-auto relative rounded-[24px] group">
        <GlowingEffect spread={40} glow={!isDark} disabled={isDark} proximity={64} inactiveZone={0.01} borderWidth={2} />
        <div 
          className="relative z-10 h-16 flex items-center justify-between rounded-[24px] px-6 transition-all duration-500"
          style={{
            background: scrolled 
              ? (isDark ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.75)')
              : isLanding 
                ? 'transparent' 
                : (isDark ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.5)'),
            backdropFilter: (scrolled || !isLanding) ? 'blur(24px) saturate(180%)' : 'none',
            WebkitBackdropFilter: (scrolled || !isLanding) ? 'blur(24px) saturate(180%)' : 'none',
            border: (scrolled || !isLanding) ? (isDark ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 255, 255, 0.6)') : '1px solid transparent',
            boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isDark ? 'shadow-lg border border-[var(--border-subtle)]' : 'shadow-lg shadow-[#FC6C26]/20'}`}
              style={{ background: isDark ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #FC6C26, #FC6C26)' }}
            >
              <Compass size={22} className={isDark ? "text-[var(--text-primary)]" : "text-white"} />
            </div>
            <span
              className="font-display font-black text-3xl tracking-tighter transition-colors duration-300 drop-shadow-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              Expedition<span style={{ color: isDark ? 'var(--text-primary)' : '#FC6C26' }}>X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[17px] font-black font-display transition-all duration-300 hover:opacity-100 relative group tracking-tight"
                style={{
                  color: location.pathname === link.to ? 'var(--text-primary)' : (isDark ? 'var(--text-secondary)' : '#4B5563'),
                  opacity: 1,
                }}
              >
                <span>
                  {link.label}
                </span>
                <span 
                  className="absolute -bottom-1.5 left-0 w-full h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
                  style={{ backgroundColor: isDark ? 'var(--text-primary)' : '#FC6C26' }}
                />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Moon size={20} /> : theme === 'monochrome' ? <Palette size={20} /> : <Sun size={20} />}
              </button>
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
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 shadow-sm border transition-colors ${theme === value ? (isDark ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'border-[#FC6C26] bg-[#FC6C26]/10 text-[#FC6C26]') : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                          <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <span className={`text-[14px] font-display tracking-tight ${theme === value ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-secondary)]'}`}>{label}</span>
                        {theme === value && (
                          <span className={`ml-auto text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md ${isDark ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' : 'bg-[#FC6C26]/10 text-[#FC6C26]'}`}>Active</span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              to="/login"
              className="hidden md:inline-flex text-[17px] font-black font-display px-4 py-2 rounded-lg transition-colors hover:text-[#FC6C26] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className={`hidden md:inline-flex items-center gap-1.5 text-[17px] font-extrabold font-display px-8 py-3 rounded-[16px] transition-all hover:scale-105 hover:-translate-y-0.5 ${isDark ? 'text-[var(--bg-primary)]' : 'text-white'}`}
              style={{ 
                background: isDark ? 'var(--text-primary)' : 'linear-gradient(135deg, #FC6C26, #FC6C26)',
                boxShadow: isDark ? '0 8px 20px -6px rgba(255, 255, 255, 0.4)' : '0 8px 20px -6px rgba(252, 108, 38,0.5)'
              }}
            >
              Get Started
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 rounded-[14px] flex items-center justify-center transition-all"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {menuOpen ? (
                <X size={20} style={{ color: 'var(--text-primary)' }} />
              ) : (
                <Menu size={20} style={{ color: 'var(--text-primary)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-[85px] left-4 right-4 rounded-[24px] overflow-hidden p-6 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-lg font-bold text-[#1B2A4A] border-b border-[var(--border-subtle)] last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3.5 rounded-[16px] text-base font-bold bg-[var(--bg-card)] text-[#1B2A4A] border border-[var(--border-subtle)]"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3.5 rounded-[16px] text-base font-bold text-white shadow-[0_8px_20px_-6px_rgba(252, 108, 38,0.5)]"
                  style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)' }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

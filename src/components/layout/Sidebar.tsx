import { NavLink, Link, useNavigate } from 'react-router-dom'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Compass, LayoutDashboard, Map, BookOpen, Briefcase, Heart, MessageSquare, Plane,
  Star, Bell, User, HelpCircle, Settings, ChevronLeft, ChevronRight,
  Wrench, ShieldCheck, LogOut, X, ShieldAlert, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { t } from '../../utils/formatters'
import { springSnappy, springSoft, easeReveal, durations } from '../../motion/tokens'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: Briefcase, label: 'My Trips', to: '/app/trips' },
  { icon: Plane, label: 'Flight Search', to: '/app/flights' },
  { icon: BookOpen, label: 'My Bookings', to: '/app/bookings' },
  { icon: Heart, label: 'Wishlist', to: '/app/wishlist' },
  { icon: MessageSquare, label: 'AI Assistant', to: '/app/assistant' },
  { icon: Star, label: 'Reviews & Memories', to: '/app/reviews' },
  { icon: Star, label: 'Rewards', to: '/app/rewards' },
  { icon: HelpCircle, label: 'Help & Support', to: '/app/help' },
]

interface SidebarProps {
  collapsed: boolean
  onCollapse: () => void
  isMobile?: boolean
}

export function Sidebar({ collapsed, onCollapse, isMobile = false }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { language } = useSettingsStore()
  const navigate = useNavigate()
  const prefersReduced = useReducedMotion()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const targetWidth = collapsed && !isMobile ? 72 : 260

  return (
    <motion.aside
      animate={{ width: targetWidth }}
      transition={springSoft}
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden backdrop-blur-ultra"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--shadow-ultra)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 h-20 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <AnimatePresence>
            {(!collapsed || isMobile) ? (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ ease: easeReveal, duration: durations.fast }}
                className="font-display font-black text-2xl tracking-tighter whitespace-nowrap overflow-hidden text-[var(--text-primary)] ml-2 cursor-pointer drop-shadow-sm"
              >
                ExpeditionX
              </motion.span>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] mx-auto shadow-md cursor-pointer"
              >
                <Compass size={22} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Close on mobile / Collapse on desktop */}
        <motion.button
          onClick={onCollapse}
          whileTap={prefersReduced ? undefined : { scale: 0.9 }}
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: durations.micro }}
          className="ml-auto w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {isMobile ? (
            <X size={16} />
          ) : collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1.5 relative" onMouseLeave={() => setHoveredPath(null)}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="relative" onMouseEnter={() => setHoveredPath(item.to)}>
              {hoveredPath === item.to && (
                <motion.div
                  layoutId="sidebar-hover-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--bg-card-hover)', zIndex: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `relative z-10 flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-black tracking-tighter transition-all duration-300 group/nav ${isActive ? 'active-nav' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--amber-500)' : 'var(--text-secondary)',
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />}
                    
                    {/* Premium Active Background */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(252, 108, 38,0.08) 0%, rgba(223,105,81,0.04) 100%)',
                          border: '1px solid rgba(252, 108, 38,0.15)',
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    
                    {/* Active Left Indicator (Glowing) */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full shadow-[0_0_8px_rgba(252, 108, 38,0.4)]"
                        style={{ background: 'var(--amber-500)' }}
                        transition={springSnappy}
                      />
                    )}

                    <div className="relative shrink-0 z-10 transition-transform duration-300 group-hover:scale-110">
                      <item.icon
                        size={20}
                        style={{
                          color: isActive ? 'var(--amber-500)' : 'var(--text-muted)',
                        }}
                      />
                      {/* Notification badge with scale-bounce entrance */}
                      <AnimatePresence>
                        {item.label === 'Notifications' && unreadCount > 0 && (
                          <motion.span
                            key={unreadCount}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: [0, 1.3, 1],
                              opacity: 1,
                              transition: springSnappy,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                            style={{ background: 'var(--amber-500)', fontSize: '9px' }}
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {(!collapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: durations.fast }}
                          className="whitespace-nowrap"
                        >
                          {t(item.label, language)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin Link */}
        {user?.role === 'admin' && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <NavLink
              to="/app/admin"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold"
              style={({ isActive }) => ({
                background: isActive ? 'rgba(27, 42, 74, 0.05)' : 'transparent',
                color: isActive ? 'var(--teal-700)' : 'var(--text-muted)',
              })}
            >
              <ShieldCheck size={20} />
              {(!collapsed || isMobile) && <span>{t('Admin Analytics', language)}</span>}
            </NavLink>
          </div>
        )}
      </nav>

    </motion.aside>
  )
}

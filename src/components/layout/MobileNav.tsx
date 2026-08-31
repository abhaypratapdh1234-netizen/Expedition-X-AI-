import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, Map, Briefcase, MoreHorizontal, Search, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { springSnappy, springSoft, durations } from '../../motion/tokens'

const BOTTOM_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', to: '/app/dashboard' },
  { icon: Search, label: 'Explore', to: '/app/explore' },
  { icon: Map, label: 'Planner', to: '/app/planner/setup' },
  { icon: BookOpen, label: 'Book', to: '/app/book/hotels' },
  { icon: MoreHorizontal, label: 'More', to: null },
]

const MORE_ITEMS = [
  { label: 'My Bookings', to: '/app/bookings' },
  { label: 'Wishlist', to: '/app/wishlist' },
  { label: 'AI Assistant', to: '/app/assistant' },
  { label: 'Rewards', to: '/app/rewards' },
  { label: 'Profile', to: '/app/profile' },
  { label: 'Help', to: '/app/help' },
]

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'var(--bg-overlay)' }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
              transition={springSoft}
              className="fixed bottom-20 left-4 right-4 rounded-2xl p-4 z-50 grid grid-cols-3 gap-2"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {MORE_ITEMS.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: durations.fast }}
                >
                  <NavLink
                    to={item.to!}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium w-full"
                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 pb-safe"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          height: '64px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {BOTTOM_ITEMS.map((item) => {
          if (!item.to) {
            return (
              <motion.button
                key="more"
                onClick={() => setMoreOpen(!moreOpen)}
                whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                transition={{ duration: durations.micro }}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <div
                  className="w-6 h-6 flex items-center justify-center"
                  style={{ color: moreOpen ? 'var(--teal-600)' : 'var(--text-muted)' }}
                >
                  <item.icon size={20} />
                </div>
                <span className="text-xs" style={{ color: moreOpen ? 'var(--teal-600)' : 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </motion.button>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-3 py-1 relative"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                      style={{ background: 'var(--teal-600)' }}
                      transition={springSnappy}
                    />
                  )}
                  <div
                    className="w-6 h-6 flex items-center justify-center"
                    style={{ color: isActive ? 'var(--teal-600)' : 'var(--text-muted)' }}
                  >
                    <item.icon size={20} />
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: isActive ? 'var(--teal-600)' : 'var(--text-muted)', fontWeight: isActive ? '600' : '400' }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </>
  )
}

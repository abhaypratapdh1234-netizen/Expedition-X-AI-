import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { AIFloatingWidget } from '../ai/AIFloatingWidget'

import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { easeReveal, easeExit, durations } from '../../motion/tokens'

export function AppShell() {
  const { user, isAuthenticated, isOnboarded } = useAuthStore()
  const { theme } = useThemeStore()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  // Track navigation direction (+1 forward, -1 back)
  const historyIndexRef = useRef(window.history.state?.idx ?? 0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const currentIdx = window.history.state?.idx ?? 0
    setDirection(currentIdx >= historyIndexRef.current ? 1 : -1)
    historyIndexRef.current = currentIdx
    setMobileSidebarOpen(false)
  }, [location.pathname])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isOnboarded && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />
  }

  // Direction-aware page transition variants
  const pageVariants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: durations.base, ease: easeReveal } },
        exit: { opacity: 0, transition: { duration: durations.fast, ease: easeExit } },
      }
    : {
        initial: { opacity: 0, x: direction * 12 },
        animate: { opacity: 1, x: 0, transition: { duration: durations.base, ease: easeReveal } },
        exit: { opacity: 0, x: direction * -12, transition: { duration: durations.fast, ease: easeExit } },
      }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Desktop Sidebar — never re-animates on route change */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: durations.fast }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'var(--bg-overlay)' }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <Sidebar
                collapsed={false}
                onCollapse={() => setMobileSidebarOpen(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
        }}
      >
        <style>{`
          @media (max-width: 1023px) {
            .main-content { margin-left: 0 !important; }
          }
        `}</style>

        {/* Topbar — never re-animates on route change */}
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          user={user}
        />

        {/* Content area — direction-aware cross-fade + 12px X slide */}
        <main
          className="flex-1 overflow-auto"
          style={{
            paddingTop: 'var(--topbar-height)',
            minHeight: '100vh',
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={location.pathname}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <MobileNav />
        </div>

        {/* Floating AI Assistant Widget */}
        <AIFloatingWidget />
      </div>


    </div>
  )
}

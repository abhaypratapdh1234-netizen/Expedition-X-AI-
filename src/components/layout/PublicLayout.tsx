import { Outlet, useLocation } from 'react-router-dom'
import { PublicNavbar } from './PublicNavbar'
import { Footer } from './Footer'
import { useThemeStore } from '../../stores/themeStore'
import { useEffect } from 'react'

export function PublicLayout() {
  const { theme } = useThemeStore()
  const location = useLocation()
  
  // We can still use isLanding if we want to change layout background later, but we will render Navbar everywhere.
  const isLanding = location.pathname === '/'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

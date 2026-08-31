import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, FileText, DollarSign, Calendar, CloudSun } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'

const TABS = [
  { path: '/app/toolkit/packing', label: 'Packing', icon: CheckSquare },
  { path: '/app/toolkit/documents', label: 'Documents', icon: FileText },
  { path: '/app/toolkit/currency', label: 'Currency', icon: DollarSign },
  { path: '/app/toolkit/events', label: 'Events', icon: Calendar },
  { path: '/app/toolkit/weather', label: 'Weather', icon: CloudSun },
]

export function ToolkitTabs() {
  const theme = useThemeStore(s => s.theme)
  const isMonochrome = theme === 'monochrome'
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  
  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-4 pt-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {TABS.map(tab => (
        <NavLink 
          key={tab.path} 
          to={tab.path} 
          className="relative group outline-none"
        >
          {({ isActive }) => (
            <div 
              className={`relative z-10 px-6 py-3 rounded-[16px] text-[16px] font-bold antialiased capitalize whitespace-nowrap transition-all duration-500 flex items-center gap-2.5 overflow-hidden ${
                isActive ? '' : 'hover:-translate-y-1'
              }`}
              style={{
                background: isActive 
                  ? (isMonochrome || isDark || isLight ? 'var(--text-primary)' : 'linear-gradient(135deg, var(--teal-600) 0%, var(--teal-800) 100%)') 
                  : 'var(--bg-card)',
                color: isActive ? (isMonochrome || isDark || isLight ? 'var(--bg-primary)' : 'white') : (isDark || isLight ? 'var(--text-primary)' : 'var(--text-secondary)'),
                boxShadow: isActive 
                  ? (isMonochrome || isDark || isLight ? 'var(--shadow-sm)' : '0 15px 35px -5px rgba(20, 184, 166, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)') 
                  : '0 4px 12px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid transparent' : (isDark || isLight ? '1px solid var(--border-default)' : '1px solid var(--border-subtle)')
              }}
            >
              {/* Luxury active state glow */}
              {isActive && (!isMonochrome && !isDark && !isLight) && (
                <motion.div
                  layoutId="toolkit-active-glow"
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-violet-500/20 blur-md z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2.5">
                <tab.icon 
                  size={16} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-500 ${isActive ? (isMonochrome || isDark || isLight ? 'text-[var(--bg-primary)]' : 'text-teal-100') : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} 
                />
                <span className="tracking-wide">
                  {tab.label}
                </span>
              </div>
            </div>
          )}
        </NavLink>
      ))}
    </div>
  )
}

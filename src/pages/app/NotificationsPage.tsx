import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Bell, Tag, Calendar, Star, Check, Trash2, ShieldCheck, Ticket, Users, Sparkles, ClipboardList, Clock, AlertCircle } from 'lucide-react'
import { useNotificationStore } from '../../stores/notificationStore'
import { useTripStore } from '../../stores/tripStore'
import { useThemeStore } from '../../stores/themeStore'
import { computeDecisionTimeline } from '../../services/intelligenceService'
import { pageTransition, staggerContainer, itemPop } from '../../motion/variants'

const FILTER_TABS = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'booking', label: 'Bookings', icon: Ticket },
  { id: 'trip', label: 'Trips', icon: Calendar },
  { id: 'promo', label: 'Deals', icon: Tag },
  { id: 'referral', label: 'Referrals', icon: Users },
  { id: 'system', label: 'System', icon: ShieldCheck },
  { id: 'tripprep', label: 'Trip Prep', icon: ClipboardList },
]

import React from 'react';

class NotificationsErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">React Crash in NotificationsPage!</h2>
          <p className="text-lg text-slate-800 font-mono bg-red-50 p-4 rounded-xl shadow-inner border border-red-200">
            {this.state.error?.message || "Unknown Error"}
          </p>
          <pre className="mt-4 text-left text-xs text-slate-500 overflow-auto bg-slate-50 p-4 rounded-lg">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function NotificationsPage() {
  return (
    <NotificationsErrorBoundary>
      <NotificationsPageContent />
    </NotificationsErrorBoundary>
  )
}

function NotificationsPageContent() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore()
  const { trips } = useTripStore()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const [activeFilter, setActiveFilter] = useState('all')
  const navigate = useNavigate()

  // ── v4: Compute Decision Timeline reminders across all upcoming trips ──
  const tripPrepReminders = useMemo(() => {
    const upcoming = (trips || []).filter(t => t?.status === 'upcoming' && t?.startDate)
    const allTasks: Array<{ tripName: string; tripId: string; task: ReturnType<typeof computeDecisionTimeline>[0] }> = []
    for (const trip of upcoming) {
      if (!trip?.startDate) continue;
      try {
        const tasks = computeDecisionTimeline(trip.startDate, trip.destinations?.[0] || trip.title || '')
        if (!tasks) continue;
        const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86_400_000)
        // Show tasks that are due within the next 60 days and not done
        const relevantTasks = tasks.filter(t => t?.days_before_trip <= daysUntil + 5 && !t?.done)
        for (const task of relevantTasks.slice(0, 3)) {
          allTasks.push({ tripName: trip.title || trip.destinations?.[0] || 'Trip', tripId: trip.id, task })
        }
      } catch(e) {
        console.error("Timeline error", e);
      }
    }
    return allTasks.slice(0, 10)
  }, [trips])

  const handleNotifClick = (notif: any) => {
    if (!notif?.read) markRead(notif?.id);
    if (notif?.link) navigate(notif.link);
  }

  const filtered = useMemo(
    () => activeFilter === 'all' ? (notifications || []) : (notifications || []).filter(n => n?.type === activeFilter),
    [notifications, activeFilter]
  )

  const getIcon = (type: string) => {
    switch(type) {
      case 'booking': return <Ticket size={20} className="text-[#8b5cf6]" />
      case 'trip': return <Calendar size={20} className="text-[#0f766e]" />
      case 'promo': return <Tag size={20} className="text-[#f59e0b]" />
      case 'referral': return <Users size={20} className="text-[#3b82f6]" />
      case 'system': return <ShieldCheck size={20} className="text-[#64748b]" />
      default: return <Bell size={20} className="text-[var(--text-muted)]" />
    }
  }

  const getIconBg = (type: string) => {
    if (isDark) {
      switch(type) {
        case 'booking': return 'bg-[rgba(139,92,246,0.1)] shadow-[0_4px_10px_rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.2)]'
        case 'trip': return 'bg-[rgba(20,184,166,0.1)] shadow-[0_4px_10px_rgba(20,184,166,0.2)] border border-[rgba(20,184,166,0.2)]'
        case 'promo': return 'bg-[rgba(245,158,11,0.1)] shadow-[0_4px_10px_rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.2)]'
        case 'referral': return 'bg-[rgba(59,130,246,0.1)] shadow-[0_4px_10px_rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.2)]'
        case 'system': return 'bg-[rgba(100,116,139,0.1)] shadow-[0_4px_10px_rgba(100,116,139,0.2)] border border-[rgba(100,116,139,0.2)]'
        default: return 'bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm'
      }
    }
    switch(type) {
      case 'booking': return 'bg-gradient-to-br from-[#ede9fe] to-[#ddd6fe] shadow-[0_4px_10px_rgba(139,92,246,0.2)] border border-[#c4b5fd]'
      case 'trip': return 'bg-gradient-to-br from-[#ccfbf1] to-[#99f6e4] shadow-[0_4px_10px_rgba(15,118,110,0.2)] border border-[#5eead4]'
      case 'promo': return 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a] shadow-[0_4px_10px_rgba(245,158,11,0.2)] border border-[#fcd34d]'
      case 'referral': return 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] shadow-[0_4px_10px_rgba(59,130,246,0.2)] border border-[#93c5fd]'
      case 'system': return 'bg-gradient-to-br from-[#FFF4D6] to-[#FFF4D6] shadow-[0_4px_10px_rgba(100,116,139,0.2)] border border-[#cbd5e1]'
      default: return 'bg-[var(--bg-card)] border border-[#e5e7eb] shadow-sm'
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (minutes < 1) return 'JUST NOW'
    if (minutes < 60) return `${minutes}M AGO`
    if (hours < 24) return `${hours}H AGO`
    return `${Math.floor(hours/24)}D AGO`
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      {/* ══════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-extrabold mb-2 text-[var(--text-primary)] tracking-tight">Notifications</h1>
          <p className="text-[var(--text-secondary)] font-bold flex items-center gap-2">
            {unreadCount > 0 ? (
              <>
                <span 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[13px] uppercase tracking-wider shadow-sm border"
                  style={{
                    background: isDark ? 'var(--bg-card)' : '#fdecd3',
                    color: isDark ? 'var(--text-primary)' : '#FC6C26',
                    borderColor: isDark ? 'var(--border-subtle)' : '#fdecd3'
                  }}
                >
                  <Sparkles size={14} className={isDark ? 'text-[var(--text-primary)]' : ''} /> {unreadCount} unread
                </span>
                <span>•</span>
                <span className="text-[var(--text-primary)] font-black text-[14px]">{(notifications || []).length} total</span>
              </>
            ) : (
              <span className="font-extrabold">All caught up! 🎉</span>
            )}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={markAllRead}
            className="flex items-center gap-2 text-[14px] px-6 py-3 rounded-[16px] font-black transition-all shadow-md group"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <Check size={18} className={`${isDark ? 'text-[var(--text-primary)]' : 'text-[#FC6C26]'} group-hover:scale-125 transition-transform`} strokeWidth={3} /> Mark all read
          </motion.button>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          LUXURY FILTER TABS
      ══════════════════════════════════════════════ */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pt-1">
        {FILTER_TABS.map(tab => {
          const tabCount = tab.id === 'all' ? (notifications || []).length : (notifications || []).filter(n => n?.type === tab.id).length
          const tabUnread = tab.id === 'all' ? (unreadCount || 0) : (notifications || []).filter(n => n?.type === tab.id && !n?.read).length
          const isActive = activeFilter === tab.id

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="relative group outline-none shrink-0"
            >
              <div 
                className={`relative z-10 px-6 py-3 rounded-[16px] text-[15px] font-black capitalize whitespace-nowrap transition-all duration-500 flex items-center gap-2.5 overflow-hidden ${
                  isActive ? '' : 'hover:-translate-y-1'
                }`}
                style={{
                  background: isActive ? (isDark ? 'var(--text-primary)' : 'linear-gradient(135deg, #FC6C26 0%, #F1A501 100%)') : 'var(--bg-card)',
                  color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                  boxShadow: isActive 
                    ? '0 12px 24px -6px rgba(17,24,39,0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)' 
                    : '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.04)'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="notif-active-glow"
                    className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent z-0 pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-2.5 drop-shadow-sm">
                  <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-500 ${isActive ? (isDark ? 'text-[var(--bg-primary)]' : 'text-white') : `text-[var(--text-muted)] group-hover:${isDark ? 'text-[var(--text-primary)]' : 'text-[#FC6C26]'}`}`} />
                  <span className="tracking-wide">{tab.label}</span>
                  
                  {tabUnread > 0 && (
                    <span className={`ml-1.5 px-2.5 py-1 rounded-md text-[12px] font-black shadow-sm ${
                      isActive 
                        ? (isDark ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' : 'bg-[var(--bg-card)] text-[#FC6C26]') 
                        : (isDark ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]' : 'bg-[#fdecd3] text-[#FC6C26] border border-[#fdecd3]')
                    }`}>
                      {tabUnread}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════
          NOTIFICATIONS LIST (Ultra-Premium Glass Cards)
      ══════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="text-center py-32 rounded-[40px] shadow-sm relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 1)' }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10" style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.03)' }}>
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <Bell size={40} className="text-[#d1d5db]" />
              </motion.div>
            </div>
            <h3 className="font-display text-2xl mb-3 text-[var(--text-primary)] font-bold relative z-10">No {activeFilter !== 'all' ? activeFilter : ''} notifications</h3>
            <p className="text-[15px] font-extrabold text-[var(--text-muted)] max-w-sm mx-auto relative z-10">
              You're all caught up! We'll notify you when something important happens.
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence>
              {filtered.map((notif) => {
                const isUnread = !notif.read;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    variants={itemPop}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleNotifClick(notif)}
                  >
                  <div className={`relative group rounded-[24px] ${isUnread ? 'hover:-translate-y-1 transition-transform duration-500' : ''}`}>
                    <GlowingEffect spread={40} glow={true} disabled={!isUnread} proximity={64} inactiveZone={0.01} borderWidth={2} />
                    <div 
                      className={`p-5 sm:p-6 rounded-[24px] transition-all duration-500 cursor-pointer relative overflow-hidden`}
                      style={{
                        background: isUnread ? 'var(--bg-card)' : 'var(--bg-card)',
                        boxShadow: isUnread 
                          ? '0 20px 40px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255, 255, 255, 1)' 
                          : '0 4px 10px rgba(0,0,0,0.02), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                        border: isUnread ? (isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(223,105,81,0.15)') : '1px solid var(--border-subtle)',
                        opacity: 1,
                        filter: 'none'
                      }}
                    >
                    {isUnread && (
                      <div className="absolute top-0 left-0 w-2 h-full" style={{ background: isDark ? 'var(--text-primary)' : 'linear-gradient(180deg, #FC6C26, #FC6C26)', boxShadow: isDark ? '4px 0 15px rgba(255,255,255,0.4)' : '4px 0 15px rgba(223,105,81,0.4)' }} />
                    )}

                    <div className="flex gap-5 relative z-10 pl-2">
                      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 border ${getIconBg(notif.type)} group-hover:scale-110 transition-transform duration-500`}>
                        {notif.icon ? <span className="text-2xl drop-shadow-sm">{notif.icon}</span> : getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <h3 className={`font-black text-[20px] truncate tracking-tight transition-colors text-[var(--text-primary)]`}>
                            {notif.title}
                          </h3>
                          <span className={`text-[13px] font-black uppercase tracking-[0.15em] shrink-0 sm:mt-1.5 ${isUnread ? (isDark ? 'text-[var(--text-primary)]' : 'text-[#FC6C26]') : 'text-[var(--text-muted)]'}`}>
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[16px] leading-relaxed font-black transition-colors text-[var(--text-primary)]`}>
                          {notif.message}
                        </p>
                        {/* Relevance tag — why this notification was shown */}
                        <div className="mt-3">
                          <span 
                            className="inline-flex items-center gap-1.5 text-[13px] font-black px-4 py-2 rounded-full border"
                            style={{ 
                              background: isDark ? 'var(--bg-card)' : '#FFF5F0',
                              color: isDark ? 'var(--text-primary)' : '#FC6C26',
                              borderColor: isDark ? 'var(--border-subtle)' : '#FFE4D6'
                            }}
                          >
                            {notif.type === 'promo' && '🏷️ Based on: your travel interests'}
                            {notif.type === 'trip' && '✈️ Triggered by: upcoming trip activity'}
                            {notif.type === 'booking' && '📅 Related to: your active booking'}
                            {notif.type === 'referral' && '👥 From: your referral activity'}
                            {notif.type === 'system' && '🔔 System notification'}
                            {!['promo', 'trip', 'booking', 'referral', 'system'].includes(notif.type) && '📬 General update'}
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ═══ v4: TRIP PREP TIMELINE REMINDERS PANEL ═══ */}
      <AnimatePresence mode="wait">
        {activeFilter === 'tripprep' && (
          <motion.div
            key="tripprep"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            {tripPrepReminders.length === 0 ? (
              <div
                className="text-center py-24 rounded-[40px] shadow-sm"
                style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-display text-2xl mb-2 text-[var(--text-primary)] font-bold">All prepped!</h3>
                <p className="text-[15px] font-extrabold text-[var(--text-muted)] max-w-sm mx-auto">
                  No upcoming trip prep tasks due right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={16} className="text-[#FC6C26]" />
                  <span className="text-[12px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">Decision Timeline Reminders</span>
                  <span className="text-[10px] font-bold text-[#9ca3af] italic ml-1">— rule-based, anchored to trip dates</span>
                </div>

                {tripPrepReminders.map(({ tripName, tripId, task }, idx) => {
                  const isUrgent = task.days_before_trip <= 7
                  const isDueSoon = task.days_before_trip <= 14
                  const accentColor = isUrgent ? '#dc2626' : isDueSoon ? '#f59e0b' : '#FC6C26'
                  return (
                    <motion.div
                      key={`${tripId}-${task.id}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="relative group rounded-[24px] hover:-translate-y-1 transition-transform duration-500"
                    >
                      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                      <div
                        className="p-5 sm:p-6 rounded-[24px] relative overflow-hidden cursor-pointer"
                        style={{ background: 'var(--bg-card)', boxShadow: '0 16px 35px rgba(0,0,0,0.05)', border: `1px solid ${accentColor}20` }}
                        onClick={() => task.link && navigate(task.link)}
                      >
                        {/* Left accent bar */}
                        <div className="absolute left-0 top-0 w-1.5 h-full rounded-l-[24px]" style={{ background: accentColor }} />

                        <div className="flex gap-4 pl-3">
                          {/* Icon */}
                          <div
                            className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 text-2xl border"
                            style={{ background: `${accentColor}10`, borderColor: `${accentColor}25` }}
                          >
                            {task.emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                              <h3 className="font-black text-[20px] text-[var(--text-primary)] tracking-tight">{task.task}</h3>
                              <span
                                className="text-[13px] font-black uppercase tracking-widest shrink-0 px-3 py-1.5 rounded-full"
                                style={{ background: `${accentColor}15`, color: accentColor }}
                              >
                                {isUrgent ? '🔴 Urgent' : isDueSoon ? '🟡 Soon' : '📅 Upcoming'}
                              </span>
                            </div>

                            <p className="text-[16px] font-black text-[var(--text-muted)] mb-3">
                              For <span className="text-[var(--text-primary)] font-black">{tripName}</span>
                              {' · '}{task.days_before_trip} days before departure
                            </p>

                            <div className="flex items-center gap-3">
                              <div
                                className="inline-flex items-center gap-1.5 text-[13px] font-black px-4 py-2 rounded-full"
                                style={{ background: '#FFF5F0', color: '#FC6C26', border: '1px solid #FFE4D6' }}
                              >
                                <Clock size={14} />
                                Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </div>
                              <span className="text-[10px] font-bold text-[#c4c4c4] italic">rule-based reminder</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                <p className="text-center text-[11px] font-bold text-[#9ca3af] py-2">
                  Reminders are anchored to trip start dates — not AI predictions.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

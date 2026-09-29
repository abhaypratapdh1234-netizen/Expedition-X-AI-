import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  ArrowLeft,
  ShieldCheck,
  Bell,
  CreditCard,
  MapPin,
  Sparkles,
  HeadphonesIcon,
} from 'lucide-react'
import { useThemeStore } from '../../../stores/themeStore'

const BRAND = '#FC6C26'

const features = [
  {
    icon: CreditCard,
    title: 'Instant Payment Processing',
    desc: 'Secure, one-click payments via UPI, Cards & Net Banking — fully PCI-DSS compliant.',
  },
  {
    icon: ShieldCheck,
    title: 'Guaranteed Reservations',
    desc: 'Real-time confirmation with hotel partners, zero risk of overbooking.',
  },
  {
    icon: MapPin,
    title: 'Multi-City Booking',
    desc: 'Plan complex multi-leg itineraries and book everything in a single session.',
  },
  {
    icon: HeadphonesIcon,
    title: '24 / 7 Concierge Support',
    desc: 'Dedicated travel specialists available round-the-clock for any booking assistance.',
  },
]

const timeline = [
  { phase: 'Alpha Testing', status: 'completed', label: 'Done' },
  { phase: 'Payment Gateway Integration', status: 'active', label: 'In Progress' },
  { phase: 'Security Audit', status: 'upcoming', label: 'Upcoming' },
  { phase: 'Public Launch', status: 'upcoming', label: 'Coming Soon' },
]

export function BookingConfirmation() {
  const navigate = useNavigate()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-card)',
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-12" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: isDark ? '#0d0d0d' : '#fff7f3' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(252,108,38,0.18) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 pt-14 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(252,108,38,0.12)', border: '1px solid rgba(252,108,38,0.3)', color: BRAND }}
          >
            <Sparkles size={12} />
            Feature Coming Soon
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(252,108,38,0.2), rgba(252,108,38,0.05))',
                border: '2px solid rgba(252,108,38,0.25)',
                boxShadow: '0 0 48px rgba(252,108,38,0.18)',
              }}
            >
              <Clock size={42} style={{ color: BRAND }} strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            Online Booking is
            <span style={{ color: BRAND }}> Currently Unavailable</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            We are actively developing our secure booking and payment infrastructure to deliver
            a world-class reservation experience. Our engineering team is working diligently to
            launch this feature with the highest standards of security and reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            >
              <ArrowLeft size={15} />
              Back to Checkout
            </button>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FC6C26, #e85d1a)', color: '#ffffff', boxShadow: '0 4px 24px rgba(252,108,38,0.35)' }}
            >
              <Bell size={15} />
              Notify Me on Launch
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-10 space-y-10">
        {/* Development Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-3xl"
          style={cardStyle}
        >
          <h2 className="font-display text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Development Roadmap
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px" style={{ background: 'var(--border-subtle)' }} />
            <div className="space-y-6 pl-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="relative"
                >
                  <div
                    className="absolute -left-12 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: item.status === 'completed'
                        ? 'rgba(34,197,94,0.15)'
                        : item.status === 'active'
                        ? 'rgba(252,108,38,0.15)'
                        : 'var(--bg-secondary)',
                      borderColor: item.status === 'completed'
                        ? '#22c55e'
                        : item.status === 'active'
                        ? BRAND
                        : 'var(--border-default)',
                    }}
                  >
                    {item.status === 'completed' ? (
                      <span style={{ color: '#22c55e', fontSize: 14 }}>&#10003;</span>
                    ) : item.status === 'active' ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: BRAND }}
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border-default)' }} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.phase}</p>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: item.status === 'completed'
                          ? 'rgba(34,197,94,0.12)'
                          : item.status === 'active'
                          ? 'rgba(252,108,38,0.12)'
                          : 'var(--bg-secondary)',
                        color: item.status === 'completed'
                          ? '#22c55e'
                          : item.status === 'active'
                          ? BRAND
                          : 'var(--text-muted)',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Features */}
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="font-display text-lg font-bold mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            What's Coming With Full Booking
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="p-5 rounded-2xl flex gap-4"
                style={cardStyle}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(252,108,38,0.1)', border: '1px solid rgba(252,108,38,0.2)' }}
                >
                  <feat.icon size={18} style={{ color: BRAND }} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{feat.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="p-6 rounded-3xl text-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(252,108,38,0.08), rgba(252,108,38,0.03))'
              : 'linear-gradient(135deg, #fff5f0, #fff)',
            border: '1px solid rgba(252,108,38,0.2)',
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Need to make a reservation right now?
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Our travel experts are available to assist you with manual booking enquiries.
            Reach out via the Help Centre and we will connect you with the right accommodation partner.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #FC6C26, #e85d1a)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(252,108,38,0.28)',
            }}
          >
            <HeadphonesIcon size={13} />
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  )
}

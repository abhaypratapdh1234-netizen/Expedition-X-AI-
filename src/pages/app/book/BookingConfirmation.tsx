import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Download, Share2, Calendar } from 'lucide-react'
import { springSnappy, springSoft, easeReveal, durations } from '../../../motion/tokens'
import { svgDrawIn } from '../../../motion/variants'

export function BookingConfirmation() {
  const confNumber = 'EXP-' + Math.random().toString(36).substr(2, 8).toUpperCase()

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-2xl mx-auto">
      {/* Success Animation — SVG pathLength draw-in + scale bounce (Feedback/Entrance) */}
      <div className="text-center py-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.12, 1], opacity: 1 }}
          transition={{ ...springSnappy, duration: durations.base }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, var(--teal-700), var(--teal-400))',
            boxShadow: '0 0 40px rgba(62,217,190,0.4)',
          }}
        >
          {/* SVG checkmark draws in — pathLength 0→1 (Entrance) */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={svgDrawIn}
              initial="hidden"
              animate="show"
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ease: easeReveal, duration: durations.base }}
        >
          <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Booking Confirmed! 🎉
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your adventure is all set. Confirmation sent to your email.
          </p>
        </motion.div>
      </div>

      {/* E-Ticket Card — slides/fades up from below (Entrance) */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ...springSoft }}
        className="rounded-3xl overflow-hidden mb-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Ticket Header */}
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, var(--teal-900), var(--teal-700))' }}>
          <p className="text-xs text-white/60 mb-1">BOOKING REFERENCE</p>
          <p className="text-2xl font-bold text-white font-display">{confNumber}</p>
        </div>

        {/* Perforated Divider */}
        <div className="flex items-center" style={{ borderTop: '2px dashed var(--border-default)' }}>
          <div className="w-5 h-5 rounded-full -mt-2.5 -ml-2.5" style={{ background: 'var(--bg-primary)' }} />
          <div className="flex-1" />
          <div className="w-5 h-5 rounded-full -mt-2.5 -mr-2.5" style={{ background: 'var(--bg-primary)' }} />
        </div>

        {/* Ticket Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-5 mb-6">
            {[
              { label: 'Property', value: 'The Lodhi, New Delhi' },
              { label: 'Check-in', value: 'Aug 10, 2026' },
              { label: 'Check-out', value: 'Aug 12, 2026' },
              { label: 'Guests', value: '2 Adults, 1 Room' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.07, ease: easeReveal, duration: durations.fast }}
              >
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* QR Code Area */}
          <motion.div
            className="flex items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: durations.base }}
          >
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-3xl">▪️◾◽</div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>SHOW QR AT PROPERTY</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Scan this code at check-in. Valid for one stay.
              </p>
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--teal-600)' }}>
                Total Paid: ₹14,750
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, ease: easeReveal, duration: durations.base }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ opacity: 0.85 }}
          transition={{ duration: durations.micro }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          <Download size={16} /> Download E-Ticket
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ opacity: 0.85 }}
          transition={{ duration: durations.micro }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          <Share2 size={16} /> Share Booking
        </motion.button>
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: durations.micro }}
          className="flex-1"
        >
          <Link
            to="/app/trips"
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white w-full"
            style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-500))' }}
          >
            <Calendar size={16} /> View My Trip
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

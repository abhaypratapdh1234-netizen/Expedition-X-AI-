import { motion } from 'framer-motion'
import { WifiOff, RefreshCw, Download } from 'lucide-react'

export function OfflinePage() {
  const handleRetry = () => window.location.reload()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full"
      >
        {/* Animated icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mx-auto w-28 h-28 mb-8"
        >
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(214,93,93,0.12), rgba(214,93,93,0.06))', border: '2px solid rgba(214,93,93,0.2)' }}
          >
            <WifiOff size={52} style={{ color: 'var(--error)' }} />
          </div>
          {/* Pulse rings */}
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-3xl border"
              style={{ borderColor: 'rgba(214,93,93,0.15)' }}
              animate={{ scale: [1, 1.3 + i * 0.15], opacity: [0.6, 0] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </motion.div>

        <h1
          className="font-display text-4xl mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          No Internet
        </h1>
        <h2
          className="font-display text-xl mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          You're offline
        </h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          It seems your connection has wandered off the map. Check your Wi-Fi or mobile data and try again.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-500))', boxShadow: 'var(--shadow-teal)' }}
          >
            <RefreshCw size={16} />
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold border"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            <Download size={16} />
            View Offline Itinerary
          </motion.button>
        </div>

        {/* Offline tip */}
        <div
          className="mt-8 p-4 rounded-2xl text-left"
          style={{ background: 'rgba(15,107,92,0.05)', border: '1px solid rgba(15,107,92,0.15)' }}
        >
          <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--teal-700)' }}>
            💡 OFFLINE TIP
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Your saved itineraries and downloaded trip details are available offline. Go to{' '}
            <span style={{ color: 'var(--teal-600)', fontWeight: 600 }}>My Trips</span> to access them.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

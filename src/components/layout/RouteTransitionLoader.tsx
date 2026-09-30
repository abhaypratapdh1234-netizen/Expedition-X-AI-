import { motion } from 'framer-motion'

export function RouteTransitionLoader() {
  return (
    <div className="w-full min-h-[80vh] p-6 lg:p-10 relative overflow-hidden">
      {/* Top glowing progress bar indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] overflow-hidden bg-transparent">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FC6C26] via-[#F1A501] to-[#3fa796]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
          style={{ width: '60%' }}
        />
      </div>

      {/* Subtle Skeleton Header */}
      <div className="mb-8 space-y-3 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      {/* Subtle Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-gray-200 dark:bg-neutral-800/80 border border-border-subtle/40"
          />
        ))}
      </div>
    </div>
  )
}

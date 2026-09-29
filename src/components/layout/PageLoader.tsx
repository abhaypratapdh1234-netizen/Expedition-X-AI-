import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-[9999]">
      <div className="relative flex items-center justify-center mb-10 mt-10">
        
        {/* Deep background pulsing ring */}
        <motion.div
          animate={{ scale: [1, 2.5, 1], opacity: [0, 0.15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full bg-black dark:bg-white"
        />
        
        {/* Fast inner pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute w-20 h-20 rounded-full border-2 border-black dark:border-white"
        />

        {/* Orbiting element */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-36 h-36 rounded-full border border-black/10 dark:border-white/10"
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-black dark:bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </motion.div>

        {/* Core rotating element */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative z-10 bg-gradient-to-tr from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black p-5 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.4)] dark:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
        >
          <Compass size={44} strokeWidth={2} />
        </motion.div>
      </div>
      
      {/* Animated Text */}
      <div className="flex gap-1 mt-4 ml-3">
        {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((letter, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="font-display text-lg font-black text-black dark:text-white tracking-[0.4em]"
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

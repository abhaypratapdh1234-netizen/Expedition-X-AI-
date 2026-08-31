import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-[9999]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-teal-600 mb-4"
      >
        <Compass size={48} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="font-display text-xl font-bold text-text-primary tracking-wide"
      >
        Loading<span className="text-amber-500">...</span>
      </motion.div>
    </div>
  )
}

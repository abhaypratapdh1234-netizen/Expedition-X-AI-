import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEMES } from '../../../data/mockData'
import { ArrowRight } from 'lucide-react'

const THEME_DETAILS = {
  adventure: { gradient: 'linear-gradient(135deg, #0a4a3f, #0f6b5c)', desc: 'Trekking, rafting, skydiving — push your limits.' },
  heritage: { gradient: 'linear-gradient(135deg, #4a3d56, #6c5b7b)', desc: 'Forts, temples, palaces — walk through history.' },
  beach: { gradient: 'linear-gradient(135deg, #1a9b84, #27c4a4)', desc: 'Sun, sand, and sea — the perfect coastal escape.' },
  offbeat: { gradient: 'linear-gradient(135deg, #3fa796, #1a9b84)', desc: 'Hidden gems most tourists never discover.' },
  food: { gradient: 'linear-gradient(135deg, #d4752a, #f2994a)', desc: 'Street food to fine dining — taste every culture.' },
  nightlife: { gradient: 'linear-gradient(135deg, #101418, #263040)', desc: 'Rooftop bars, clubs, night markets — the city after dark.' },
}

export function ExploreByTheme() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Explore by Theme</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pick your travel style and discover curated destinations.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.map((theme, i) => {
          const detail = THEME_DETAILS[theme.id as keyof typeof THEME_DETAILS]
          return (
            <motion.div key={theme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={`/app/explore/search?q=${theme.label}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl overflow-hidden cursor-pointer h-56 relative"
                  style={{ background: detail?.gradient || 'var(--teal-700)' }}
                >
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 30% 70%, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div className="text-5xl">{theme.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-display mb-1">{theme.label}</h2>
                      <p className="text-white/70 text-sm">{detail?.desc}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-white/60">{theme.destinations} destinations</span>
                        <span className="flex items-center gap-1 text-xs text-white font-semibold">
                          Explore <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

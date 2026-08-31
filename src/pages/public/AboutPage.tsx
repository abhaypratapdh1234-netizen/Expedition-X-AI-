import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Globe, Star, Users } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  )
}

export function AboutPage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const TIMELINE = [
    { year: '2024', title: 'ExpeditionX AI Founded', desc: 'Built from a simple frustration: trip planning was too fragmented, too expensive, too slow.' },
    { year: 'Q1 2025', title: 'AI Cost Estimator Launched', desc: 'Our ML model achieves 94% accuracy on trip cost predictions, saving users an average of ₹6,000 per trip.' },
    { year: 'Q3 2025', title: '50,000 Users Milestone', desc: 'Travelers across 28 cities start planning smarter with our AI tools.' },
    { year: '2026', title: 'Full Platform Launch', desc: 'Booking, live trip mode, gamification, and group collaboration — all in one place.' },
  ]

  const VALUES = [
    { icon: Zap, title: 'AI-First', desc: 'Every decision is powered by intelligence, not guesswork.' },
    { icon: Shield, title: 'Trustworthy', desc: 'Real data, honest cost estimates, no hidden fees.' },
    { icon: Globe, title: 'Inclusive', desc: 'From backpacker to luxury — every budget deserves great planning.' },
    { icon: Users, title: 'Community', desc: 'Travelers helping travelers through reviews, tips, and shared memories.' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section className="pt-28 pb-20 px-4 text-center" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
        <ScrollReveal>
          <h1 className={`font-display font-extrabold text-5xl md:text-6xl mb-6 tracking-tight ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>
            We're making travel<br />
            <span className="gradient-text">effortlessly intelligent</span>
          </h1>
          <p className={`text-xl font-medium font-display max-w-3xl mx-auto mb-10 leading-[1.8] ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#374151]'}`}>
            ExpeditionX AI was born from a simple belief: planning a trip should be as exciting as taking it. 
            No more 15-tab spreadsheets. No more surprise bills. Just smart, beautiful, AI-guided travel.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-500))' }}>
            Join the Journey <ArrowRight size={16} />
          </Link>
        </ScrollReveal>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div>
              <span className="text-[15px] font-extrabold uppercase tracking-widest text-[#FC6C26] font-display">OUR MISSION</span>
              <h2 className={`font-display font-extrabold text-4xl leading-[1.15] mt-4 mb-6 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>
                Democratize world-class travel planning for every budget
              </h2>
              <p className={`text-[17px] font-semibold font-display leading-[1.8] mb-6 ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#374151]'}`}>
                Premium travel agencies charge ₹10,000+ for what our AI does in seconds. 
                We believe intelligent trip planning shouldn't be a luxury.
              </p>
              <p className={`text-[17px] font-semibold font-display leading-[1.8] ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#374151]'}`}>
                From a student's ₹5,000 weekend getaway to a family's ₹5-lakh Europe tour — 
                ExpeditionX AI gives everyone the tools that were once reserved for the wealthy few.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg. savings per trip', value: '₹6,200', icon: '💰' },
                { label: 'Time saved planning', value: '4.5 hours', icon: '⏱️' },
                { label: 'Accuracy of AI estimates', value: '94%', icon: '🎯' },
                { label: 'Destinations covered', value: '1,800+', icon: '🌍' },
              ].map(stat => (
                <div key={stat.label} className="p-5 rounded-2xl text-center"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-extrabold font-display mb-2 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>
                    {stat.value}
                  </div>
                  <p className="text-[15px] font-semibold font-display text-[var(--text-secondary)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <h2 className={`font-display font-extrabold text-4xl text-center mb-16 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>What we stand for</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <div className="p-6 rounded-2xl text-center h-full"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--teal-50)' }}>
                    <v.icon size={22} style={{ color: 'var(--teal-700)' }} />
                  </div>
                  <h3 className={`font-extrabold text-lg mb-3 font-display ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>{v.title}</h3>
                  <p className="text-[15px] font-medium font-display leading-relaxed text-[var(--text-secondary)]">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 max-w-3xl mx-auto px-4">
        <ScrollReveal>
          <h2 className={`font-display font-extrabold text-4xl text-center mb-16 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>Our Journey</h2>
        </ScrollReveal>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'var(--border-default)' }} />
          {TIMELINE.map((t, i) => (
            <ScrollReveal key={t.year} delay={i * 0.1}>
              <div className="flex gap-6 mb-10 relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative z-10 text-xs font-bold"
                  style={{ background: 'var(--teal-700)', color: 'white', border: '3px solid var(--bg-primary)' }}>
                  {i + 1}
                </div>
                <div className="pt-2">
                  <span className="text-[15px] font-extrabold text-[#FC6C26] font-display tracking-wide">{t.year}</span>
                  <h3 className={`font-extrabold text-xl mt-1 mb-2 font-display ${isDark ? 'text-[var(--text-primary)]' : 'text-[#1B2A4A]'}`}>
                    {t.title}
                  </h3>
                  <p className="text-[16px] font-medium font-display text-[var(--text-secondary)] leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}

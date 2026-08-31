import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Heart, Send } from 'lucide-react'
import { DESTINATIONS } from '../../data/mockData'
import { useAuthStore } from '../../stores/authStore'
import BoomerangVideoBg from '../../components/BoomerangVideoBg'
import { GlowingEffect } from '@/components/ui/glowing-effect'

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4'

// ── Scroll Reveal ──
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

function MailIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const HOW_IT_WORKS = [
    { step: '01', icon: '🔍', title: 'Search Any Destination', desc: 'Type a city or landmark. Our AI instantly surfaces tourist spots, cost estimates, and nearby hotels.', color: '#F1A501' },
    { step: '02', icon: '🗺️', title: 'Build Your Itinerary', desc: 'Drag and drop attractions into a day-wise plan. Watch costs update live as you add activities.', color: '#FC6C26' },
    { step: '03', icon: '📋', title: 'Book Everything', desc: 'Reserve hotels and attraction tickets without leaving the platform. One checkout, all set.', color: '#006380' },
  ]

  const TESTIMONIALS = [
    { name: 'Priya Sharma', location: 'Mumbai', avatar: 'PS', rating: 5, text: "ExpeditionX AI planned my Rajasthan trip in 10 minutes. The cost breakdown was scarily accurate and I saved ₹8,000!", trip: 'Rajasthan Heritage Tour' },
    { name: 'Arjun Mehta', location: 'Bangalore', avatar: 'AM', rating: 5, text: "The group trip planner is a lifesaver. We had 8 people and zero arguments about the itinerary for the first time ever.", trip: 'Goa Group Trip' },
  ]

  return (
    <div className="font-sans bg-[var(--bg-primary)] overflow-hidden relative">
      
      {/* ── Ambient Background Blobs ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFF5F0] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 -z-10 animate-blob" />
      <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-[#F5F8FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 -z-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 w-[800px] h-[800px] bg-[#FFF0E6] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 -z-10 animate-blob animation-delay-4000" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 z-10 min-h-[90vh]">
        <div className="flex-1 text-center lg:text-left pt-12 lg:pt-0">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#FC6C26] font-bold text-[14px] md:text-[16px] tracking-[0.25em] uppercase mb-6"
          >
            The Future of Travel Intelligence
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[4.5rem] md:text-[6.5rem] lg:text-[7.5rem] font-display font-bold text-[var(--text-primary)] leading-[0.9] tracking-[-0.04em] mb-8 drop-shadow-md"
          >
            Plan Your Next <br className="hidden lg:block"/>
            <span className="relative inline-block text-[var(--text-primary)] z-10">
              Adventure
              <svg className="absolute w-[105%] h-[24px] -bottom-3 left-[-2.5%] text-[#FC6C26] z-[-1] opacity-90" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                <path d="M2.00015 6.99997C47.0177 2.12871 133.565 -2.48395 198.5 7.49997" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--text-primary)] text-[1.125rem] md:text-[1.375rem] mb-12 max-w-2xl mx-auto lg:mx-0 leading-[1.7] font-semibold tracking-wide text-balance"
          >
            Experience seamless exploration. Instantly discover destinations, generate AI-optimized itineraries, and effortlessly secure bookings—all within a single, beautifully intelligent ecosystem.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
          >
            <Link to="/signup" className="relative group bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white px-10 py-5 rounded-[18px] font-bold text-[17px] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-[0_20px_40px_-10px_rgba(252, 108, 38,0.5)] flex items-center justify-center w-full sm:w-auto">
              Start Planning Free
              <div className="absolute inset-0 rounded-[18px] ring-2 ring-white/20 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
            </Link>
            <a href="#how" className="flex items-center gap-4 text-[var(--text-primary)] hover:text-[#FC6C26] transition-colors font-bold text-[17px] group">
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#FC6C26] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_12px_32px_rgba(252, 108, 38,0.15)]">
                <Play className="fill-[#FC6C26] ml-1" size={20} />
              </div>
              See how it works
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full max-w-[560px] mx-auto lg:mr-0"
        >
           {/* Hero image using video */}
           <div className="relative w-full aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(27,42,74,0.3)] z-10 p-2 bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-white/60">
              <div className="w-full h-full rounded-[40px] overflow-hidden relative">
                <BoomerangVideoBg src={BG_VIDEO} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent mix-blend-overlay" />
              </div>
           </div>
           
           {/* Decorative floating plane */}
           <div className="absolute -top-6 -right-6 w-[88px] h-[88px] bg-[var(--bg-card)] rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.08)] flex items-center justify-center z-20 animate-[bounce_4s_infinite] border border-gray-50">
             <span className="text-4xl transform -rotate-12">✈️</span>
           </div>
           
           {/* Decorative floating stats card */}
           <div className="absolute -bottom-8 -left-8 bg-[var(--bg-card)]/90 backdrop-blur-xl p-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-20 border border-white hidden sm:flex">
             <div className="w-12 h-12 rounded-full bg-[#EFEAFB] flex items-center justify-center text-xl">✨</div>
             <div>
               <p className="text-[var(--text-primary)] font-bold text-[17px]">100K+</p>
               <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">Trips Planned</p>
             </div>
           </div>
        </motion.div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center relative z-10">
        <ScrollReveal>
          <p className="text-[#FC6C26] font-black tracking-[0.25em] text-[15px] mb-4 uppercase drop-shadow-sm">Category</p>
          <h2 className="text-[3rem] md:text-[4.5rem] font-display font-black tracking-tighter mb-24 relative inline-block drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)]">
            Everything you need
            {/* Plus sign grid decorative */}
            <div className="absolute -right-20 -top-10 text-[#FC6C26]/20 flex flex-wrap w-20 gap-2 z-[-1] pointer-events-none">
               {[...Array(12)].map((_, i) => <span key={i} className="text-3xl leading-none font-bold">+</span>)}
            </div>
          </h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            { icon: '🤖', title: 'AI Trip Planner', desc: 'Instantly generate hyper-personalized itineraries powered by state-of-the-art route optimization.' },
            { icon: '💰', title: 'Live Cost Estimator', desc: 'Gain absolute financial clarity. Track every penny in real-time before you make a single booking.', highlight: true },
            { icon: '🗺️', title: 'Interactive Map', desc: 'Experience your journey visually with stunning animated path tracing and intelligent clustering.' },
            { icon: '👥', title: 'Group Trip Planner', desc: 'Collaborate effortlessly in real-time. Share itineraries, split expenses, and sync instantly with friends.' },
          ].map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="relative h-full rounded-[32px] p-2 md:p-3 transition-transform duration-500 hover:-translate-y-3 group border border-[var(--border-subtle)]/60 shadow-sm">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className={`relative flex flex-col items-center text-center p-8 rounded-[24px] h-full ${feature.highlight ? 'shadow-[0_24px_60px_rgba(252,108,38,0.2)] bg-[var(--bg-card)] z-10 border-2 border-[#FC6C26]/30' : 'bg-[var(--bg-card)]/95 backdrop-blur-3xl border border-[var(--border-subtle)] shadow-[0_12px_40px_rgba(0,0,0,0.06)]'}`}>
                  <div className={`w-[88px] h-[88px] mb-8 rounded-[24px] flex items-center justify-center text-[40px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner ${feature.highlight ? 'bg-gradient-to-br from-[#FC6C26]/15 to-[#FC6C26]/30 text-[#FC6C26]' : 'bg-[#FFF5F0]'}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-[var(--text-primary)] font-extrabold tracking-tight text-[24px] md:text-[28px] mb-4 leading-snug drop-shadow-sm">{feature.title}</h3>
                  <p className="text-[var(--text-muted)] text-[16px] md:text-[18px] leading-relaxed font-medium tracking-normal text-balance">{feature.desc}</p>
                  {feature.highlight && (
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-[#FC6C26] to-[#FC6C26] rounded-[40px] -z-10 opacity-20 blur-2xl" />
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── TOP DESTINATIONS SECTION ── */}
      <section id="destinations" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center relative z-10">
        <ScrollReveal>
          <p className="text-[#FC6C26] font-black tracking-[0.25em] text-[14px] md:text-[16px] mb-6 uppercase drop-shadow-sm">Top Selling</p>
          <h2 className="text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-display font-black leading-[0.9] tracking-tighter mb-24 drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)]">Destinations People Love</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {DESTINATIONS.slice(0, 3).map((dest, i) => (
            <ScrollReveal key={dest.id} delay={i * 0.1}>
              <div className="relative h-full rounded-[32px] p-2 md:p-3 group hover:-translate-y-3 transition-all duration-500 cursor-pointer">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div 
                  className="relative h-full bg-[var(--bg-card)] rounded-[24px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
                  onClick={() => {
                    logout()
                    navigate(`/login?returnTo=${encodeURIComponent(`/app/explore/search?q=${dest.name}`)}`)
                  }}
                >
                  <div className="h-[340px] rounded-[16px] overflow-hidden relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-6 text-left relative bg-[var(--bg-card)]/95 backdrop-blur-3xl -mt-12 mx-2 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-10 transform group-hover:-translate-y-2 transition-transform duration-500 border border-[var(--border-subtle)]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-[var(--text-primary)] font-extrabold tracking-tight text-[24px] mb-1 drop-shadow-sm">{dest.name}</h3>
                        <p className="text-[var(--text-muted)] font-medium text-[16px] tracking-normal">{dest.country}</p>
                      </div>
                      <span className="text-[#FC6C26] font-black tracking-tight text-[24px] drop-shadow-sm">₹{dest.costPerDay}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--text-secondary)] text-[16px] font-bold pt-4 border-t border-[var(--border-subtle)]">
                      <span className="text-xl">📍</span> {dest.bestTime} Days Trip
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
        <div className="flex-1">
          <ScrollReveal>
            <p className="text-[#FC6C26] font-black tracking-[0.25em] text-[14px] md:text-[16px] mb-6 uppercase drop-shadow-sm">Easy and Fast</p>
            <h2 className="text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-display font-black leading-[0.9] tracking-tighter mb-16 drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)]">
              From idea to adventure, <br/> in minutes
            </h2>
          </ScrollReveal>
          
          <div className="space-y-12">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.1}>
                <div className="flex gap-8 group">
                  <div 
                    className="w-[64px] h-[64px] rounded-[20px] flex items-center justify-center text-white text-[28px] shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300" 
                    style={{ background: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-extrabold tracking-tight text-[24px] md:text-[28px] mb-3 leading-tight drop-shadow-sm">{step.title}</h3>
                    <p className="text-[var(--text-muted)] text-[16px] md:text-[18px] leading-relaxed max-w-sm font-medium tracking-normal text-balance">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="flex-1 relative w-full flex justify-center lg:justify-end">
          {/* Main Card */}
          <ScrollReveal delay={0.2}>
            <div className="bg-[var(--bg-card)] p-6 rounded-[36px] shadow-[0_40px_80px_-20px_rgba(27,42,74,0.15)] w-full max-w-[360px] relative z-10 border border-[var(--border-subtle)] overflow-hidden group">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
              <div className="overflow-hidden rounded-[24px] mb-6 relative z-10">
                <img src={DESTINATIONS[0].image} alt="Destination" className="w-full h-[240px] object-cover hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform shadow-sm">
                  ❤️
                </div>
              </div>
              <h3 className="text-[var(--text-primary)] font-extrabold text-[22px] mb-2 drop-shadow-sm">Trip to {DESTINATIONS[0].name}</h3>
              <p className="text-[var(--text-muted)] text-[15px] mb-6 font-medium tracking-normal">14-29 June | by Travel Agent</p>
              <div className="flex gap-4 mb-8">
                {['🍃', '🗺️', '🚀'].map((emoji, idx) => (
                  <span key={idx} className="w-[48px] h-[48px] rounded-full bg-[#F5F8FF] flex items-center justify-center text-[22px] hover:bg-[#EFEAFB] transition-colors cursor-pointer">
                    {emoji}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-[var(--text-muted)] text-[15px] font-bold pt-6 border-t border-[var(--border-subtle)] relative z-10">
                <span className="flex items-center gap-3"><span className="text-2xl">🏢</span> 24 people going</span>
              </div>
            </div>
          </ScrollReveal>
          
          {/* Floating Status Card */}
          <ScrollReveal delay={0.4}>
            <div className="absolute -right-12 bottom-20 bg-[var(--bg-card)]/90 backdrop-blur-xl p-6 rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex gap-5 w-[300px] z-20 hidden lg:flex border border-white/50">
               <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="w-[60px] h-[60px] rounded-full shadow-inner" />
               <div className="flex-1">
                 <p className="text-[var(--text-muted)] text-[13px] font-bold mb-1 uppercase tracking-wider">Ongoing</p>
                 <h4 className="text-[var(--text-primary)] font-extrabold text-[18px] mb-3 drop-shadow-sm">Trip to Rome</h4>
                 <p className="text-[var(--text-secondary)] text-[14px] font-extrabold mb-2"><span className="text-[#FC6C26] font-black drop-shadow-sm">40%</span> completed</p>
                 <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '40%' }}
                     transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                     className="h-full bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] rounded-full" 
                   />
                 </div>
               </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-20 relative z-10">
        <div className="flex-1">
          <ScrollReveal>
            <p className="text-[#FC6C26] font-black tracking-[0.25em] text-[14px] mb-4 uppercase drop-shadow-sm">Testimonials</p>
            <h2 className="text-[2.5rem] md:text-[4rem] font-display font-black tracking-tighter leading-[1.1] mb-12 drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)]">
              What people say <br/> about Us.
            </h2>
            <div className="flex gap-4">
              <div className="w-4 h-4 rounded-full bg-[var(--text-primary)] cursor-pointer" />
              <div className="w-4 h-4 rounded-full bg-[var(--bg-card)] hover:bg-[#D1D5DB] transition-colors cursor-pointer" />
              <div className="w-4 h-4 rounded-full bg-[var(--bg-card)] hover:bg-[#D1D5DB] transition-colors cursor-pointer" />
            </div>
          </ScrollReveal>
        </div>

        <div className="flex-1 relative w-full max-w-[500px] mt-16 md:mt-0">
           <ScrollReveal delay={0.2}>
             {/* Main Testimonial Card */}
             <div className="bg-[var(--bg-card)] p-10 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(27,42,74,0.1)] relative z-10 border border-gray-50">
               <div className="absolute -top-10 -left-10 w-[80px] h-[80px] rounded-full bg-[var(--bg-card)] shadow-xl flex items-center justify-center font-bold text-white bg-gradient-to-tr from-[#FC6C26] to-[#FC6C26] text-[26px]">
                 {TESTIMONIALS[0].avatar}
               </div>
               <p className="text-[var(--text-secondary)] leading-relaxed text-[17px] mb-10 mt-6 font-medium tracking-normal text-balance">
                 "{TESTIMONIALS[0].text}"
               </p>
               <h4 className="text-[var(--text-primary)] font-black text-[20px] mb-1 drop-shadow-sm">{TESTIMONIALS[0].name}</h4>
               <p className="text-[var(--text-muted)] text-[15px] font-medium tracking-normal">{TESTIMONIALS[0].location}</p>
             </div>
           </ScrollReveal>
           
           {/* Stacked Shadow Card */}
           <ScrollReveal delay={0.3}>
             <div className="absolute top-16 left-16 right-[-64px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] z-0 hidden sm:block">
               <p className="text-[var(--text-muted)] leading-relaxed text-[17px] mb-10 mt-6 font-medium tracking-normal opacity-20">
                 "{TESTIMONIALS[1].text}"
               </p>
               <h4 className="text-[var(--text-primary)] font-black text-[20px] opacity-30">{TESTIMONIALS[1].name}</h4>
               <p className="text-[var(--text-muted)] text-[15px] font-medium opacity-30">{TESTIMONIALS[1].location}</p>
             </div>
           </ScrollReveal>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="py-24 px-6 max-w-[1000px] mx-auto flex flex-wrap justify-center gap-16 sm:gap-24 items-center">
        {['AXON', 'Jetstar', 'Expedia', 'Qantas', 'Alitalia'].map(brand => (
          <span key={brand} className="text-3xl font-black text-[var(--text-primary)] tracking-tighter opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default">{brand}</span>
        ))}
      </section>

      {/* ── NEWSLETTER SECTION ── */}
      <section className="py-32 px-6 max-w-[1400px] mx-auto mb-20 relative z-10">
        <ScrollReveal>
          <div className="bg-[#EFEAFB]/50 backdrop-blur-3xl border border-white/60 rounded-tl-[100px] rounded-br-[100px] rounded-tr-[32px] rounded-bl-[32px] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(138,121,223,0.15)]">
            
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--bg-card)]/60 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#59B1E6]/20 rounded-full blur-3xl" />
            
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-tr from-[#FC6C26] to-[#FC6C26] rounded-full flex items-center justify-center shadow-2xl text-white transform rotate-12 z-20">
               <Send size={32} className="ml-2" />
            </div>

            <h2 className="text-[2rem] md:text-[3.2rem] font-display font-black tracking-tighter leading-[1.2] mb-16 relative z-10 max-w-4xl mx-auto drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)]">
              Subscribe to get information, latest news and other interesting offers about ExpeditionX
            </h2>
            
            <form className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10 max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="relative w-full sm:flex-1 rounded-[20px] p-[2px] group">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative z-10 w-full h-full bg-[var(--bg-card)] rounded-[18px]">
                  <MailIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-[var(--text-primary)] w-6 h-6 z-20" />
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="w-full pl-20 pr-8 py-6 rounded-[18px] text-[var(--text-primary)] outline-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] text-[17px] font-bold border-2 border-transparent transition-all bg-transparent placeholder-[#9CA3AF] relative z-20 tracking-tight" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] hover:scale-105 transition-transform duration-300 text-white px-12 py-6 rounded-[20px] font-bold text-[17px] shadow-[0_20px_40px_-10px_rgba(252, 108, 38,0.4)] w-full sm:w-auto tracking-wide"
              >
                Subscribe
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>

      {/* No Footer here, handled by PublicLayout */}
    </div>
  )
}

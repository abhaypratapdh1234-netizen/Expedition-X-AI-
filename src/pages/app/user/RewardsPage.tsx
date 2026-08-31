import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Star, Gift, Award, TrendingUp, Lock, Check, Ticket, Map, Plane, Headphones, ShieldCheck, Hotel, Sparkles, Brain } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'

const REWARDS = [
  { id: 'r1', title: '₹500 Off Next Booking', points: 1000, category: 'Discount', available: true, icon: Ticket },
  { id: 'r2', title: 'Free City Map Guide', points: 500, category: 'Freebie', available: true, icon: Map },
  { id: 'r3', title: 'Priority Customer Support', points: 1500, category: 'Service', available: true, icon: Headphones },
  { id: 'r4', title: 'Airport Lounge Access', points: 2500, category: 'Perk', available: false, icon: Plane },
  { id: 'r5', title: 'Free Travel Insurance', points: 3000, category: 'Insurance', available: false, icon: ShieldCheck },
  { id: 'r6', title: 'Hotel Room Upgrade', points: 5000, category: 'Luxury', available: false, icon: Hotel },
]

const ACTIVITIES_DATA = [
  { desc: 'Completed Delhi Trip', points: +200, date: 'Aug 13' },
  { desc: 'Wrote 3 Reviews', points: +150, date: 'Aug 12' },
  { desc: 'Added Friends to Group Trip', points: +100, date: 'Aug 10' },
  { desc: 'Redeemed ₹500 voucher', points: -500, date: 'Jul 28' },
]

export function RewardsPage() {
  const { user, setUser } = useAuthStore()
  const { rewardSegment } = useIntelligenceStore()
  
  const [currentXP] = useState(user?.xp || 1250); // Lifetime XP (never goes down)
  const [coins, setCoins] = useState(() => {
    const stored = localStorage.getItem('user_coins');
    return stored ? parseInt(stored) : (user?.xp || 1250);
  });
  const [activities, setActivities] = useState(ACTIVITIES_DATA);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());

  // Sort rewards by user's segment priority categories
  const sortedRewards = useMemo(() => {
    if (!rewardSegment) return REWARDS
    return [...REWARDS].sort((a, b) => {
      const ai = rewardSegment.priorityCategories.indexOf(a.category)
      const bi = rewardSegment.priorityCategories.indexOf(b.category)
      const aIdx = ai === -1 ? 999 : ai
      const bIdx = bi === -1 ? 999 : bi
      return aIdx - bIdx
    })
  }, [rewardSegment])

  const handleRedeem = (reward: any) => {
    if (coins < reward.points) return;
    setRedeeming(reward.id);
    setTimeout(() => {
      setRedeemed(prev => new Set(prev).add(reward.id));
      
      const newCoins = coins - reward.points;
      setCoins(newCoins);
      localStorage.setItem('user_coins', newCoins.toString());

      setActivities(prev => [
        { desc: `Redeemed ${reward.title}`, points: -reward.points, date: 'Just now' },
        ...prev
      ]);
      setRedeeming(null);
    }, 800);
  };

  const LEVELS = [
    { level: 1, name: 'Wanderer', xp: 0 },
    { level: 2, name: 'Explorer', xp: 500 },
    { level: 3, name: 'Adventurer', xp: 1000 },
    { level: 4, name: 'Nomad', xp: 2000 },
    { level: 5, name: 'Legend', xp: 5000 },
  ]

  let currentLevelObj = LEVELS[0];
  let nextLevelObj = LEVELS[1];
  let currentLevelIndex = 0;

  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXP >= LEVELS[i].xp) {
      currentLevelObj = LEVELS[i];
      currentLevelIndex = i;
      nextLevelObj = LEVELS[i + 1] || LEVELS[i];
    } else {
      break;
    }
  }

  const calculatedLevel = currentLevelObj.level;
  const isMaxLevel = currentLevelIndex === LEVELS.length - 1;
  const baseXP = currentLevelObj.xp;
  const targetXP = isMaxLevel ? baseXP : nextLevelObj.xp;
  
  const xpIntoCurrentLevel = currentXP - baseXP;
  const xpNeededForNextLevel = isMaxLevel ? 0 : targetXP - baseXP;
  const levelProgressPercentage = isMaxLevel ? 100 : Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForNextLevel) * 100));

  const absoluteProgressPercentage = isMaxLevel ? 100 : Math.min(100, Math.max(0, (currentXP / targetXP) * 100));

  const segmentPercentage = 100 / (LEVELS.length - 1);
  const nodesTrackPercentage = isMaxLevel 
    ? 100 
    : (currentLevelIndex * segmentPercentage) + ((levelProgressPercentage / 100) * segmentPercentage);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold mb-2 text-[var(--text-primary)] tracking-tight">Travel Rewards</h1>
        <p className="text-[var(--text-secondary)] font-bold">Earn XP, unlock perks, and redeem exclusive rewards.</p>
      </div>

      {/* ── AI SEGMENT CARD ── */}
      {rewardSegment && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-[24px] p-5 flex items-center gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 6px 24px rgba(252,108,38,0.08)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#FC6C26,#FF8A50)', boxShadow: '0 8px 20px rgba(252,108,38,0.3)' }}>
            <Brain size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-black uppercase tracking-widest text-[#FC6C26]">Your Traveler Segment</span>
            </div>
            <p className="font-black text-[var(--text-primary)] text-lg">{rewardSegment.label}</p>
            <p className="text-[14px] text-[var(--text-secondary)] font-bold mt-1">{rewardSegment.reason}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Rewards Sorted For You</p>
            <p className="text-[14px] font-black text-[#FC6C26]">{rewardSegment.priorityCategories.slice(0, 3).join(' · ')}</p>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM XP HERO CARD
      ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mb-12 relative group rounded-[32px]"
      >
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="p-8 sm:p-10 rounded-[32px] relative overflow-hidden"
          style={{ 
            background: 'var(--bg-card)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255, 255, 255, 1)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}
        >
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--bg-card)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--bg-card)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 pointer-events-none transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 text-[#FC6C26]/15 drop-shadow-md">
          <Award size={200} strokeWidth={1.5} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-orange-100 mb-5 shadow-sm">
                <Star size={14} className="fill-orange-400 text-orange-500" />
                <span className="text-orange-600 text-[12px] font-black uppercase tracking-widest">Current Status</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
                Level {calculatedLevel} <span className="text-gray-300 font-light">—</span> {currentLevelObj.name}
              </h2>
            </div>
          </div>

          <div className="flex items-end justify-between text-[var(--text-muted)] text-[13px] font-black mb-4 uppercase tracking-[0.1em]">
            <span className="text-3xl sm:text-5xl text-[var(--text-primary)] font-display tracking-tight">
              {currentXP.toLocaleString()} <span className="text-[16px] font-black text-[var(--text-secondary)]">Total XP</span>
            </span>
            <span>{isMaxLevel ? 'MAX LEVEL' : `${targetXP.toLocaleString()} XP LIMIT`}</span>
          </div>
          
          {/* THE LUXURY PROGRESS BAR */}
          <div className="h-4 rounded-full overflow-hidden relative" style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
            <motion.div
              className="absolute top-0 left-0 bottom-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #FC6C26, #FC6C26)',
                boxShadow: '0 0 20px rgba(252, 108, 38,0.4), inset 0 2px 2px rgba(255, 255, 255, 0.3)'
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${absoluteProgressPercentage}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
            >
              {/* Glossy top edge */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
            </motion.div>
          </div>
          
          <p className="text-[var(--text-muted)] text-xs font-extrabold mt-4 flex items-center gap-2 tracking-wide">
            <TrendingUp size={14} className="text-[#FC6C26]" />
            {isMaxLevel 
              ? <span className="text-[var(--text-primary)]">YOU HAVE REACHED THE MAXIMUM LEVEL</span>
              : <>EARN {(targetXP - currentXP).toLocaleString()} MORE XP TO UNLOCK <strong className="text-[var(--text-primary)] font-extrabold">"{nextLevelObj.name}"</strong> STATUS</>
            }
          </p>
        </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          LUXURY STATUS PROGRESSION
      ══════════════════════════════════════════════ */}
      <div className="mb-14">
        <h2 className="font-black text-[14px] mb-8 text-[var(--text-muted)] uppercase tracking-[0.2em]">Status Progression</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-6 hide-scrollbar relative px-4">
          
          {/* Thick Luxury Track */}
          <div className="absolute top-7 left-[3.5rem] right-[3.5rem] h-2 rounded-full" style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Active Glowing Track */}
            <motion.div 
              className="absolute top-0 left-0 bottom-0 rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, #FC6C26, #FC6C26)',
                boxShadow: '0 2px 10px rgba(252, 108, 38,0.4)'
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${nodesTrackPercentage}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>

          {LEVELS.map((lvl) => {
            const isAchieved = lvl.level < calculatedLevel;
            const isCurrent = lvl.level === calculatedLevel;
            const isLocked = lvl.level > calculatedLevel;
            
            return (
              <motion.div 
                 key={lvl.level} 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: lvl.level * 0.15 }}
                 className="flex flex-col items-center gap-4 shrink-0 px-2 relative z-10"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-700"
                  style={{
                    background: isAchieved || isCurrent 
                      ? 'linear-gradient(135deg, #FC6C26, #FC6C26)' 
                      : 'var(--bg-card)',
                    color: isAchieved || isCurrent ? 'var(--bg-card)' : '#6b7280',
                    boxShadow: isCurrent 
                      ? '0 10px 25px rgba(252, 108, 38,0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)' 
                      : isAchieved
                        ? '0 4px 10px rgba(252, 108, 38,0.2)'
                        : '0 4px 10px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255, 255, 255, 1)',
                    border: isLocked ? '2px solid var(--border-subtle)' : '2px solid transparent',
                    transform: isCurrent ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  {isAchieved ? <Check size={24} strokeWidth={3} /> : isCurrent ? <Star size={24} className="fill-white" /> : lvl.level}
                </div>
                <div className="text-center mt-2">
                  <p className="text-[13px] font-black uppercase tracking-widest transition-colors" style={{ color: isCurrent ? '#FC6C26' : isAchieved ? 'var(--text-primary)' : '#6b7280' }}>
                    {lvl.name}
                  </p>
                  <p className="text-[13px] font-black text-[var(--text-secondary)] mt-1">{lvl.xp} XP</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ══════════════════════════════════════════════
            REDEEM REWARDS (Glassmorphic Cards)
        ══════════════════════════════════════════════ */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-[14px] text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
              <Gift size={16} className="text-[#FC6C26]" /> Claim Rewards & Earn XP
            </h2>
            <div className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[rgba(0,0,0,0.06)] shadow-sm">
              Total Coins: <span className="text-[#FC6C26]">{coins.toLocaleString()} XP</span>
            </div>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sortedRewards.map((reward) => {
              const isRedeemed = redeemed.has(reward.id);
              const isAvailable = coins >= reward.points || isRedeemed;
              return (
              <motion.div key={reward.id} variants={itemPop}>
              <div
                className="relative group rounded-[24px]"
              >
                <GlowingEffect spread={40} glow={true} disabled={!isAvailable} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="p-6 rounded-[24px] transition-all duration-500 flex flex-col relative overflow-hidden h-full"
                  style={{
                    background: isAvailable ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    boxShadow: isAvailable 
                      ? '0 10px 30px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255, 255, 255, 1)' 
                      : 'none',
                    border: isAvailable ? '1px solid rgba(0,0,0,0.03)' : '1px solid rgba(0,0,0,0.06)',
                    opacity: isAvailable ? 1 : 0.7,
                    filter: isAvailable ? 'none' : 'grayscale(40%)'
                  }}>
                {/* Hover Glow */}
                {isAvailable && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500`}
                      style={{ background: 'rgba(223,105,81,0.1)', color: '#FC6C26' }}
                    >
                      <reward.icon size={26} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-black text-[20px] text-[var(--text-primary)] leading-tight">{reward.title}</h3>
                      <p className="text-[13px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mt-1.5">{reward.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    {/* Why You Got This — transparent segment targeting */}
                    {rewardSegment && rewardSegment.priorityCategories.indexOf(reward.category) <= 1 && (
                      <span className="flex items-center gap-1.5 text-[12px] font-black px-3 py-1.5 rounded-full shadow-sm"
                            style={{ background: 'rgba(252, 108, 38, 0.1)', color: '#FC6C26', border: '1px solid rgba(252, 108, 38, 0.2)' }}>
                        <Sparkles size={12} /> For You
                      </span>
                    )}
                    {!isAvailable && <Lock size={18} className="text-[var(--text-muted)]" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-[rgba(0,0,0,0.04)] relative z-10">
                  <span className="flex items-center gap-1.5 text-lg font-extrabold drop-shadow-sm" style={{ color: '#FC6C26' }}>
                    <Star size={18} className="fill-[#FC6C26]" />
                    {reward.points.toLocaleString()}
                  </span>
                  
                  {isAvailable ? (
                    isRedeemed ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-5 py-2.5 rounded-[14px] text-xs font-bold text-white flex items-center gap-1.5 shadow-md"
                        style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                      >
                        <Check size={14} strokeWidth={3} /> Redeemed
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRedeem(reward)}
                        disabled={redeeming === reward.id}
                        className="px-6 py-3 rounded-[16px] text-[14px] font-black text-white transition-all shadow-md flex items-center justify-center min-w-[100px]"
                        style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)', boxShadow: '0 4px 12px rgba(252, 108, 38,0.3)' }}
                      >
                        {redeeming === reward.id ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Sparkles size={16} />
                          </motion.div>
                        ) : 'Redeem & Claim'}
                      </motion.button>
                    )
                  ) : (
                    <button disabled className="px-6 py-3 rounded-[16px] text-[14px] font-black text-[var(--text-muted)] cursor-not-allowed flex items-center gap-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <Lock size={14} /> Locked
                    </button>
                  )}
                </div>
                </div>
              </div>
              </motion.div>
            )})}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════
            RECENT ACTIVITY (Sleek Panel)
        ══════════════════════════════════════════════ */}
        <div>
          <h2 className="font-black text-[14px] mb-6 text-[var(--text-muted)] uppercase tracking-[0.2em]">Recent Activity</h2>
          <div className="relative group rounded-[24px]">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <div 
              className="p-6 rounded-[24px] relative overflow-hidden h-full bg-[var(--bg-card)]"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255, 255, 255, 1)', border: '1px solid rgba(0,0,0,0.03)' }}
            >
            <div className="space-y-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-[13px] top-4 bottom-4 w-[2px] rounded-full bg-[var(--border-subtle)]" />
              
              {activities.map((activity, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} className="flex items-start gap-5 relative z-10 group/item">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold shadow-sm bg-[var(--bg-card)] border-2 border-[var(--bg-card)] group-hover/item:scale-110 transition-transform" style={{ color: activity.points > 0 ? '#FC6C26' : '#ef4444', background: activity.points > 0 ? 'rgba(252, 108, 38, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                    {activity.points > 0 ? '+' : '-'}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-[16px] font-black text-[var(--text-primary)]">{activity.desc}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[13px] font-black" style={{ color: activity.points > 0 ? '#FC6C26' : '#ef4444' }}>
                        {activity.points > 0 ? '+' : ''}{activity.points} XP
                      </span>
                      <span className="text-[12px] font-black text-[var(--text-muted)] tracking-wider">• {activity.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-4 rounded-xl text-[14px] font-black transition-all hover:bg-[var(--bg-card)] relative z-10" style={{ color: '#FC6C26', border: '1px solid rgba(0,0,0,0.05)' }}>
              View All History
            </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

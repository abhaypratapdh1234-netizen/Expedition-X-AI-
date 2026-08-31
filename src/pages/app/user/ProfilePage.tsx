import { useRef, useState, useEffect } from 'react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../stores/authStore'
import { Camera, Edit2, Star, Globe, Award, Settings, BookOpen, Heart, LogOut, ChevronRight, Shield, Bell, Trash2, Brain } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { useIntelligenceStore } from '../../../stores/intelligenceStore'
import { useTripStore } from '../../../stores/tripStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useBookingStore } from '../../../stores/bookingStore'

const ALL_BADGES = [
  { id: 'History Buff', emoji: '🏛️', desc: 'Visited heritage sites', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { id: 'Mountain Climber', emoji: '🏔️', desc: 'Explored hill stations', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { id: 'Backpacker', emoji: '🎒', desc: 'Completed solo trips', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { id: 'Top Reviewer', emoji: '⭐', desc: 'Active community member', color: 'bg-violet-500/10 text-violet-600 border-violet-200' },
  { id: 'Early Bird', emoji: '🌅', desc: 'Joined Expedition X early', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
  { id: 'First Trip', emoji: '✈️', desc: 'Completed first trip', color: 'bg-teal-500/10 text-teal-600 border-teal-200' }
]
const getLevelName = (level: number) => {
  switch(level) {
    case 1: return 'Wanderer';
    case 2: return 'Explorer';
    case 3: return 'Adventurer';
    case 4: return 'Nomad';
    case 5: return 'Legend';
    default: return 'Explorer';
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { profile, compute } = useIntelligenceStore()
  const { trips, fetchUserTrips } = useTripStore()
  const { savedPlaceIds, fetchWishlist } = useWishlistStore()
  const { myBookings, fetchMyBookings } = useBookingStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [stats, setStats] = useState({ trips: 0, reviews: 0, wishlist: 0 })
  const [userBadges, setUserBadges] = useState<string[]>([])

  // Self-compute: ensure Travel DNA renders even on direct navigation
  useEffect(() => {
    fetchUserTrips()
    fetchWishlist()
    fetchMyBookings()
  }, [])

  useEffect(() => {
    if (!profile && (trips.length > 0 || savedPlaceIds.length > 0)) {
      compute(trips, savedPlaceIds, myBookings, user?.preferences)
    }
  }, [trips.length, savedPlaceIds.length, myBookings.length, profile])

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return
      try {
        const { apiClient } = await import('../../../services/apiClient')
        const [dashboard, wishlistData, gamification, allReviews] = await Promise.all([
          apiClient.get<any>('/dashboard/summary').catch(() => null),
          apiClient.get<any[]>('/wishlist').catch(() => []),
          apiClient.get<any>(`/gamification/${user.id}`).catch(() => null),
          import('../../../services/reviewService').then(m => m.reviewService.getGlobalReviews()).catch(() => [])
        ])
        
        const userReviews = allReviews.filter((r: any) => r.userName === 'You' || r.userName === user.name);
        
        setStats({
          trips: dashboard?.totalTrips || 0,
          reviews: userReviews.length || 0,
          wishlist: wishlistData?.length || 0
        })

        if (gamification) {
          setUserBadges(gamification.badges || [])
          if (gamification.level !== user.explorerLevel || gamification.xp !== user.xp) {
            setUser({ ...user, explorerLevel: gamification.level, xp: gamification.xp })
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile stats', err)
      }
    }
    fetchProfileData()
  }, [user?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64String = event.target?.result as string
      try {
        if (user) {
          const { simulateNetworkDelay } = await import('../../../services/mockDelay')
          await simulateNetworkDelay(800, 1500)
          
          // Save to localStorage for lifetime persistence across mock logins
          localStorage.setItem(`expedition_avatar_${user.email}`, base64String)
          
          // Update local state instantly, bypass offline backend
          setUser({ ...user, avatar: base64String })
        }
      } catch (err) {
        console.error('Failed to upload avatar', err)
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = async () => {
    if (!user) return
    setIsUploading(true)
    try {
      const { simulateNetworkDelay } = await import('../../../services/mockDelay')
      await simulateNetworkDelay(400, 800)
      
      // Remove from persistent storage
      localStorage.removeItem(`expedition_avatar_${user.email}`)
      
      setUser({ ...user, avatar: undefined })
    } catch (err) {
      console.error('Failed to delete avatar', err)
    } finally {
      setIsUploading(false)
    }
  }

  const STATS = [
    { label: 'Trips', value: stats.trips, icon: Globe },
    { label: 'Reviews', value: stats.reviews, icon: BookOpen },
    { label: 'Wishlist', value: stats.wishlist, icon: Heart },
    { label: 'Level', value: user?.explorerLevel || 1, icon: Award },
  ]

  const MENU_ITEMS = [
    { label: 'My Trips', icon: Globe, to: '/app/trips', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { label: 'Saved Places', icon: Heart, to: '/app/wishlist', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
    { label: 'My Reviews', icon: BookOpen, to: '/app/reviews', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    { label: 'Travel Rewards', icon: Award, to: '/app/rewards', color: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200' },
    { label: 'Account Settings', icon: Settings, to: '/app/settings', color: 'text-slate-600', bg: 'bg-slate-200', border: 'border-slate-300' },
  ]

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      
      {/* ══════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════ */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold mb-1 text-[var(--text-primary)] tracking-tight">Profile</h1>
        </div>
        <div className="flex gap-3">
           <motion.button onClick={() => navigate('/app/notifications')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <Bell size={20} />
           </motion.button>
           <motion.button onClick={() => navigate('/app/settings')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <Settings size={20} />
           </motion.button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ULTRA-PREMIUM AVATAR HERO CARD
      ══════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="mb-10 relative group rounded-[32px]"
      >
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="p-8 sm:p-10 rounded-[32px] relative overflow-hidden shadow-card"
          style={{ 
            background: 'var(--bg-card)',
            backdropFilter: 'blur(40px) saturate(200%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 pointer-events-none transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 text-[#FC6C26]/15 drop-shadow-md z-0 hidden md:block">
          <Award size={200} strokeWidth={1.5} />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-8">
          
          <div className="relative group">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-white text-5xl sm:text-6xl font-display font-bold relative z-10 overflow-hidden"
              style={{ 
                background: user?.avatar ? 'none' : 'linear-gradient(135deg, #FC6C26, #FC6C26)',
                boxShadow: '0 0 0 8px var(--bg-card), 0 20px 40px rgba(0,0,0,0.15), inset 0 4px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
                   <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin shadow-lg" />
                </div>
              )}
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </motion.div>
            
            <motion.button 
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="absolute bottom-1 right-1 w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-primary)] z-20 transition-all shadow-md group-hover:scale-110"
              style={{ background: 'var(--bg-card)', border: '1px solid #e5e7eb', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
            >
              <Camera size={20} />
            </motion.button>
            
            {user?.avatar && (
              <motion.button 
                onClick={handleDeleteImage}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="absolute top-1 left-1 w-10 h-10 rounded-full flex items-center justify-center text-red-500 z-20 transition-all shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-110"
                style={{ background: 'var(--bg-card)', border: '1px solid #fee2e2', boxShadow: '0 8px 20px rgba(239,68,68,0.15)' }}
                title="Remove Picture"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div key="edit" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col sm:flex-row gap-3 mb-3">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="px-5 py-3 rounded-2xl text-xl font-bold border-2 outline-none bg-[var(--bg-card)] border-[var(--border-subtle)] focus:border-[#FC6C26] text-[var(--text-primary)] shadow-inner" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                      if (user) {
                        setUser({ ...user, name });
                        localStorage.setItem(`expedition_name_${user.email}`, name);
                      }
                      setEditing(false);
                    }}
                    className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #FC6C26, #FC6C26)' }}>
                    Save
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-3">
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <h1 className="font-display text-5xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight">{user?.name}</h1>
                    <motion.button whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)} className="p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors">
                       <Edit2 size={20} />
                    </motion.button>
                  </div>
                  <p className="text-[var(--text-secondary)] font-black text-[16px] flex items-center justify-center sm:justify-start gap-2 mt-2 tracking-wide">
                     <Shield size={16} className="text-[#FC6C26]" /> {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Level Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full shadow-lg mt-4 border border-[var(--border-subtle)] backdrop-blur-md"
              style={{ background: 'var(--bg-card)', boxShadow: '0 10px 25px rgba(252, 108, 38,0.15)' }}>
              <Star size={18} className="fill-[#FC6C26] text-[#FC6C26] drop-shadow-[0_0_8px_rgba(252, 108, 38,0.4)]" />
              <span className="text-[var(--text-primary)] text-[16px] font-black uppercase tracking-[0.15em]">Level {user?.explorerLevel || 3} {getLevelName(user?.explorerLevel || 3)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-card)] mx-1" />
              <span className="text-[#FC6C26] text-[18px] font-black font-mono tracking-wider">{user?.xp || 1250} XP</span>
            </div>
          </div>
        </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          FLOATING STAT CAPSULES
      ══════════════════════════════════════════════ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={itemPop}>
            <div className="relative group rounded-[24px]">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <div className="p-6 rounded-[24px] text-center relative overflow-hidden transition-all duration-500"
                style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255, 255, 255, 1)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <stat.icon size={24} className="mx-auto mb-3 text-[var(--text-muted)] group-hover:text-teal-600 transition-colors duration-500" />
                <p className="text-3xl font-extrabold font-display text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                <p className="text-[14px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">{stat.label}</p>
              </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── TRAVEL DNA CARD ─── */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 rounded-[28px] overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 32px rgba(252,108,38,0.08)' }}
        >
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#FC6C26,#FF8A50,#FC6C26)' }} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#FC6C26,#FF8A50)', boxShadow: '0 8px 20px rgba(252,108,38,0.3)' }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-black uppercase tracking-widest text-[#FC6C26]">Your Travel DNA</p>
                <p className="text-[14px] text-[var(--text-muted)] font-bold mt-1">{profile.dna.basis}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Avg Trip</p>
                <p className="text-[16px] font-black text-[var(--text-primary)] mt-1">{profile.avgDuration} days · ₹{(profile.avgBudget / 1000).toFixed(0)}k</p>
              </div>
            </div>
            {/* ── 9-Trait DNA Bars ── */}
            <div className="space-y-2.5">
              {([
                ['mountains',   '🏔️', 'Mountains'   ],
                ['beach',       '🌊', 'Beach'       ],
                ['adventure',   '🧗', 'Adventure'   ],
                ['luxury',      '✨', 'Luxury'      ],
                ['history',     '🏛️', 'History'     ],
                ['food',        '🍛', 'Food'        ],
                ['photography', '📷', 'Photography' ],
                ['shopping',    '🛍️', 'Shopping'    ],
                ['nightlife',   '🌙', 'Nightlife'   ],
              ] as const).map(([trait, emoji, label]) => (
                <div key={trait}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      {emoji} {label}
                    </span>
                    <span className="text-[14px] font-black text-[#FC6C26]">
                      {(profile.dna as any)[trait] ?? 50}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile.dna as any)[trait] ?? 50}%` }}
                      transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#FC6C26] to-[#FF8A50]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Cluster Badge ── */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Your Traveller Type</p>
                <p className="text-[18px] font-black text-[var(--text-primary)]">{profile.dna.cluster_label}</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-[14px] font-black border"
                style={{ background: 'rgba(252, 108, 38, 0.1)', color: '#FC6C26', borderColor: 'rgba(252, 108, 38, 0.2)' }}
              >
                k-means cluster
              </div>
            </div>

            {/* ── Basis (inspectable) ── */}
            <p className="text-[13px] font-bold text-[var(--text-muted)] mt-3">{profile.dna.basis}</p>
          </div>
        </motion.div>
      )}

      {/* ── v4: Comfortable Budget Setting ── */}
      {(() => {
        const { comfortableBudget, setComfortableBudget } = useIntelligenceStore.getState()
        return (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--amber-500)', opacity: 0.8 }}>
                  <span className="text-[18px]">💰</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[var(--text-primary)]">Comfortable Trip Budget</h3>
                  <p className="text-[13px] font-bold text-[var(--text-muted)] mt-1">Used for Budget Stress analysis · your own input, not inferred from data</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-3 flex-1 focus-within:border-[#FC6C26] transition-colors">
                  <span className="text-[var(--text-muted)] font-black text-[18px] mr-1.5">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 30000"
                    defaultValue={comfortableBudget > 0 ? comfortableBudget : undefined}
                    className="flex-1 bg-transparent text-[18px] font-black text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    onBlur={(e) => {
                      const val = parseInt(e.target.value) || 0
                      setComfortableBudget(val)
                    }}
                  />
                </div>
                {comfortableBudget > 0 && (
                  <span className="text-[14px] font-black px-3 py-1.5 rounded-full bg-[#F0FDF4] text-[#16a34a] border border-[#16a34a]/20">
                    ₹{comfortableBudget.toLocaleString()} saved
                  </span>
                )}
              </div>
              <p className="text-[13px] font-bold text-[var(--text-muted)] mt-2 italic">This is used only in your itinerary builder to show how a trip compares to your comfort level.</p>
            </div>
          </motion.div>
        )
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* ══════════════════════════════════════════════
            LUXURY MENU CARDS ("The Bars")
        ══════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-4">
          {MENU_ITEMS.map((item, i) => (
            <Link key={item.to} to={item.to} className="block group relative rounded-[24px]">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-5 p-5 rounded-[24px] transition-all duration-500 relative overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(15,118,110,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-500 group-hover:scale-110 ${item.bg} ${item.color} ${item.border}`}>
                   <item.icon size={24} strokeWidth={2} />
                </div>
                <span className="flex-1 font-extrabold text-xl text-[var(--text-primary)]">{item.label}</span>
                
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-primary)] group-hover:bg-[#f0fdfa] group-hover:text-teal-600 transition-colors border border-[rgba(0,0,0,0.1)]">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            BADGES EARNED
        ══════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-5">
             <h2 className="font-black text-[14px] text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
               <Award size={16} className="text-teal-600" /> Badges Earned
             </h2>
             <button className="text-[14px] font-black text-teal-600 hover:underline">View All</button>
          </div>
          
          <div className="relative group rounded-[24px]">
             <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
             <div className="p-6 rounded-[24px] relative overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)' }}>
            {userBadges.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Award size={32} className="text-[#d1d5db]" />
                </div>
                <p className="font-black text-[var(--text-primary)] mb-2 text-[22px]">No Badges Yet</p>
                <p className="text-[16px] font-bold text-[var(--text-muted)] leading-relaxed">Start completing trips and writing reviews to earn badges!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userBadges.map((badgeName, i) => {
                  const badge = ALL_BADGES.find(b => b.id === badgeName) || { id: badgeName, emoji: '🎖️', desc: 'Earned achievement', color: 'bg-[#f0fdfa] text-teal-700 border-teal-200' }
                  return (
                    <motion.div key={badge.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative group rounded-[20px] hover:-translate-y-0.5 transition-all duration-300">
                      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                      <div className="flex items-center gap-4 p-4 rounded-[20px] relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.03)' }}>
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shrink-0 ${badge.color} border shadow-sm group-hover:scale-110 transition-transform`}>
                         {badge.emoji}
                      </div>
                      <div>
                        <p className="font-black text-[18px] text-[var(--text-primary)] mb-0.5">{badge.id}</p>
                        <p className="text-[14px] font-black text-[var(--text-muted)]">{badge.desc}</p>
                      </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          LUXURY LOGOUT BUTTON
      ══════════════════════════════════════════════ */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={logout}
        className="w-full relative group rounded-[20px]"
      >
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
        <div className="w-full flex items-center justify-center gap-3 py-5 rounded-[20px] text-[16px] font-black transition-all relative overflow-hidden"
          style={{ 
            background: 'rgba(225, 29, 72, 0.1)', 
            color: '#e11d48', 
            border: '1px solid rgba(225, 29, 72, 0.2)',
            boxShadow: '0 10px 25px rgba(225,29,72,0.15)'
          }}
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> LOG OUT SECURELY
        </div>
      </motion.button>
    </motion.div>
  )
}

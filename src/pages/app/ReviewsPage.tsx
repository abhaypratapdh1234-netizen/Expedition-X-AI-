import { useState, useEffect, useMemo } from 'react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, Sparkles, Send, MessageSquare, MapPin, Search, TrendingUp, ChevronRight } from 'lucide-react'
import { aiService } from '../../services/aiService'
import { reviewService, type ReviewResponse } from '../../services/reviewService'
import { placeService } from '../../services/placeService'
import { pageTransition } from '../../motion/variants'
import { analyzeReviewSentiment, rankReviewsByHelpfulness } from '../../services/intelligenceService'

const SENTIMENT_META: Record<string, { label: string; bg: string; color: string; border: string; emoji: string }> = {
  Positive: { label: 'Positive', bg: '#f0fdf4', color: '#15803d', border: '#86efac', emoji: '✨' },
  Neutral:  { label: 'Neutral',  bg: '#fffbeb', color: '#b45309', border: '#fcd34d', emoji: '⚖️' },
  Negative: { label: 'Negative', bg: '#fff1f2', color: '#dc2626', border: '#fca5a5', emoji: '⚠️' },
}

const FILTERS = [
  { key: 'all', label: 'All Reviews', emoji: '🌟' },
  { key: '5',   label: '5 Stars',    emoji: '⭐' },
  { key: '4',   label: '4 Stars',    emoji: '⭐' },
  { key: '3',   label: '3 Stars',    emoji: '⭐' },
] as const

// Helper to generate consistent gradients from string
const getGradients = (str: string) => {
  const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const colors = [
    ['#FC6C26', '#FC6C26'], ['#6d28d9', '#8b5cf6'], ['#b45309', '#f59e0b'],
    ['#0369a1', '#38bdf8'], ['#be185d', '#f43f5e'], ['#c026d3', '#e879f9']
  ]
  return colors[Math.abs(hash) % colors.length]
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3'>('all')
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [newReview, setNewReview] = useState('')
  
  // Place Selection State
  const [placeQuery, setPlaceQuery] = useState('')
  const [placeResults, setPlaceResults] = useState<any[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiSentiment, setAiSentiment] = useState<{ sentiment: string; score: number } | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getGlobalReviews()
      setReviews(data)
    } catch (err) {
      console.error('Failed to fetch reviews', err)
    } finally {
      setLoading(false)
    }
  }

  // Sentiment Analysis Debouncer
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newReview.length > 10) {
        try {
          const res = await aiService.getSentimentScore(newReview)
          setAiSentiment({ sentiment: res.label, score: res.score })
        } catch {}
      } else {
        setAiSentiment(null)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [newReview])

  // Place Search Debouncer
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (placeQuery.length > 2 && !selectedPlaceId) {
        try {
          const res = await placeService.searchDestinations({ query: placeQuery })
          setPlaceResults(res.slice(0, 5))
        } catch {}
      } else {
        setPlaceResults([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [placeQuery, selectedPlaceId])

  const handleSubmit = async () => {
    if (!newReview || !selectedPlaceId || rating === 0) return
    setIsSubmitting(true)
    try {
      await reviewService.submitReview(selectedPlaceId, rating, newReview, placeQuery)
      await fetchReviews()
      
      setShowForm(false)
      setRating(0)
      setNewReview('')
      setPlaceQuery('')
      setSelectedPlaceId(null)
      setAiSentiment(null)
    } catch (err) {
      console.error("Failed to submit review", err)
      alert("Failed to submit review. Are you logged in?")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (id: number) => {
    try {
      await reviewService.upvoteReview(id)
      setReviews(reviews.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    } catch {}
  }

  const baseFiltered = filter === 'all' ? reviews : reviews.filter(r => r.rating === Number(filter))
  // Rank by transparent helpfulness formula: (recency × 0.4) + (length × 0.35) + (verified × 0.25)
  const filtered = rankReviewsByHelpfulness(baseFiltered)

  // AI Sentiment Summary — computed from real review text, labeled as keyword-weighted heuristic
  const sentimentSummary = useMemo(() => {
    if (reviews.length === 0) return null
    return analyzeReviewSentiment(reviews)
  }, [reviews.length])

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 min-h-screen relative"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-amber-300/8 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-300/8 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '14s' }} />

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="font-display text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
            Reviews & Ratings
          </h1>
          <p className="text-[19px] font-extrabold text-[var(--text-secondary)]">Honest reviews from real travelers, analyzed by AI.</p>
        </div>
        <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2.5 px-7 py-4 rounded-full text-white text-sm font-bold uppercase tracking-widest shrink-0 relative overflow-hidden"
          style={{
            background: showForm ? 'linear-gradient(135deg,#111827,#374151)' : 'linear-gradient(135deg,#FC6C26,#FC6C26)',
            boxShadow: showForm ? '0 10px 30px rgba(17,24,39,0.25)' : '0 12px 35px rgba(252, 108, 38,0.4)'
          }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          <MessageSquare size={16} className="relative z-10" />
          <span className="relative z-10">{showForm ? 'Cancel' : 'Write Review'}</span>
        </motion.button>
      </div>

      {/* ── AI SENTIMENT SUMMARY BANNER ── */}
      <AnimatePresence>
        {sentimentSummary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-10 rounded-[28px] overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid #FFE4D6', boxShadow: '0 8px 32px rgba(252,108,38,0.08)' }}
          >
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #FC6C26, #FF8A50, #FC6C26)' }} />
            <div className="p-6 flex flex-col sm:flex-row gap-5 sm:items-start">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#FC6C26,#FF8A50)', boxShadow: '0 8px 20px rgba(252,108,38,0.3)' }}>
                <TrendingUp size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px] font-black uppercase tracking-widest text-[#FC6C26]">AI Sentiment Analysis</span>
                  <span className="text-[13px] text-[var(--text-muted)] font-black uppercase tracking-wider">· keyword-weighted heuristic · {sentimentSummary.totalAnalyzed} reviews analyzed</span>
                </div>
                <p className="font-black text-[var(--text-primary)] text-[16px] mb-3">
                  {sentimentSummary.overallLabel === 'Mostly Positive' && '🟢'}
                  {sentimentSummary.overallLabel === 'Mixed' && 'ퟪ'}
                  {sentimentSummary.overallLabel === 'Mostly Negative' && '🔴'}
                  {' '}<span className="text-[#FC6C26]">{sentimentSummary.overallLabel}</span> across all reviews
                </p>
                <div className="flex flex-wrap gap-2">
                  {sentimentSummary.positiveHighlights.map(h => (
                    <span key={h} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      ✓ {h}
                    </span>
                  ))}
                  {sentimentSummary.negativeHighlights.map(h => (
                    <span key={h} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                      ⚠ {h}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-black uppercase tracking-widest text-[var(--text-muted)]">Sorted by</p>
                <p className="text-[14px] font-black text-[var(--text-primary)]">Recency · Detail · Verified</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WRITE REVIEW FORM ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            className="mb-10 rounded-[32px] overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 25px 60px rgba(0,0,0,0.08)' }}>
            {/* Form header band */}
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#FC6C26,#FC6C26,#6d28d9)' }} />
            <div className="p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', boxShadow: '0 6px 16px rgba(252, 108, 38,0.35)' }}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-base">Share Your Experience</h3>
                  <p className="text-[13px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">AI-powered sentiment analysis</p>
                </div>
              </div>

              <div className="space-y-5 relative">
                {/* Place Search */}
                <div className="relative">
                  <motion.div animate={{ boxShadow: focusedField === 'place' ? '0 0 0 3px rgba(252, 108, 38,0.15), 0 8px 25px rgba(0,0,0,0.06)' : '0 4px 15px rgba(0,0,0,0.04)' }}
                    className="rounded-[20px] overflow-hidden"
                    style={{ border: focusedField === 'place' ? '1.5px solid rgba(252, 108, 38,0.5)' : '1.5px solid rgba(0,0,0,0.06)', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3 px-5 py-4">
                      <Search size={18} className="text-[#FC6C26] shrink-0" />
                      <input type="text" placeholder="Search for a destination to review..."
                        value={placeQuery}
                        onChange={e => { setPlaceQuery(e.target.value); setSelectedPlaceId(null) }}
                        onFocus={() => setFocusedField('place')} onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                        className="flex-1 bg-transparent text-sm font-extrabold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                    </div>
                  </motion.div>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {placeResults.length > 0 && focusedField === 'place' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] rounded-2xl shadow-xl z-50 border border-[var(--border-subtle)] overflow-hidden">
                        {placeResults.map((p) => (
                          <div key={p.id} onClick={() => { setPlaceQuery(p.name); setSelectedPlaceId(p.id); setPlaceResults([]) }}
                            className="px-5 py-3 hover:bg-[var(--bg-card)] cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors">
                            <MapPin size={16} className="text-[var(--text-muted)]" />
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">{p.name}</p>
                              <p className="text-[13px] text-[var(--text-muted)] font-extrabold">{p.city}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Star rating */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-[20px]"
                  style={{ background: '#fefce8', border: '1.5px solid #fef08a' }}>
                  <span className="text-sm font-bold text-[#92400e] uppercase tracking-widest">Rate your experience</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <motion.button key={s}
                        onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                        whileHover={{ scale: 1.3, rotate: -5 }} whileTap={{ scale: 0.9 }}
                        className="p-0.5 focus:outline-none">
                        <Star size={30} className={(hoverRating || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-[#D1D5DB]'}
                          style={{ filter: (hoverRating || rating) >= s ? 'drop-shadow(0 3px 8px rgba(245,158,11,0.5))' : 'none', transition: 'all 0.2s' }} />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Review textarea */}
                <div className="relative">
                  <motion.div animate={{ boxShadow: focusedField === 'review' ? '0 0 0 3px rgba(252, 108, 38,0.15), 0 8px 25px rgba(0,0,0,0.06)' : '0 4px 15px rgba(0,0,0,0.04)' }}
                    className="rounded-[20px] overflow-hidden"
                    style={{ border: focusedField === 'review' ? '1.5px solid rgba(252, 108, 38,0.5)' : '1.5px solid rgba(0,0,0,0.06)', background: 'var(--bg-card)' }}>
                    <textarea value={newReview} onChange={e => setNewReview(e.target.value)}
                      onFocus={() => setFocusedField('review')} onBlur={() => setFocusedField(null)}
                      placeholder="Tell us everything — the good, the bad, and the beautiful…"
                      rows={4}
                      className="w-full px-6 py-5 bg-transparent text-sm font-extrabold text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-muted)]" />
                  </motion.div>
                  <AnimatePresence>
                    {aiSentiment && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                        style={{ background: SENTIMENT_META[aiSentiment.sentiment]?.bg, color: SENTIMENT_META[aiSentiment.sentiment]?.color, border: `1px solid ${SENTIMENT_META[aiSentiment.sentiment]?.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                        <Sparkles size={12} /> AI: {aiSentiment.sentiment}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    disabled={rating === 0 || !newReview || !selectedPlaceId || isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2.5 px-7 py-3 rounded-full text-white text-sm font-bold uppercase tracking-widest disabled:opacity-40 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', boxShadow: '0 10px 28px rgba(252, 108, 38,0.4)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                    <span className="relative z-10">{isSubmitting ? 'Analyzing…' : 'Publish'}</span>
                    <Send size={14} className="relative z-10" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          10,000 BILLION DOLLAR FILTER TAB BAR
      ═══════════════════════════════════════════ */}
      {reviews.length > 0 && (
        <div className="flex gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2">
          {FILTERS.map(f => {
            const isActive = filter === f.key
            return (
              <motion.button key={f.key} onClick={() => setFilter(f.key as any)}
                whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-400 relative group shrink-0"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #FC6C26 0%, #F1A501 100%)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: isActive
                    ? '0 12px 35px rgba(17,24,39,0.25), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                    : '0 4px 20px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.04)',
                }}>
                {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />}
                {isActive && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-full" />}
                <span className="relative z-10">{f.emoji}</span>
                {f.key !== 'all' && (
                  <Star size={13} className="relative z-10" style={{ fill: isActive ? '#fbbf24' : '#fbbf24', color: isActive ? '#fbbf24' : '#fbbf24', filter: isActive ? 'drop-shadow(0 1px 3px rgba(251,191,36,0.6))' : 'none' }} />
                )}
                <span className="relative z-10">{f.label}</span>
                <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-black"
                  style={{ background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.06)', color: isActive ? '#ffffff' : 'var(--text-muted)' }}>
                  {f.key === 'all' ? reviews.length : reviews.filter(r => r.rating === Number(f.key)).length}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* ═══ REVIEW CARDS GRID ═══ */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FC6C26]"></div>
        </div>
      ) : reviews.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-28 px-4 text-center rounded-[32px] bg-[var(--bg-card)] relative overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 25px 60px rgba(0,0,0,0.06)' }}
        >
          {/* Beautiful glowing orb background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-300/10 rounded-full blur-[80px] pointer-events-none" />
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 relative z-10"
            style={{ background: 'linear-gradient(135deg,#fee2e2,#fff1f2)', border: '1px solid #fca5a5', boxShadow: '0 20px 50px rgba(239,68,68,0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8)' }}
          >
            <MessageSquare size={40} className="text-red-500 drop-shadow-lg" />
          </motion.div>
          
          <h3 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-3 relative z-10">No Reviews Yet</h3>
          <p className="text-[var(--text-muted)] font-extrabold mb-10 max-w-sm relative z-10 text-[17px] leading-relaxed">
            Your community is waiting! Be the first traveler to share your authentic experience and help others discover the world's hidden gems.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-9 py-4.5 rounded-full text-white font-bold uppercase tracking-widest text-sm relative overflow-hidden z-10"
            style={{ background: 'linear-gradient(135deg,#FC6C26,#FC6C26)', boxShadow: '0 15px 40px rgba(252, 108, 38,0.4)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            <Sparkles size={16} className="relative z-10" />
            <span className="relative z-10">Write the First Review</span>
            <ArrowRight size={16} className="relative z-10" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((review, idx) => {
              const sm = SENTIMENT_META[review.sentimentLabel || 'Neutral'] || SENTIMENT_META.Neutral
              const safeUserName = review.userName || 'Anonymous'
              const [colorFrom, colorTo] = getGradients(safeUserName)
              const nameParts = safeUserName.trim().split(' ').filter(Boolean)
              const avatar = nameParts.length > 1 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : safeUserName.substring(0, 2).toUpperCase()
              
              const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'

              return (
                <motion.div key={review.id} layout
                  initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>

                  <motion.div whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    className="rounded-[32px] overflow-hidden flex flex-col h-full group relative"
                    style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 35px rgba(0,0,0,0.06)' }}>

                    {/* Colour accent top bar */}
                    <div className="h-1.5 w-full shrink-0"
                      style={{ background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`, boxShadow: `0 2px 12px ${colorFrom}60` }} />

                    <div className="p-7 flex flex-col flex-1">
                      {/* User + sentiment */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md relative overflow-hidden shrink-0"
                            style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`, boxShadow: `0 8px 20px ${colorFrom}50` }}>
                            {avatar}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                          </div>
                          <div>
                            <p className="font-black text-[18px] text-[var(--text-primary)] leading-tight tracking-tight">{safeUserName}</p>
                            <p className="text-[13px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{dateStr}</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-black uppercase tracking-widest shrink-0 ml-2"
                          style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>
                          {sm.emoji} {sm.label}
                        </span>
                      </div>

                      {/* Place + Stars */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                          style={{ background: `${colorFrom}15`, border: `1px solid ${colorFrom}40` }}>
                          <MapPin size={16} style={{ color: colorFrom }} />
                          <span className="text-[13px] font-black uppercase tracking-widest" style={{ color: colorFrom }}>{review.placeName}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} size={16}
                              style={{ fill: si < review.rating ? '#f59e0b' : 'transparent', color: si < review.rating ? '#f59e0b' : '#D1D5DB', filter: si < review.rating ? 'drop-shadow(0 1px 3px rgba(245,158,11,0.4))' : 'none' }} />
                          ))}
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-[16px] leading-relaxed text-[var(--text-primary)] font-medium tracking-tight flex-1 mb-6 break-words">
                        "{review.comment}"
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-5"
                        style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <motion.button onClick={() => handleUpvote(review.id)} whileHover={{ scale: 1.05, x: 2 }} whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                          <ThumbsUp size={16} className="text-[#FC6C26]" />
                          {review.upvotes} Helpful
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

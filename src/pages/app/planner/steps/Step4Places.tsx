/**
 * Step4Places.tsx — Features #1 (Hidden), #3 (Crowd), #4 (Quiet), #11 (Food), #14 (Challenges)
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Volume2, VolumeX, Users, Utensils, Trophy, ArrowRight, Info, ChevronDown } from 'lucide-react'
import {
  findHiddenPlaces, getCrowdDensity, submitCrowdReport, findSilentZones,
  getFoodSafetyRatings, getChallenges,
  type HiddenPlace, type CrowdReport, type SilentZone, type FoodSafetyRating, type Challenge,
} from '../../../services/plannerFeatures'
import { usePlannerStore } from '../../../stores/plannerStore'

const CROWD_COLOR = { quiet: '#22c55e', moderate: '#f59e0b', busy: '#ef4444' }

export function Step4Places() {
  const { session, placeFilters, toggleFilter, challenges, setChallenges, setStep, completeStep } = usePlannerStore()
  const destination = session?.destination || 'Goa'

  const [activeTab, setActiveTab] = useState<'discover' | 'food' | 'challenges'>('discover')
  const [hiddenPlaces, setHiddenPlaces] = useState<HiddenPlace[]>([])
  const [silentZones, setSilentZones] = useState<SilentZone[]>([])
  const [foodRatings, setFoodRatings] = useState<FoodSafetyRating[]>([])
  const [crowdMap, setCrowdMap] = useState<Record<string, CrowdReport>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    const chs = getChallenges(`trip-${destination}`)
    setChallenges(chs)
  }, [destination])

  const loadData = async () => {
    setLoading(true)
    const [hidden, quiet, food] = await Promise.all([
      findHiddenPlaces(destination),
      findSilentZones(destination),
      getFoodSafetyRatings(destination),
    ])
    setHiddenPlaces(hidden)
    setSilentZones(quiet)
    setFoodRatings(food)

    // Load crowd data for each hidden place
    const crowdData: Record<string, CrowdReport> = {}
    for (const hp of hidden) {
      crowdData[hp.id] = await getCrowdDensity(hp.id)
    }
    setCrowdMap(crowdData)
    setLoading(false)
  }

  const handleCrowdReport = (placeId: string, level: 1 | 2 | 3 | 4 | 5) => {
    submitCrowdReport(placeId, level, 'user-1')
    // Refresh crowd data for this place
    getCrowdDensity(placeId).then(data => setCrowdMap(prev => ({ ...prev, [placeId]: data })))
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-black text-[var(--text-primary)]">📍 Places Discovery</h2>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">Hidden gems · Quiet zones · Food safety · Local challenges</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleFilter('hiddenGems')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-black border transition-all ${
            placeFilters.hiddenGems ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
          }`}
        >
          🕵️ Hidden Gems
        </button>
        <button
          onClick={() => toggleFilter('quietSpots')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-black border transition-all ${
            placeFilters.quietSpots ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}
        >
          🤫 Quiet Spots
        </button>
        <button
          onClick={() => toggleFilter('foodSafety')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-black border transition-all ${
            placeFilters.foodSafety ? 'bg-[#FC6C26] text-white border-[#FC6C26] shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}
        >
          🍴 Food Safety
        </button>
        <button
          onClick={() => toggleFilter('crowdDensity')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-black border transition-all ${
            placeFilters.crowdDensity ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}
        >
          👥 Crowd
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { key: 'discover', label: '🗺️ Discover' },
          { key: 'food', label: '🍴 Food Safety' },
          { key: 'challenges', label: `🏁 Challenges (${challenges.length})` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all ${
              activeTab === tab.key ? 'bg-[var(--bg-card)] shadow-sm text-[#FC6C26]' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── DISCOVER TAB ── */}
        {activeTab === 'discover' && (
          <motion.div key="discover" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Hidden gems */}
            {(placeFilters.hiddenGems || !Object.values(placeFilters).some(Boolean)) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[16px]">🕵️</span>
                  <p className="text-[14px] font-black text-[var(--text-primary)]">Hidden Gems</p>
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-[#9ca3af]">
                    <Info size={10} />
                    <span>Inverse review-density formula</span>
                  </div>
                </div>
                {loading ? (
                  <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : hiddenPlaces.map(place => {
                  const crowd = crowdMap[place.id]
                  return (
                    <motion.div key={place.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-[var(--bg-card)] rounded-xl border-2 border-dashed border-[var(--border-subtle)] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[14px] font-black text-[var(--text-primary)]">{place.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] capitalize">{place.category} · {place.source}</p>
                        </div>
                        {/* Hidden score badge */}
                        <div className="flex flex-col items-center px-3 py-1.5 bg-[#1B2A4A] rounded-xl shrink-0">
                          <span className="text-[16px] font-black text-white">{place.hiddenScore}</span>
                          <span className="text-[8px] text-white/70 uppercase tracking-wider">/10 hidden</span>
                        </div>
                      </div>

                      {/* Formula (transparent) */}
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-[var(--border-subtle)]">
                        <p className="text-[10px] text-[#9ca3af] font-bold leading-relaxed">
                          Formula: {place.formula}
                        </p>
                      </div>

                      {/* OSM tags */}
                      <div className="flex flex-wrap gap-1">
                        {place.osmTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[#FC6C26]/20 text-[10px] text-[#FC6C26] font-black">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Crowd density dot + report */}
                      {crowd && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: CROWD_COLOR[crowd.currentLevel] }} />
                            <span className="text-[12px] text-[var(--text-muted)] font-black">
                              {crowd.currentLevel === 'busy' ? 'Busy' : crowd.currentLevel === 'moderate' ? 'Moderate' : 'Quiet'} now
                              · {crowd.currentPercent}%
                            </span>
                            <span className="text-[10px] text-[#9ca3af]">({crowd.reports.length} reports)</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(lvl => (
                              <button key={lvl} onClick={() => handleCrowdReport(place.id, lvl as any)}
                                className="w-6 h-6 rounded-full border border-[var(--border-subtle)] text-[10px] font-black hover:bg-[#FC6C26] hover:text-white hover:border-[#FC6C26] transition-colors">
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-[#9ca3af]">{crowd?.dataSource}</p>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Quiet zones */}
            {(placeFilters.quietSpots || !Object.values(placeFilters).some(Boolean)) && silentZones.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[16px]">🤫</span>
                  <p className="text-[14px] font-black text-[var(--text-primary)]">Quiet Zones</p>
                </div>
                {silentZones.map(zone => (
                  <div key={zone.id} className="bg-[var(--bg-card)] rounded-xl border border-green-100 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-black text-[var(--text-primary)]">{zone.name}</p>
                      <div className="flex items-center px-2.5 py-1 bg-green-50 rounded-xl border border-green-200">
                        <VolumeX size={12} className="text-green-600 mr-1.5" />
                        <span className="text-[12px] font-black text-green-700">{zone.quietScore}/10</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {zone.quietFactors.map(f => (
                        <span key={f} className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">{f}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#9ca3af]">{zone.source} · Rule-based OSM tag scoring</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── FOOD SAFETY TAB ── */}
        {activeTab === 'food' && (
          <motion.div key="food" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700">
                Community-reported hygiene ratings, NOT an official FSSAI inspection score.
                Illness mentions auto-detected by TF-IDF + Logistic Regression classifier.
              </p>
            </div>

            {foodRatings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🍴</div>
                <p className="text-[14px] font-black text-[var(--text-primary)]">No food ratings yet for {destination}</p>
              </div>
            ) : foodRatings.map(fr => (
              <div key={fr.placeId} className={`bg-[var(--bg-card)] rounded-xl border p-4 space-y-3 ${fr.symptomFlag ? 'border-red-200' : 'border-[var(--border-subtle)]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-black text-[var(--text-primary)]">{fr.name}</p>
                    <p className="text-[11px] text-[#9ca3af]">{fr.reviewCount} community reviews</p>
                  </div>
                  <div className="flex flex-col items-center shrink-0 px-3 py-1.5 bg-[var(--bg-card)] border rounded-xl"
                    style={{ borderColor: fr.rating >= 4 ? '#22c55e' : fr.rating >= 3 ? '#f59e0b' : '#ef4444' }}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10}
                          className={i < Math.round(fr.rating) ? 'text-[#FC6C26] fill-[#FC6C26]' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] font-black" style={{ color: fr.rating >= 4 ? '#22c55e' : '#f59e0b' }}>
                      {fr.rating}/5
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {fr.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-[var(--text-muted)] bg-gray-50 px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">{tag}</span>
                  ))}
                </div>

                {fr.symptomFlag && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-red-700">Illness mentions detected</p>
                      <p className="text-[10px] text-red-500">ML classifier confidence: {Math.round(fr.symptomConfidence * 100)}%</p>
                    </div>
                    <div className="text-right">
                      <div className="h-1.5 w-20 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.round(fr.symptomConfidence * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-[#9ca3af]">{fr.disclaimer}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── CHALLENGES TAB ── */}
        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-[#FC6C26]" />
              <p className="text-[14px] font-black text-[var(--text-primary)]">Local Challenges</p>
              <span className="text-[10px] text-[#9ca3af] ml-auto">Rule engine · Reuses #1 and #11 outputs</span>
            </div>

            {challenges.map(ch => (
              <div key={ch.id} className={`bg-[var(--bg-card)] rounded-xl border p-4 space-y-3 transition-all ${
                ch.completed ? 'border-green-200 bg-green-50' : 'border-[var(--border-subtle)]'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    ch.completed ? 'bg-green-100' : 'bg-gray-50 border border-[var(--border-subtle)]'
                  }`}>
                    {ch.completed ? '✅' : ch.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-black text-[var(--text-primary)]">{ch.title}</p>
                      <span className="text-[11px] font-black text-[#FC6C26] shrink-0">+{ch.xpReward} XP</span>
                    </div>
                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{ch.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                    <span>{ch.requirement}</span>
                    <span className="font-black">{ch.progress}/{ch.target}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (ch.progress / ch.target) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: ch.completed ? '#22c55e' : '#FC6C26' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <p className="text-[10px] text-[#9ca3af] text-center">
              Challenges powered by hidden places (#1) and food safety (#11) outputs.
              Completion: geofence check-in. XP synced to Rewards page.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { completeStep(4); setStep(5) }}
        className="w-full py-4 mt-auto rounded-2xl bg-gradient-to-r from-[#FC6C26] to-[#e55a15] text-white font-black text-[15px] shadow-[0_8px_25px_rgba(252,108,38,0.4)] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
      >
        Continue to Pack & Budget <ArrowRight size={16} />
      </button>
    </div>
  )
}

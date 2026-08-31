import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Heart } from 'lucide-react'
import { useExploreStore } from '../../../stores/exploreStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { staggerContainer, itemPop } from '../../../motion/variants'

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-bg-card border border-border-subtle">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
      </div>
    </div>
  )
}

export function SearchResultsPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const { searchResults, isSearching, setFilters } = useExploreStore()
  const { savedPlaceIds, fetchWishlist, toggleSaved } = useWishlistStore()
  const [sort, setSort] = useState('popularity')

  useEffect(() => {
    // We override filters whenever the URL query changes
    setFilters({ query })
  }, [query, setFilters])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const sortedResults = [...searchResults].sort((a, b) => {
    if (sort === 'cost-asc') return (a.avgCost || a.costPerDay || 0) - (b.avgCost || b.costPerDay || 0)
    if (sort === 'cost-desc') return (b.avgCost || b.costPerDay || 0) - (a.avgCost || a.costPerDay || 0)
    if (sort === 'rating') return b.rating - a.rating
    return 0 // popularity default
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl mb-1 text-text-primary">
          Results for "<span className="text-teal-600">{query || 'all'}</span>"
        </h1>
        <p className="text-sm text-text-muted">
          {isSearching ? 'Searching...' : `${searchResults.length} destinations found`}
        </p>
      </motion.div>

      {/* Filters Row */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border-default outline-none bg-bg-card text-text-primary">
            <option value="popularity">Popularity</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Destination Cards */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {isSearching ? (
          [1,2,3,4,5,6].map(i => <SkeletonCard key={`skel-${i}`} />)
        ) : sortedResults.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {sortedResults.map((dest) => (
              <motion.div key={dest.id} layout variants={itemPop} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}>
                <Link to={`/app/explore/place/${dest.id}`}>
                  <div className="rounded-2xl overflow-hidden shadow-card border border-border-subtle bg-bg-card group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={dest.imageUrl || dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={e => { e.preventDefault(); toggleSaved(dest.id) }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md">
                        <Heart size={14} className={savedPlaceIds.includes(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'} />
                      </motion.button>
                      
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-bold text-white px-2 py-1 rounded-lg bg-amber-500/90">
                          ₹{(dest.avgCost || dest.costPerDay || 0).toLocaleString()}/day
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-text-primary">{dest.name}</h3>
                      <p className="text-xs flex items-center gap-1 mt-0.5 text-text-muted">
                        <MapPin size={10} /> {dest.state} · ⭐{dest.rating}
                      </p>
                      <div className="flex gap-1.5 mt-2">
                        {(dest.category ? (Array.isArray(dest.category) ? dest.category : dest.category.split(',')) : []).slice(0, 2).map((c: string) => (
                          <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-card)] text-teal-700">{c.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-3 text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl mb-2 text-text-primary">No results found</h3>
            <p className="text-sm text-text-muted">
              Try a different search term or explore all destinations.
            </p>
            <Link to="/app/explore" className="mt-4 inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold bg-teal-700 hover:bg-teal-800 transition-colors">
              Explore All
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

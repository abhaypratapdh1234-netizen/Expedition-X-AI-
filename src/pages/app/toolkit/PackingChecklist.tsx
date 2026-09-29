import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Plus, Trash2, Sparkles, Check, Package, Edit2, X, RotateCcw } from 'lucide-react'
import { useTripStore } from '../../../stores/tripStore'
import { useThemeStore } from '../../../stores/themeStore'
import { useAuthStore } from '../../../stores/authStore'
import { pageTransition, itemPop, staggerContainer } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

const DEFAULT_CATEGORIES: Record<string, string[]> = {
  '👕 Clothing': ['T-shirts (3-4)', 'Jeans/Pants', 'Jacket/Sweater', 'Comfortable Shoes', 'Sandals', 'Undergarments'],
  '🧴 Toiletries': ['Toothbrush & Paste', 'Sunscreen SPF50+', 'Shampoo', 'Moisturizer', 'Hand Sanitizer'],
  '📱 Electronics': ['Phone Charger', 'Power Bank', 'Headphones', 'Camera', 'Travel Adapter'],
  '💊 Health': ['Personal Medications', 'First Aid Kit', 'ORS Packets', 'Pain Relievers'],
  '📄 Documents': ['Aadhaar/Passport', 'E-Tickets', 'Hotel Vouchers', 'Travel Insurance'],
  '✨ AI Recommendations': ['Raincoat (Expected rain)', 'Mosquito Repellent (Tropical area)', 'Reusable Water Bottle']
}

export function PackingChecklist() {
  const { currentTrip, fetchUserTrips, trips, fetchTripById } = useTripStore()
  const { user } = useAuthStore()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  const isMonochrome = theme === 'monochrome'

  // Per-account storage keys so custom columns and checks persist for lifetime strictly for this account
  const accountKey = user?.email ? user.email.toLowerCase().trim() : (user?.id ? user.id : 'guest')
  const catStorageKey = `expeditionx_packing_categories_${accountKey}`
  const checkedStorageKey = `expeditionx_packing_checked_${accountKey}`

  const loadSavedCategories = useCallback((): Record<string, string[]> => {
    try {
      const saved = localStorage.getItem(catStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load packing categories', e)
    }
    return DEFAULT_CATEGORIES
  }, [catStorageKey])

  const loadSavedChecked = useCallback((): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem(checkedStorageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    return {}
  }, [checkedStorageKey])

  const [categories, setCategories] = useState<Record<string, string[]>>(loadSavedCategories)
  const [checked, setChecked] = useState<Record<string, boolean>>(loadSavedChecked)

  // Column (category) creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Column renaming state
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null)

  // Item creation state
  const [addingItemCategory, setAddingItemCategory] = useState<string | null>(null)
  const [newItemText, setNewItemText] = useState('')

  // Item editing state
  const [editingItem, setEditingItem] = useState<{ category: string; index: number; value: string } | null>(null)

  // Reload when account changes
  useEffect(() => {
    setCategories(loadSavedCategories())
    setChecked(loadSavedChecked())
  }, [loadSavedCategories, loadSavedChecked])

  useEffect(() => {
    if (trips.length === 0) {
      fetchUserTrips()
    }
  }, [fetchUserTrips, trips.length])

  useEffect(() => {
    if (!currentTrip && trips.length > 0) {
      const upcoming = trips.find(t => t.status === 'upcoming') || trips[0]
      if (upcoming) fetchTripById(upcoming.id)
    }
  }, [currentTrip, trips, fetchTripById])

  // Persistence helpers
  const persistCategories = (newCategories: Record<string, string[]>) => {
    setCategories(newCategories)
    try {
      localStorage.setItem(catStorageKey, JSON.stringify(newCategories))
    } catch (e) {
      console.warn('Could not save categories', e)
    }
  }

  const persistChecked = (newChecked: Record<string, boolean>) => {
    setChecked(newChecked)
    try {
      localStorage.setItem(checkedStorageKey, JSON.stringify(newChecked))
    } catch (e) {
      console.warn('Could not save checked items', e)
    }
  }

  const toggle = (item: string) => {
    const updated = { ...checked, [item]: !checked[item] }
    persistChecked(updated)
  }

  // --- Category (Column) Actions ---
  const handleSaveNewCategory = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      setIsAddingCategory(false)
      return
    }
    if (categories[trimmed]) {
      setIsAddingCategory(false)
      setNewCategoryName('')
      return
    }
    const updated = { ...categories, [trimmed]: [] }
    persistCategories(updated)
    setNewCategoryName('')
    setIsAddingCategory(false)
    setAddingItemCategory(trimmed)
  }

  const handleDeleteCategory = (catName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = { ...categories }
    const itemsToRemove = updated[catName] || []
    delete updated[catName]
    persistCategories(updated)

    if (itemsToRemove.length > 0) {
      const updatedChecked = { ...checked }
      itemsToRemove.forEach(item => delete updatedChecked[item])
      persistChecked(updatedChecked)
    }

    if (addingItemCategory === catName) setAddingItemCategory(null)
    if (editingCategory?.oldName === catName) setEditingCategory(null)
    if (editingItem?.category === catName) setEditingItem(null)
  }

  const handleSaveEditCategory = () => {
    if (!editingCategory) return
    const { oldName, newName } = editingCategory
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null)
      return
    }

    const updated: Record<string, string[]> = {}
    Object.keys(categories).forEach(key => {
      if (key === oldName) {
        updated[trimmed] = categories[oldName]
      } else {
        updated[key] = categories[key]
      }
    })
    persistCategories(updated)
    setEditingCategory(null)
  }

  // --- Item Actions ---
  const handleAddItem = (catName: string) => {
    const trimmed = newItemText.trim()
    if (!trimmed) {
      setAddingItemCategory(null)
      return
    }
    const currentItems = categories[catName] || []
    const updated = { ...categories, [catName]: [...currentItems, trimmed] }
    persistCategories(updated)
    setNewItemText('')
    setAddingItemCategory(null)
  }

  const handleSaveEditItem = () => {
    if (!editingItem) return
    const { category, index, value } = editingItem
    const trimmed = value.trim()
    if (!trimmed) {
      setEditingItem(null)
      return
    }

    const currentItems = [...(categories[category] || [])]
    const oldText = currentItems[index]
    currentItems[index] = trimmed
    const updated = { ...categories, [category]: currentItems }

    if (checked[oldText]) {
      const updatedChecked = { ...checked, [trimmed]: true }
      delete updatedChecked[oldText]
      persistChecked(updatedChecked)
    }

    persistCategories(updated)
    setEditingItem(null)
  }

  const handleDeleteItem = (catName: string, index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const currentItems = [...(categories[catName] || [])]
    const [removed] = currentItems.splice(index, 1)
    const updated = { ...categories, [catName]: currentItems }

    if (checked[removed]) {
      const updatedChecked = { ...checked }
      delete updatedChecked[removed]
      persistChecked(updatedChecked)
    }

    persistCategories(updated)
    if (editingItem?.category === catName && editingItem?.index === index) {
      setEditingItem(null)
    }
  }

  const handleRestoreDefaults = () => {
    const updated = { ...DEFAULT_CATEGORIES, ...categories }
    persistCategories(updated)
  }

  const allItems = Object.values(categories).flat()
  const totalChecked = allItems.filter(item => checked[item]).length
  const progress = allItems.length > 0 ? Math.round((totalChecked / allItems.length) * 100) : 0
  const hasMissingDefaults = Object.keys(DEFAULT_CATEGORIES).some(k => !categories[k])

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl md:text-7xl mb-3 text-[var(--text-primary)] font-bold tracking-tight antialiased">Packing Checklist</h1>
          <p className="text-[var(--text-secondary)] text-[18px] font-bold antialiased mt-2">
            AI-tailored for your upcoming trip to <span className="text-[var(--text-primary)] font-bold">{currentTrip?.destinations[0] || 'your destination'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {hasMissingDefaults && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-bg-secondary hover:bg-[var(--bg-card)] border border-border-default text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
              title="Restore missing default columns"
            >
              <RotateCcw size={15} /> Restore Defaults
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-white hover:bg-neutral-100 text-black border border-white transition-all cursor-pointer shadow-sm"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
            title="Add your own custom packing column"
          >
            <Plus size={16} className="text-black" strokeWidth={2.5} /> Add Column
          </motion.button>
        </div>
      </div>
      
      <ToolkitTabs />

      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="p-8 rounded-[32px] mb-10 relative overflow-hidden group"
        style={{
          background: 'var(--bg-card)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255, 255, 255, 1)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex justify-between items-end mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-[#FC6C26]" />
              <span className="font-bold antialiased text-[16px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Overall Progress</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold antialiased text-[var(--text-primary)]">{progress}% Packed</h2>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold antialiased text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)]" style={{ background: 'var(--bg-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <Check size={18} className="text-[#FC6C26] stroke-[3]" />
              {totalChecked} / {allItems.length} ITEMS
            </span>
          </div>
        </div>

        {/* The Luxury Neon Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden relative z-10" style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <motion.div 
            className="h-full rounded-full relative"
            style={{ 
              background: isDark || isLight || isMonochrome ? 'var(--text-primary)' : 'linear-gradient(90deg, #FC6C26, #f97316, #fb923c)',
              boxShadow: isDark || isLight || isMonochrome ? '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)' : '0 4px 10px rgba(252,108,38,0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
            }}
            animate={{ 
              width: `${progress}%`,
            }} 
            transition={{ 
              width: { type: 'spring', stiffness: 50, damping: 15 },
            }} 
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {progress === 100 && allItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }} 
              className="flex items-center justify-center gap-3 p-4 rounded-[20px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(252, 108, 38, 0.1), rgba(252, 108, 38, 0.05))', border: '1px solid rgba(252, 108, 38, 0.2)' }}
            >
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <CheckCircle size={24} className="text-[#FC6C26]" />
              </motion.div>
              <p className="text-[15px] font-bold antialiased text-[#FC6C26] tracking-wider">
                FULLY PACKED & READY FOR THE ADVENTURE! 🚀
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inline Add Column Modal / Form */}
      <AnimatePresence>
        {isAddingCategory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 rounded-2xl border-2 border-dashed border-[#FC6C26]/50 bg-bg-card shadow-lg flex flex-col sm:flex-row items-center gap-3"
          >
            <input 
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Column Name (e.g. 🎒 Photography Gear, 👶 Baby Essentials)..."
              className="flex-1 w-full bg-bg-secondary border border-border-default rounded-xl px-4 py-3 text-[16px] font-bold text-text-primary outline-none focus:border-[#FC6C26] transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNewCategory()
                if (e.key === 'Escape') setIsAddingCategory(false)
              }}
            />
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleSaveNewCategory}
                className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-100 text-black font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-white"
                style={{ backgroundColor: '#ffffff', color: '#000000' }}
              >
                <Check size={16} className="text-black" strokeWidth={2.5} /> Create Column
              </button>
              <button
                onClick={() => { setIsAddingCategory(false); setNewCategoryName('') }}
                className="w-11 h-11 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer border border-border-default"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Columns Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {Object.entries(categories).map(([category, items]) => {
            const isAi = category.includes('AI')
            const catChecked = items.filter(it => checked[it]).length
            const isCatComplete = catChecked === items.length && items.length > 0
            const isEditingThisCat = editingCategory?.oldName === category
            const isAddingToThisCat = addingItemCategory === category

            return (
              <motion.div 
                key={category} 
                layout
                variants={itemPop} 
                className="rounded-[28px] overflow-hidden transition-all duration-500 flex flex-col bg-bg-card border border-border-subtle shadow-sm hover:shadow-md"
              >
                {/* Column Header */}
                <div 
                  className="flex items-center justify-between px-5 sm:px-6 py-4 relative overflow-hidden bg-bg-card border-b border-border-subtle"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    {isEditingThisCat ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={editingCategory.newName}
                          onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                          className="flex-1 bg-bg-secondary border border-[#FC6C26] rounded-lg px-2.5 py-1 text-[16px] font-bold text-text-primary outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditCategory()
                            if (e.key === 'Escape') setEditingCategory(null)
                          }}
                        />
                        <button 
                          onClick={handleSaveEditCategory} 
                          className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center hover:bg-neutral-100 transition-colors shrink-0 shadow-sm"
                          style={{ backgroundColor: '#ffffff', color: '#000000' }}
                          title="Save Name"
                        >
                          <Check size={14} className="text-black" strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => setEditingCategory(null)} 
                          className="w-8 h-8 rounded-lg bg-bg-secondary text-text-secondary flex items-center justify-center hover:bg-bg-card transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        {isAi && (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                            <Sparkles size={16} className="text-[#FC6C26] shrink-0" />
                          </motion.div>
                        )}
                        <h3 className="font-bold antialiased text-[20px] text-text-primary tracking-tight truncate">
                          {category}
                        </h3>
                        <button
                          onClick={() => setEditingCategory({ oldName: category, newName: category })}
                          className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                          title="Edit column name"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[13px] font-black px-2.5 py-1 rounded-lg ${
                      isCatComplete ? 'bg-[#FC6C26] text-white shadow-sm' : 'bg-bg-secondary text-text-secondary border border-border-default'
                    }`}>
                      {catChecked}/{items.length}
                    </span>

                    <button
                      onClick={() => {
                        setAddingItemCategory(isAddingToThisCat ? null : category)
                        setNewItemText('')
                      }}
                      className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-[var(--bg-card)] border border-border-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                      title="Add item to this column"
                    >
                      <Plus size={15} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteCategory(category, e)}
                      className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-red-500/10 border border-border-default text-text-secondary hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete this entire column"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {items.length === 0 && !isAddingToThisCat && (
                      <div className="py-8 text-center text-text-muted text-sm font-medium">
                        No items yet. Click <span className="font-bold text-text-primary">+</span> to add items.
                      </div>
                    )}

                    {items.map((item, index) => {
                      const isEditingThisItem = editingItem?.category === category && editingItem?.index === index
                      const isItemChecked = !!checked[item]

                      if (isEditingThisItem) {
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-bg-secondary rounded-xl">
                            <input 
                              type="text"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                              className="flex-1 bg-transparent border-b border-[#FC6C26] outline-none text-[15px] font-bold text-text-primary px-1 py-0.5"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditItem()
                                if (e.key === 'Escape') setEditingItem(null)
                              }}
                            />
                            <button
                              onClick={handleSaveEditItem}
                              className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center hover:bg-neutral-100 transition-colors shadow-sm shrink-0"
                              style={{ backgroundColor: '#ffffff', color: '#000000' }}
                              title="Save"
                            >
                              <Check size={13} className="text-black" strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="w-7 h-7 rounded-lg bg-bg-card text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors shrink-0"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )
                      }

                      return (
                        <motion.div 
                          key={item + index} 
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-secondary/60 transition-colors group cursor-pointer"
                          onClick={() => toggle(item)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Checkbox */}
                            <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
                              <motion.div
                                initial={false}
                                animate={{ scale: isItemChecked ? 1 : 0, opacity: isItemChecked ? 1 : 0 }}
                                className="absolute"
                              >
                                <CheckCircle size={20} className="text-[#FC6C26] fill-[#FC6C26]/20" strokeWidth={2.5} />
                              </motion.div>
                              <motion.div
                                initial={false}
                                animate={{ scale: isItemChecked ? 0 : 1, opacity: isItemChecked ? 0 : 1 }}
                              >
                                <Circle size={20} className="text-text-muted group-hover:text-text-primary transition-colors" strokeWidth={2} />
                              </motion.div>
                            </div>
                            
                            {/* Text */}
                            <span 
                              className="text-[16px] font-bold antialiased transition-all duration-200 select-none truncate" 
                              style={{
                                color: isItemChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: isItemChecked ? 'line-through' : 'none'
                              }}
                            >
                              {item}
                            </span>
                          </div>

                          {/* Hover Actions: Edit & Delete */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingItem({ category, index, value: item })
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(category, index, e)}
                              className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Inline Add Item Input */}
                  {isAddingToThisCat && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2 bg-bg-secondary rounded-xl flex items-center gap-2 border border-border-default"
                    >
                      <input 
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add new item..."
                        className="flex-1 bg-transparent text-[15px] font-bold text-text-primary outline-none px-2 py-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(category)
                          if (e.key === 'Escape') setAddingItemCategory(null)
                        }}
                      />
                      <button
                        onClick={() => handleAddItem(category)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-black text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-white"
                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      >
                        <Check size={13} className="text-black" strokeWidth={2.5} /> Add
                      </button>
                      <button
                        onClick={() => { setAddingItemCategory(null); setNewItemText('') }}
                        className="w-7 h-7 rounded-lg text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Add Column Card Slot */}
          <motion.div 
            layout
            variants={itemPop}
            onClick={() => setIsAddingCategory(true)}
            className="rounded-[28px] border-2 border-dashed border-border-default hover:border-[#FC6C26]/50 bg-bg-card/40 hover:bg-bg-secondary/40 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-secondary group-hover:bg-[#FC6C26]/10 flex items-center justify-center text-text-muted group-hover:text-[#FC6C26] transition-colors">
              <Plus size={24} />
            </div>
            <p className="text-[17px] font-bold text-text-secondary group-hover:text-text-primary transition-colors">
              Add Custom Column
            </p>
            <p className="text-xs text-text-muted font-medium">Create your own customized packing category</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

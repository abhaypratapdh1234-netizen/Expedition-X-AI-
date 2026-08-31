import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Copy, Check, MessageCircle, Wallet } from 'lucide-react'
import { socialService } from '../../../services/socialService'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'

export function GroupTrip() {
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [itinerary, setItinerary] = useState(['Red Fort → 9 AM', 'Chandni Chowk Lunch → 1 PM', 'India Gate → 5 PM'])
  const inviteLink = 'https://expeditionx.ai/join/TRP-DELHI-2026'

  useEffect(() => {
    async function load() {
      const active = await socialService.getActiveCollaborators('t1')
      setCollaborators(active)
    }
    load()

    // Simulate polling for presence
    const interval = setInterval(async () => {
      const active = await socialService.getActiveCollaborators('t1')
      setCollaborators(active)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const EXPENSES = [
    { id: '1', desc: 'Hotel Booking', amount: 8400, paidBy: 'u2', split: ['u1', 'u2', 'u3'] },
    { id: '2', desc: 'Red Fort Tickets', amount: 300, paidBy: 'u3', split: ['u1', 'u2', 'u3'] },
    { id: '3', desc: 'Dinner at Karim\'s', amount: 2100, paidBy: 'u2', split: ['u1', 'u2', 'u3'] },
  ]
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0)

  // Drag and drop handler (simplified for UI demonstration)
  const handleDragEnd = (event: any, info: any, index: number) => {
    if (Math.abs(info.offset.y) > 40) {
      const newItems = [...itinerary]
      const dir = info.offset.y > 0 ? 1 : -1
      if (index + dir >= 0 && index + dir < newItems.length) {
        const temp = newItems[index]
        newItems[index] = newItems[index + dir]
        newItems[index + dir] = temp
        setItinerary(newItems)
      }
    }
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-1 text-text-primary">Group Trip Planner</h1>
        <p className="text-text-muted">Plan, collaborate, and split costs with your travel squad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Collaborators */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
            <h3 className="font-bold text-sm mb-4 text-text-primary uppercase tracking-wider">
              Travelers ({collaborators.length})
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {collaborators.map(c => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ background: c.color || 'var(--teal-600)' }}>
                        {c.name.split(' ').map((n:string) => n[0]).join('').substring(0,2)}
                      </div>
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg-card"
                        style={{ background: c.status === 'online' ? 'var(--success)' : 'var(--text-muted)' }} 
                      />
                      {/* Pulse effect if editing */}
                      {c.isEditing && (
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: c.color || 'var(--teal-600)' }}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                        {c.name}
                        {c.isEditing && <span className="text-[10px] text-text-muted font-normal bg-bg-secondary px-1.5 py-0.5 rounded italic">Editing...</span>}
                      </p>
                      <p className="text-xs capitalize text-text-muted font-medium">{c.status}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Invite Link */}
            <div className="mt-6 pt-5 border-t border-border-subtle">
              <p className="text-xs font-bold mb-2 text-text-secondary uppercase tracking-wider">Invite by Link</p>
              <div className="flex gap-2">
                <input readOnly value={inviteLink}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-default text-text-muted focus:outline-none focus:border-teal-500 transition-colors" />
                <motion.button onClick={handleCopy} whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  style={{ background: copied ? 'var(--success)' : 'var(--teal-600)' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Cost Split Summary */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet size={80} className="text-amber-500" />
            </div>
            <h3 className="font-bold text-sm mb-4 text-text-primary uppercase tracking-wider relative z-10 flex items-center gap-2">
              <Wallet size={16} className="text-amber-500" /> Who Owes What
            </h3>
            
            <div className="space-y-3 relative z-10">
              {[
                { from: 'Rahul K.', to: 'Priya S.', amount: 2100 },
                { from: 'You', to: 'Priya S.', amount: 1500 },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-default">
                  <div className="text-xs flex items-center gap-1.5 font-medium">
                    <span className="font-bold text-text-primary px-2 py-0.5 bg-bg-card rounded shadow-sm border border-border-subtle">{t.from}</span>
                    <span className="text-text-muted">owes</span>
                    <span className="font-bold text-text-primary px-2 py-0.5 bg-bg-card rounded shadow-sm border border-border-subtle">{t.to}</span>
                  </div>
                  <span className="font-bold text-sm text-red-500">₹{t.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-subtle relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-text-secondary uppercase tracking-wider text-xs">Total Group Spend</span>
                <motion.span 
                  key={totalExpenses}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="font-display font-bold text-lg text-text-primary"
                >
                  ₹{totalExpenses.toLocaleString()}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Shared Itinerary */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
              <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
                Shared Itinerary <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-2">
                  {collaborators.filter(c => c.status === 'online').map(c => (
                    <motion.div 
                      key={c.id} 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-7 h-7 rounded-full border-2 border-bg-card flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                      style={{ background: c.color || 'var(--teal-600)' }}
                    >
                      {c.name[0]}
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-text-muted bg-bg-secondary px-2 py-1 rounded-md border border-border-default">Live</span>
              </div>
            </div>

            {/* Itinerary Items (Draggable) */}
            <div className="space-y-3">
              <AnimatePresence>
                {itinerary.map((item, i) => (
                  <motion.div 
                    key={item} 
                    layout
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, info) => handleDragEnd(e, info, i)}
                    whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: 'var(--shadow-lg)' }}
                    className="flex gap-4 p-4 rounded-xl bg-bg-secondary border border-border-default cursor-grab active:cursor-grabbing hover:border-teal-500/30 transition-colors group relative"
                  >
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-1 h-1 bg-border-default rounded-full mb-0.5" />
                       <div className="w-1 h-1 bg-border-default rounded-full mb-0.5" />
                       <div className="w-1 h-1 bg-border-default rounded-full" />
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ml-2"
                      style={{ background: 'var(--bg-card)' }}>
                      {['🏛️', '🍛', '🏛️'][i % 3]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary mb-0.5">{item.split('→')[0].trim()}</p>
                      <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {item.split('→')[1]?.trim()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {collaborators.filter(c => c.isEditing).length > 0 && i === 1 && (
                         <motion.div 
                           initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                           className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-bg-card absolute -top-2 -right-2 shadow-sm"
                           style={{ background: collaborators.find(c => c.isEditing)?.color || 'var(--violet-600)' }}
                         >
                           {collaborators.find(c => c.isEditing)?.name[0]}
                         </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="mt-4 p-4 rounded-xl border border-dashed border-border-default text-center">
               <p className="text-xs font-bold text-text-muted uppercase tracking-widest">+ Drag to Reorder</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

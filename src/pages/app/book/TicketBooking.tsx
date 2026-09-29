import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plane, Train, Bus, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react'
import { bookingService } from '../../../services/bookingService'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'

export function TicketBooking() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<'flight' | 'train' | 'bus'>('flight')

  useEffect(() => {
    async function loadTickets() {
      setIsLoading(true)
      try {
        const results = await bookingService.searchTransport(mode, 'BOM', 'DEL', '2026-08-10')
        setTickets(results)
      } finally {
        setIsLoading(false)
      }
    }
    loadTickets()
  }, [mode])

  const ticket = tickets.find(t => t.id === selectedTicket)

  // Flight Path SVG Arc Animation
  const PathAnimation = () => (
    <div className="absolute top-1/2 left-0 w-full h-[60px] -translate-y-1/2 pointer-events-none overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
        <motion.path
          d="M 10,15 Q 50,-5 90,15"
          fill="none"
          stroke="var(--teal-500)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          r="2"
          fill="var(--teal-600)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          cx="90" cy="15"
        />
      </svg>
    </div>
  )

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1 text-text-primary">Travel Tickets</h1>
        <p className="text-text-muted">Book flights, trains, and buses with live availability.</p>
      </div>

      <div className="flex gap-2 mb-6 bg-bg-card p-1.5 rounded-xl border border-border-subtle shadow-sm w-max">
        {(['flight', 'train', 'bus'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-500/20' : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'}`}>
            {m === 'flight' && <Plane size={16} />}
            {m === 'train' && <Train size={16} />}
            {m === 'bus' && <Bus size={16} />}
            {m}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-bg-card border border-border-subtle shadow-sm skeleton" />
            ))
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
              {tickets.map((t) => (
                <motion.div
                  key={t.id}
                  variants={itemPop}
                  onClick={() => setSelectedTicket(t.id === selectedTicket ? null : t.id)}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all bg-bg-card ${selectedTicket === t.id ? 'border-2 border-teal-500 shadow-card' : 'border border-border-subtle hover:border-teal-500/50 hover:shadow-sm'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] text-teal-600 flex items-center justify-center">
                        {mode === 'flight' ? <Plane size={20} /> : mode === 'train' ? <Train size={20} /> : <Bus size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{t.airline}</h3>
                        <p className="text-xs text-text-muted">{t.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-text-primary">₹{t.price.toLocaleString()}</span>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-0.5">Per Traveler</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between relative px-2">
                    {/* Origin */}
                    <div className="text-left relative z-10">
                      <p className="text-xl font-display font-bold text-text-primary">{t.departure}</p>
                      <p className="text-xs text-text-muted mt-1 font-medium bg-bg-secondary px-2 py-0.5 rounded border border-border-default">BOM</p>
                    </div>
                    
                    {/* Duration / Path */}
                    <div className="flex-1 px-8 text-center relative">
                      {selectedTicket === t.id ? <PathAnimation /> : (
                        <div className="w-full h-[2px] bg-border-default absolute top-1/2 left-0 -translate-y-1/2" />
                      )}
                      <p className="text-xs font-semibold text-text-muted relative z-10 bg-bg-card px-2 py-0.5 rounded-full mx-auto w-max border border-border-default">{t.duration}</p>
                    </div>

                    {/* Destination */}
                    <div className="text-right relative z-10">
                      <p className="text-xl font-display font-bold text-text-primary">{t.arrival}</p>
                      <p className="text-xs text-text-muted mt-1 font-medium bg-bg-secondary px-2 py-0.5 rounded border border-border-default ml-auto w-max">DEL</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedTicket === t.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Only {t.seatsAvailable} seats left at this price</span>
                        </div>
                        <div className="text-xs text-text-muted font-medium bg-bg-secondary px-2 py-1 rounded-md">Economy Class</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Summary Card */}
        <div>
          <div className="p-6 rounded-2xl sticky top-20 bg-bg-card border border-border-subtle shadow-card">
            <h3 className="font-bold text-sm mb-4 text-text-primary uppercase tracking-wider">Booking Summary</h3>

            {ticket ? (
              <AnimatePresence mode="wait">
                <motion.div key={ticket.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-4 rounded-xl mb-4 bg-bg-secondary border border-border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane size={14} className="text-teal-600" />
                      <p className="font-bold text-sm text-text-primary">{ticket.airline}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-text-muted mt-2">
                      <span>BOM → DEL</span>
                      <span>{ticket.duration}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-3 text-text-secondary">Travelers</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-bg-secondary text-text-primary border border-border-default hover:bg-bg-card hover:border-teal-500 transition-colors shadow-sm font-bold text-lg flex items-center justify-center">-</button>
                      <span className="font-display font-bold text-2xl text-text-primary w-8 text-center">{qty}</span>
                      <button onClick={() => setQty(Math.min(9, qty + 1))} className="w-10 h-10 rounded-xl bg-bg-secondary text-text-primary border border-border-default hover:bg-bg-card hover:border-teal-500 transition-colors shadow-sm font-bold text-lg flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-subtle mb-6">
                    <div className="flex justify-between font-bold items-end">
                      <span className="text-text-primary text-sm uppercase tracking-wider">Total</span>
                      <span className="text-2xl text-amber-500 tracking-tight">₹{(ticket.price * qty).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link to="/app/book/checkout" state={{ ticketId: ticket.id, qty, type: 'flight' }} className="block">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))' }}>
                      Proceed to Checkout <ChevronRight size={16} />
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto bg-bg-secondary rounded-full flex items-center justify-center mb-4 text-border-default">
                  <Plane size={24} />
                </div>
                <p className="text-sm font-medium text-text-muted">Select a flight to view summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

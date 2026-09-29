import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { ArrowLeftRight, TrendingUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { pageTransition, itemPop, staggerContainer } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

const FLAGS: Record<string, string> = {
  INR: '🇮🇳', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪',
  JPY: '🇯🇵', SGD: '🇸🇬', AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭',
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState<number | string>(10000)
  const [from, setFrom] = useState('INR')
  const [to, setTo] = useState('USD')
  const [isSwapping, setIsSwapping] = useState(false)
  const [apiData, setApiData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const numAmount = Number(amount) || 0
  const CURRENCIES = Object.keys(FLAGS)

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await axios.get(`https://open.er-api.com/v6/latest/${from}`)
        if (res.data && res.data.result === 'success') {
          setApiData(res.data)
        } else {
          setError('Failed to load live exchange rates.')
        }
      } catch {
        setError('Currency service is currently unreachable.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRates()
  }, [from]) // Only refetch if base currency changes

  const rate = apiData?.rates?.[to] || 0;
  const converted = (numAmount * rate).toFixed(2);
  const exchangeRate = rate.toFixed(4);
  const lastUpdated = apiData?.time_last_update_utc 
    ? new Date(apiData.time_last_update_utc).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' })
    : 'Recently';

  const handleSwap = () => {
    setIsSwapping(true)
    setFrom(to)
    setTo(from)
    setAmount(converted)
    setTimeout(() => setIsSwapping(false), 300)
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-6xl md:text-7xl mb-3 text-text-primary font-black tracking-tight">Currency Converter</h1>
        <p className="text-[18px] font-black text-text-muted mt-2">Live exchange rates for your global adventures.</p>
      </div>

      <ToolkitTabs />

      <div className="max-w-2xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl mb-8 bg-bg-card border border-border-subtle shadow-xl relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="mb-6">
            <label className="text-[14px] font-black uppercase tracking-widest text-text-secondary block mb-3 ml-1">Amount</label>
            <div className="relative flex items-center bg-bg-secondary border border-border-default rounded-2xl focus-within:border-teal-500 transition-colors shadow-inner px-4 py-2">
              <span className="text-[22px] mr-2 text-text-muted">{FLAGS[from]}</span>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full py-3 bg-transparent text-4xl font-black font-display outline-none text-text-primary" 
              />
            </div>
          </div>

          <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-2 items-center mb-8">
            <div className="w-full flex-1">
              <label className="text-[12px] font-black uppercase tracking-widest text-text-muted block mb-2 ml-1">From</label>
              <div className="relative">
                <select 
                  value={from} 
                  onChange={e => setFrom(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-[16px] font-black bg-bg-secondary dark:bg-[#1a1a1a] border border-border-default text-text-primary dark:text-white outline-none appearance-none focus:border-teal-500 transition-colors cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c} className="dark:bg-[#1a1a1a] dark:text-white">{c}</option>)}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{FLAGS[from]}</span>
              </div>
            </div>

            <motion.button 
              animate={{ rotate: isSwapping ? 180 : 0, scale: isSwapping ? 0.8 : 1 }}
              onClick={handleSwap}
              className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-card)] dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-sm z-10 sm:mt-5 hover:bg-teal-100 transition-colors"
            >
              <ArrowLeftRight size={16} />
            </motion.button>

            <div className="w-full flex-1">
              <label className="text-[12px] font-black uppercase tracking-widest text-text-muted block mb-2 ml-1">To</label>
              <div className="relative">
                <select 
                  value={to} 
                  onChange={e => setTo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-[16px] font-black bg-bg-secondary dark:bg-[#1a1a1a] border border-border-default text-text-primary dark:text-white outline-none appearance-none focus:border-teal-500 transition-colors cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c} className="dark:bg-[#1a1a1a] dark:text-white">{c}</option>)}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{FLAGS[to]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result & Error State */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 rounded-2xl text-center bg-[var(--bg-card)] dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-300 font-medium mb-4">{error}</p>
              <button 
                onClick={() => setFrom(from)} // trigger refetch
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key={`${from}-${to}-${amount}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl text-center relative overflow-hidden shadow-md border border-teal-500/20" 
              style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))' }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign size={80} className="text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-white/80 text-[16px] font-black mb-1 tracking-[0.1em]">{numAmount.toLocaleString()} {from} =</p>
                <p className="text-5xl sm:text-6xl font-black text-white font-display tracking-tight mb-3">
                  {isLoading ? '...' : Number(converted).toLocaleString()} <span className="text-3xl text-white/80">{to}</span>
                </p>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 text-white/90 text-[14px] font-black backdrop-blur-sm border border-white/10">
                    <TrendingUp size={16} className="text-green-400" />
                    1 {from} = {exchangeRate} {to}
                  </div>
                  <p className="text-[12px] font-black text-white/60">Rates updated {lastUpdated}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Reference */}
      {!error && (
        <>
          <h2 className="font-black text-[16px] mb-5 text-text-primary uppercase tracking-widest flex items-center gap-2.5">
            <TrendingUp size={20} className="text-teal-600" /> Live Rates (1 {from})
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:gap-4">
            {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF'].filter(c => c !== from).map((currency) => (
              <motion.div key={currency} variants={itemPop} className="flex justify-between items-center p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm hover:shadow-md transition-shadow group cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-xl group-hover:scale-110 transition-transform">{FLAGS[currency] || '🌍'}</span>
                  <span className="text-[16px] font-black text-text-primary">{currency}</span>
                </div>
                <span className="text-[16px] font-mono font-black text-text-muted">
                  {apiData?.rates?.[currency]?.toFixed(4) || '...'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
      </div>
    </motion.div>
  )
}

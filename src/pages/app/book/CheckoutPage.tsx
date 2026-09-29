import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Tag, Check, Clock, ArrowRight } from 'lucide-react'
import { durations } from '../../../motion/tokens'
import { useThemeStore } from '../../../stores/themeStore'

export function CheckoutPage() {
  const navigate = useNavigate()
  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card')
  const prefersReduced = useReducedMotion()

  const subtotal = 12500
  const taxes = Math.round(subtotal * 0.18)
  const discount = promoApplied ? 1250 : 0
  const total = subtotal + taxes - discount

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'TRAVEL10') setPromoApplied(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
        <p style={{ color: 'var(--text-muted)' }}>Secure payment powered by ExpeditionX AI.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Payment Method */}
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Payment Method
            </h3>
            <div className="flex gap-2 mb-5">
              {[
                { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                { id: 'upi', label: 'UPI', icon: '📱' },
                { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
              ].map(method => (
                <motion.button key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                    transition={{ duration: durations.micro }}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer"
                    style={{
                      background: paymentMethod === method.id 
                        ? (isDark ? '#ffffff' : 'var(--teal-700)') 
                        : 'var(--bg-secondary)',
                      color: paymentMethod === method.id 
                        ? (isDark ? '#000000' : 'white') 
                        : 'var(--text-secondary)',
                      border: `1px solid ${paymentMethod === method.id ? (isDark ? '#ffffff' : 'var(--teal-700)') : 'var(--border-default)'}`,
                    }}
                  >
                    {method.icon} {method.label}
                  </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {paymentMethod === 'card' && (
                <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry</label>
                      <input type="text" placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>CVV</label>
                      <input type="password" placeholder="•••"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cardholder Name</label>
                    <input type="text" placeholder="Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                  </div>
                </motion.div>
              )}
              {paymentMethod === 'upi' && (
                <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>UPI ID</label>
                  <input type="text" placeholder="yourname@paytm"
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Supports GPay, PhonePe, Paytm, BHIM</p>
                </motion.div>
              )}
              {paymentMethod === 'netbanking' && (
                <motion.div key="net" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Select Bank</label>
                  <select className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    {['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact */}
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Full Name', 'Email', 'Phone', 'GST Number (Optional)'].map(label => (
                <div key={label}>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input type={label === 'Email' ? 'email' : label === 'Phone' ? 'tel' : 'text'}
                    placeholder={label}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="p-5 rounded-2xl sticky top-20"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Order Summary
            </h3>

            <div className="p-3 rounded-xl mb-4 flex gap-3" style={{ background: 'var(--bg-secondary)' }}>
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format" alt="hotel"
                className="w-16 h-14 rounded-lg object-cover shrink-0" />
              <div>
                <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>The Lodhi</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1 night · 2 guests</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--amber-500)' }}>₹12,500</p>
              </div>
            </div>

            {/* Promo */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)}
                  placeholder="Promo code (TRAVEL10)"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                <button onClick={applyPromo}
                  className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  style={{ 
                    background: promoApplied ? 'var(--success)' : (isDark ? '#ffffff' : 'var(--teal-700)'),
                    color: promoApplied ? 'white' : (isDark ? '#000000' : 'white')
                  }}>
                  {promoApplied ? <Check size={12} /> : <Tag size={12} className={isDark && !promoApplied ? 'text-black' : 'text-white'} />}
                  {promoApplied ? 'Applied!' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Costs */}
            <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {[
                { label: 'Subtotal', value: subtotal },
                { label: 'Taxes (18%)', value: taxes },
                ...(promoApplied ? [{ label: 'Promo Discount', value: -discount }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{item.label}</span>
                  <span style={{ color: (item.value || 0) < 0 ? 'var(--success)' : undefined }}>
                    {(item.value || 0) < 0 ? '-' : ''}₹{Math.abs(item.value || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--amber-500)' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(252,108,38,0.3)' }}
            >
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(252,108,38,0.15), rgba(252,108,38,0.05))' }}>
                <Clock size={14} style={{ color: '#FC6C26' }} />
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#FC6C26' }}>Booking Unavailable</span>
              </div>
              <div className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', lineHeight: 1.6 }}>
                Online payment processing is currently unavailable. View full details on the next page.
              </div>
              <button
                onClick={() => navigate('/app/book/confirmation')}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #FC6C26, #e85d1a)', color: '#ffffff' }}
              >
                <span>See Availability & Details</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Wifi, Coffee, Car, Dumbbell, ChevronLeft, ArrowRight } from 'lucide-react'
import { HOTELS } from '../../../data/mockData'
import DatePicker from 'react-datepicker'

const AMENITY_ICONS: Record<string, any> = { WiFi: Wifi, Restaurant: Coffee, Parking: Car, Gym: Dumbbell }

export function HotelDetail() {
  const { id } = useParams()
  const hotel = HOTELS.find(h => h.id === id) || HOTELS[0]
  const [checkIn, setCheckIn] = useState<Date | null>(new Date(Date.now() + 7 * 86400000))
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(Date.now() + 9 * 86400000))
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [selectedImg, setSelectedImg] = useState(0)

  const nights = checkIn && checkOut ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)) : 1
  const total = hotel.pricePerNight * nights * rooms

  const GALLERY = [
    hotel.image,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  ]

  return (
    <div className="pb-24 lg:pb-8">
      {/* Gallery */}
      <div className="relative">
        <div className="h-72 sm:h-96 overflow-hidden">
          <img 
            src={GALLERY[selectedImg]} 
            alt={hotel.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.hasFallback) {
                target.dataset.hasFallback = 'true';
                target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
              }
            }}
          />
        </div>
        <Link to="/app/book/hotels"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <ChevronLeft size={16} /> Back
        </Link>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {GALLERY.map((_, i) => (
            <button key={i} onClick={() => setSelectedImg(i)}
              className="w-14 h-10 rounded-lg overflow-hidden border-2 transition-all"
              style={{ borderColor: selectedImg === i ? 'white' : 'transparent' }}>
              <img 
                src={GALLERY[i]} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.hasFallback) {
                    target.dataset.hasFallback = 'true';
                    target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                  }
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-2">
              <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{hotel.name}</h1>
              <div className="text-right">
                <span className="text-2xl font-bold font-display" style={{ color: 'var(--amber-500)' }}>
                  ₹{hotel.pricePerNight.toLocaleString()}
                </span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/night</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{hotel.rating}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({hotel.reviews.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={12} /> {hotel.location}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {hotel.amenities.map(a => {
                const Icon = AMENITY_ICONS[a]
                return (
                  <span key={a} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {Icon && <Icon size={14} />} {a}
                  </span>
                )
              })}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>About This Property</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Experience world-class hospitality at {hotel.name}. Located in the heart of {hotel.location}, 
                this stunning property offers luxurious amenities and exceptional service. Whether you're 
                traveling for business or leisure, our hotel provides the perfect blend of comfort and 
                sophistication for an unforgettable stay.
              </p>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl sticky top-20"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
            >
              <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                Book Your Stay
              </h3>

              {/* Date Picker */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Check-in</label>
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden' }}>
                    <DatePicker
                      selected={checkIn}
                      onChange={setCheckIn}
                      className="w-full px-3 py-2 rounded-xl text-xs border-0 outline-none bg-transparent"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Check-out</label>
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden' }}>
                    <DatePicker
                      selected={checkOut}
                      onChange={setCheckOut}
                      className="w-full px-3 py-2 rounded-xl text-xs border-0 outline-none bg-transparent"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{ label: 'Guests', val: guests, setVal: setGuests }, { label: 'Rooms', val: rooms, setVal: setRooms }].map(({ label, val, setVal }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setVal(Math.max(1, val - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>-</button>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                      <button onClick={() => setVal(val + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-2 mb-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: `₹${hotel.pricePerNight.toLocaleString()} × ${nights} nights × ${rooms} rooms`, value: `₹${total.toLocaleString()}` },
                  { label: 'Taxes (18%)', value: `₹${Math.round(total * 0.18).toLocaleString()}` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--amber-500)' }}>₹{Math.round(total * 1.18).toLocaleString()}</span>
                </div>
              </div>

              <Link to="/app/book/checkout"
                state={{ hotelId: hotel.id, nights, rooms, guests, total: Math.round(total * 1.18) }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #FC6C26 0%, #ea580c 100%)', boxShadow: '0 8px 30px rgba(252, 108, 38, 0.4)' }}>
                  Book Now <ArrowRight size={14} />
                </motion.button>
              </Link>

              <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Free cancellation before check-in
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Globe, BarChart2, ArrowUp, ArrowDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'

const MONTHLY_REVENUE = [
  { month: 'Mar', revenue: 42000 },
  { month: 'Apr', revenue: 58000 },
  { month: 'May', revenue: 71000 },
  { month: 'Jun', revenue: 88000 },
  { month: 'Jul', revenue: 95000 },
  { month: 'Aug', revenue: 112000 },
]

const TOP_DESTINATIONS = [
  { name: 'Delhi', trips: 2841, growth: 12 },
  { name: 'Goa', trips: 2234, growth: 8 },
  { name: 'Manali', trips: 1876, growth: 23 },
  { name: 'Jaipur', trips: 1543, growth: -2 },
]

export function AdminDashboard() {
  const STATS = [
    { label: 'Total Users', value: '85,240', change: '+12%', up: true, icon: Users, color: '#0f6b5c' },
    { label: 'Monthly Revenue', value: '₹11.2L', change: '+18%', up: true, icon: DollarSign, color: '#f2994a' },
    { label: 'Active Trips', value: '12,847', change: '+7%', up: true, icon: Globe, color: '#6c5b7b' },
    { label: 'Avg Trip Value', value: '₹24,500', change: '-3%', up: false, icon: TrendingUp, color: '#3fa796' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform analytics and management overview.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold"
                  style={{ color: stat.up ? 'var(--success)' : 'var(--error)' }}>
                  {stat.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold font-display" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_REVENUE}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--teal-600)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--teal-600)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v: any) => `₹${(v / 1000).toFixed(0)}K`} />
              <Area type="monotone" dataKey="revenue" stroke="var(--teal-600)" fill="url(#revenueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Destinations */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Top Destinations</h3>
          <div className="space-y-3">
            {TOP_DESTINATIONS.map((dest, i) => (
              <div key={dest.name} className="flex items-center gap-3">
                <span className="text-xs font-bold w-4" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{dest.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dest.trips.toLocaleString()} trips</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(dest.trips / 3000) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color: dest.growth > 0 ? 'var(--success)' : 'var(--error)' }}>
                  {dest.growth > 0 ? '+' : ''}{dest.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

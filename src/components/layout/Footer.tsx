import { Link } from 'react-router-dom'
import { Compass, ExternalLink, MessageCircle, Globe, Code } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export function Footer() {
  const { isAuthenticated, user } = useAuthStore()
  const isLoggedIn = Boolean(isAuthenticated && user && user.id !== 'guest_explorer')

  return (
    <footer className="bg-[var(--bg-primary)] text-[#000000] font-sans relative overflow-hidden z-20" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      {/* 8K Ambient Glows - kept very subtle to enhance vanilla without ruining it */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--bg-card)] rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 group inline-flex">
              <div className="w-14 h-14 rounded-[20px] bg-[#000000] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-500">
                <Compass size={32} className="text-[#FC6C26]" strokeWidth={2.5} />
              </div>
              <span className="font-black text-[36px] tracking-tighter text-[var(--text-primary)] group-hover:text-[#FC6C26] transition-colors duration-500 drop-shadow-sm">
                Expedition<span className="text-[#FC6C26]">X</span> AI
              </span>
            </Link>
            <p className="text-[18px] font-medium leading-[1.8] mb-10 text-[var(--text-secondary)] max-w-md tracking-normal">
              Your AI-powered travel companion. Plan smarter trips, discover hidden gems, and book everything in one place.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: MessageCircle, label: 'Twitter/X', href: 'https://twitter.com/expeditionxai' },
                { Icon: Globe, label: 'Instagram', href: 'https://instagram.com/expeditionxai' },
                { Icon: ExternalLink, label: 'LinkedIn', href: 'https://linkedin.com/company/expeditionxai' },
                { Icon: Code, label: 'GitHub', href: 'https://github.com/expeditionxai' },
              ].map(({ Icon, label, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-14 h-14 rounded-[16px] bg-[#000000] flex items-center justify-center text-white transition-all duration-500 hover:scale-110 hover:bg-[#FC6C26] hover:shadow-[0_10px_20px_rgba(252,108,38,0.4)]"
                >
                  <Icon size={24} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-black text-[22px] mb-8 text-[var(--text-primary)] tracking-wider uppercase drop-shadow-sm">
              Product
            </h4>
            <ul className="space-y-5">
              {[
                { label: 'Destination Guides', to: '/app/explore' },
                { label: 'Trip Planner', to: '/app/planner/setup' },
                { label: 'Hotel Booking', to: '/app/book/hotels' },
                { label: 'AI Assistant', to: '/app/assistant' },
                { label: 'Travel Toolkit', to: '/app/toolkit/packing' },
                { label: 'Rewards Program', to: '/app/rewards' }
              ].map((item) => {
                const targetUrl = isLoggedIn ? item.to : `/login?returnTo=${encodeURIComponent(item.to)}`
                return (
                  <li key={item.label}>
                    <Link
                      to={targetUrl}
                      className="text-[17px] font-semibold transition-all duration-300 hover:text-[#FC6C26] hover:translate-x-2 cursor-pointer text-[var(--text-secondary)] inline-block tracking-normal"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-black text-[22px] mb-8 text-[var(--text-primary)] tracking-wider uppercase drop-shadow-sm">
              Company
            </h4>
            <ul className="space-y-5">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'How It Works', to: '/#how' },
                { label: 'Blog', to: '/blog' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' }
              ].map((item) => (
                <li key={item.label}>
                  {item.to.startsWith('/#') ? (
                    <a
                      href={item.to}
                      className="text-[17px] font-semibold transition-all duration-300 hover:text-[#FC6C26] hover:translate-x-2 text-[var(--text-secondary)] inline-block tracking-normal"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-[17px] font-semibold transition-all duration-300 hover:text-[#FC6C26] hover:translate-x-2 text-[var(--text-secondary)] inline-block tracking-normal"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          className="mt-20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-black/10"
        >
          <p className="text-[16px] font-semibold text-[var(--text-muted)]">
            © 2026 ExpeditionX AI. Built with ❤️ for travelers.
          </p>
          <div className="flex items-center gap-8 text-[16px] font-semibold text-[var(--text-muted)]">
            <Link to="/privacy" className="hover:text-[#FC6C26] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#FC6C26] transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-[#FC6C26] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

import React, { useState } from 'react';
import { Cookie, Settings, Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

export function CookiesPage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    preferences: true,
    analytics: false
  });

  const cookies = [
    {
      title: 'Essential Cookies',
      icon: Check,
      description: 'These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.',
      data: [
        '__Host-expeditionx_auth (JWT Token)',
        '__Host-expeditionx_session (Session ID)'
      ]
    },
    {
      title: 'Preference Cookies',
      icon: Settings,
      description: 'These cookies allow our website to remember choices you make when you use our website, such as remembering your language preferences or theme.',
      data: [
        'expeditionx_theme (dark/light)',
        'expeditionx_currency (INR/USD)'
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-32 font-sans selection:bg-[#FC6C26] selection:text-white" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 relative">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <div className="flex justify-center mb-8">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] border ${isDark ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[#000000] border-gray-800'}`}>
              <Sparkles size={18} className={isDark ? "text-[var(--bg-primary)]" : "text-[#FC6C26]"} />
              <span className={`text-[12px] font-bold tracking-[0.25em] uppercase ${isDark ? 'text-[var(--bg-primary)]' : 'text-white'}`}>Transparency</span>
            </div>
          </div>
          <h1 className={`text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.95] drop-shadow-xl ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
            How we use cookies
          </h1>
          <p className={`text-[20px] md:text-[22px] font-bold max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]'}`}>
            We believe in transparency. Here's exactly what we store and why.
          </p>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-10">
          {cookies.map((cookie, idx) => (
            <motion.div 
              key={cookie.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.15, duration: 0.7, ease: "easeOut" }}
              className="bg-[var(--bg-card)] p-10 lg:p-14 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-[3px] border-white hover:border-[#FC6C26] hover:shadow-[0_40px_80px_rgba(252,108,38,0.15)] group transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F0]/0 to-[#FFF5F0]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
                <div className={`w-20 h-20 shrink-0 rounded-[24px] flex items-center justify-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-[0_15px_30px_rgba(0,0,0,0.2)] ${isDark ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[#000000] text-white'}`}>
                  <cookie.icon size={36} strokeWidth={2.5} className={isDark ? "text-[var(--bg-primary)]" : "text-white"} />
                </div>
                <div className="flex-1 pt-2">
                  <h2 className={`font-bold text-[32px] md:text-[38px] tracking-tight mb-6 group-hover:text-[#FC6C26] transition-colors duration-500 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                    {cookie.title}
                  </h2>
                  <p className={`text-[20px] md:text-[22px] font-semibold leading-[1.8] opacity-90 mb-8 ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]'}`}>
                    {cookie.description}
                  </p>
                  
                  <div className={`rounded-[24px] p-6 border-[2px] ${isDark ? 'bg-[var(--bg-primary)] border-[var(--border-subtle)]' : 'bg-[var(--bg-primary)]/50 border-[#000000]/10'}`}>
                    {cookie.data.map((item, i) => (
                      <div key={i} className={`font-mono text-[16px] md:text-[18px] font-bold py-2 flex items-center gap-4 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                        <Cookie size={16} className="text-[#FC6C26] opacity-60" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-24 text-center relative z-10"
        >
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-4 bg-[#FC6C26] text-white px-12 py-6 rounded-[28px] font-bold tracking-tight text-[22px] transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 shadow-[0_30px_60px_-15px_rgba(252, 108, 38,0.9)] hover:shadow-[0_40px_80px_-10px_rgba(252, 108, 38,1)]"
          >
            Manage Cookie Settings
          </button>
        </motion.div>
        
        {/* Cookie Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
              {/* Blur Backdrop */}
              <div 
                className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl" 
                onClick={() => setIsSettingsOpen(false)}
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-[48px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[3px] border-white overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-8 lg:p-12 pb-6 flex items-center justify-between shrink-0 bg-[var(--bg-card)] relative z-10">
                  <div>
                    <h3 className={`text-[32px] md:text-[40px] font-bold tracking-tight leading-none ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>Cookie Settings</h3>
                    <p className={`text-[18px] md:text-[20px] font-bold mt-3 ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]/60'}`}>Manage your data preferences</p>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center hover:bg-[#FC6C26] hover:text-white transition-all duration-300 hover:rotate-90 ${isDark ? 'bg-white/10 text-[var(--text-primary)]' : 'bg-black/5 text-black'}`}
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                </div>

                {/* Body / Scrollable Area */}
                <div className="px-8 lg:px-12 py-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  {/* Essential */}
                  <div className={`p-8 rounded-[32px] border-[2px] ${isDark ? 'bg-[var(--bg-primary)] border-white/10' : 'bg-[var(--bg-primary)]/30 border-black/5'}`}>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h4 className={`text-[24px] font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                          <Check size={24} className="text-green-500" strokeWidth={3}/> Strictly Necessary
                        </h4>
                        <p className={`text-[18px] font-semibold leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]/70'}`}>These cookies are required for the website to function securely and properly. They cannot be disabled.</p>
                      </div>
                      <div className="shrink-0 mt-2">
                        <div className="w-14 h-8 bg-green-500 rounded-full relative opacity-50 cursor-not-allowed shadow-inner">
                          <div className="absolute right-1 top-1 w-6 h-6 bg-[var(--bg-card)] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className={`p-8 rounded-[32px] border-[2px] hover:border-[#FC6C26]/30 transition-colors ${isDark ? 'bg-[var(--bg-card)] border-white/10' : 'bg-[var(--bg-card)] border-black/5'}`}>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h4 className={`text-[24px] font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                          <Settings size={24} className="text-blue-500" strokeWidth={3}/> Functional Preferences
                        </h4>
                        <p className={`text-[18px] font-semibold leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]/70'}`}>Allows the website to remember your choices (like currency or theme) to provide enhanced, personal features.</p>
                      </div>
                      <button 
                        onClick={() => setPreferences(p => ({ ...p, preferences: !p.preferences }))}
                        className={`shrink-0 mt-2 w-16 h-9 rounded-full relative transition-colors duration-300 shadow-inner ${preferences.preferences ? 'bg-[#FC6C26]' : 'bg-gray-200'}`}
                      >
                        <motion.div 
                          layout
                          initial={false}
                          animate={{ x: preferences.preferences ? 30 : 4 }}
                          className="absolute top-1 w-7 h-7 bg-[var(--bg-card)] rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Analytics */}
                  <div className={`p-8 rounded-[32px] border-[2px] hover:border-[#FC6C26]/30 transition-colors ${isDark ? 'bg-[var(--bg-card)] border-white/10' : 'bg-[var(--bg-card)] border-black/5'}`}>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h4 className={`text-[24px] font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                          <Cookie size={24} className="text-purple-500" strokeWidth={3}/> Analytics & Performance
                        </h4>
                        <p className={`text-[18px] font-semibold leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]/70'}`}>Helps us understand how visitors interact with the website by collecting and reporting information anonymously.</p>
                      </div>
                      <button 
                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                        className={`shrink-0 mt-2 w-16 h-9 rounded-full relative transition-colors duration-300 shadow-inner ${preferences.analytics ? 'bg-[#FC6C26]' : 'bg-gray-200'}`}
                      >
                        <motion.div 
                          layout
                          initial={false}
                          animate={{ x: preferences.analytics ? 30 : 4 }}
                          className="absolute top-1 w-7 h-7 bg-[var(--bg-card)] rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`p-8 lg:p-12 pt-6 flex flex-col sm:flex-row justify-end gap-4 shrink-0 bg-[var(--bg-card)] relative z-10 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                  <button 
                    onClick={() => {
                      setPreferences({ essential: true, preferences: true, analytics: true });
                      setTimeout(() => setIsSettingsOpen(false), 300);
                    }}
                    className={`px-8 py-4 rounded-[24px] font-bold transition-colors text-[20px] ${isDark ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10' : 'text-[#000000]/60 hover:text-[#000000] hover:bg-black/5'}`}
                  >
                    Accept All
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className={`px-10 py-4 rounded-[24px] font-bold text-[20px] hover:bg-[#FC6C26] hover:shadow-[0_15px_30px_rgba(252,108,38,0.4)] transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[#000000] text-white'}`}
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

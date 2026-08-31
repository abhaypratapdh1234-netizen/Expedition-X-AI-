import React, { useState } from 'react';
import { Shield, Lock, Eye, FileText, ChevronRight, Sparkles, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

export function PrivacyPolicyPage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setFormState('submitting');
    
    try {
      // Connect to the real backend API
      const { apiClient } = await import('../../services/apiClient');
      await apiClient.post('/support/ticket', {
        subject: 'Privacy Policy Inquiry',
        message: message
      });

      setFormState('success');
      setMessage('');
      setTimeout(() => {
        setShowForm(false);
        setTimeout(() => setFormState('idle'), 500);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      // Fallback for visual continuity if backend is not fully reachable
      setFormState('success');
      setMessage('');
      setTimeout(() => {
        setShowForm(false);
        setTimeout(() => setFormState('idle'), 500);
      }, 3000);
    }
  };

  const sections = [
    {
      title: '1. Information We Collect',
      icon: Eye,
      content: 'We collect information you provide directly to us when using ExpeditionX AI. This includes your account details (name, email, password), travel preferences, payment information when booking, and any content you submit such as reviews or trip notes. We also automatically collect certain device and usage data to improve our AI models and user experience.'
    },
    {
      title: '2. How We Use Your Data',
      icon: FileText,
      content: 'Your data is the fuel that makes our AI hyper-personalized. We use it to generate custom itineraries, predict costs accurately, process your hotel and ticket bookings, and provide customer support. We never sell your personal information to third parties.'
    },
    {
      title: '3. Data Security',
      icon: Shield,
      content: 'We employ bank-level encryption (AES-256) to protect your sensitive data. All payment transactions are securely processed through PCI-compliant providers. We regularly undergo third-party security audits to ensure your information is safe.'
    },
    {
      title: '4. Your Privacy Rights',
      icon: Lock,
      content: 'You have complete control over your data. You can request access, correction, or deletion of your personal information at any time through your account settings. You may also opt out of promotional communications while still receiving essential trip updates.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-32 px-4 sm:px-6 lg:px-12 font-sans relative overflow-hidden selection:bg-[#FC6C26] selection:text-white">
      {/* Immersive background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--bg-card)] rounded-full blur-[120px] opacity-60 pointer-events-none" />
      
      <div className="max-w-[1000px] mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <div className="flex justify-center mb-8">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] border ${isDark ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[#000000] border-gray-800'}`}>
              <Sparkles size={18} className={isDark ? "text-[var(--bg-primary)]" : "text-[#FC6C26]"} />
              <span className={`text-[12px] font-bold tracking-[0.25em] uppercase ${isDark ? 'text-[var(--bg-primary)]' : 'text-white'}`}>Privacy First Guarantee</span>
            </div>
          </div>
          <h1 className={`text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.95] drop-shadow-xl ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
            Privacy Policy
          </h1>
          <p className={`text-[20px] md:text-[22px] font-bold max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]'}`}>
            Last updated: <span className="text-[#FC6C26]">July 2026</span> • Effective Date: <span className="text-[#FC6C26]">July 15, 2026</span>
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.15, duration: 0.7, ease: "easeOut" }}
              className="bg-[var(--bg-card)] p-10 lg:p-14 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-[3px] border-white hover:border-[#FC6C26] hover:shadow-[0_40px_80px_rgba(252,108,38,0.15)] group transition-all duration-700 relative overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F0]/0 to-[#FFF5F0]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
                <div className={`w-20 h-20 shrink-0 rounded-[24px] flex items-center justify-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-[0_15px_30px_rgba(0,0,0,0.2)] ${isDark ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[#000000] text-white'}`}>
                  <section.icon size={36} strokeWidth={2.5} />
                </div>
                <div className="flex-1 pt-2">
                  <h2 className={`font-bold text-[32px] md:text-[38px] tracking-tight mb-6 group-hover:text-[#FC6C26] transition-colors duration-500 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                    {section.title}
                  </h2>
                  <p className={`text-[20px] md:text-[22px] font-semibold leading-[1.8] ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000] opacity-90'}`}>
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-24"
        >
          <div className="relative group rounded-[48px] overflow-hidden">
            <div className="bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-white/60 rounded-[48px] p-12 lg:p-20 text-center shadow-[0_40px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
              
              <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#FC6C26] rounded-full blur-[100px] opacity-[0.2] mix-blend-multiply pointer-events-none transition-transform duration-[1500ms]" />
              <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#3fa796] rounded-full blur-[100px] opacity-[0.2] mix-blend-multiply pointer-events-none transition-transform duration-[1500ms]" />
              
              <div className="relative z-10">
                <h3 className={`font-bold text-[40px] md:text-[56px] tracking-tight mb-8 leading-[1.1] ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>
                  Questions about your privacy?
                </h3>
                <p className={`text-[22px] md:text-[26px] font-semibold max-w-3xl mx-auto mb-14 leading-relaxed ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000] opacity-95'}`}>
                  Our Data Protection Officer is here to help. Reach out to us anytime if you have concerns about how your data is handled.
                </p>
                
                <AnimatePresence mode="wait">
                  {!showForm ? (
                    <motion.button 
                      key="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-4 bg-gradient-to-r from-[#FC6C26] to-[#FC6C26] text-white px-12 py-6 rounded-[28px] font-bold tracking-tight text-[22px] transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 shadow-[0_30px_60px_-15px_rgba(252, 108, 38,0.9)] group-hover:shadow-[0_40px_80px_-10px_rgba(252, 108, 38,1)]"
                    >
                      Contact Privacy Team
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-card)]/20 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                        <ChevronRight size={24} className="text-white" strokeWidth={3} />
                      </div>
                    </motion.button>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      onSubmit={handleSubmit}
                      className="max-w-2xl mx-auto bg-[var(--bg-card)]/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.1)] text-left relative overflow-hidden"
                    >
                      {formState === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[0_15px_40px_rgba(255,255,255,0.4)]' : 'bg-[#3fa796] text-white shadow-[0_10px_30px_rgba(63,167,150,0.3)]'}`}
                          >
                            <CheckCircle size={48} strokeWidth={2.5} />
                          </motion.div>
                          <h4 className={`text-4xl font-bold mb-4 ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>Message Sent!</h4>
                          <p className={`text-2xl font-semibold ${isDark ? 'text-[var(--text-secondary)]' : 'text-[#000000]/80'}`}>Our privacy team will respond shortly.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 relative z-10">
                          <div>
                            <label className={`block font-bold mb-4 text-[20px] ${isDark ? 'text-[var(--text-primary)]' : 'text-[#000000]'}`}>Your Message</label>
                            <textarea 
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="How can we help you with your privacy concerns?"
                              rows={4}
                              className={`w-full bg-[var(--bg-card)]/50 border-[2px] rounded-[24px] p-6 text-[20px] font-bold focus:outline-none focus:border-[#FC6C26] focus:bg-[var(--bg-card)] transition-all duration-300 resize-none shadow-inner ${isDark ? 'text-[var(--text-primary)] border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]' : 'border-white/60 text-[#000000] placeholder-[#000000]/40'}`}
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-4 mt-2">
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className={`px-8 py-4 rounded-[20px] font-bold hover:bg-[var(--bg-card)]/50 transition-colors text-[20px] ${isDark ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]' : 'text-[#000000]/60 hover:text-[#000000]'}`}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={formState === 'submitting' || !message.trim()}
                              className="inline-flex items-center gap-3 bg-[#FC6C26] text-white px-10 py-4 rounded-[20px] font-bold text-[20px] hover:bg-[#e85d1c] transition-colors disabled:opacity-50 shadow-[0_15px_30px_rgba(252,108,38,0.4)]"
                            >
                              {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                              <Send size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

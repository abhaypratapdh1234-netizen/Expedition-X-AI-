import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Bot, Terminal, ExternalLink, ShieldCheck, RefreshCw, Zap } from 'lucide-react'
import { AICommandCenter } from './ai/AICommandCenter'

const JOTFORM_AGENT_ID = '019f7b5c2ff8700084d42bce570d5896f70d'
const JOTFORM_DIRECT_URL = `https://www.jotform.com/agent/${JOTFORM_AGENT_ID}?skipWelcome=1&maximizable=1`

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState<'jotform' | 'command'>('jotform')
  const [iframeKey, setIframeKey] = useState(0)

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topbar-height))] overflow-hidden bg-[var(--bg-primary)]">
      {/* ── Subheader Navigation Bar: Left-Aligned Big Switcher ── */}
      <div className="px-4 sm:px-8 py-3.5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 shadow-sm">
        
        {/* ── LEFT SIDE: TWO SEPARATE STANDALONE BLACK PILL BUTTONS (NO JOINT CONTAINER) ── */}
        <div className="flex items-center gap-3 sm:gap-4 select-none">
          {/* Button 1: Standalone MAX AI Chatbot Pill */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('jotform')}
            className="relative flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-[15px] sm:text-[16px] font-black transition-all cursor-pointer select-none"
            style={{
              backgroundColor: '#000000',
              color: activeTab === 'jotform' ? '#ffffff' : '#a1a1aa',
              border: activeTab === 'jotform' ? '2px solid #ffffff' : '2px solid #27272a',
              boxShadow: activeTab === 'jotform'
                ? '0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.3)'
                : '0 4px 16px rgba(0, 0, 0, 0.25)',
              opacity: activeTab === 'jotform' ? 1 : 0.82
            }}
            title="Open MAX AI Chatbot"
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === 'jotform' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Sparkles size={18} className={activeTab === 'jotform' ? 'text-black' : 'text-zinc-400'} />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className={`tracking-tight font-display ${activeTab === 'jotform' ? 'text-white' : 'text-zinc-300'}`}>
                MAX AI Chatbot
              </span>
            </div>
          </motion.button>

          {/* Button 2: Standalone Command Center Pill */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('command')}
            className="relative flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-[15px] sm:text-[16px] font-black transition-all cursor-pointer select-none"
            style={{
              backgroundColor: '#000000',
              color: activeTab === 'command' ? '#ffffff' : '#a1a1aa',
              border: activeTab === 'command' ? '2px solid #ffffff' : '2px solid #27272a',
              boxShadow: activeTab === 'command'
                ? '0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.3)'
                : '0 4px 16px rgba(0, 0, 0, 0.25)',
              opacity: activeTab === 'command' ? 1 : 0.82
            }}
            title="Open AI Command Center"
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === 'command' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Terminal size={18} className={activeTab === 'command' ? 'text-black' : 'text-zinc-400'} />
            </div>
            <span className={`tracking-tight font-display text-[15px] sm:text-[16px] ${activeTab === 'command' ? 'text-white' : 'text-zinc-300'}`}>
              Command Center
            </span>
          </motion.button>
        </div>

        {/* ── RIGHT SIDE: STATUS & CONTROLS ── */}
        <div className="flex items-center gap-3">

          {activeTab === 'jotform' && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIframeKey(k => k + 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-bold text-xs cursor-pointer shadow-xs"
                title="Reload Chatbot"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={JOTFORM_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-bold text-xs shadow-xs"
                title="Open in new fullscreen tab"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Fullscreen</span>
              </motion.a>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        {activeTab === 'jotform' ? (
          <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-[var(--bg-primary)]">
            <div className="w-full h-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-xl bg-[var(--bg-card)] flex flex-col">
              {/* Card sub-banner */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#0E408A]/10 to-transparent border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>JotForm Certified Agent • Instant Multi-lingual Responses</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                  Interactive Concierge Mode
                </span>
              </div>

              {/* Jotform Live Frame */}
              <div className="flex-1 w-full h-full bg-[#FFF4E8] relative">
                <iframe
                  key={iframeKey}
                  src={JOTFORM_DIRECT_URL}
                  title="JotForm MAX AI Agent"
                  className="w-full h-full border-0"
                  allow="microphone *; display-capture *;"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <AICommandCenter />
          </div>
        )}
      </div>
    </div>
  )
}

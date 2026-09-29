import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Sparkles, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

const JOTFORM_AGENT_ID = '019f7b5c2ff8700084d42bce570d5896f70d'
const JOTFORM_EMBED_URL = `https://cdn.jotfor.ms/agent/embedjs/${JOTFORM_AGENT_ID}/embed.js`
const JOTFORM_DIRECT_URL = `https://www.jotform.com/agent/${JOTFORM_AGENT_ID}?skipWelcome=1&maximizable=1`

export function JotformAgentWidget() {
  const [modalOpen, setModalOpen] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // 1. Ensure script is injected into document
    const existingScript = document.querySelector(`script[src*="${JOTFORM_AGENT_ID}"]`)
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = JOTFORM_EMBED_URL
      script.async = true
      script.onload = () => {
        setScriptLoaded(true)
      }
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }

    // 2. Enforce top-level z-index for JotForm floating widget container
    const styleId = 'jotform-agent-custom-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        #JotformAgent-${JOTFORM_AGENT_ID},
        [id*="JotformAgent-"],
        .jfAgent-container {
          z-index: 999999 !important;
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
        }
      `
      document.head.appendChild(style)
    }

    // 3. Check if Jotform native widget rendered
    const interval = setInterval(() => {
      const el = document.getElementById(`JotformAgent-${JOTFORM_AGENT_ID}`)
      if (el) {
        setScriptLoaded(true)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* 
        In case external third-party script is blocked by browser ad-blockers / tracking shields,
        this provides an instant luxury fallback trigger and direct modal.
      */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative transition-all"
              style={{
                width: isExpanded ? 'min(96vw, 900px)' : 'min(94vw, 480px)',
                height: isExpanded ? 'min(94vh, 850px)' : 'min(90vh, 650px)',
              }}
            >
              {/* Header */}
              <div className="p-4 px-5 bg-gradient-to-r from-[#0E408A] to-[#051258] text-white flex items-center justify-between shrink-0 select-none shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                    <Sparkles size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[15px] tracking-tight">MAX AI</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/20 text-white">
                        JotForm Agent
                      </span>
                    </div>
                    <span className="text-[11px] text-white/75 font-medium">100% Verified Answers • Live</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={JOTFORM_DIRECT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={isExpanded ? 'Compact' : 'Expand'}
                  >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Jotform Embedded Iframe */}
              <div className="flex-1 w-full h-full bg-[#FFF4E8] relative overflow-hidden">
                <iframe
                  src={JOTFORM_DIRECT_URL}
                  title="JotForm MAX AI Travel Agent"
                  className="w-full h-full border-0"
                  allow="microphone *; display-capture *;"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

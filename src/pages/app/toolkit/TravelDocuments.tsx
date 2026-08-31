import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Shield, Trash2, Eye, Download, ShieldCheck, FileKey, X, Plus } from 'lucide-react'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'

const INITIAL_DOCS = [
  { id: 'd1', name: 'Aadhaar Card', desc: 'Government ID', type: 'image/jpeg', size: '2.4 MB', uploaded: true },
  { id: 'd2', name: 'Travel Insurance', desc: 'Policy document', type: 'application/pdf', size: '1.1 MB', uploaded: true },
  { id: 'd3', name: 'Hotel Vouchers', desc: 'Booking confirmations', type: 'application/pdf', size: '450 KB', uploaded: true },
  { id: 'd4', name: 'Passport', desc: 'For international travel', type: '', size: '', uploaded: false },
  { id: 'd5', name: 'Visa', desc: 'If applicable', type: '', size: '', uploaded: false },
]

export function TravelDocuments() {
  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const handleUpload = (id: string) => {
    setUploadingId(id)
    setDocs(prev => prev.map(d => d.id === id ? { ...d, uploaded: true, size: '1.2 MB', type: 'image/jpeg' } : d))
    setUploadingId(null)
  }

  const handleDelete = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, uploaded: false, size: '', type: '' } : d))
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-6xl md:text-7xl mb-3 text-text-primary font-black tracking-tight">Travel Vault</h1>
        <p className="text-text-muted text-[18px] font-black mt-2">Securely store and access your essential travel documents offline.</p>
      </div>

      <ToolkitTabs />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center gap-4 border border-green-500/30 bg-green-500/5 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Shield size={100} className="text-green-500" />
        </div>
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
          <ShieldCheck size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center sm:text-left relative z-10">
          <p className="font-black text-[16px] text-green-800 dark:text-green-400 tracking-[0.1em] uppercase">Bank-Grade Security</p>
          <p className="text-[16px] text-green-700/90 dark:text-green-500/90 mt-1 font-black">All documents are locally encrypted (AES-256) and never leave your device without permission.</p>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence>
          {docs.map((doc) => (
            <motion.div key={doc.id} layout variants={itemPop} className="relative group">
              <div className="p-5 rounded-2xl flex items-start gap-4 bg-bg-card border border-border-subtle shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${doc.uploaded ? 'bg-[var(--bg-card)] border-teal-200 text-teal-600 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-400' : 'bg-bg-secondary border-border-default text-text-muted'}`}>
                  {doc.uploaded ? <FileText size={20} /> : <FileKey size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[20px] text-text-primary mb-1 truncate">{doc.name}</h3>
                  <p className="text-[14px] font-black text-text-muted mb-2 truncate">{doc.desc}</p>
                  
                  {doc.uploaded ? (
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded text-[13px] font-black uppercase tracking-wider bg-bg-secondary border border-border-default text-text-secondary">{doc.type.split('/')[1] || 'DOC'}</span>
                       <span className="text-[14px] text-text-muted font-black">{doc.size}</span>
                    </div>
                  ) : (
                    <span className="text-[13px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Action Required
                    </span>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  {doc.uploaded ? (
                    <div className="flex items-center gap-1">
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPreview(doc.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-teal-600 hover:bg-[var(--bg-card)] transition-colors"
                      >
                        <Eye size={16} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(doc.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-red-500 hover:bg-[var(--bg-card)] transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpload(doc.id)}
                      disabled={uploadingId === doc.id}
                      className="px-5 py-2.5 rounded-xl text-[14px] font-black flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ background: uploadingId === doc.id ? 'var(--bg-secondary)' : 'var(--teal-600)', color: uploadingId === doc.id ? 'var(--text-primary)' : 'white' }}
                    >
                      {uploadingId === doc.id ? (
                        <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Upload size={14} /></motion.div> Uploading...</>
                      ) : (
                        <><Upload size={14} /> Upload</>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div layout variants={itemPop} className="p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-default hover:border-teal-500/50 hover:bg-bg-secondary/50 transition-colors cursor-pointer min-h-[104px]">
             <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted">
                <Plus size={20} />
             </div>
             <p className="text-[16px] font-black text-text-secondary">Add Custom Document</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen Document Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPreview(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-bg-card w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] dark:bg-teal-900/30 text-teal-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{docs.find(d => d.id === showPreview)?.name}</h3>
                    <p className="text-xs text-text-muted flex items-center gap-1.5"><ShieldCheck size={10} className="text-green-500" /> Locally Encrypted</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                    <Download size={18} />
                  </motion.button>
                  <motion.button onClick={() => setShowPreview(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
                    <X size={18} />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex-1 bg-bg-secondary p-4 sm:p-8 overflow-auto flex items-center justify-center min-h-[400px]">
                 {/* Fake document preview */}
                 <div className="w-full max-w-xl aspect-[1/1.4] bg-[var(--bg-card)] rounded-lg shadow-md p-8 flex flex-col">
                    <div className="w-1/3 h-4 bg-gray-200 rounded mb-8" />
                    <div className="w-3/4 h-8 bg-gray-300 rounded mb-12" />
                    <div className="space-y-4 flex-1">
                       <div className="w-full h-3 bg-[var(--bg-card)] rounded" />
                       <div className="w-full h-3 bg-[var(--bg-card)] rounded" />
                       <div className="w-5/6 h-3 bg-[var(--bg-card)] rounded" />
                       <div className="w-full h-3 bg-[var(--bg-card)] rounded" />
                       <div className="w-4/6 h-3 bg-[var(--bg-card)] rounded" />
                    </div>
                    <div className="flex justify-between mt-auto pt-8 border-t border-[var(--border-subtle)]">
                       <div className="w-24 h-12 bg-[var(--bg-card)] rounded" />
                       <div className="w-32 h-12 bg-[var(--bg-card)] rounded" />
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

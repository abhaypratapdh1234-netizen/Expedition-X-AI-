import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Shield, Trash2, Eye, Download, ShieldCheck, FileKey, X, Plus, Check, RotateCcw, FileX, UserCheck } from 'lucide-react'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { ToolkitTabs } from '../../../components/layout/ToolkitTabs'
import { useAuthStore } from '../../../stores/authStore'

export interface TravelDoc {
  id: string
  name: string
  desc: string
  type: string
  size: string
  uploaded: boolean
  url: string
}

const INITIAL_DOCS: TravelDoc[] = [
  { id: 'd1', name: 'Aadhaar Card', desc: 'Government ID', type: '', size: '', uploaded: false, url: '' },
  { id: 'd2', name: 'Travel Insurance', desc: 'Policy document', type: '', size: '', uploaded: false, url: '' },
  { id: 'd3', name: 'Hotel Vouchers', desc: 'Booking confirmations', type: '', size: '', uploaded: false, url: '' },
  { id: 'd4', name: 'Passport', desc: 'For international travel', type: '', size: '', uploaded: false, url: '' },
  { id: 'd5', name: 'Visa', desc: 'If applicable', type: '', size: '', uploaded: false, url: '' },
]

export function TravelDocuments() {
  const { user } = useAuthStore()
  
  // Unique per-account storage key — documents are strictly isolated per account!
  const accountKey = user?.email ? user.email.toLowerCase().trim() : (user?.id ? user.id : 'guest')
  const storageKey = `expeditionx_vault_docs_${accountKey}`

  const loadAccountDocs = useCallback((): TravelDoc[] => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load travel documents from account storage', e)
    }
    return INITIAL_DOCS
  }, [storageKey])

  const [docs, setDocs] = useState<TravelDoc[]>(loadAccountDocs)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Whenever account switches (login, logout, different user), reload that specific account's documents
  useEffect(() => {
    setDocs(loadAccountDocs())
  }, [loadAccountDocs])

  // Synchronous and safe persistence helper
  const persistDocs = (newDocs: TravelDoc[]) => {
    setDocs(newDocs)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newDocs))
    } catch {
      try {
        // Fallback for localStorage quota limit (omit large base64 strings if necessary)
        const lightweight = newDocs.map(d => ({
          ...d,
          url: d.url && d.url.length > 500000 ? '' : d.url
        }))
        localStorage.setItem(storageKey, JSON.stringify(lightweight))
      } catch (err) {
        console.warn('Could not persist documents to localStorage', err)
      }
    }
  }

  const handleSaveCustomDoc = () => {
    if (!customName.trim()) {
      setIsAddingCustom(false)
      return
    }
    const newDoc: TravelDoc = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      desc: 'Custom uploaded document',
      type: '',
      size: '',
      uploaded: false,
      url: ''
    }
    const updated = [...docs, newDoc]
    persistDocs(updated)
    setCustomName('')
    setIsAddingCustom(false)
  }

  const handleRestoreDefaults = () => {
    const existingNames = new Set(docs.map(d => d.name.toLowerCase()))
    const missingDefaults = INITIAL_DOCS.filter(d => !existingNames.has(d.name.toLowerCase()))
    const updated = [...docs, ...missingDefaults]
    persistDocs(updated)
  }

  const handleDownload = (docId: string) => {
    const doc = docs.find(d => d.id === docId)
    if (!doc || !doc.url) return
    
    const a = document.createElement('a')
    a.href = doc.url
    
    let ext = ''
    if (doc.type === 'image/jpeg') ext = '.jpg'
    else if (doc.type === 'image/png') ext = '.png'
    else if (doc.type === 'application/pdf') ext = '.pdf'
    
    a.download = `${doc.name.replace(/\s+/g, '_')}${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleUploadClick = (id: string) => {
    setUploadingId(id)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && uploadingId) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      const sizeStr = file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${sizeMB} MB`
      
      const reader = new FileReader()
      reader.onload = () => {
        const fileUrl = (reader.result as string) || ''
        const updated = docs.map(d => d.id === uploadingId ? { 
          ...d, 
          uploaded: true, 
          size: sizeStr, 
          type: file.type || 'application/octet-stream',
          url: fileUrl
        } : d)
        persistDocs(updated)
      }
      reader.readAsDataURL(file)
    }
    setUploadingId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Action 1: Delete Document Card / Column completely from the account vault
  const handleDeleteCard = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const docToDelete = docs.find(d => d.id === id)
    if (docToDelete?.url && docToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(docToDelete.url)
    }
    const updated = docs.filter(d => d.id !== id)
    persistDocs(updated)
    if (showPreview === id) {
      setShowPreview(null)
    }
  }

  // Action 2: Remove uploaded file from card, keeping the card slot ready for a new file
  const handleRemoveFile = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const updated = docs.map(d => {
      if (d.id === id) {
        if (d.url && d.url.startsWith('blob:')) {
          URL.revokeObjectURL(d.url)
        }
        return { ...d, uploaded: false, size: '', type: '', url: '' }
      }
      return d
    })
    persistDocs(updated)
  }

  const hasMissingDefaults = INITIAL_DOCS.some(def => !docs.some(d => d.name.toLowerCase() === def.name.toLowerCase()))

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl md:text-7xl mb-3 text-text-primary font-black tracking-tight">Travel Vault</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-text-muted text-[18px] font-black">Securely store and access your essential travel documents offline.</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-secondary border border-border-default text-xs font-bold text-text-secondary">
              <UserCheck size={14} className="text-teal-500" />
              <span>Vault: <strong className="text-text-primary">{user?.email || (user?.name ? `${user.name}` : 'Personal Vault')}</strong></span>
            </div>
          </div>
        </div>

        {hasMissingDefaults && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleRestoreDefaults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-bg-secondary hover:bg-[var(--bg-card)] border border-border-default text-text-secondary hover:text-text-primary transition-all self-start sm:self-auto shrink-0 shadow-sm cursor-pointer"
            title="Restore missing default document categories"
          >
            <RotateCcw size={15} /> Restore Defaults
          </motion.button>
        )}
      </div>

      <ToolkitTabs />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center gap-4 border border-[#FC6C26]/30 bg-[#FC6C26]/5 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Shield size={100} className="text-[#FC6C26]" />
        </div>
        <div className="w-12 h-12 rounded-full bg-[#FC6C26]/20 flex items-center justify-center shrink-0 border border-[#FC6C26]/30">
          <ShieldCheck size={24} className="text-[#FC6C26]" />
        </div>
        <div className="text-center sm:text-left relative z-10">
          <p className="font-black text-[16px] text-black tracking-[0.1em] uppercase">Account-Protected Vault</p>
          <p className="text-[16px] text-black mt-1 font-black">All documents are encrypted locally and saved exclusively to your account. No other account can access them, and they remain saved until you delete them.</p>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
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
                    <div className="flex items-center gap-1.5">
                      {/* Preview Document */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPreview(doc.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-teal-600 hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                        title="Preview Document"
                        aria-label="Preview Document"
                      >
                        <Eye size={16} />
                      </motion.button>

                      {/* Download Document */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(doc.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-teal-600 hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                        title="Download Document"
                        aria-label="Download Document"
                      >
                        <Download size={16} />
                      </motion.button>

                      {/* Remove uploaded file only (keeps card) */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleRemoveFile(doc.id, e)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        title="Remove uploaded file (keeps card slot)"
                        aria-label="Remove uploaded file"
                      >
                        <FileX size={16} />
                      </motion.button>

                      {/* Delete Document Card / Column completely */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDeleteCard(doc.id, e)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Document Card Completely"
                        aria-label="Delete Document Card"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleUploadClick(doc.id)}
                        className="px-5 py-2.5 rounded-xl text-[14px] font-black flex items-center gap-2 transition-colors cursor-pointer shadow-sm bg-white hover:bg-neutral-100 text-black border border-white"
                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      >
                        <Upload size={14} className="text-black" strokeWidth={2.5} /> Upload
                      </motion.button>

                      {/* Delete Document Card / Column completely */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDeleteCard(doc.id, e)}
                        className="w-10 h-[44px] rounded-xl flex items-center justify-center bg-bg-secondary text-text-secondary hover:text-red-500 hover:bg-red-500/10 border border-border-default hover:border-red-500/30 transition-colors cursor-pointer"
                        title="Delete Document Column"
                        aria-label="Delete Document Column"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isAddingCustom ? (
            <motion.div layout variants={itemPop} className="p-5 rounded-2xl flex items-center justify-between gap-4 border-2 border-dashed border-teal-500/50 bg-bg-secondary/30 transition-colors min-h-[104px]">
               <input 
                 type="text" 
                 value={customName}
                 onChange={(e) => setCustomName(e.target.value)}
                 placeholder="Document Name (e.g., Driver's License)"
                 className="flex-1 bg-transparent border-b border-border-default focus:border-teal-500 outline-none px-2 py-2 text-[16px] font-black text-text-primary"
                 autoFocus
                 onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomDoc()}
               />
               <div className="flex gap-2 shrink-0">
                 <button 
                   onClick={handleSaveCustomDoc} 
                   className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-black flex items-center justify-center transition-colors cursor-pointer shadow-sm border border-white"
                   style={{ backgroundColor: '#ffffff', color: '#000000' }}
                   title="Save Document"
                   aria-label="Save Document"
                 >
                   <Check size={20} className="text-black" strokeWidth={2.5} />
                 </button>
                 <button onClick={() => { setIsAddingCustom(false); setCustomName(''); }} className="w-10 h-10 rounded-xl bg-bg-secondary text-text-secondary flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors cursor-pointer">
                   <X size={20} />
                 </button>
               </div>
            </motion.div>
          ) : (
            <motion.div layout variants={itemPop} onClick={() => setIsAddingCustom(true)} className="p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-default hover:border-teal-500/50 hover:bg-bg-secondary/50 transition-colors cursor-pointer min-h-[104px]">
               <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted">
                  <Plus size={20} />
               </div>
               <p className="text-[16px] font-black text-text-secondary">Add Custom Document</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />

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
                    <p className="text-xs text-text-muted flex items-center gap-1.5"><ShieldCheck size={10} className="text-[#FC6C26]" /> Account-Encrypted</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button onClick={() => showPreview && handleDownload(showPreview)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer" title="Download Document">
                    <Download size={18} />
                  </motion.button>
                  <motion.button onClick={() => showPreview && handleDeleteCard(showPreview)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-red-500 transition-colors cursor-pointer" title="Delete Document Card">
                    <Trash2 size={18} />
                  </motion.button>
                  <motion.button onClick={() => setShowPreview(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer" title="Close Preview">
                    <X size={18} />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex-1 bg-bg-secondary p-4 sm:p-8 overflow-auto flex items-center justify-center min-h-[400px]">
                 {docs.find(d => d.id === showPreview)?.type.startsWith('image/') ? (
                    <img src={docs.find(d => d.id === showPreview)?.url} alt="Preview" className="max-w-full max-h-[70vh] rounded-lg shadow-md object-contain" />
                 ) : docs.find(d => d.id === showPreview)?.type === 'application/pdf' ? (
                    <iframe src={docs.find(d => d.id === showPreview)?.url} className="w-full max-w-4xl h-[70vh] rounded-lg shadow-md bg-white" />
                 ) : (
                    <div className="w-full max-w-xl aspect-[1/1.4] bg-[var(--bg-card)] rounded-lg shadow-md p-8 flex flex-col items-center justify-center text-center border border-border-default">
                       <FileText size={48} className="text-text-muted mb-4" />
                       <p className="text-text-secondary font-bold text-lg">Preview not available for this file type.</p>
                       <p className="text-sm text-text-muted mt-2">You can download it to view the contents securely.</p>
                    </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

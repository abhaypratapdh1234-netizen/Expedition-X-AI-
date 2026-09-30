import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../../../stores/tripStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { useAuthStore } from '../../../stores/authStore'
import { formatCurrency, t } from '../../../utils/formatters'
import { Calendar, Users, Map, DollarSign, ArrowRight, Zap, CheckCircle2, UploadCloud, Eye, Sparkles, Trash2, Download, Plus, X, RotateCcw, ShieldCheck, Check, FileText, UserPlus, Mail, Phone, Copy, UserCheck, Shield, Receipt, Wallet, Tag, ShoppingBag, Utensils, AlertCircle } from 'lucide-react'
import { TripPrepPanel } from '../../../components/ui/TripPrepPanel'
import { computeDecisionTimeline, computeReadinessChecklist } from '../../../services/intelligenceService'
import type { TimelineTask, ReadinessItem } from '../../../services/intelligenceService'
import { useThemeStore } from '../../../stores/themeStore'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { TripDocumentViewerModal, type TripDocItem } from '../../../components/trips/TripDocumentViewerModal'

export interface ExtraBudgetItem {
  id: string
  title: string
  amount: number
  category: 'food' | 'transport' | 'activities' | 'stay' | 'shopping' | 'other'
  notes?: string
  date?: string
  createdAt: string
}

const EXTRA_BUDGET_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️', color: '#f97316' },
  { id: 'transport', label: 'Transport & Cab', icon: '🚕', color: '#0ea5e9' },
  { id: 'activities', label: 'Activities & Tickets', icon: '🎟️', color: '#8b5cf6' },
  { id: 'shopping', label: 'Shopping & Souvenirs', icon: '🛍️', color: '#ec4899' },
  { id: 'stay', label: 'Stay & Lodging', icon: '🏨', color: '#10b981' },
  { id: 'other', label: 'Miscellaneous', icon: '📦', color: '#64748b' },
] as const

const QUICK_BUDGET_PRESETS = [
  { title: 'Beach Seafood Dinner', amount: 1500, category: 'food' as const },
  { title: 'Scooter / Airport Cab', amount: 800, category: 'transport' as const },
  { title: 'Scuba Diving / Water Sports', amount: 2500, category: 'activities' as const },
  { title: 'Local Souvenirs & Crafts', amount: 1200, category: 'shopping' as const },
  { title: 'Sunset Cocktails & Snacks', amount: 950, category: 'food' as const },
]

export interface TripCollaborator {
  id: string
  name: string
  email: string
  phone?: string
  role: 'Owner' | 'Co-organizer' | 'Collaborator' | 'Trip Member' | 'Viewer'
  status: 'Active' | 'Invited'
  from: string
  to: string
  glow: string
  addedAt: string
  isOwner?: boolean
}

const DEFAULT_TRIP_DOCS: TripDocItem[] = [
  { 
    id: 'aadhaar', 
    name: 'Aadhaar Card', 
    icon: '🪪', 
    status: 'required', 
    category: 'government_id',
    isSystemDefault: true 
  },
  { 
    id: 'pan', 
    name: 'PAN Card', 
    icon: '🪪', 
    status: 'required', 
    category: 'government_id',
    isSystemDefault: true 
  },
  { 
    id: 'hotel_voucher', 
    name: 'Hotel Voucher', 
    icon: '🏨', 
    status: 'uploaded', 
    category: 'hotel', 
    fileName: 'Grand_Hyatt_Resort_Voucher.pdf',
    fileType: 'system/hotel',
    fileSize: '412 KB',
    uploadedAt: 'System Verified',
    isSystemDefault: true 
  },
  { 
    id: 'eticket', 
    name: 'E-Ticket PDF', 
    icon: '🎫', 
    status: 'uploaded', 
    category: 'ticket', 
    fileName: 'IndiGo_Flight_BoardingPass_6E204.pdf',
    fileType: 'system/flight',
    fileSize: '1.2 MB',
    uploadedAt: 'System Verified',
    isSystemDefault: true 
  },
]

const TABS = ['itinerary', 'budget', 'bookings', 'documents', 'collaborators', 'prep'] as const
const TAB_ICONS: Record<string, string> = { itinerary: '🗺️', budget: '💰', bookings: '🏨', documents: '📁', collaborators: '👥', prep: '✅' }

export function TripOverview() {
  const { id } = useParams()
  const { currentTrip: trip, fetchTripById, isLoading } = useTripStore()
  const { currency, language } = useSettingsStore()
  const { user } = useAuthStore()
  const theme = useThemeStore(s => s.theme)
  const [domTheme, setDomTheme] = useState<string | null>(() =>
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null
  )

  useEffect(() => {
    const updateDomTheme = () => {
      if (typeof document !== 'undefined') {
        setDomTheme(document.documentElement.getAttribute('data-theme'))
      }
    }
    updateDomTheme()
    const observer = new MutationObserver(updateDomTheme)
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    }
    return () => observer.disconnect()
  }, [])

  const isDark = (theme === 'dark' || domTheme === 'dark') && theme !== 'monochrome' && domTheme !== 'monochrome'
  const isMonochrome = theme === 'monochrome' || domTheme === 'monochrome'
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('itinerary')
  const [timeline, setTimeline] = useState<TimelineTask[]>([])
  const [checklist, setChecklist] = useState<ReadinessItem[]>([])

  // Document Vault State & Persistence
  const accountKey = user?.email ? user.email.toLowerCase().trim() : (user?.id || 'guest')
  const tripStorageKey = `expeditionx_trip_docs_${id || trip?.id || 'default'}_${accountKey}`

  const loadSavedDocs = (): TripDocItem[] => {
    try {
      const saved = localStorage.getItem(tripStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Could not read saved trip docs', e)
    }
    return DEFAULT_TRIP_DOCS
  }

  const [tripDocs, setTripDocs] = useState<TripDocItem[]>(loadSavedDocs)
  const [selectedViewDoc, setSelectedViewDoc] = useState<TripDocItem | null>(null)
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [showAddCustomModal, setShowAddCustomModal] = useState(false)
  const [customDocName, setCustomDocName] = useState('')
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'delete' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Collaborators State & Real Persistence
  const collabStorageKey = `expeditionx_trip_collaborators_${id || trip?.id || 'default'}_${accountKey}`

  const loadSavedCollaborators = (): TripCollaborator[] => {
    try {
      const saved = localStorage.getItem(collabStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Could not read saved collaborators', e)
    }
    const currentUserName = user?.name || 'Anant Ambani'
    const currentUserEmail = user?.email || 'anantambani@gmail.com'
    return [
      {
        id: 'owner_primary',
        name: currentUserName,
        email: currentUserEmail,
        role: 'Owner',
        status: 'Active',
        from: '#FC6C26',
        to: '#ea580c',
        glow: 'rgba(252, 108, 38, 0.4)',
        addedAt: 'Trip Creator & Host',
        isOwner: true
      }
    ]
  }

  const [collaborators, setCollaborators] = useState<TripCollaborator[]>(loadSavedCollaborators)
  const [showAddCollabModal, setShowAddCollabModal] = useState(false)
  const [collabName, setCollabName] = useState('')
  const [collabEmail, setCollabEmail] = useState('')
  const [collabPhone, setCollabPhone] = useState('')
  const [collabRole, setCollabRole] = useState<TripCollaborator['role']>('Co-organizer')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    setCollaborators(loadSavedCollaborators())
  }, [collabStorageKey])

  const saveCollaborators = (newCollabs: TripCollaborator[], toastMsg?: string, toastType: 'success' | 'delete' = 'success') => {
    setCollaborators(newCollabs)
    try {
      localStorage.setItem(collabStorageKey, JSON.stringify(newCollabs))
    } catch (err) {
      console.warn('Failed to save collaborators', err)
    }
    if (toastMsg) {
      setFeedbackToast({ message: toastMsg, type: toastType })
      setTimeout(() => setFeedbackToast(null), 3500)
    }
  }

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault()
    if (!collabName.trim() || !collabEmail.trim()) return

    const palette = [
      { from: '#0f172a', to: '#1e293b', glow: 'rgba(15, 23, 42, 0.4)' },
      { from: '#6d28d9', to: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
      { from: '#0284c7', to: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
      { from: '#059669', to: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
      { from: '#db2777', to: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
      { from: '#d97706', to: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }
    ][collaborators.length % 6]

    const newPerson: TripCollaborator = {
      id: `collab_${Date.now()}`,
      name: collabName.trim(),
      email: collabEmail.trim(),
      phone: collabPhone.trim() || undefined,
      role: collabRole,
      status: 'Active',
      from: palette.from,
      to: palette.to,
      glow: palette.glow,
      addedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      isOwner: false
    }

    const updated = [...collaborators, newPerson]
    saveCollaborators(updated, `"${newPerson.name}" added as ${newPerson.role}!`, 'success')
    setCollabName('')
    setCollabEmail('')
    setCollabPhone('')
    setCollabRole('Co-organizer')
    setShowAddCollabModal(false)
  }

  const handleDeleteCollaborator = (collabId: string) => {
    const target = collaborators.find(c => c.id === collabId)
    if (!target) return
    if (target.isOwner) {
      if (!window.confirm('Remove yourself / Trip Owner from collaborators?')) return
    }
    const updated = collaborators.filter(c => c.id !== collabId)
    saveCollaborators(updated, `"${target.name}" removed from trip.`, 'delete')
  }

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join?trip=${id || trip?.id || 'goa'}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
    setFeedbackToast({ message: 'Trip invite link copied to clipboard!', type: 'success' })
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // ── Extra Budget Details State & Real Persistence ─────────────────────────────
  const budgetStorageKey = `expeditionx_trip_extra_budget_${id || trip?.id || 'default'}_${accountKey}`

  const loadSavedExtraBudget = (): ExtraBudgetItem[] => {
    try {
      const saved = localStorage.getItem(budgetStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Could not read saved extra budget items', e)
    }
    return []
  }

  const [extraBudgetItems, setExtraBudgetItems] = useState<ExtraBudgetItem[]>(loadSavedExtraBudget)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState<ExtraBudgetItem['category']>('food')
  const [expenseNotes, setExpenseNotes] = useState('')
  const [expenseDate, setExpenseDate] = useState(() => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))

  useEffect(() => {
    setExtraBudgetItems(loadSavedExtraBudget())
  }, [budgetStorageKey])

  const saveExtraBudgetItems = (items: ExtraBudgetItem[], toastMsg?: string, toastType: 'success' | 'delete' = 'success') => {
    setExtraBudgetItems(items)
    try {
      localStorage.setItem(budgetStorageKey, JSON.stringify(items))
    } catch (err) {
      console.warn('Failed to save extra budget items', err)
    }
    if (toastMsg) {
      setFeedbackToast({ message: toastMsg, type: toastType })
      setTimeout(() => setFeedbackToast(null), 3500)
    }
  }

  const handleAddExpense = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parsedAmount = parseFloat(expenseAmount.replace(/[^0-9.]/g, ''))
    if (!expenseTitle.trim()) {
      alert('Please enter an expense title or description.')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid expense price/amount.')
      return
    }

    const newItem: ExtraBudgetItem = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: expenseTitle.trim(),
      amount: parsedAmount,
      category: expenseCategory,
      notes: expenseNotes.trim() || undefined,
      date: expenseDate,
      createdAt: new Date().toISOString()
    }

    const updated = [newItem, ...extraBudgetItems]
    saveExtraBudgetItems(updated, `Added "${newItem.title}" (${formatCurrency(newItem.amount, currency)}) to budget bar!`, 'success')
    setExpenseTitle('')
    setExpenseAmount('')
    setExpenseNotes('')
    setShowAddExpenseModal(false)
  }

  const handleQuickAddExpense = (preset: typeof QUICK_BUDGET_PRESETS[number]) => {
    const newItem: ExtraBudgetItem = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      createdAt: new Date().toISOString()
    }
    const updated = [newItem, ...extraBudgetItems]
    saveExtraBudgetItems(updated, `Added "${newItem.title}" (${formatCurrency(newItem.amount, currency)}) to budget bar!`, 'success')
  }

  const handleDeleteExpense = (expenseId: string) => {
    const itemToDelete = extraBudgetItems.find(i => i.id === expenseId)
    const updated = extraBudgetItems.filter(i => i.id !== expenseId)
    saveExtraBudgetItems(updated, itemToDelete ? `Removed "${itemToDelete.title}" from budget.` : 'Expense removed.', 'delete')
  }

  const extraExpensesTotal = useMemo(() => {
    return extraBudgetItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }, [extraBudgetItems])

  const baseSpent = Number(trip?.spent) || 0
  const totalEffectiveSpent = baseSpent + extraExpensesTotal
  const tripBudget = Number(trip?.budget) || 30000
  const budgetUsedPercentage = tripBudget > 0 ? (totalEffectiveSpent / tripBudget) * 100 : 0
  const remainingBudget = tripBudget - totalEffectiveSpent
  const isOverBudget = totalEffectiveSpent > tripBudget

  useEffect(() => {
    setTripDocs(loadSavedDocs())
  }, [tripStorageKey])

  const saveTripDocs = (newDocs: TripDocItem[], toastMsg?: string, toastType: 'success' | 'delete' = 'success') => {
    setTripDocs(newDocs)
    try {
      localStorage.setItem(tripStorageKey, JSON.stringify(newDocs))
    } catch {
      try {
        const trimmed = newDocs.map(d => ({
          ...d,
          fileData: d.fileData && d.fileData.length > 2000000 ? '' : d.fileData
        }))
        localStorage.setItem(tripStorageKey, JSON.stringify(trimmed))
      } catch (err) {
        console.warn('LocalStorage save error', err)
      }
    }
    if (toastMsg) {
      setFeedbackToast({ message: toastMsg, type: toastType })
      setTimeout(() => setFeedbackToast(null), 3500)
    }
  }

  const handleTriggerUpload = (docId: string) => {
    setUploadingDocId(docId)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingDocId) return

    const sizeStr = file.size < 1024 * 1024 
      ? `${Math.round(file.size / 1024)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const updated = tripDocs.map(d => {
        if (d.id === uploadingDocId) {
          return {
            ...d,
            status: 'uploaded' as const,
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: sizeStr,
            fileData: dataUrl,
            uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          }
        }
        return d
      })

      saveTripDocs(updated, `"${file.name}" uploaded successfully! Always saved.`, 'success')
      setUploadingDocId(null)
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteUpload = (docId: string) => {
    const targetDoc = tripDocs.find(d => d.id === docId)
    if (!targetDoc) return

    const updated = tripDocs.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'required' as const,
          fileName: undefined,
          fileType: undefined,
          fileSize: undefined,
          fileData: undefined,
          uploadedAt: undefined
        }
      }
      return d
    })
    saveTripDocs(updated, `Uploaded file for "${targetDoc.name}" deleted. Upload required.`, 'delete')

    if (selectedViewDoc?.id === docId) {
      setSelectedViewDoc(null)
    }
  }

  const handleDeleteDoc = (docId: string) => {
    const targetDoc = tripDocs.find(d => d.id === docId)
    if (!targetDoc) return

    if (targetDoc.isSystemDefault) {
      handleDeleteUpload(docId)
    } else {
      const updated = tripDocs.filter(d => d.id !== docId)
      saveTripDocs(updated, `"${targetDoc.name}" deleted from vault.`, 'delete')
      if (selectedViewDoc?.id === docId) {
        setSelectedViewDoc(null)
      }
    }
  }

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customDocName.trim()) {
      setShowAddCustomModal(false)
      return
    }
    const newDoc: TripDocItem = {
      id: `custom_doc_${Date.now()}`,
      name: customDocName.trim(),
      icon: '📄',
      status: 'required',
      category: 'other',
      isSystemDefault: false
    }
    const updated = [...tripDocs, newDoc]
    saveTripDocs(updated, `"${customDocName.trim()}" added to checklist.`, 'success')
    setCustomDocName('')
    setShowAddCustomModal(false)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset documents checklist to defaults? (Hotel Voucher & E-Ticket will be restored)')) {
      saveTripDocs(DEFAULT_TRIP_DOCS, 'Documents restored to defaults.', 'success')
    }
  }

  useEffect(() => { if (id) fetchTripById(id) }, [id, fetchTripById])

  // v4: Compute Decision Timeline + Readiness Checklist when trip loads
  useEffect(() => {
    if (!trip) return
    const dest = trip.destinations?.[0] || trip.title || ''
    if (trip.startDate) setTimeline(computeDecisionTimeline(trip.startDate, dest))
    setChecklist(computeReadinessChecklist(trip, dest))
  }, [trip?.id])

  if (isLoading || !trip) return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      <p className="text-sm text-text-muted font-medium">{t('Loading your adventure…', language)}</p>
    </div>
  )

  const days = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)

  return (
    <div className="pb-32 lg:pb-8 min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ═══════════════════════════════════════════
          ULTRA-PREMIUM HERO COVER
      ═══════════════════════════════════════════ */}
      <div className="relative h-80 overflow-hidden">
        <img src={trip.coverImage} alt={trip.title}
          className="w-full h-full object-cover" />
        {/* Cinematic gradient layers */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />

        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white font-display leading-tight drop-shadow-2xl mb-2">{trip.title}</h1>
            <p className="text-white/70 text-sm font-bold tracking-[0.2em] uppercase">{trip.destinations.join('  →  ')}</p>
          </div>
          {trip.status === 'upcoming' && (
            <Link to={`/app/trips/${trip.id}/live`}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#0f172a,#0f172a)', boxShadow: '0 12px 35px rgba(15, 23, 42,0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3)', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
              <Zap size={15} className="fill-white" /> {t('Live Mode', language)}
            </Link>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          10,000 BILLION DOLLAR STAT CARDS ROW
          — Raised floating cards from the hero —
      ═══════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 -mt-8 relative z-10 mb-8">
        <div className="grid grid-cols-4 gap-3">
          {[
            { Icon: Calendar, label: t('Start', language), value: new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), from: isDark ? '#2563eb' : '#0f172a', to: isDark ? '#60a5fa' : '#0f172a', glow: isDark ? 'rgba(37,99,235,0.45)' : 'rgba(15, 23, 42,0.35)' },
            { Icon: Users,    label: t('People', language), value: String(collaborators.length), from: '#6d28d9', to: '#8b5cf6', glow: 'rgba(139,92,246,0.35)' },
            { Icon: DollarSign, label: t('Budget', language), value: formatCurrency(trip.budget, currency), from: '#b45309', to: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
            { Icon: Map,      label: t('Days', language), value: String(days), from: '#0369a1', to: '#38bdf8', glow: 'rgba(56,189,248,0.35)' },
          ].map((s) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-5 px-2 rounded-[24px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 cursor-default"
              style={{
                background: 'var(--bg-card)',
                boxShadow: isDark
                  ? `0 14px 30px -10px ${s.glow}, 0 2px 10px rgba(0,0,0,0.6)`
                  : (isMonochrome ? `0 10px 25px -5px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)` : `0 20px 40px -10px ${s.glow}, 0 4px 15px rgba(0,0,0,0.04)`),
                border: isDark ? '1.5px solid rgba(255,255,255,0.18)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(255,255,255,0.8)')
              }}>
              {/* Gradient shimmer background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.from}08, transparent 70%)` }} />
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 relative"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})`, boxShadow: `0 8px 20px ${s.glow}` }}>
                <s.Icon size={20} className="text-white" strokeWidth={2.5} />
                {/* Shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
              </div>
              <p
                className="font-black text-[22px] tracking-tight leading-none mb-1.5 drop-shadow-sm transition-colors text-[#0f172a] dark:text-white"
                style={{
                  color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a'),
                  textShadow: isDark ? '0 1px 10px rgba(255,255,255,0.2)' : 'none'
                }}
              >
                {s.value}
              </p>
              <p
                className="text-[12px] font-black uppercase tracking-[0.2em] transition-colors text-[#475569] dark:text-slate-100"
                style={{
                  color: isDark ? '#f8fafc' : (isMonochrome ? '#111111' : '#475569'),
                  opacity: isDark ? 0.95 : 1
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-0">
        {/* ═══════════════════════════════════════════
            10,000 BILLION DOLLAR TAB BAR
            — Horizontal sliding pill dock —
        ═══════════════════════════════════════════ */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="inline-flex p-1.5 rounded-full gap-1 relative"
            style={{
              background: 'var(--bg-card)',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), inset 0 2px 5px rgba(0,0,0,0.025)',
              border: '1px solid var(--border-subtle)'
            }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 cursor-pointer group ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
                  style={{
                    background: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#ffffff' : (isDark ? '#ffffff' : '#000000'),
                    boxShadow: isActive
                      ? '0 10px 25px -5px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.2)'
                      : 'none',
                    border: isActive
                      ? (isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid #000000')
                      : '1px solid transparent',
                  }}>
                  {isActive && <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} variant="white" />}
                  {/* Subtle top shine layer on active */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full pointer-events-none" />
                  )}
                  <span className="text-base leading-none relative z-10">{TAB_ICONS[tab]}</span>
                  <span className="relative z-10 font-black">{t(tab.charAt(0).toUpperCase() + tab.slice(1), language)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            TAB CONTENT
        ═══════════════════════════════════════════ */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              {(trip.itinerary || []).map((dayPlan, i) => {
                const mainItem = dayPlan.items.length > 0 ? dayPlan.items[0].name : t('Leisure Day', language);
                const totalCost = dayPlan.items.reduce((sum, item) => sum + item.cost, 0);
                
                return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group flex gap-5 items-center px-6 py-5 rounded-[28px] cursor-pointer transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.04)'), boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  {/* Left accent glow line */}
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-500 group-hover:top-2 group-hover:bottom-2"
                    style={{ background: 'linear-gradient(to bottom, #0f172a, #0f172a)', boxShadow: '2px 0 10px rgba(15, 23, 42,0.3)' }} />
                  {/* Day number bubble */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: 'linear-gradient(135deg, #0f172a, #0f172a)', boxShadow: '0 10px 25px rgba(15, 23, 42,0.4)' }}>
                    {dayPlan.day}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg transition-colors duration-300 drop-shadow-sm tracking-tight text-[#0f172a] dark:text-white"
                      style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}>
                      {t('Day', language)} {dayPlan.day} — {mainItem}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] font-bold uppercase tracking-widest text-[#475569] dark:text-slate-300"
                        style={{ color: isDark ? '#cbd5e1' : (isMonochrome ? '#222222' : '#475569') }}>
                        {dayPlan.items.length} {t('activities', language)}
                      </span>
                      <span className="text-[#94a3b8]">·</span>
                      <span className="text-[12px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white"
                        style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}>
                        {formatCurrency(totalCost, currency)} {t('est.', language)}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-400 opacity-0 group-hover:opacity-100"
                    style={{ background: isDark ? 'linear-gradient(135deg, #2563eb, #60a5fa)' : 'linear-gradient(135deg, #0f172a, #0f172a)', boxShadow: '0 4px 12px rgba(15, 23, 42,0.4)' }}>
                    <ArrowRight size={15} className="text-white" />
                  </div>
                </motion.div>
              )})}
              <Link to="/app/planner/itinerary"
                className="flex items-center justify-center gap-3 py-5 rounded-[28px] text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden group"
                style={{ background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #0f172a, #0f172a)', color: 'white', boxShadow: '0 15px 35px rgba(15, 23, 42,0.4)', border: isDark ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <Sparkles size={16} className="relative z-10" /> 
                <span className="relative z-10">{t('Edit Full Itinerary', language)}</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              {/* ═════════════════════════════════════════════════════════════════
                  MAIN BUDGET PROGRESS BAR CARD
                  — Reflects base spent + all user extra budget additions —
              ═════════════════════════════════════════════════════════════════ */}
              <div className="p-7 rounded-[28px] relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.04)'), boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#475569] dark:text-slate-300"
                        style={{ color: isDark ? '#cbd5e1' : (isMonochrome ? '#222222' : '#475569') }}>
                        {t('Total Spent', language)}
                      </p>
                      {extraExpensesTotal > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white border border-slate-700 shadow-sm">
                          +{formatCurrency(extraExpensesTotal, currency)} Extra Logged
                        </span>
                      )}
                    </div>
                    <p className="text-5xl font-black text-[#0f172a] dark:text-white tracking-tight drop-shadow-sm"
                      style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}>
                      {formatCurrency(totalEffectiveSpent, currency)}
                    </p>
                    {extraExpensesTotal > 0 && (
                      <p className={`text-xs font-medium mt-1.5 ${isDark ? 'text-slate-400' : (isMonochrome ? 'text-black' : 'text-slate-500')}`}>
                        Base: {formatCurrency(baseSpent, currency)} · Extra details: {formatCurrency(extraExpensesTotal, currency)} ({extraBudgetItems.length} {extraBudgetItems.length === 1 ? 'item' : 'items'})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#475569] dark:text-slate-300 mb-2"
                      style={{ color: isDark ? '#cbd5e1' : (isMonochrome ? '#222222' : '#475569') }}>
                      {t('of Budget', language)}
                    </p>
                    <p className="text-3xl font-black text-[#0f172a] dark:text-white drop-shadow-sm"
                      style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}>
                      {formatCurrency(tripBudget, currency)}
                    </p>
                  </div>
                </div>

                {/* ULTRA PREMIUM DYNAMIC BUDGET PROGRESS BAR */}
                <div className="relative h-6 w-full rounded-full overflow-hidden"
                  style={{ background: isDark ? '#1e2230' : 'var(--bg-card)', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2)' }}>
                  <motion.div
                    key={`budget-bar-${totalEffectiveSpent}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      background: isOverBudget
                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                        : isDark
                          ? 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)'
                          : 'linear-gradient(90deg, #0f172a, #0f172a, #fdecd3)',
                      boxShadow: isOverBudget
                        ? '0 4px 16px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
                        : '0 4px 16px rgba(15, 23, 42, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    {/* Moving shine */}
                    <div className="absolute inset-0 animate-pulse"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)', animationDuration: '2s' }} />
                    {/* Top gloss */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full" />
                  </motion.div>
                </div>

                {/* METRICS ROW BELOW BAR */}
                <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
                  <p className="text-[13px] font-bold text-[#475569] dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"
                    style={{ color: isDark ? '#cbd5e1' : (isMonochrome ? '#222222' : '#475569') }}>
                    <span>{Math.round(budgetUsedPercentage)}% {t('used', language)}</span>
                    {isOverBudget && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                        Budget Exceeded
                      </span>
                    )}
                  </p>
                  <p className={`text-[13px] font-black uppercase tracking-widest ${isOverBudget ? 'text-red-500 font-black' : 'text-[#0f172a] dark:text-white'}`}
                    style={{ color: isOverBudget ? undefined : (isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a')) }}>
                    {isOverBudget
                      ? `+${formatCurrency(totalEffectiveSpent - tripBudget, currency)} ${t('over budget', language)}`
                      : `${formatCurrency(remainingBudget, currency)} ${t('remaining', language)}`}
                  </p>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════════════════
                  NEW FEATURE: EXTRA BUDGET DETAILS & EXPENSE MANAGEMENT
              ═════════════════════════════════════════════════════════════════ */}
              <div
                className="p-6 sm:p-7 rounded-[28px] relative overflow-hidden"
                style={{
                  background: isDark ? '#11131a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : (isMonochrome ? '1.5px solid #000000' : '2px solid #e2e8f0'),
                  boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #f1f5f9' }}>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 flex-wrap" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                      <Receipt size={24} className="text-[#FC6C26]" />
                      <span>Extra Budget Details & Expenses</span>
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm" style={{
                        background: isDark ? 'rgba(255,255,255,0.12)' : '#020617',
                        color: '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #020617'
                      }}>
                        {extraBudgetItems.length} {extraBudgetItems.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </h3>
                    <p className="text-sm font-semibold mt-1.5 leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                      Add meals, cab rides, activities, or shopping — each item automatically updates your Total Spent and price bar above.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 shadow-md cursor-pointer shrink-0"
                    style={{
                      background: isDark ? '#FC6C26' : '#0f172a',
                      border: isDark ? '1px solid #FC6C26' : '1px solid #1e293b'
                    }}
                  >
                    <Plus size={16} className="text-white" strokeWidth={3} />
                    <span>Add Extra Expense</span>
                  </button>
                </div>

                {/* Quick Add Presets Bar */}
                <div className="py-4">
                  <p className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: isDark ? '#cbd5e1' : '#020617' }}>
                    <span>⚡</span>
                    <span>Quick-Add Common Expenses (One-Click):</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {QUICK_BUDGET_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickAddExpense(preset)}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-sm hover:shadow"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                          border: isDark ? '2px solid rgba(255,255,255,0.15)' : '2px solid #cbd5e1',
                          color: isDark ? '#ffffff' : '#020617'
                        }}
                        title={`Quick add ${preset.title} for ${formatCurrency(preset.amount, currency)}`}
                      >
                        <span className="text-base">
                          {preset.category === 'food' ? '🍽️' : preset.category === 'transport' ? '🚕' : preset.category === 'activities' ? '🎟️' : '🛍️'}
                        </span>
                        <span className="font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>{preset.title}</span>
                        <span
                          className="px-2.5 py-1 rounded-lg font-black text-xs transition-colors"
                          style={{
                            background: isDark ? 'rgba(252,108,38,0.15)' : '#f1f5f9',
                            border: isDark ? '1px solid rgba(252,108,38,0.3)' : '1px solid #cbd5e1',
                            color: isDark ? '#FC6C26' : '#020617'
                          }}
                        >
                          +{formatCurrency(preset.amount, currency)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Expenses List */}
                <div className="mt-2 space-y-3">
                  {extraBudgetItems.length === 0 ? (
                    <div
                      className="p-8 rounded-2xl text-center"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                        border: isDark ? '2px dashed rgba(255,255,255,0.15)' : '2px dashed #cbd5e1'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                        }}
                      >
                        💳
                      </div>
                      <p className="font-black text-base" style={{ color: isDark ? '#ffffff' : '#020617' }}>No extra expenses added yet</p>
                      <p className="text-sm font-semibold mt-1 max-w-md mx-auto" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                        Click <strong style={{ color: isDark ? '#FC6C26' : '#0f172a' }}>"+ Add Extra Expense"</strong> or pick one of the quick suggestions above to log custom expenses and watch your price bar calculate in real-time.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {extraBudgetItems.map((item) => {
                          const categoryMeta = EXTRA_BUDGET_CATEGORIES.find(c => c.id === item.category) || EXTRA_BUDGET_CATEGORIES[0]
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl shadow-sm transition-all hover:shadow-md"
                              style={{
                                background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                                border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #e2e8f0'
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                                  style={{
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                                  }}
                                >
                                  {categoryMeta.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <h4 className="font-black text-base tracking-tight" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                                      {item.title}
                                    </h4>
                                    <span
                                      className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm"
                                      style={{
                                        background: isDark ? 'rgba(255,255,255,0.12)' : '#020617',
                                        color: '#ffffff',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #020617'
                                      }}
                                    >
                                      {categoryMeta.label}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold mt-1 flex items-center gap-2" style={{ color: isDark ? '#94a3b8' : '#374151' }}>
                                    <span className="font-extrabold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{item.date || 'Today'}</span>
                                    {item.notes && (
                                      <>
                                        <span style={{ color: isDark ? '#64748b' : '#9ca3af' }}>•</span>
                                        <span className="italic font-semibold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{item.notes}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0"
                                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : undefined }}
                              >
                                <span className="text-xl font-black tracking-tight font-mono" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                                  +{formatCurrency(item.amount, currency)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(item.id)}
                                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 transition-colors text-xs font-black cursor-pointer shadow-sm"
                                  title={`Delete "${item.title}"`}
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Extra Expenses Summary Footer */}
                      <div
                        className="pt-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm"
                        style={{ borderTop: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #e2e8f0' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                          <span className="font-bold" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
                            Total extra cost of <span className="font-black underline decoration-2 decoration-[#FC6C26]" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{formatCurrency(extraExpensesTotal, currency)}</span> is actively added to the price bar above.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Clear all extra logged expenses?')) {
                              saveExtraBudgetItems([], 'All extra budget items cleared.', 'delete')
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer shrink-0 shadow-sm"
                          style={{
                            color: '#ef4444',
                            background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
                            borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'
                          }}
                        >
                          Clear All Expenses
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* MODAL: ADD EXTRA BUDGET ITEM */}
              <AnimatePresence>
                {showAddExpenseModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAddExpenseModal(false)}
                      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 font-sans"
                    >
                      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#FC6C26]/10 flex items-center justify-center text-xl">
                            💰
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-950 tracking-tight">Add Extra Budget Item</h3>
                            <p className="text-xs text-slate-700 font-bold">This price will be immediately added into your total spent and price bar.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddExpenseModal(false)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleAddExpense} className="mt-5 space-y-4">
                        {/* Title Input */}
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-950 block mb-1.5">
                            Expense Title / Details *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Seafood Dinner at Thalassa, Goa"
                            value={expenseTitle}
                            onChange={e => setExpenseTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FC6C26] focus:border-transparent bg-white transition-all text-slate-950 placeholder:text-slate-400"
                          />
                        </div>

                        {/* Price Input */}
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-950 block mb-1.5">
                            Price / Amount ({currency}) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-base">
                              {currency === 'INR' ? '₹' : '$'}
                            </span>
                            <input
                              type="number"
                              required
                              step="any"
                              min="1"
                              placeholder="e.g. 2500"
                              value={expenseAmount}
                              onChange={e => setExpenseAmount(e.target.value)}
                              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-300 text-base font-black focus:outline-none focus:ring-2 focus:ring-[#FC6C26] focus:border-transparent bg-white transition-all text-slate-950 font-mono placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Category Selector */}
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-950 block mb-1.5">
                            Category
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {EXTRA_BUDGET_CATEGORIES.map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setExpenseCategory(cat.id as ExtraBudgetItem['category'])}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                                  expenseCategory === cat.id
                                    ? 'bg-black text-white border-black shadow-sm'
                                    : 'bg-white text-slate-950 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-base">{cat.icon}</span>
                                <span className="truncate">{cat.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date and Optional Note */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-black uppercase tracking-wider text-slate-950 block mb-1.5">
                              Date / Scheduled
                            </label>
                            <input
                              type="text"
                              value={expenseDate}
                              onChange={e => setExpenseDate(e.target.value)}
                              placeholder="e.g. Oct 24, 2026"
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FC6C26] bg-white text-slate-950 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-wider text-slate-950 block mb-1.5">
                              Optional Notes
                            </label>
                            <input
                              type="text"
                              value={expenseNotes}
                              onChange={e => setExpenseNotes(e.target.value)}
                              placeholder="e.g. Paid via UPI"
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FC6C26] bg-white text-slate-950 placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Submit & Cancel Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddExpenseModal(false)}
                            className="px-5 py-2.5 text-xs font-black text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-[#0f172a] hover:bg-black text-white rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={14} className="text-[#FC6C26]" strokeWidth={3} />
                            <span>Add to Price Bar</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* OPEN COST ESTIMATOR BUTTON (Exact match to screenshot) */}
              <Link to="/app/planner/cost"
                className="flex items-center justify-center gap-3 py-5 rounded-[28px] text-[15px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] hover:-translate-y-0.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', boxShadow: '0 15px 35px rgba(15,23,42,0.3)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <span className="relative z-10 drop-shadow-sm">{t('Open Cost Estimator', language)}</span>
                <ArrowRight size={16} className="relative z-10" />
              </Link>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-3">
              {['Hotel: The Lodhi — Aug 10-12', 'Ticket: Red Fort — Aug 11 9 AM'].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="group flex justify-between items-center px-6 py-5 rounded-[28px] transition-all duration-400 hover:-translate-y-0.5 relative overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.06)'),
                    boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.05)'
                  }}>
                  {/* Left accent bar in black / luxury monochrome */}
                  <div
                    className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to bottom, #ffffff, #94a3b8)'
                        : 'linear-gradient(to bottom, #000000, #334155)',
                      boxShadow: isDark ? '2px 0 10px rgba(255,255,255,0.25)' : '2px 0 10px rgba(0,0,0,0.3)'
                    }}
                  />
                  <div className="pl-2">
                    <p
                      className="text-[16px] font-black drop-shadow-sm tracking-tight"
                      style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}
                    >
                      {b}
                    </p>
                    <p
                      className="text-[12px] font-bold mt-1.5 uppercase tracking-wider"
                      style={{ color: isDark ? '#94a3b8' : (isMonochrome ? '#222222' : '#475569') }}
                    >
                      Booking #{1000 + i}
                    </p>
                  </div>
                  {/* Confirmed Feature Badge — Black in all themes */}
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 select-none cursor-default"
                    style={{
                      background: '#000000',
                      border: isDark ? '1.5px solid rgba(255,255,255,0.35)' : '1.5px solid #000000',
                      color: '#ffffff',
                      boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.18)'
                    }}
                  >
                    <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {t('Confirmed', language)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Vault Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl shadow-sm" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,0.8)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Trip Vault & Travel Passes</h4>
                    <p className="text-[11px] font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {tripDocs.filter(d => d.status === 'uploaded').length} of {tripDocs.length} Documents Uploaded & Saved
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FC6C26] hover:bg-[#E5591A] text-white text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Add Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: isDark ? '#e2e8f0' : '#475569' }}
                    title="Restore default documents (Hotel Voucher & E-Ticket)"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              <AnimatePresence>
                {feedbackToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm ${
                      feedbackToast.type === 'delete'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <span>{feedbackToast.message}</span>
                    <button type="button" onClick={() => setFeedbackToast(null)} className="opacity-70 hover:opacity-100 ml-2 cursor-pointer">
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Custom Document Modal / Form */}
              {showAddCustomModal && (
                <motion.form
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddCustomDoc}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center gap-3 shadow-sm"
                >
                  <input
                    type="text"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    placeholder="Enter document name (e.g. Visa, Driving License, Cab Voucher)"
                    className="flex-1 w-full px-4 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#FC6C26] text-white text-xs font-bold hover:bg-[#E5591A] shadow-sm cursor-pointer"
                    >
                      Save Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomModal(false)}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Document Cards */}
              <div className="space-y-3">
                {tripDocs.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-[28px] transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.04)'), boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}
                  >
                    {/* Left status accent bar — Clean black/slate gradient in all themes */}
                    <div
                      className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full"
                      style={{
                        background: doc.status === 'required'
                          ? (isDark ? 'linear-gradient(to bottom,#475569,#334155)' : 'linear-gradient(to bottom,#000000,#334155)')
                          : (isDark ? 'linear-gradient(to bottom,#ffffff,#94a3b8)' : 'linear-gradient(to bottom,#000000,#1e293b)'),
                        boxShadow: isDark
                          ? '2px 0 10px rgba(255,255,255,0.2)'
                          : '2px 0 10px rgba(0,0,0,0.25)'
                      }}
                    />

                    {/* Left Icon and Title */}
                    <div className="flex items-center gap-4">
                      <span className="text-3xl shrink-0">{doc.icon}</span>
                      <div>
                        <p
                          className="text-[16px] font-black drop-shadow-sm tracking-tight"
                          style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}
                        >
                          {doc.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p
                            className="text-[11px] font-black uppercase tracking-wider"
                            style={{
                              color: doc.status === 'required' ? '#b45309' : (isDark ? '#e2e8f0' : '#000000')
                            }}
                          >
                            {doc.status === 'required' ? `⚠ ${t('Upload required', language)}` : `✓ ${t('Uploaded', language)}`}
                          </p>
                          {doc.fileName && (
                            <span className="text-[11px] font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                              • {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {doc.status === 'required' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(doc.id)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                            style={{
                              background: 'linear-gradient(135deg,#111827,#374151)',
                              color: '#ffffff',
                              boxShadow: '0 6px 16px rgba(17,24,39,0.25)'
                            }}
                          >
                            <UploadCloud size={14} />
                            <span>{t('Upload', language)}</span>
                          </button>

                          {/* Delete colour feature only for that add new (custom added documents) */}
                          {!doc.isSystemDefault && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete "${doc.name}" from your vault?`)) {
                                  handleDeleteDoc(doc.id)
                                }
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 shadow-sm"
                              title="Delete this custom document"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedViewDoc(doc)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                              color: isDark ? '#e2e8f0' : '#1e293b',
                              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0'
                            }}
                          >
                            <Eye size={14} className="text-[#FC6C26]" />
                            <span>{t('View', language)}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hidden file input for file picker */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept="image/*,application/pdf"
              />

              {/* Document Viewer Modal */}
              <TripDocumentViewerModal
                isOpen={Boolean(selectedViewDoc)}
                onClose={() => setSelectedViewDoc(null)}
                doc={selectedViewDoc}
                onDelete={handleDeleteDoc}
                passengerName={user?.name || 'Anant Ambani'}
                tripTitle={trip.title}
                tripDestination={trip.destinations?.join(', ') || 'Goa, India'}
              />
            </div>
          )}

          {activeTab === 'collaborators' && (
            <div className="space-y-4">
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl shadow-sm" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,0.8)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FC6C26]/10 flex items-center justify-center text-[#FC6C26]">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Trip Collaborators & Travelers</h4>
                    <p className="text-[11px] font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {collaborators.length} {collaborators.length === 1 ? 'person' : 'people'} collaborating in real time
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddCollabModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FC6C26] hover:bg-[#E5591A] text-white text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Add Collaborator</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: isDark ? '#e2e8f0' : '#334155', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0' }}
                    title="Copy trip invite link"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Copied Link!' : 'Invite Link'}</span>
                  </button>
                </div>
              </div>

              {/* Add Collaborator Form */}
              {showAddCollabModal && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddCollaborator}
                  className="p-6 rounded-3xl shadow-md space-y-4"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(248,250,252,0.9)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                  }}
                >
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <h4 className="font-black text-sm flex items-center gap-2" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                      <UserPlus size={16} className="text-[#FC6C26]" />
                      <span>Add Real Collaborator</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddCollabModal(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Radhika Merchant"
                        value={collabName}
                        onChange={(e) => setCollabName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20 transition-all"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                        }}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. radhika@gmail.com"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20 transition-all"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98200 12345"
                        value={collabPhone}
                        onChange={(e) => setCollabPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20 transition-all"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                        Trip Role
                      </label>
                      <select
                        value={collabRole}
                        onChange={(e) => setCollabRole(e.target.value as TripCollaborator['role'])}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20 transition-all cursor-pointer"
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#ffffff' : '#0f172a',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1'
                        }}
                      >
                        <option value="Co-organizer">Co-organizer (Full editing & booking permissions)</option>
                        <option value="Collaborator">Collaborator (Can add places & notes)</option>
                        <option value="Trip Member">Trip Member (Travel companion)</option>
                        <option value="Viewer">Viewer (Read-only itinerary view)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCollabModal(false)}
                      className="px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      style={{ color: isDark ? '#94a3b8' : '#475569' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-[#FC6C26] hover:bg-[#E5591A] text-white rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      Add Collaborator
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Collaborators List */}
              <div className="space-y-3">
                {collaborators.map((person, i) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-[28px] transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : (isMonochrome ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.04)'), boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black relative overflow-hidden shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${person.from}, ${person.to})`,
                            boxShadow: `0 10px 25px ${person.glow}`
                          }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse"
                          style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.6)' }}
                          title="Active Traveler"
                        />
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-lg tracking-tight drop-shadow-sm text-[#0f172a] dark:text-white"
                            style={{ color: isDark ? '#ffffff' : (isMonochrome ? '#000000' : '#0f172a') }}>
                            {person.name}
                          </p>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            person.isOwner
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : person.role === 'Co-organizer'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {person.role}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                          <span className="flex items-center gap-1 font-medium">
                            <Mail size={12} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                            <span>{person.email}</span>
                          </span>
                          {person.phone && (
                            <span className="flex items-center gap-1 font-medium">
                              <Phone size={12} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                              <span>{person.phone}</span>
                            </span>
                          )}
                          <span className="text-[11px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            • {person.addedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Status and Delete action */}
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Active</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove "${person.name}" from this trip?`)) {
                            handleDeleteCollaborator(person.id)
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold cursor-pointer"
                        title={`Remove ${person.name}`}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prep' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TripPrepPanel
                timeline={timeline}
                checklist={checklist}
                tripId={id || trip.id}
              />
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

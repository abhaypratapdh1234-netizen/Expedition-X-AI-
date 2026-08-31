/**
 * MemoryTagger.tsx — Memory Weight™ Tagger Premium Edition
 * Theme-aware premium styles for dark mode, preserving light/monochrome themes.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Lock, Unlock, Send, X, Sparkles } from 'lucide-react'
import {
  MEMORY_TAGS,
  tagPlaceMemory,
  getTripMemories,
  removeMemory,
  type MemoryTagId,
  type PlaceMemory,
} from '../../services/infrastructureService'
import { useThemeStore } from '../../stores/themeStore'

const FONT = "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
const FONT_BODY = "'Inter', 'Segoe UI', sans-serif"

interface MemoryTaggerProps {
  tripId: string
  placeId: string
  placeName: string
  userId?: string
}

export function MemoryTagger({ tripId, placeId, placeName, userId = 'user-1' }: MemoryTaggerProps) {
  const [memories, setMemories] = useState<PlaceMemory[]>([])
  const [selectedTag, setSelectedTag] = useState<MemoryTagId | null>(null)
  const [weight, setWeight] = useState(3)
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [savedTag, setSavedTag] = useState<string | null>(null)

  const theme = useThemeStore(s => s.theme)
  const isDark = theme === 'dark'

  const loadMemories = () => {
    const all = getTripMemories(tripId)
    setMemories(all.filter(m => m.placeId === placeId))
  }

  const handleDelete = (memoryId: string) => {
    removeMemory(memoryId)
    loadMemories()
  }

  useEffect(() => {
    loadMemories()
  }, [tripId, placeId])

  const existingTagIds = memories.map(m => m.tagId)

  const handleTagSelect = (tagId: MemoryTagId) => {
    if (existingTagIds.includes(tagId)) return
    const next = selectedTag === tagId ? null : tagId
    setSelectedTag(next)
    setShowForm(next !== null)
  }

  const handleSave = () => {
    if (!selectedTag) return
    tagPlaceMemory(userId, tripId, placeId, placeName, selectedTag, weight, note, isPublic)
    setSavedTag(selectedTag)
    loadMemories()
    setTimeout(() => {
      setSavedTag(null)
      setSelectedTag(null)
      setWeight(3)
      setNote('')
      setIsPublic(false)
      setShowForm(false)
    }, 1600)
  }

  const selectedMeta = MEMORY_TAGS.find(t => t.id === selectedTag)

  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      background: isDark ? '#111111' : 'var(--bg-card)',
      border: isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)',
      boxShadow: '0 4px 24px rgba(139,92,246,0.07)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: isDark ? '1.5px solid #222222' : '1.5px solid #f3f4f6',
        background: isDark ? 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(124,58,237,0.05))' : 'linear-gradient(135deg, rgba(252,231,243,0.4), rgba(237,233,254,0.3))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #db2777, #7c3aed)',
            boxShadow: '0 4px 12px rgba(219,39,119,0.35)',
          }}>
            <Heart size={20} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <p style={{
              fontSize: 16, fontWeight: 900,
              fontFamily: FONT,
              color: isDark ? '#ffffff' : 'var(--text-primary)', margin: 0,
              letterSpacing: '-0.4px', lineHeight: 1.2,
            }}>Memory Weight™</p>
            <p style={{
              fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280',
              fontWeight: 600, margin: '3px 0 0', fontFamily: FONT,
            }}>Tag what this place meant to you</p>
          </div>
        </div>
        {memories.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 20,
            background: 'rgba(124,58,237,0.10)', color: '#6d28d9',
            border: '1.5px solid rgba(124,58,237,0.22)',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: FONT,
          }}>
            <Sparkles size={10} />
            {memories.length} tagged
          </span>
        )}
      </div>

      {/* ── Existing Tags ── */}
      {memories.length > 0 && (
        <div style={{ padding: '12px 18px 6px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {memories.map(m => {
            const meta = MEMORY_TAGS.find(t => t.id === m.tagId)
            if (!meta) return null
            return (
              <span
                key={m.id}
                style={{
                  fontSize: 12, fontWeight: 700,
                  fontFamily: FONT,
                  padding: '6px 12px', borderRadius: 20,
                  background: isDark ? 'rgba(255,255,255,0.05)' : `${meta.color}18`,
                  color: meta.color,
                  border: isDark ? '1px solid #333333' : `1.5px solid ${meta.color}35`,
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <span>{meta.emoji} {meta.name.replace('Most ', '')} · {m.weight}/5</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: meta.color, padding: 0, display: 'flex', alignItems: 'center',
                    opacity: 0.6, borderRadius: 3,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = '1' }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = '0.6' }}
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* ── Tag Grid ── */}
      <div style={{ padding: '14px 18px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {MEMORY_TAGS.map(tag => {
          const isExisting = existingTagIds.includes(tag.id)
          const isSelected = selectedTag === tag.id

          return (
            <motion.button
              key={tag.id}
              whileHover={{ scale: isExisting ? 1 : 1.025 }}
              whileTap={{ scale: isExisting ? 1 : 0.96 }}
              onClick={() => handleTagSelect(tag.id)}
              disabled={isExisting}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
                borderRadius: 14, cursor: isExisting ? 'default' : 'pointer',
                textAlign: 'left',
                border: isSelected
                  ? `2px solid ${tag.color}`
                  : isExisting
                    ? (isDark ? '1.5px solid #222222' : '1.5px solid var(--border-subtle)')
                    : (isDark ? '1.5px solid #333333' : '1.5px solid #e5e7eb'),
                background: isSelected
                  ? (isDark ? 'rgba(124,58,237,0.15)' : `${tag.color}18`)
                  : isExisting
                    ? (isDark ? '#0A0A0A' : 'var(--bg-secondary)')
                    : (isDark ? '#222222' : '#f8f9fa'),
                boxShadow: isSelected ? `0 0 0 3px ${tag.color}18, 0 4px 14px ${tag.color}20` : 'none',
                opacity: isExisting && !isSelected ? 0.65 : 1,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{tag.emoji}</span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 800,
                fontFamily: FONT, letterSpacing: '-0.2px',
                color: isSelected ? tag.color : isExisting ? tag.color : (isDark ? '#ffffff' : '#1f2937'),
              }}>
                {tag.name.replace('Most ', '')}
              </span>
              {isExisting && (
                <span style={{
                  fontSize: 11, width: 20, height: 20, borderRadius: '50%',
                  background: `${tag.color}20`, color: tag.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, flexShrink: 0,
                }}>✓</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── Tag Form ── */}
      <AnimatePresence>
        {showForm && selectedTag && selectedMeta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderTop: isDark ? '1.5px solid #222222' : '1.5px solid #f3f4f6' }}
          >
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tag header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{selectedMeta.emoji}</span>
                <div>
                  <p style={{
                    fontSize: 15, fontWeight: 900,
                    fontFamily: FONT,
                    color: selectedMeta.color, margin: 0, letterSpacing: '-0.3px',
                  }}>{selectedMeta.name}</p>
                  <p style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500, margin: '2px 0 0', fontFamily: FONT_BODY }}>
                    Rate the intensity below
                  </p>
                </div>
              </div>

              {/* Intensity slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#ffffff' : '#111827', fontFamily: FONT }}>Intensity</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: selectedMeta.color, fontFamily: FONT }}>{weight}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[1, 2, 3, 4, 5].map(w => (
                    <motion.button
                      key={w}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setWeight(w)}
                      style={{
                        flex: 1, height: 12, borderRadius: 5, border: 'none', cursor: 'pointer',
                        background: w <= weight ? selectedMeta.color : (isDark ? '#222222' : '#e5e7eb'),
                        opacity: w <= weight ? 1 : 0.4,
                        transition: 'all 0.15s',
                        boxShadow: w <= weight ? `0 2px 6px ${selectedMeta.color}40` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 700,
                  color: isDark ? '#ffffff' : '#111827', marginBottom: 8, fontFamily: FONT,
                }}>
                  Personal Note{' '}
                  <span style={{ fontWeight: 400, color: isDark ? '#94a3b8' : '#9ca3af', fontSize: 12 }}>(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What made this place special to you?"
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 13px', borderRadius: 12, fontSize: 13,
                    resize: 'none', outline: 'none', boxSizing: 'border-box',
                    background: isDark ? '#0A0A0A' : '#f9fafb',
                    color: isDark ? '#ffffff' : '#111827',
                    border: isDark ? '1.5px solid #222222' : '1.5px solid #e5e7eb',
                    fontFamily: FONT_BODY, fontWeight: 400, lineHeight: 1.55,
                  }}
                  onFocus={e => { e.currentTarget.style.border = `1.5px solid ${selectedMeta.color}` }}
                  onBlur={e => { e.currentTarget.style.border = isDark ? '1.5px solid #222222' : '1.5px solid #e5e7eb' }}
                />
              </div>

              {/* Privacy toggle */}
              <button
                onClick={() => setIsPublic(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: isPublic ? 'rgba(16,185,129,0.08)' : (isDark ? '#0A0A0A' : '#f9fafb'),
                  border: `1.5px solid ${isPublic ? 'rgba(16,185,129,0.30)' : (isDark ? '1.5px solid #222222' : '#e5e7eb')}`,
                  borderRadius: 12, cursor: 'pointer', padding: '9px 13px',
                  fontSize: 12, fontWeight: 700,
                  color: isPublic ? '#059669' : (isDark ? '#94a3b8' : '#6b7280'),
                  transition: 'all 0.2s', width: '100%', fontFamily: FONT,
                }}
              >
                {isPublic
                  ? <Unlock size={14} style={{ color: '#10b981' }} />
                  : <Lock size={14} />}
                {isPublic ? 'Public — contributes to place significance' : 'Private — only visible to you'}
              </button>

              {/* Save & Cancel */}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!!savedTag}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                    color: '#fff', fontSize: 14, fontWeight: 900,
                    fontFamily: FONT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: savedTag
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : `linear-gradient(135deg, ${selectedMeta.color}, ${selectedMeta.color}cc)`,
                    boxShadow: savedTag
                      ? '0 4px 16px rgba(16,185,129,0.35)'
                      : `0 4px 16px ${selectedMeta.color}40`,
                    transition: 'all 0.25s',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {savedTag ? <><Sparkles size={15} /> Memory Saved!</> : <><Send size={14} /> Save Memory</>}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setShowForm(false); setSelectedTag(null) }}
                  style={{
                    padding: '14px 16px', borderRadius: 14,
                    border: isDark ? '1.5px solid #333333' : '1.5px solid #e5e7eb',
                    cursor: 'pointer',
                    background: isDark ? '#222222' : '#f9fafb',
                    color: isDark ? '#ffffff' : '#6b7280', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

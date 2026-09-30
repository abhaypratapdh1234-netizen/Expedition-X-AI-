/**
 * InviteJoinPage.tsx
 * The page that opens when a friend clicks the invite link.
 * Captures their real GPS and writes it to localStorage so the
 * organiser's radar can display their actual position.
 *
 * URL format: /join?g={groupId}&m={memberId}&n={memberName}
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { reverseGeocode, loadMembersFromStorage, saveMembersToStorage } from '../hooks/useGroupTracking'
import type { GroupMember } from '../hooks/useGroupTracking'

export default function InviteJoinPage() {
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('g') || ''
  const memberId = searchParams.get('m') || ''
  const memberName = decodeURIComponent(searchParams.get('n') || 'Friend')

  const [phase, setPhase] = useState<'idle' | 'requesting' | 'sharing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const watchRef = { current: null as number | null }

  const startSharing = () => {
    if (!groupId || !memberId) {
      setErrorMsg('Invalid invite link. Please ask the trip organiser to share a new link.')
      setPhase('error')
      return
    }
    if (!('geolocation' in navigator)) {
      setErrorMsg('Your browser does not support location sharing.')
      setPhase('error')
      return
    }
    setPhase('requesting')
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setPhase('sharing')
        const label = await reverseGeocode(lat, lon)
        setLocationLabel(label)

        const stored = loadMembersFromStorage(groupId)
        const existing = stored.find(m => m.id === memberId)
        let updated: GroupMember[]
        if (existing) {
          updated = stored.map(m =>
            m.id === memberId
              ? { ...m, lat, lon, locationLabel: label, lastSeen: Date.now(), inviteAccepted: true, status: 'safe' as const }
              : m
          )
        } else {
          const newMember: GroupMember = {
            id: memberId,
            name: memberName,
            avatar: '\uD83C\uDF92',
            lat, lon,
            lastSeen: Date.now(),
            locationLabel: label,
            distanceFromGroupCentroid: 0,
            isAlert: false,
            battery: 100,
            phone: '',
            status: 'safe',
            inviteAccepted: true,
          }
          updated = [...stored, newMember]
        }
        saveMembersToStorage(groupId, updated)
        setPhase('done')
      },
      (err) => {
        if (err.code === 1) {
          setErrorMsg('You denied location access. Please allow it and try again.')
        } else {
          setErrorMsg('Could not get your location. Ensure GPS is enabled.')
        }
        setPhase('error')
      },
      { enableHighAccuracy: true, timeout: 20000 }
    )
  }

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-2xl p-8 text-center space-y-6">
        <div className="text-5xl">\uD83E\uDDED</div>
        <h1 className="text-2xl font-black tracking-tight">Join Trip Group</h1>

        {!groupId || !memberId ? (
          <div className="text-red-600 font-bold">
            Invalid invite link. Please ask the trip organiser to share a fresh link.
          </div>
        ) : phase === 'idle' ? (
          <>
            <p className="text-neutral-600 text-[15px]">
              <strong>{memberName}</strong>, you have been invited to share your real-time location
              with the ExpeditionX trip group.
            </p>
            <p className="text-neutral-500 text-[13px]">
              Your location will update every 15 seconds and appear on the group radar map.
              You can close this page to stop sharing.
            </p>
            <button
              onClick={startSharing}
              className="w-full py-4 rounded-2xl bg-black text-white text-[15px] font-black hover:bg-neutral-900 transition-all shadow-lg"
            >
              \uD83D\uDCCD Share My Live Location
            </button>
          </>
        ) : phase === 'requesting' ? (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin mx-auto" />
            <p className="font-bold text-neutral-700">Requesting your GPS location\u2026</p>
            <p className="text-[12px] text-neutral-500">Please allow location access when your browser prompts.</p>
          </div>
        ) : phase === 'sharing' ? (
          <div className="space-y-3">
            <div className="text-4xl">\uD83D\uDCCD</div>
            <p className="font-black text-[16px]">Location Active!</p>
            <p className="text-[13px] text-neutral-600 font-medium">\uD83D\uDCCD {locationLabel}</p>
            <p className="text-[12px] text-neutral-500">
              Your live location has been shared with the trip group. Keep this page open to continue updating.
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-[13px] font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Sharing in real-time
            </div>
          </div>
        ) : phase === 'done' ? (
          <div className="space-y-3">
            <div className="text-4xl">\u2705</div>
            <p className="font-black text-[16px]">You are live on the radar!</p>
            <p className="text-[13px] text-neutral-600">
              Your location <strong>{locationLabel}</strong> is now visible to the trip organiser.
            </p>
            <p className="text-[11px] text-neutral-400">
              Re-open this link on your device anytime to refresh your position.
            </p>
          </div>
        ) : phase === 'error' ? (
          <div className="space-y-4">
            <div className="text-4xl">\u26A0\uFE0F</div>
            <p className="text-red-600 font-bold text-[14px]">{errorMsg}</p>
            <button
              onClick={() => setPhase('idle')}
              className="w-full py-3 rounded-2xl border-2 border-black text-black font-black hover:bg-neutral-100 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : null}

        <p className="text-[10px] text-neutral-400 pt-2">
          Powered by ExpeditionX AI \u00B7 Location data is only shared within your trip group.
          We do not store location data on any server.
        </p>
      </div>
    </div>
  )
}

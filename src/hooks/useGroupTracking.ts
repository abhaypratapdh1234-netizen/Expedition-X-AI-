/**
 * useGroupTracking.ts
 * Real-time group location tracking using browser Geolocation API.
 * Uses localStorage as a shared bus so that any device/tab that opens the invite link
 * can post its real GPS coordinates and appear on the organiser's radar.
 *
 * Storage key schema:
 *   group:{groupId}:members  -> JSON array of GroupMember objects
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface GroupMember {
  id: string
  name: string
  avatar: string
  lat: number | null
  lon: number | null
  lastSeen: number
  locationLabel: string
  distanceFromGroupCentroid: number
  isAlert: boolean
  battery: number
  phone: string
  status: 'safe' | 'alert' | 'offline'
  isMe?: boolean
  inviteAccepted?: boolean
}

const POLL_INTERVAL_MS = 15_000

export function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getStorageKey(groupId: string) {
  return `group:${groupId}:members`
}

export function loadMembersFromStorage(groupId: string): GroupMember[] {
  try {
    const raw = localStorage.getItem(getStorageKey(groupId))
    if (!raw) return []
    return JSON.parse(raw) as GroupMember[]
  } catch {
    return []
  }
}

export function saveMembersToStorage(groupId: string, members: GroupMember[]) {
  try {
    localStorage.setItem(getStorageKey(groupId), JSON.stringify(members))
  } catch {
    // storage quota exceeded
  }
}

/** Reverse-geocode lat/lon to human-readable label using Nominatim */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'ExpeditionXAI/1.0' } }
    )
    const data = await res.json()
    const addr = data.address || {}
    const parts = [
      addr.road || addr.pedestrian || addr.footway,
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.county,
    ].filter(Boolean)
    return parts.length > 0
      ? parts.join(', ')
      : (data.display_name?.split(',').slice(0, 2).join(', ') ?? 'Unknown location')
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}

export function useGroupTracking(groupId: string, geofenceKm: number) {
  const [myLocation, setMyLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [myLabel, setMyLabel] = useState<string>('Fetching your location\u2026')
  const [myBattery, setMyBattery] = useState<number>(100)
  const [members, setMembers] = useState<GroupMember[]>(() => loadMembersFromStorage(groupId))
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(true)
  const watchIdRef = useRef<number | null>(null)

  // Get real battery level
  useEffect(() => {
    if ('getBattery' in navigator) {
      ;(navigator as Navigator & { getBattery: () => Promise<{ level: number }> })
        .getBattery()
        .then(bat => setMyBattery(Math.round(bat.level * 100)))
        .catch(() => {})
    }
  }, [])

  // Watch organiser's real GPS
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.')
      setIsLocating(false)
      return
    }
    setIsLocating(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setMyLocation({ lat, lon })
        setIsLocating(false)
        setLocationError(null)
        const label = await reverseGeocode(lat, lon)
        setMyLabel(label)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === 1) {
          setLocationError('Location access denied. Please allow location in browser settings.')
        } else if (err.code === 2) {
          setLocationError('Location unavailable. Check your device GPS.')
        } else {
          setLocationError('Location timed out. Retrying\u2026')
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  // Sync from localStorage on interval and storage events (cross-tab)
  const syncFromStorage = useCallback(() => {
    const stored = loadMembersFromStorage(groupId)
    setMembers(stored)
  }, [groupId])

  useEffect(() => {
    syncFromStorage()
    const interval = setInterval(syncFromStorage, POLL_INTERVAL_MS)
    const handler = (e: StorageEvent) => {
      if (e.key === getStorageKey(groupId)) syncFromStorage()
    }
    window.addEventListener('storage', handler)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handler)
    }
  }, [groupId, syncFromStorage])

  // Recompute distances when my location or members change
  const membersWithDistance: GroupMember[] = members.map(m => {
    if (!myLocation || m.lat === null || m.lon === null) {
      return { ...m }
    }
    const dist = parseFloat(calcDistanceKm(myLocation.lat, myLocation.lon, m.lat, m.lon).toFixed(2))
    const isAlert = dist > geofenceKm
    return { ...m, distanceFromGroupCentroid: dist, isAlert, status: isAlert ? 'alert' as const : 'safe' as const }
  })

  const addPendingMember = useCallback((name: string, phone: string, avatar: string): GroupMember => {
    const newMember: GroupMember = {
      id: `gm-${Date.now()}`,
      name,
      avatar,
      lat: null,
      lon: null,
      lastSeen: Date.now(),
      locationLabel: 'Invite sent \u2014 awaiting their location\u2026',
      distanceFromGroupCentroid: 0,
      isAlert: false,
      battery: 100,
      phone,
      status: 'offline',
      inviteAccepted: false,
    }
    setMembers(prev => {
      const next = [...prev, newMember]
      saveMembersToStorage(groupId, next)
      return next
    })
    return newMember
  }, [groupId])

  const removeMember = useCallback((memberId: string) => {
    setMembers(prev => {
      const next = prev.filter(m => m.id !== memberId)
      saveMembersToStorage(groupId, next)
      return next
    })
  }, [groupId])

  const pingMember = useCallback((_memberId: string) => {
    // In production: send push notification via FCM / WebSocket
  }, [])

  return {
    myLocation,
    myLabel,
    myBattery,
    isLocating,
    locationError,
    members: membersWithDistance,
    addPendingMember,
    removeMember,
    pingMember,
    syncFromStorage,
  }
}

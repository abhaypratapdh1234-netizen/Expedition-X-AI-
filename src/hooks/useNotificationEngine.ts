/**
 * useNotificationEngine — ExpeditionX AI
 * ─────────────────────────────────────────────────────────────
 * A fully event-driven notification engine that watches real app
 * state (trips, auth, bookings, wishlist) and dispatches accurate,
 * context-aware notifications to the notificationStore.
 *
 * This hook should be mounted ONCE inside AppShell so it's always
 * active while the user is logged in.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useTripStore } from '../stores/tripStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useWishlistStore } from '../stores/wishlistStore'

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

function uid(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** A tiny singleton key-value store (survives re-renders, not sessions) */
const fired = new Set<string>()

// ─── Main Hook ───────────────────────────────────────────────────────────────

export function useNotificationEngine() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const trips = useTripStore((s) => s.trips)
  const savedPlaceIds = useWishlistStore((s) => s.savedPlaceIds)
  const savedFlights = useWishlistStore((s) => s.savedFlights)
  const { pushNotification, notifications } = useNotificationStore()

  const prevTripCount = useRef<number>(0)
  const prevWishlistPlaceCount = useRef<number>(0)
  const prevWishlistFlightCount = useRef<number>(0)
  const sessionStarted = useRef<boolean>(false)

  // ── 1. Welcome notification on first login of session ───────────────────
  useEffect(() => {
    if (!isAuthenticated || !user || sessionStarted.current) return
    sessionStarted.current = true

    const key = `welcome-${user.id}-${new Date().toDateString()}`
    if (fired.has(key)) return
    fired.add(key)

    const hour = new Date().getHours()
    const greeting =
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    pushNotification(
      'system',
      `${greeting}, ${user.name?.split(' ')[0] || 'Explorer'}! 👋`,
      `Welcome back to ExpeditionX AI. Your travel universe is ready — you have ${notifications.filter((n) => !n.read).length} unread updates.`,
      '/app/dashboard',
      '✨'
    )
  }, [isAuthenticated, user])

  // ── 2. Trip-based smart notifications ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !trips?.length) return

    for (const trip of trips) {
      if (!trip?.id || !trip?.startDate) continue

      const days = daysUntil(trip.startDate)
      const tripName = trip.title || trip.destinations?.[0] || 'your trip'

      // 2a. Trip departing tomorrow
      const key24h = `trip-24h-${trip.id}`
      if (days === 1 && !fired.has(key24h)) {
        fired.add(key24h)
        pushNotification(
          'trip',
          `🚀 Departure Tomorrow — ${tripName}`,
          `Your trip to ${tripName} is TOMORROW! Double-check your packing list, documents, and transport.`,
          `/app/trips/${trip.id}`,
          '🚀'
        )
      }

      // 2b. Trip departing in 3 days
      const key3d = `trip-3d-${trip.id}`
      if (days === 3 && !fired.has(key3d)) {
        fired.add(key3d)
        pushNotification(
          'trip',
          `✈️ Trip in 3 Days — ${tripName}`,
          `${tripName} is just 3 days away! Your AI itinerary is ready. Check weather forecasts and confirm bookings.`,
          `/app/trips/${trip.id}`,
          '✈️'
        )
      }

      // 2c. Trip departing in 7 days
      const key7d = `trip-7d-${trip.id}`
      if (days === 7 && !fired.has(key7d)) {
        fired.add(key7d)
        pushNotification(
          'trip',
          `📅 One Week to Go — ${tripName}`,
          `One week until ${tripName}! Now is the best time to book local experiences and check visa requirements.`,
          `/app/trips/${trip.id}`,
          '📅'
        )
      }

      // 2d. Trip in 30 days — early planning nudge
      const key30d = `trip-30d-${trip.id}`
      if (days <= 30 && days > 25 && !fired.has(key30d)) {
        fired.add(key30d)
        pushNotification(
          'trip',
          `🗺️ Trip Planning Nudge — ${tripName}`,
          `You have about a month until ${tripName}. AI recommends booking accommodation now — prices typically rise 15% closer to the date.`,
          `/app/trips/${trip.id}`,
          '🗺️'
        )
      }

      // 2e. Ongoing trip (started today or is active)
      const endDays = trip.endDate ? daysUntil(trip.endDate) : null
      const keyLive = `trip-live-${trip.id}`
      if (days <= 0 && (endDays === null || endDays >= 0) && !fired.has(keyLive)) {
        fired.add(keyLive)
        pushNotification(
          'trip',
          `🌍 Safe Travels — ${tripName}`,
          `Your trip to ${tripName} has begun! ExpeditionX AI is with you. Tap to activate Live Trip Mode.`,
          `/app/trips/${trip.id}/live`,
          '🌍'
        )
      }
    }

    // 2f. New trip added (count increased since last render)
    if (prevTripCount.current > 0 && trips.length > prevTripCount.current) {
      const newest = trips[0]
      if (newest) {
        const key = `new-trip-${newest.id}`
        if (!fired.has(key)) {
          fired.add(key)
          pushNotification(
            'trip',
            `🎉 Trip Created — ${newest.title || newest.destinations?.[0] || 'New Adventure'}`,
            `Your new trip has been added! AI is personalizing your itinerary, budget, and recommendations.`,
            `/app/trips/${newest.id}`,
            '🎉'
          )
        }
      }
    }
    prevTripCount.current = trips.length
  }, [isAuthenticated, trips])

  // ── 3. Wishlist notifications ────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    // New place saved to wishlist
    if (prevWishlistPlaceCount.current > 0 && savedPlaceIds.length > prevWishlistPlaceCount.current) {
      const key = `wishlist-place-${savedPlaceIds.length}`
      if (!fired.has(key)) {
        fired.add(key)
        pushNotification(
          'promo',
          '❤️ Destination Saved to Wishlist',
          `We'll watch prices and deals for your saved destination. You'll be notified when a price drop occurs!`,
          '/app/wishlist',
          '❤️'
        )
      }
    }
    prevWishlistPlaceCount.current = savedPlaceIds.length
  }, [isAuthenticated, savedPlaceIds])

  useEffect(() => {
    if (!isAuthenticated) return

    // New flight saved to wishlist
    if (prevWishlistFlightCount.current > 0 && savedFlights.length > prevWishlistFlightCount.current) {
      const newest = savedFlights[savedFlights.length - 1]
      const key = `wishlist-flight-${newest?.id || savedFlights.length}`
      if (!fired.has(key)) {
        fired.add(key)
        pushNotification(
          'promo',
          '✈️ Flight Saved — Price Alert Active',
          `Your saved flight is being monitored. We'll notify you the moment the price changes or a better deal appears.`,
          '/app/wishlist',
          '✈️'
        )
      }
    }
    prevWishlistFlightCount.current = savedFlights.length
  }, [isAuthenticated, savedFlights])

  // ── 4. Periodic intelligent feed (simulates backend push events) ─────────
  // Fires a relevant smart notification every few minutes while the app is open.
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const smartFeed = [
      {
        type: 'promo' as const,
        title: '🏷️ Flash Deal — Shimla Packages',
        message:
          'Limited-time: Shimla 3N/4D packages from ₹8,999. Includes hotel + transport. Only 12 slots left!',
        link: '/app/explore/search?q=Shimla',
        icon: '🏷️',
      },
      {
        type: 'weather_alert' as const,
        title: '🌦️ Monsoon Update — Goa',
        message:
          'Southwest monsoon expected to intensify over North Goa this weekend. AI has adjusted your Plan B activities.',
        link: '/app/planner/workspace',
        icon: '🌦️',
      },
      {
        type: 'scam_alert' as const,
        title: '⚠️ Travel Advisory — Delhi NCR',
        message:
          'Community report: Unlicensed taxis operating near IGI Airport T3. Use official pre-paid taxi counters.',
        link: '/app/planner/workspace',
        icon: '⚠️',
      },
      {
        type: 'promo' as const,
        title: '✈️ Price Drop — Mumbai to Bangalore',
        message:
          'Airfare for MUM→BLR dropped 31% today. From ₹1,899 (non-stop). Your AI assistant found 3 options.',
        link: '/app/book/flights',
        icon: '✈️',
      },
      {
        type: 'challenge' as const,
        title: '🏆 New Explorer Challenge Unlocked',
        message:
          'Complete "Weekend Warrior" — visit 2 hill stations in 60 days. Earn 500 XP + exclusive badge!',
        link: '/app/rewards',
        icon: '🏆',
      },
      {
        type: 'referral' as const,
        title: '👫 Your Friend Joined ExpeditionX!',
        message:
          'Your referral link was used — you earned ₹200 travel credits. Share more to unlock premium perks!',
        link: '/app/rewards/referral',
        icon: '👫',
      },
      {
        type: 'system' as const,
        title: '🔒 Account Security',
        message:
          'New login detected from Chrome on Windows. If this was you, no action needed. If not, secure your account now.',
        link: '/app/settings',
        icon: '🔒',
      },
      {
        type: 'offline_pack' as const,
        title: '📥 Offline Pack Ready — Manali',
        message:
          'Your Manali offline maps, restaurant guide, and emergency contacts are downloaded and ready for no-signal zones.',
        link: '/app/planner/workspace',
        icon: '📥',
      },
      {
        type: 'promo' as const,
        title: '🎟️ Festival Season Deals',
        message:
          'Diwali travel demand rising fast. Lock in your Varanasi or Jaipur hotel now — our AI predicts 40% price surge next week.',
        link: '/app/explore',
        icon: '🎟️',
      },
      {
        type: 'capsule_unlock' as const,
        title: '💌 Time Capsule Unlocked — Last Trip',
        message:
          'Remember your Rishikesh trip? A memory capsule you created 6 months ago is now unlocked. Relive it!',
        link: '/app/memories',
        icon: '💌',
      },
    ]

    // Fire the first smart notification after 90 seconds (gives user time to settle)
    const firstTimer = setTimeout(() => {
      const feed = smartFeed[Math.floor(Math.random() * smartFeed.length)]
      const key = `smart-feed-${feed.title}`
      if (!fired.has(key)) {
        fired.add(key)
        pushNotification(feed.type, feed.title, feed.message, feed.link, feed.icon)
      }
    }, 90_000)

    // Fire subsequent smart notifications every 4-6 minutes with variety
    let idx = 0
    const periodicInterval = setInterval(() => {
      idx = (idx + 1) % smartFeed.length
      const feed = smartFeed[idx]
      const key = `smart-${Date.now()}-${idx}`
      // Unique by rotating feed
      fired.add(key)
      pushNotification(feed.type, feed.title, feed.message, feed.link, feed.icon)
    }, 5 * 60_000) // every 5 minutes

    return () => {
      clearTimeout(firstTimer)
      clearInterval(periodicInterval)
    }
  }, [isAuthenticated, user?.id])
}

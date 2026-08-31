/**
 * ExpeditionX AI — Global Motion Tokens
 * Import from this file everywhere. Never hardcode durations/easings inline.
 *
 * Purpose tags used throughout the app:
 *   Entrance   — element appearing for the first time
 *   Feedback   — response to user interaction (press, hover, toggle)
 *   Transition — moving between states / routes
 *   Ambient    — looping idle animation (max 1–2 per screen)
 *   Data-Driven — triggered by data changes (XP bar, chart updates)
 */

// ─── Spring Presets ──────────────────────────────────────────────────────────

/** For interactive elements the user directly touches (buttons, drag, nav pills) */
export const springSnappy = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
}

/** For panels, modals, drawers — softer settle */
export const springSoft = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
}

// ─── Easing Curves ───────────────────────────────────────────────────────────

/** Custom "expo-out" — for passive content reveals (page load, scroll in) */
export const easeReveal: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Sharper exit — elements leaving the screen */
export const easeExit: [number, number, number, number] = [0.7, 0, 0.84, 0]

// ─── Duration Tokens (seconds) ───────────────────────────────────────────────

export const durations = {
  micro: 0.15,  // button press, toggle
  fast: 0.25,   // hover, small UI feedback
  base: 0.4,    // card reveal, modal open
  slow: 0.7,    // page transition, hero elements
} as const

// ─── Stagger Helpers ─────────────────────────────────────────────────────────

export const stagger = {
  /** Apply to the wrapping motion.div of a list */
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },
  /** Apply to each list item */
  item: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: easeReveal,
        duration: durations.base,
      },
    },
  },
  /** Faster stagger for dense grids */
  itemFast: {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: easeReveal,
        duration: durations.fast,
      },
    },
  },
} as const



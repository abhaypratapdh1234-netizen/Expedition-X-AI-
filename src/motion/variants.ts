/**
 * ExpeditionX AI — Reusable Animation Variants
 * All shared variant objects for components. Import and apply directly.
 */

import { springSnappy, springSoft, easeReveal, easeExit, durations } from './tokens'

// ─── Page / Route Transitions ────────────────────────────────────────────────

/**
 * Direction-aware content area slide.
 * Pass `direction: 1` (forward) or `-1` (back) as custom prop.
 */
export const pageTransition = {
  initial: (direction: number = 1) => ({
    opacity: 0,
    x: (direction || 1) * 12,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.base, ease: easeReveal },
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    x: (direction || 1) * -12,
    transition: { duration: durations.fast, ease: easeExit },
  }),
}


// ─── Dropdown / Popover ──────────────────────────────────────────────────────

export const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96, transformOrigin: 'top right' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...springSnappy, duration: durations.fast },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: durations.micro, ease: easeExit },
  },
}

export const dropdownItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { ease: easeReveal, duration: durations.fast } },
}

// ─── Card Animations ─────────────────────────────────────────────────────────


export const cardHover = {
  rest: { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  hover: {
    y: -6,
    boxShadow: '0 16px 40px rgba(15,107,92,0.18)',
    transition: springSnappy,
  },
}

// ─── Stagger & List Items ───────────────────────────────────────────────────

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const itemPop = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: springSnappy },
  exit: { opacity: 0, scale: 0.95, transition: { duration: durations.fast, ease: easeExit } },
}

// ─── SVG Draw-In (Checkmark, Route Line) ─────────────────────────────────────

export const svgDrawIn = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { ease: easeReveal, duration: durations.slow }, opacity: { duration: 0.1 } },
  },
}

// ─── Interactive Elements (Buttons, Cards, Icons) ────────────────────────────

export const buttonInteraction = {
  whileHover: { scale: 1.02, y: -2, transition: springSnappy },
  whileTap: { scale: 0.97, y: 0, transition: springSnappy },
}

export const cardInteraction = {
  whileHover: { scale: 1.015, y: -4, transition: springSoft },
  whileTap: { scale: 0.98, y: 0, transition: springSnappy },
}

export const iconButtonInteraction = {
  whileHover: { scale: 1.1, rotate: 5, transition: springSnappy },
  whileTap: { scale: 0.9, rotate: -5, transition: springSnappy },
}

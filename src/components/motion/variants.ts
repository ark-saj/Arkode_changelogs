import type { Transition, Variants } from "framer-motion";

/* Arkode Mosaic — shared Framer Motion variants.
   All transitions use the Mosaic ease cubic-bezier(0.22,0.68,0,1) and the
   token durations 120/200/320ms. Purposeful motion, not motion on everything.
   Every consumer must still respect useReducedMotion (see motion-safe.tsx). */

export const EASE = [0.22, 0.68, 0, 1] as const;

export const DUR = {
  fast: 0.12, // 120ms
  base: 0.2, // 200ms
  slow: 0.32, // 320ms
} as const;

export const baseTransition: Transition = { duration: DUR.base, ease: EASE };

/** Simple opacity fade. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
};

/** Fade + 8px upward slide. The default "enter" for cards and rows. */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

/** Container that staggers its children (~0.05s) on enter. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
};

/** Subtle scale-in for modals / popovers (0.97 -> 1). */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.base, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: DUR.fast, ease: EASE },
  },
};

/** Animated expand/collapse: height auto + opacity. For ticket detail, etc. */
export const expandCollapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: DUR.slow, ease: EASE },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

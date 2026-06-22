"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DUR, EASE } from "@/components/motion/variants";

/* Arkode Mosaic — page/section transition wrapper.
   Wrap the content/section region. On `transitionKey` change it fades + slides
   (8px) the outgoing content out and the incoming content in via
   AnimatePresence. Under reduced motion it cross-fades instantly with no
   transform. Use for route templates or section/filter swaps. */

export interface PageTransitionProps {
  /** Change this to trigger an exit/enter cycle (e.g. pathname or filter key). */
  transitionKey: string;
  className?: string;
  children: React.ReactNode;
}

export function PageTransition({
  transitionKey,
  className,
  children,
}: PageTransitionProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        className={className}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: DUR.base, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

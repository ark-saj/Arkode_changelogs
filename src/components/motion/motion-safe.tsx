"use client";

import * as React from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";

/* Arkode Mosaic — reduced-motion-safe motion helpers.
   <MDiv>/<MSpan>/<MUl>/<MLi> behave like motion.* but, under
   prefers-reduced-motion, drop their animation props (initial/animate/exit/
   variants/whileInView/whileHover/whileTap/transition/layout) so content
   appears instantly with no transforms. Use these instead of raw motion.*
   whenever a transform/opacity animation should no-op for reduced motion. */

export function useMotionSafe(): boolean {
  // true => motion is allowed; false => reduce (no-op transforms).
  return !useReducedMotion();
}

// The animation-related props we strip when reduced motion is requested.
const MOTION_KEYS = [
  "initial",
  "animate",
  "exit",
  "variants",
  "whileInView",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "transition",
  "layout",
  "layoutId",
  "viewport",
] as const;

function stripMotionProps<T extends object>(props: T): T {
  const next = { ...props } as Record<string, unknown>;
  for (const k of MOTION_KEYS) delete next[k];
  return next as T;
}

type MotionTag = "div" | "span" | "ul" | "li" | "section" | "nav";

function makeSafe<Tag extends MotionTag>(tag: Tag) {
  const Component = motion[tag];
  const Safe = React.forwardRef<
    HTMLElement,
    MotionProps & React.HTMLAttributes<HTMLElement>
  >(function SafeMotion(props, ref) {
    const reduce = useReducedMotion();
    const finalProps = reduce ? stripMotionProps(props) : props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Cmp = Component as any;
    return <Cmp ref={ref} {...finalProps} />;
  });
  Safe.displayName = `MSafe(${tag})`;
  return Safe;
}

export const MDiv = makeSafe("div");
export const MSpan = makeSafe("span");
export const MUl = makeSafe("ul");
export const MLi = makeSafe("li");
export const MSection = makeSafe("section");
export const MNav = makeSafe("nav");

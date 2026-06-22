"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { PixelIcon, type PixelIconName } from "@/components/mosaic/pixel-icon";
import { DUR, EASE } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — fanned-card hero illustration (the Mistral fanned "M" cards).
   A stack of 3-4 rounded cards fanned (rotate + offset) like a hand of cards,
   each in a different mosaic accent (coral / blue / ink / orange) with a
   centered pixel icon and an e3 shadow. On mount they fan out from a stacked
   center (stagger + rotate + slide). Under reduced motion they render in their
   final fanned position with no animation. */

interface FanCard {
  bg: string; // background color
  icon: PixelIconName;
  rotate: number; // final rotation (deg)
  x: number; // final x offset (px)
  y: number; // final y offset (px)
}

// coral / blue / ink / orange — fanned left-to-right.
const DEFAULT_CARDS: FanCard[] = [
  { bg: "#FF6C5D", icon: "mark", rotate: -12, x: -96, y: 14 },
  { bg: "#2A6FDB", icon: "bolt", rotate: -4, x: -32, y: -2 },
  { bg: "#001C43", icon: "chartBar", rotate: 4, x: 32, y: -2 },
  { bg: "#FF8A3D", icon: "cube", rotate: 12, x: 96, y: 14 },
];

export interface FannedCardsProps {
  cards?: FanCard[];
  className?: string;
  /** Edge length of each card in px. */
  cardSize?: number;
}

export function FannedCards({
  cards = DEFAULT_CARDS,
  className,
  cardSize = 120,
}: FannedCardsProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ height: cardSize + 64 }}
      aria-hidden
    >
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center rounded-lg14 shadow-e3"
          style={{
            width: cardSize,
            height: cardSize,
            backgroundColor: c.bg,
            zIndex: i,
          }}
          initial={
            reduce
              ? false
              : { rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.9 }
          }
          animate={{
            rotate: c.rotate,
            x: c.x,
            y: c.y,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: DUR.slow,
            ease: EASE,
            delay: reduce ? 0 : i * 0.07,
          }}
        >
          <PixelIcon
            name={c.icon}
            unit={6}
            tint={c.bg === "#001C43" ? "#FF6C5D" : "#FFFFFF"}
          />
        </motion.div>
      ))}
    </div>
  );
}

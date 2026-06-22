import { Heart, Lightbulb, ThumbsUp, type LucideIcon } from "lucide-react";
import type { ReactionCounts, TicketStatus } from "@/lib/types";

/**
 * Presentation metadata for each ticket status (Mosaic).
 * Styled as muted mono badge tints: bg = status color at ~12% alpha, fg = the
 * color itself. Status colors are the one categorical exception to "one coral
 * per view" and read as a legend, not as competing UI accents.
 *
 * new          → Nuevo          coral-deep #E8503F (the brand tint — the star)
 * improvement  → Mejora         blue       #2A6FDB
 * fix          → Corrección     crimson    #C5362A
 * optimization → Optimización   orange     #FF8A3D
 *
 * Class strings are written out in full so Tailwind's JIT can see them.
 */
export const STATUS_META: Record<
  TicketStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "Nuevo",
    badgeClass:
      "text-[#E8503F] bg-[#E8503F]/[0.12] border-[#E8503F]/30 ring-[#E8503F]/10",
    dotClass: "bg-[#E8503F]",
  },
  improvement: {
    label: "Mejora",
    badgeClass:
      "text-[#2A6FDB] bg-[#2A6FDB]/[0.12] border-[#2A6FDB]/30 ring-[#2A6FDB]/10",
    dotClass: "bg-[#2A6FDB]",
  },
  fix: {
    label: "Corrección",
    badgeClass:
      "text-[#C5362A] bg-[#C5362A]/[0.12] border-[#C5362A]/30 ring-[#C5362A]/10",
    dotClass: "bg-[#C5362A]",
  },
  optimization: {
    label: "Optimización",
    badgeClass:
      "text-[#FF8A3D] bg-[#FF8A3D]/[0.12] border-[#FF8A3D]/30 ring-[#FF8A3D]/10",
    dotClass: "bg-[#FF8A3D]",
  },
};

export const STATUS_ORDER: TicketStatus[] = [
  "new",
  "improvement",
  "fix",
  "optimization",
];

/** Reaction definitions, in display order. Icons (no emoji) for brand consistency. */
export const REACTION_META: {
  key: keyof ReactionCounts;
  icon: LucideIcon;
  label: string;
}[] = [
  { key: "helped", icon: ThumbsUp, label: "Me ayudó" },
  { key: "love", icon: Heart, label: "Excelente mejora" },
  { key: "suggestion", icon: Lightbulb, label: "Tengo sugerencias" },
];

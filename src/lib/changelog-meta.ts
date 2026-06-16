import { Heart, Lightbulb, ThumbsUp, type LucideIcon } from "lucide-react";
import type { ReactionCounts, TicketStatus } from "@/lib/types";

/**
 * Presentation metadata for each ticket status.
 * Class strings are written out in full so Tailwind's JIT can see them.
 */
export const STATUS_META: Record<
  TicketStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "Nuevo",
    badgeClass:
      "text-status-new bg-status-new/10 border-status-new/30 ring-status-new/10",
    dotClass: "bg-status-new",
  },
  improvement: {
    label: "Mejora",
    badgeClass:
      "text-status-improvement bg-status-improvement/10 border-status-improvement/30 ring-status-improvement/10",
    dotClass: "bg-status-improvement",
  },
  fix: {
    label: "Corrección",
    badgeClass:
      "text-status-fix bg-status-fix/10 border-status-fix/30 ring-status-fix/10",
    dotClass: "bg-status-fix",
  },
  optimization: {
    label: "Optimización",
    badgeClass:
      "text-status-optimization bg-status-optimization/10 border-status-optimization/30 ring-status-optimization/10",
    dotClass: "bg-status-optimization",
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

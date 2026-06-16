/**
 * Domain model for the changelog ("Centro de Novedades").
 *
 * These types are the contract between the UI and ANY data source. The mock
 * repository and the Supabase repository both produce exactly these shapes, so
 * components never care where the data comes from.
 */

/** A ticket's nature, drives the colored badge. */
export type TicketStatus = "new" | "improvement" | "fix" | "optimization";

/** Functional area of Odoo a change belongs to. */
export interface Category {
  /** Stable key used in filters and URLs, e.g. "crm". */
  key: string;
  /** Human label shown in the UI, e.g. "CRM". */
  name: string;
  /** Lucide icon name used to render the chip. */
  icon: string;
}

/**
 * A single visual evidence of a change. For the demo we render a deterministic
 * "app mockup" from `variant` + `seed` (no external image needed). When a real
 * `url` is provided (e.g. Supabase Storage), it is used instead.
 */
export interface Screenshot {
  id: string;
  /** Short, user-friendly caption. */
  caption: string;
  /** Visual style of the generated mockup. */
  variant?: "form" | "list" | "dashboard" | "kanban" | "report";
  /** Optional real image URL. Takes precedence over the generated mockup. */
  url?: string;
  seed?: number;
}

/** A before/after visual comparison rendered with an interactive slider. */
export interface BeforeAfter {
  beforeCaption: string;
  afterCaption: string;
  beforeVariant?: Screenshot["variant"];
  afterVariant?: Screenshot["variant"];
  beforeUrl?: string;
  afterUrl?: string;
  seed?: number;
}

/** Lightweight, client-side reaction counters. */
export interface ReactionCounts {
  /** 👍 "Me ayudó" */
  helped: number;
  /** ❤️ "Excelente mejora" */
  love: number;
  /** 💡 "Tengo sugerencias" */
  suggestion: number;
}

/**
 * A single change presented to the end user. Language must be NON technical:
 * what changed, why it helps, and where to find it.
 */
export interface Ticket {
  /** Public code, e.g. "CRM-001". */
  code: string;
  title: string;
  /** One-line friendly summary shown collapsed. */
  summary: string;
  status: TicketStatus;
  categoryKey: string;
  /** "¿Qué cambió?" — plain explanation. */
  whatChanged: string;
  /** "¿Por qué es útil?" — concrete benefit for the user. */
  whyUseful: string;
  /** "¿Dónde lo encuentro?" — breadcrumb route, e.g. ["CRM","Oportunidades"]. */
  whereToFind: string[];
  screenshots: Screenshot[];
  beforeAfter?: BeforeAfter;
  /** Marks the change as a highlight ("Novedades más importantes"). */
  featured?: boolean;
  reactions: ReactionCounts;
}

/** A dated group of tickets — one node of the vertical timeline. */
export interface ChangelogEntry {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Optional headline for the release. */
  title?: string;
  /** Short summary of the release shown next to the date. */
  summary: string;
  tickets: Ticket[];
}

/** Aggregated KPIs shown in the dashboard, derived from the entries. */
export interface ChangelogStats {
  totalTickets: number;
  improvements: number;
  fixes: number;
  newFeatures: number;
  optimizations: number;
  /** ISO date of the most recent entry. */
  lastUpdate: string | null;
}

/** Everything the landing page needs in a single fetch. */
export interface ChangelogData {
  entries: ChangelogEntry[];
  categories: Category[];
  stats: ChangelogStats;
}

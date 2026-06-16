import type {
  BeforeAfter,
  Category,
  ChangelogData,
  ChangelogEntry,
  Screenshot,
  Ticket,
  TicketStatus,
} from "@/lib/types";
import type { ChangelogRepository } from "@/lib/data/repository";
import { computeStats, sortEntriesDesc } from "@/lib/data/compute-stats";
import { getSupabaseClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Raw row shapes (snake_case, as stored in Postgres).               */
/*  See supabase/schema.sql for the matching DDL.                     */
/* ------------------------------------------------------------------ */
interface CategoryRow {
  key: string;
  name: string;
  icon: string;
  sort_order: number;
}
interface ScreenshotRow {
  id: string;
  caption: string;
  variant: Screenshot["variant"] | null;
  url: string | null;
  seed: number | null;
  sort_order: number;
}
interface TicketRow {
  code: string;
  title: string;
  summary: string;
  status: TicketStatus;
  category_key: string;
  what_changed: string;
  why_useful: string;
  where_to_find: string[];
  featured: boolean | null;
  reactions_helped: number;
  reactions_love: number;
  reactions_suggestion: number;
  before_after: BeforeAfter | null;
  sort_order: number;
  screenshots: ScreenshotRow[] | null;
}
interface ChangelogRow {
  id: string;
  date: string;
  title: string | null;
  summary: string;
  tickets: TicketRow[] | null;
}

/* ------------------------------------------------------------------ */
/*  Mappers: DB row -> domain model                                   */
/* ------------------------------------------------------------------ */
function mapScreenshot(row: ScreenshotRow): Screenshot {
  return {
    id: row.id,
    caption: row.caption,
    variant: row.variant ?? undefined,
    url: row.url ?? undefined,
    seed: row.seed ?? undefined,
  };
}

function mapTicket(row: TicketRow): Ticket {
  const screenshots = (row.screenshots ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapScreenshot);

  return {
    code: row.code,
    title: row.title,
    summary: row.summary,
    status: row.status,
    categoryKey: row.category_key,
    whatChanged: row.what_changed,
    whyUseful: row.why_useful,
    whereToFind: row.where_to_find ?? [],
    featured: row.featured ?? false,
    beforeAfter: row.before_after ?? undefined,
    screenshots,
    reactions: {
      helped: row.reactions_helped ?? 0,
      love: row.reactions_love ?? 0,
      suggestion: row.reactions_suggestion ?? 0,
    },
  };
}

function mapEntry(row: ChangelogRow): ChangelogEntry {
  const tickets = (row.tickets ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapTicket);
  return {
    id: row.id,
    date: row.date,
    title: row.title ?? undefined,
    summary: row.summary,
    tickets,
  };
}

function mapCategory(row: CategoryRow): Category {
  return { key: row.key, name: row.name, icon: row.icon };
}

/**
 * Supabase-backed repository. Activated automatically by the factory when
 * credentials are present. Uses a single nested query to fetch the whole tree.
 */
export class SupabaseChangelogRepository implements ChangelogRepository {
  async getChangelog(): Promise<ChangelogData> {
    const supabase = getSupabaseClient();

    const [categoriesRes, changelogsRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("changelogs")
        .select(
          "*, tickets(*, screenshots(*))",
        )
        .order("date", { ascending: false }),
    ]);

    if (categoriesRes.error) throw categoriesRes.error;
    if (changelogsRes.error) throw changelogsRes.error;

    const categories = (categoriesRes.data as CategoryRow[]).map(mapCategory);
    const entries = sortEntriesDesc(
      (changelogsRes.data as ChangelogRow[]).map(mapEntry),
    );

    return { categories, entries, stats: computeStats(entries) };
  }
}

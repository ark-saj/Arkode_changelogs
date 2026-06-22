"use client";

import * as React from "react";

import { Hero } from "@/components/changelog/hero";
import { KpiDashboard } from "@/components/changelog/kpi-dashboard";
import { Highlights } from "@/components/changelog/highlights";
import { Timeline } from "@/components/changelog/timeline";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { CommandPalette } from "@/components/portal/command-palette";
import { RightToc, type TocItem } from "@/components/portal/right-toc";
import { Sidebar } from "@/components/portal/sidebar";
import { TopBar } from "@/components/portal/top-bar";
import { SectionTab } from "@/components/mosaic/section-tab";
import { PageTransition } from "@/components/motion/page-transition";
import { useScrollSpy } from "@/components/mosaic/use-scroll-spy";
import { formatLongDate, pluralize } from "@/lib/format";
import type {
  Category,
  ChangelogData,
  ChangelogEntry,
  TicketStatus,
} from "@/lib/types";
import { STATUS_ORDER } from "@/lib/changelog-meta";

/* Arkode Mosaic — the portal app shell. Owns ALL interactive state (query,
   selected categories/statuses, command-palette open, active section). Absorbs
   the filtering + featured-extraction logic from the old changelog-explorer.
   Layout: fixed TopBar; under it a flex row of sticky Sidebar + scrolling main
   content + sticky RightToc. Composes the existing feature components in the
   content region; does NOT restyle the leaves (Phase C does). */

/** Strip accents + lowercase for forgiving, locale-friendly search. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "destacados", label: "Destacados" },
  { id: "linea-de-tiempo", label: "Línea de tiempo" },
];

export interface ChangelogPortalProps {
  data: ChangelogData;
  /** Tenant display name (resolved). */
  tenant: string;
  /** Tenant logo path under /public, if any. */
  brandLogo?: string;
  isAdmin: boolean;
  dataSource: "supabase" | "mock";
  showLogout?: boolean;
  settingsHref?: string;
}

export function ChangelogPortal({
  data,
  tenant,
  brandLogo,
  dataSource,
  showLogout = false,
  settingsHref,
}: ChangelogPortalProps) {
  const brandName = data.tenant?.name ?? tenant;

  const [query, setQuery] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<
    Set<string>
  >(new Set());
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    Set<TicketStatus>
  >(new Set());
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [railCollapsed, setRailCollapsed] = React.useState(false);

  // Restore the desktop rail state once on mount (avoids SSR mismatch).
  React.useEffect(() => {
    setRailCollapsed(
      window.localStorage.getItem("ark-sidebar-collapsed") === "1",
    );
  }, []);

  const toggleRail = React.useCallback(() => {
    setRailCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem("ark-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }, []);

  const categoriesByKey = React.useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of data.categories) map[c.key] = c;
    return map;
  }, [data.categories]);

  // Counts per module / status across ALL entries (independent of active
  // filters), so the sidebar shows the catalog totals.
  const { categoryCounts, statusCounts } = React.useMemo(() => {
    const cats: Record<string, number> = {};
    const stats: Record<TicketStatus, number> = {
      new: 0,
      improvement: 0,
      fix: 0,
      optimization: 0,
    };
    for (const c of data.categories) cats[c.key] = 0;
    for (const entry of data.entries) {
      for (const t of entry.tickets) {
        cats[t.categoryKey] = (cats[t.categoryKey] ?? 0) + 1;
        stats[t.status] += 1;
      }
    }
    return { categoryCounts: cats, statusCounts: stats };
  }, [data.categories, data.entries]);

  const filtered = React.useMemo<ChangelogEntry[]>(() => {
    const q = normalize(query.trim());

    return data.entries
      .map((entry) => {
        const tickets = entry.tickets.filter((t) => {
          if (selectedCategories.size && !selectedCategories.has(t.categoryKey))
            return false;
          if (selectedStatuses.size && !selectedStatuses.has(t.status))
            return false;
          if (!q) return true;

          const haystack = normalize(
            [
              t.code,
              t.title,
              t.summary,
              t.whatChanged,
              t.whyUseful,
              t.whereToFind.join(" "),
              categoriesByKey[t.categoryKey]?.name ?? "",
            ].join(" "),
          );
          return haystack.includes(q);
        });
        return { ...entry, tickets };
      })
      .filter((entry) => entry.tickets.length > 0);
  }, [
    data.entries,
    query,
    selectedCategories,
    selectedStatuses,
    categoriesByKey,
  ]);

  const resultCount = React.useMemo(
    () => filtered.reduce((sum, e) => sum + e.tickets.length, 0),
    [filtered],
  );

  const featured = React.useMemo(
    () => filtered.flatMap((e) => e.tickets).filter((t) => t.featured),
    [filtered],
  );

  const hasQueryOrFilters =
    query.trim().length > 0 ||
    selectedCategories.size > 0 ||
    selectedStatuses.size > 0;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const clearAll = React.useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedStatuses(new Set());
    setQuery("");
  }, []);

  // ---- scroll-spy + TOC ----
  // Right TOC lists the (filtered) release dates; each timeline entry node is
  // anchored with id="rel-<entry.id>" (emitted by the timeline leaf). Section
  // anchors (inicio/destacados/linea-de-tiempo) are owned here.
  const showHighlights = !hasQueryOrFilters && featured.length > 0;

  const tocItems = React.useMemo<TocItem[]>(
    () => filtered.map((e) => ({ id: `rel-${e.id}`, label: formatLongDate(e.date) })),
    [filtered],
  );

  const spyIds = React.useMemo(
    () => [
      "inicio",
      ...(showHighlights ? ["destacados"] : []),
      "linea-de-tiempo",
      ...tocItems.map((t) => t.id),
    ],
    [showHighlights, tocItems],
  );

  const activeSpy = useScrollSpy(spyIds);

  // Active section for the top-bar tabs: collapse release ids onto the timeline.
  const activeSection = React.useMemo(() => {
    if (!activeSpy) return "inicio";
    if (activeSpy.startsWith("rel-")) return "linea-de-tiempo";
    return activeSpy;
  }, [activeSpy]);

  // The right-TOC active marker: section ids map onto themselves.
  const activeToc = activeSpy;

  // ---- scrolling helpers ----
  const scrollToId = React.useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const jumpToSection = React.useCallback(
    (id: string) => {
      setDrawerOpen(false);
      if (id === "inicio") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      scrollToId(id);
    },
    [scrollToId],
  );

  const jumpToTicket = React.useCallback((code: string) => {
    const el = document.getElementById(`t-${code}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Briefly highlight the target with a coral ring (inline so this works
    // without touching globals.css; reduced-motion-safe — it is a static ring).
    const prev = el.style.boxShadow;
    const prevTransition = el.style.transition;
    el.style.transition = "box-shadow 200ms cubic-bezier(0.22,0.68,0,1)";
    el.style.boxShadow = "0 0 0 2px rgba(255,108,93,0.6)";
    window.setTimeout(() => {
      el.style.boxShadow = prev;
      window.setTimeout(() => {
        el.style.transition = prevTransition;
      }, 220);
    }, 1400);
  }, []);

  // ---- ⌘K / Ctrl-K ----
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A stable key for the content transition: changes when the filter signature
  // changes so the content cross-fades on a new filter set.
  const filterSignature =
    `${query}|${[...selectedCategories].sort().join(",")}|${[...selectedStatuses].sort().join(",")}`;

  return (
    <>
      <TopBar
        brandName={brandName}
        brandLogo={brandLogo}
        sections={SECTIONS}
        activeSection={activeSection}
        onJump={jumpToSection}
        onOpenPalette={() => setPaletteOpen(true)}
        onToggleSidebar={() => setDrawerOpen((o) => !o)}
        showLogout={showLogout}
        settingsHref={settingsHref}
      />

      <div className="flex min-h-screen pt-[60px]">
        <Sidebar
          categories={data.categories}
          categoryCounts={categoryCounts}
          statusCounts={statusCounts}
          selectedCategories={selectedCategories}
          selectedStatuses={selectedStatuses}
          onToggleCategory={(key) =>
            setSelectedCategories((s) => toggle(s, key))
          }
          onToggleStatus={(status) =>
            setSelectedStatuses((s) => toggle(s, status))
          }
          onClear={clearAll}
          collapsed={railCollapsed}
          onToggleCollapse={toggleRail}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[920px] px-5 py-8 sm:px-8">
            <Breadcrumb items={["Inicio", "Novedades"]} />

            {/* Hero */}
            <section id="inicio" className="scroll-mt-[76px]">
              <Hero />
            </section>

            {/* KPIs */}
            <div className="mt-12">
              <KpiDashboard stats={data.stats} />
            </div>

            <PageTransition transitionKey={filterSignature} className="mt-16">
              {/* Destacados — only when not actively filtering, to keep focus */}
              {showHighlights && (
                <section
                  id="destacados"
                  className="scroll-mt-[76px]"
                  aria-label="Destacados"
                >
                  <SectionTab meta={pluralize(featured.length, "novedad", "novedades")}>
                    Destacados
                  </SectionTab>
                  <div className="mt-6">
                    <Highlights
                      tickets={featured}
                      categoriesByKey={categoriesByKey}
                    />
                  </div>
                </section>
              )}

              {/* Línea de tiempo */}
              <section
                id="linea-de-tiempo"
                className="mt-14 scroll-mt-[76px]"
                aria-label="Línea de tiempo"
              >
                <SectionTab
                  meta={
                    hasQueryOrFilters
                      ? pluralize(resultCount, "resultado", "resultados")
                      : undefined
                  }
                >
                  Línea de tiempo
                </SectionTab>

                {hasQueryOrFilters && (
                  <p className="mt-4 text-sm text-mute">
                    {resultCount === 0
                      ? "No encontramos novedades con esos criterios."
                      : `Mostrando ${pluralize(resultCount, "novedad", "novedades")}.`}
                  </p>
                )}

                <div className="mt-8">
                  <Timeline
                    entries={filtered}
                    categoriesByKey={categoriesByKey}
                  />
                </div>
              </section>
            </PageTransition>

            <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
              <span>{tenant} · Centro de Novedades</span>
              <span>
                {dataSource === "supabase"
                  ? "Conectado a Supabase"
                  : "Datos de demostración"}
                {" · Arkode"}
              </span>
            </footer>
          </div>
        </main>

        <RightToc items={tocItems} activeId={activeToc} onJump={scrollToId} />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        data={data}
        onJump={jumpToTicket}
      />
    </>
  );
}

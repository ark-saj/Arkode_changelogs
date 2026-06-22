"use client";

import * as React from "react";

import { KpiDashboard } from "@/components/changelog/kpi-dashboard";
import { SearchBar } from "@/components/changelog/search-bar";
import { FilterBar } from "@/components/changelog/filter-bar";
import { Highlights } from "@/components/changelog/highlights";
import { Timeline } from "@/components/changelog/timeline";
import { Section } from "@/components/mosaic/section";
import { Eyebrow } from "@/components/mosaic/eyebrow";
import type {
  Category,
  ChangelogData,
  ChangelogEntry,
  TicketStatus,
} from "@/lib/types";
import { pluralize } from "@/lib/format";

/** Strip accents + lowercase for forgiving, locale-friendly search. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ChangelogExplorer({ data }: { data: ChangelogData }) {
  const [query, setQuery] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<
    Set<string>
  >(new Set());
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    Set<TicketStatus>
  >(new Set());

  const categoriesByKey = React.useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of data.categories) map[c.key] = c;
    return map;
  }, [data.categories]);

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
  }, [data.entries, query, selectedCategories, selectedStatuses, categoriesByKey]);

  const resultCount = React.useMemo(
    () => filtered.reduce((sum, e) => sum + e.tickets.length, 0),
    [filtered],
  );

  const featured = React.useMemo(
    () => filtered.flatMap((e) => e.tickets).filter((t) => t.featured),
    [filtered],
  );

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const hasQueryOrFilters =
    query.trim().length > 0 ||
    selectedCategories.size > 0 ||
    selectedStatuses.size > 0;

  return (
    <div>
      {/* KPIs */}
      <Section tone="canvas">
        <div className="sec-inner">
          <Eyebrow num="01">Resumen</Eyebrow>
          <div className="mt-8">
            <KpiDashboard stats={data.stats} />
          </div>
        </div>
      </Section>

      {/* Controls */}
      <div className="sticky top-[60px] z-30 border-y border-line bg-canvas/85 backdrop-blur-md">
        <div className="sec-inner space-y-4 px-6 py-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={resultCount}
          />
          <FilterBar
            categories={data.categories}
            selectedCategories={selectedCategories}
            selectedStatuses={selectedStatuses}
            onToggleCategory={(key) =>
              setSelectedCategories((s) => toggle(s, key))
            }
            onToggleStatus={(status) =>
              setSelectedStatuses((s) => toggle(s, status))
            }
            onClear={() => {
              setSelectedCategories(new Set());
              setSelectedStatuses(new Set());
              setQuery("");
            }}
          />
        </div>
      </div>

      {/* Highlights — only when not actively searching, to keep focus */}
      {!hasQueryOrFilters && (
        <Section tone="bone">
          <div className="sec-inner">
            <Eyebrow num="02">Destacados</Eyebrow>
            <div className="mt-8">
              <Highlights
                tickets={featured}
                categoriesByKey={categoriesByKey}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Timeline */}
      <Section tone="canvas">
        <div className="sec-inner">
          <Eyebrow num="03">Línea de tiempo</Eyebrow>

          {/* Result summary while filtering */}
          {hasQueryOrFilters && (
            <p className="mt-4 text-sm text-mute">
              {resultCount === 0
                ? "No encontramos novedades con esos criterios."
                : `Mostrando ${pluralize(resultCount, "novedad", "novedades")}.`}
            </p>
          )}

          <div className="mt-8">
            <Timeline entries={filtered} categoriesByKey={categoriesByKey} />
          </div>
        </div>
      </Section>
    </div>
  );
}

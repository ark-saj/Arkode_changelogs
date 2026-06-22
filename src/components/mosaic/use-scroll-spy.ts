"use client";

import * as React from "react";

/* Arkode Mosaic — scroll-spy hook for the right TOC.
   useScrollSpy(ids) observes the elements with those ids and returns the id of
   the section currently considered active (the topmost one intersecting the
   upper band of the viewport). SSR-safe; no-ops until mounted. Re-subscribes
   when the id list changes (e.g. after a filter reflow). */

export function useScrollSpy(
  ids: string[],
  options?: { rootMargin?: string },
): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(
    ids[0] ?? null,
  );
  // Stable key so the effect only re-runs when the set of ids changes.
  const idsKey = ids.join("|");
  const rootMargin = options?.rootMargin ?? "-80px 0px -65% 0px";

  React.useEffect(() => {
    const list = idsKey ? idsKey.split("|") : [];
    if (list.length === 0) {
      setActiveId(null);
      return;
    }

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.boundingClientRect.top);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size > 0) {
          // Pick the topmost intersecting section, in document order.
          let best: string | null = null;
          let bestTop = Infinity;
          for (const [id, top] of visible) {
            if (top < bestTop) {
              bestTop = top;
              best = id;
            }
          }
          if (best) setActiveId(best);
        }
      },
      { rootMargin, threshold: 0 },
    );

    const els: Element[] = [];
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        els.push(el);
      }
    }

    return () => observer.disconnect();
  }, [idsKey, rootMargin]);

  return activeId;
}

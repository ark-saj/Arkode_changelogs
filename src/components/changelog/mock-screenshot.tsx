import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Screenshot } from "@/lib/types";

type Variant = NonNullable<Screenshot["variant"]>;

/** Tiny deterministic PRNG so a given seed always renders the same mockup. */
function makeRng(seed: number) {
  let s = (seed || 1) * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * A believable, brand-tinted "app screenshot" rendered entirely with markup —
 * no external assets required. If `url` is provided it is shown instead, so the
 * same component works once real screenshots live in Supabase Storage.
 */
export function MockScreenshot({
  variant = "form",
  seed = 1,
  url,
  className,
}: {
  variant?: Variant;
  seed?: number;
  url?: string;
  className?: string;
}) {
  if (url) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden", className)}>
        <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    );
  }

  const rng = makeRng(seed);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-muted/80 to-muted/30 text-foreground",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-background/70 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-status-fix/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-status-optimization/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-status-new/70" />
        <span className="ml-3 h-2 w-24 rounded-full bg-foreground/15" />
        <span className="ml-auto h-4 w-4 rounded-full bg-brand/70" />
      </div>

      {/* app toolbar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="h-5 w-16 rounded-md bg-brand/80" />
        <span className="h-5 w-12 rounded-md bg-foreground/10" />
        <span className="ml-auto h-5 w-20 rounded-full bg-foreground/10" />
      </div>

      <div className="px-3 pb-3">
        {variant === "form" && <FormBody rng={rng} />}
        {variant === "list" && <ListBody rng={rng} />}
        {variant === "dashboard" && <DashboardBody rng={rng} />}
        {variant === "kanban" && <KanbanBody rng={rng} />}
        {variant === "report" && <ReportBody rng={rng} />}
      </div>
    </div>
  );
}

function FormBody({ rng }: { rng: () => number }) {
  return (
    <div className="space-y-3 rounded-lg bg-background/60 p-3">
      {range(4).map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2 w-20 rounded-full bg-foreground/20" />
          <div
            className="h-6 rounded-md border border-border/60 bg-background/80"
            style={{ width: `${55 + rng() * 40}%` }}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <span className="h-7 w-24 rounded-md bg-brand shadow-glow" />
        <span className="h-7 w-20 rounded-md bg-foreground/10" />
      </div>
    </div>
  );
}

function ListBody({ rng }: { rng: () => number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-background/60">
      <div className="flex gap-3 border-b border-border/60 bg-muted/50 px-3 py-2">
        {range(4).map((i) => (
          <div key={i} className="h-2 flex-1 rounded-full bg-foreground/25" />
        ))}
      </div>
      {range(5).map((r) => (
        <div
          key={r}
          className="flex items-center gap-3 border-b border-border/40 px-3 py-2 last:border-0"
        >
          {range(4).map((c) => (
            <div
              key={c}
              className={cn(
                "h-2 flex-1 rounded-full",
                c === 0 ? "bg-brand/50" : "bg-foreground/12",
              )}
              style={{ opacity: 0.5 + rng() * 0.5 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardBody({ rng }: { rng: () => number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {range(3).map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-background/70 p-2"
          >
            <div className="h-1.5 w-10 rounded-full bg-foreground/20" />
            <div className="mt-2 h-3 w-12 rounded bg-brand/70" />
          </div>
        ))}
      </div>
      <div className="flex h-20 items-end gap-1.5 rounded-lg border border-border/60 bg-background/60 p-2">
        {range(10).map((i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-brand/40 to-brand"
            style={{ height: `${25 + rng() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanBody({ rng }: { rng: () => number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {range(3).map((col) => (
        <div
          key={col}
          className="space-y-2 rounded-lg border border-border/60 bg-background/50 p-2"
        >
          <div
            className={cn(
              "h-1.5 w-12 rounded-full",
              col === 0 ? "bg-brand" : "bg-foreground/25",
            )}
          />
          {range(1 + Math.floor(rng() * 3)).map((card) => (
            <div
              key={card}
              className="space-y-1 rounded-md border border-border/50 bg-background/80 p-1.5 shadow-sm"
            >
              <div className="h-1.5 w-full rounded-full bg-foreground/20" />
              <div className="h-1.5 w-2/3 rounded-full bg-foreground/12" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ReportBody({ rng }: { rng: () => number }) {
  const pct = 30 + rng() * 50;
  return (
    <div className="grid grid-cols-5 gap-3">
      <div className="col-span-3 flex items-center justify-center rounded-lg border border-border/60 bg-background/60 p-3">
        <div
          className="relative h-20 w-20 rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--brand)) ${pct}%, hsl(var(--muted-foreground) / 0.25) 0)`,
          }}
        >
          <div className="absolute inset-3 rounded-full bg-background/90" />
        </div>
      </div>
      <div className="col-span-2 space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
        {range(4).map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                i === 0 ? "bg-brand" : "bg-foreground/25",
              )}
            />
            <span className="h-1.5 flex-1 rounded-full bg-foreground/15" />
          </div>
        ))}
      </div>
    </div>
  );
}

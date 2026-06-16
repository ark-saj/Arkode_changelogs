import { ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "¿Dónde lo encuentro?" — renders a breadcrumb route the user can follow inside
 * Odoo, e.g. CRM › Oportunidades › Crear oportunidad.
 */
export function WhereToFind({
  path,
  className,
}: {
  path: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2.5",
        className,
      )}
    >
      <MapPin className="mr-1 h-4 w-4 shrink-0 text-brand" />
      {path.map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm",
              i === path.length - 1
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step}
          </span>
          {i < path.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </span>
      ))}
    </div>
  );
}

import { Database } from "lucide-react";
import type { BrandTheme } from "@/lib/branding";

export function SiteFooter({
  brand,
  dataSource,
}: {
  brand: BrandTheme;
  dataSource: "supabase" | "mock";
}) {
  return (
    <footer className="mt-20 border-t border-border/40 py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p>
          {brand.name} · {brand.tagline}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5" />
          {dataSource === "supabase"
            ? "Conectado a Supabase"
            : "Datos de demostración"}
        </p>
      </div>
    </footer>
  );
}

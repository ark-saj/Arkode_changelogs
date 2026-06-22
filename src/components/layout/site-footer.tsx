import Image from "next/image";
import { Database } from "lucide-react";

/* Arkode Mosaic — thin portal footer. A single hairline rule over a compact
   row inside the content column: small Arkode mark + tenant line on the left,
   mono data-source note on the right. Not the old full-bleed ink block; this
   sits at the bottom of the portal content as a quiet sign-off. */
export function SiteFooter({
  brand,
  dataSource,
}: {
  brand: { name: string; tagline: string };
  dataSource: "supabase" | "mock";
}) {
  return (
    <footer className="mt-16 border-t border-line pt-6">
      <div className="flex flex-col items-start justify-between gap-4 text-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/arkode-complete.png"
            alt="Arkode"
            width={110}
            height={16}
            className="h-[16px] w-auto"
          />
          <span className="hidden h-3.5 w-px bg-line sm:block" aria-hidden />
          <span className="text-mute">
            {brand.name} · {brand.tagline}
          </span>
        </div>
        <p className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-faint">
          <Database className="h-3.5 w-3.5" />
          {dataSource === "supabase"
            ? "Conectado a Supabase"
            : "Datos de demostración"}
        </p>
      </div>
    </footer>
  );
}

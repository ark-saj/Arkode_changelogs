import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { BrandTheme } from "@/lib/branding";

export function SiteHeader({ brand }: { brand: BrandTheme }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-soft text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight">
              {brand.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {brand.tagline}
            </span>
          </span>
        </a>

        <ThemeToggle />
      </div>
    </header>
  );
}

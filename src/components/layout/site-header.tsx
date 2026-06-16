import Image from "next/image";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/layout/logout-button";

/** Minimal branding the header needs — satisfied by a tenant or a brand theme. */
export interface HeaderBrand {
  name: string;
  tagline: string;
  logo?: string;
}

export function SiteHeader({
  brand,
  showLogout = false,
}: {
  brand: HeaderBrand;
  showLogout?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3">
          {brand.logo ? (
            // Per-company logo (Fase 0). Wordmark scales to header height.
            <Image
              src={brand.logo}
              alt={brand.name}
              width={150}
              height={18}
              priority
              className="h-[18px] w-auto"
            />
          ) : (
            <>
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
            </>
          )}
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showLogout && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { Settings } from "lucide-react";

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
  settingsHref,
}: {
  brand: HeaderBrand;
  showLogout?: boolean;
  /** When set (tenant admins), shows a link to the settings page. */
  settingsHref?: string;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      setScrolled(top > 8);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? top / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className="progress"
        style={{ width: "100%", transform: `scaleX(${progress})` }}
      />
      <header className={scrolled ? "nav scrolled" : "nav"}>
        <div className="sec-inner flex w-full items-center justify-between gap-4 px-6">
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
              <Image
                src="/brand/arkode-complete.png"
                alt="Arkode"
                width={140}
                height={20}
                priority
                className="h-[20px] w-auto"
              />
            )}
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <span className="hidden font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-mute sm:block">
              {brand.name}
            </span>
          </a>

          <div className="flex items-center gap-2">
            {settingsHref && (
              <a
                href={settingsHref}
                aria-label="Configuración"
                title="Configuración"
                className="grid h-9 w-9 place-items-center rounded-md9 border border-line-2 text-ink transition hover:-translate-y-px hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/30"
              >
                <Settings className="h-[18px] w-[18px]" />
              </a>
            )}
            {showLogout && <LogoutButton />}
          </div>
        </div>
      </header>
    </>
  );
}

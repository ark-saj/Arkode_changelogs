"use client";

import * as React from "react";
import Image from "next/image";
import { Menu, Settings } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { SquareBullet } from "@/components/mosaic/square-bullet";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — portal top bar (fixed, full width, 60px, canvas/85 + blur,
   hairline-on-scroll). Left: Arkode wordmark + tenant chip. Center (desktop):
   in-page section tabs (square bullet, active coral). Right: a ⌘K search field
   that opens the palette, ghost Salir + settings gear (admin). Mobile: hamburger
   toggles the sidebar drawer. Scroll-progress coral line on top. */

export interface TopBarSection {
  id: string;
  label: string;
}

export interface TopBarProps {
  brandName: string;
  brandLogo?: string;
  sections: TopBarSection[];
  activeSection: string | null;
  onJump: (id: string) => void;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
  showLogout?: boolean;
  settingsHref?: string;
}

export function TopBar({
  brandName,
  brandLogo,
  sections,
  activeSection,
  onJump,
  onOpenPalette,
  onToggleSidebar,
  showLogout = false,
  settingsHref,
}: TopBarProps) {
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
      <header className={cn("nav", scrolled && "scrolled")}>
        <div className="mx-auto flex w-full max-w-[var(--maxw)] items-center gap-4 px-4 sm:px-6">
          {/* Left: hamburger (mobile) + wordmark + tenant chip */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Abrir navegación"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md9 border border-line-2 text-ink transition hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/30 lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => onJump("inicio")}
              className="flex shrink-0 items-center gap-3 focus:outline-none"
              aria-label="Ir al inicio"
            >
              <Image
                src="/brand/arkode-complete.png"
                alt="Arkode"
                width={140}
                height={20}
                priority
                className="h-[20px] w-auto"
              />
            </button>

            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <span className="hidden min-w-0 items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-mute sm:inline-flex">
              <span className="truncate">{brandName}</span>
              <span aria-hidden className="text-faint">
                ▾
              </span>
            </span>
            {brandLogo && (
              <Image
                src={brandLogo}
                alt={brandName}
                width={120}
                height={16}
                className="hidden h-[16px] w-auto sm:block"
              />
            )}
          </div>

          {/* Center: in-page section tabs (desktop) */}
          <nav
            aria-label="Secciones"
            className="ml-2 hidden items-center gap-1 md:flex"
          >
            {sections.map((s) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onJump(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md9 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "text-ink"
                      : "text-mute hover:text-ink-soft",
                  )}
                >
                  <SquareBullet
                    size={6}
                    className={cn(
                      "transition-colors",
                      active ? "bg-coral" : "bg-line-2",
                    )}
                  />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Right: ⌘K search + actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label="Buscar"
              className="group hidden h-9 items-center gap-2 rounded-md9 border border-line-2 bg-canvas pl-3 pr-2 text-mute transition hover:border-coral hover:text-coral-deep sm:inline-flex"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                Buscar
              </span>
              <kbd className="rounded-[4px] border border-line-2 bg-bone px-1.5 py-0.5 font-mono text-[10px] leading-none text-mute">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenPalette}
              aria-label="Buscar"
              className="grid h-9 w-9 place-items-center rounded-md9 border border-line-2 text-ink transition hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/30 sm:hidden"
            >
              <span className="font-mono text-[13px]">⌘K</span>
            </button>

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
